#!/usr/bin/env node
/* gzh-studio · 微信 API 本地代理（零依赖）
 *
 * 为什么必须有这一层：
 *   api.weixin.qq.com **不返回** Access-Control-Allow-Origin。浏览器里 fetch 它
 *   会被 CORS 直接拦掉（file:// 页面的 origin 是 null，更严格），页面连
 *   access_token 都拿不到。这个代理只做一件事：把请求原样转发给微信、
 *   把响应原样带回来，并补上 CORS 头。
 *
 * 它刻意做得很少：
 *   - 不存储任何密钥（AppID / AppSecret 只在请求经过时出现在内存里）
 *   - 不落盘任何日志
 *   - 只监听 127.0.0.1，局域网里别的机器连不上
 *   - 只能转发到 api.weixin.qq.com（写死白名单，避免变成开放代理 / SSRF 跳板）
 *
 * 用法:
 *   node tools/wechat-proxy.js [端口]        默认 8787
 *
 * 端口被占用时: 会给出提示而不是静默失败。
 */
'use strict';

const http = require('http');
const https = require('https');

const PORT = Number(process.argv[2] || 8787);
const HOST = '127.0.0.1';

// 只允许转发到这一个域名 —— 写死，不读环境变量，避免被改造成任意跳板
const UPSTREAM = 'api.weixin.qq.com';

// 正文上限 20MB：公众号正文 + 图片素材足够，同时挡掉恶意大 body
const MAX_BODY = 20 * 1024 * 1024;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

function send(res, code, body, type) {
  res.writeHead(code, Object.assign({
    'Content-Type': type || 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  }, CORS));
  res.end(body);
}

function json(res, obj, code) {
  send(res, code || 200, JSON.stringify(obj));
}

/* ---------- 公网 IP ----------
 * 微信「IP 白名单」要填的是**调用方的公网出口 IP**，不是内网 IP。
 * 多个源互为备份：任何一个返回就够。 */
const IP_SOURCES = [
  { url: 'https://api.ipify.org?format=json', pick: (t) => { try { return JSON.parse(t).ip; } catch (e) { return ''; } } },
  { url: 'https://myip.ipip.net', pick: (t) => { const m = String(t).match(/(\d+\.\d+\.\d+\.\d+)/); return m ? m[1] : ''; } },
  { url: 'https://ifconfig.me/ip', pick: (t) => String(t).trim() },
];

function fetchText(url, timeout, cb) {
  let done = false;
  const req = https.get(url, { timeout: timeout }, (res) => {
    let buf = '';
    res.setEncoding('utf8');
    res.on('data', (c) => { buf += c; });
    res.on('end', () => { if (!done) { done = true; cb(null, buf); } });
  });
  req.on('timeout', () => { req.destroy(); if (!done) { done = true; cb(new Error('timeout')); } });
  req.on('error', (e) => { if (!done) { done = true; cb(e); } });
}

function lookupIp(cb, i) {
  const idx = i || 0;
  if (idx >= IP_SOURCES.length) { cb(new Error('所有 IP 源都取不到')); return; }
  const src = IP_SOURCES[idx];
  fetchText(src.url, 4000, (err, text) => {
    const ip = err ? '' : src.pick(text);
    if (ip && /^\d+\.\d+\.\d+\.\d+$/.test(ip)) cb(null, ip, src.url);
    else lookupIp(cb, idx + 1);
  });
}

/* ---------- 转发到微信 ---------- */
function forward(req, res, wxPath, query) {
  // 路径白名单之外的字符一律拒绝（防目录穿越 / 协议注入）
  if (!/^[a-z0-9_\-\/]+$/i.test(wxPath)) { json(res, { error: '路径不合法: ' + wxPath }, 400); return; }

  const chunks = [];
  let size = 0;
  let aborted = false;
  req.on('data', (c) => {
    size += c.length;
    if (size > MAX_BODY) { aborted = true; req.destroy(); json(res, { error: '请求体超过 20MB' }, 413); return; }
    chunks.push(c);
  });
  req.on('end', () => {
    if (aborted) return;
    const body = Buffer.concat(chunks);

    const headers = {};
    // 只透传 Content-Type（multipart 上传要带 boundary），其余交给 Node 自己算
    if (req.headers['content-type']) headers['Content-Type'] = req.headers['content-type'];
    if (body.length) headers['Content-Length'] = body.length;

    const up = https.request({
      hostname: UPSTREAM,
      port: 443,
      path: '/' + wxPath + (query ? '?' + query : ''),
      method: req.method,
      headers: headers,
      timeout: 30000,
    }, (uRes) => {
      const out = [];
      uRes.on('data', (c) => out.push(c));
      uRes.on('end', () => {
        const buf = Buffer.concat(out);
        send(res, uRes.statusCode || 502, buf,
          uRes.headers['content-type'] || 'application/json; charset=utf-8');
      });
    });

    up.on('timeout', () => { up.destroy(); json(res, { error: '请求微信超时' }, 504); });
    up.on('error', (e) => json(res, { error: '连不上微信: ' + e.message }, 502));
    if (body.length) up.write(body);
    up.end();
  });
}

/* ---------- 服务器 ---------- */
const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://' + HOST);
  const p = u.pathname;

  if (req.method === 'OPTIONS') { send(res, 204, ''); return; }

  if (p === '/health') { json(res, { ok: true, ts: Date.now(), upstream: UPSTREAM }); return; }

  if (p === '/ip') {
    lookupIp((err, ip, from) => {
      if (err) json(res, { error: err.message }, 502);
      else json(res, { ip: ip, from: from });
    });
    return;
  }

  // /wx/cgi-bin/xxx?query  →  https://api.weixin.qq.com/cgi-bin/xxx?query
  if (p.indexOf('/wx/') === 0) {
    forward(req, res, p.slice('/wx/'.length), u.search.replace(/^\?/, ''));
    return;
  }

  json(res, { error: '未知路径: ' + p }, 404);
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error('\n端口 ' + PORT + ' 已被占用。');
    console.error('  · 可能代理已经在跑了 —— 先试试浏览器打开 http://' + HOST + ':' + PORT + '/health');
    console.error('  · 或者换个端口：node tools/wechat-proxy.js ' + (PORT + 1) + '\n');
    process.exit(1);
  }
  throw e;
});

server.listen(PORT, HOST, () => {
  console.log('\n微信 API 本地代理已启动');
  console.log('  地址     http://' + HOST + ':' + PORT);
  console.log('  转发目标 https://' + UPSTREAM + ' （写死，不转发别的域名）');
  console.log('  监听     仅本机（局域网其它机器连不上）');
  console.log('');
  console.log('接下来：');
  console.log('  1. 打开 App → 点「发布」→ 点「查本机公网 IP」');
  console.log('  2. 把这个 IP 填进公众号后台「设置与开发 › 基本配置 › IP白名单」');
  console.log('  3. 填 AppID / AppSecret → 「测试连接」→ 「发送到草稿箱」');
  console.log('');
  console.log('停止：Ctrl+C\n');
});
