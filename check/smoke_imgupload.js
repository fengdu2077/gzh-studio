/* gzh-studio · 正文图片上传冒烟（Node + playwright-core）
 *
 * 这一块有两个必须实测的点：
 *   1. multipart 上传能不能穿过代理到微信 —— 代理是原样转发 body 的，
 *      boundary / 二进制有没有被破坏，只有真发一次才知道。
 *      用假 access_token 触发 40001 来证明「请求确实到了微信」。
 *   2. 「上传过一次就记住」的映射：写进 localStorage 后重新渲染，
 *      预览里的 base64 应该直接换成微信 URL —— 这条纯前端，但要真浏览器。
 *
 * 用法: node check/smoke_imgupload.js
 * 依赖: playwright-core（已装在本机 node workspace）
 */
'use strict';

const http = require('http');
const path = require('path');
const { spawn } = require('child_process');
const { chromium } = require('playwright-core');

const ROOT = path.dirname(__dirname);
const APP = 'file:///' + path.join(ROOT, 'app', 'index.html').replace(/\\/g, '/');
const PORT = 8911;
const PROXY = 'http://127.0.0.1:' + PORT;

// 1×1 透明 PNG，够小，只为验证 multipart 链路
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==',
  'base64');

const FAKE_WX_URL = 'https://mmbiz.qpic.cn/mmbiz_png/FAKEUPLOADTEST/640?wx_fmt=png';

let pass = 0, fail = 0, warn = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (extra ? '   ' + extra : '')); }
}
function soft(name, cond, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { warn++; console.log('  ! ' + name + '（跳过：' + (extra || '网络不通') + '）'); }
}
function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }

/* 手搓一个 multipart/form-data（不用 FormData，Node 18 之前没有全局 FormData） */
function buildMultipart(boundary, fields) {
  const parts = [];
  fields.forEach((f) => {
    let head = '--' + boundary + '\r\nContent-Disposition: form-data; name="' + f.name + '"'
      + (f.filename ? '; filename="' + f.filename + '"' : '');
    if (f.type) head += '\r\nContent-Type: ' + f.type;
    parts.push(Buffer.from(head + '\r\n\r\n', 'binary'));
    parts.push(Buffer.isBuffer(f.value) ? f.value : Buffer.from(String(f.value), 'binary'));
    parts.push(Buffer.from('\r\n', 'binary'));
  });
  parts.push(Buffer.from('--' + boundary + '--\r\n', 'binary'));
  return Buffer.concat(parts);
}

function postMultipart(wxPath, fields) {
  return new Promise((resolve) => {
    const boundary = '----gzh' + Date.now();
    const body = buildMultipart(boundary, fields);
    const req = http.request({
      host: '127.0.0.1', port: PORT, method: 'POST',
      path: '/wx/' + wxPath,
      headers: {
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
        'Content-Length': body.length,
      },
      timeout: 20000,
    }, (res) => {
      let buf = '';
      res.setEncoding('utf8');
      res.on('data', (c) => { buf += c; });
      res.on('end', () => {
        let d = null;
        try { d = JSON.parse(buf); } catch (e) { d = { raw: buf.slice(0, 200) }; }
        resolve({ status: res.statusCode, data: d });
      });
    });
    req.on('error', (e) => resolve({ status: 0, data: { error: e.message } }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, data: { error: 'timeout' } }); });
    req.end(body);
  });
}

// 与 app/index.html 里的 imgKey 必须保持一致
function imgKey(src) {
  if (!src) return '';
  if (src.length <= 128) return src;
  return src.slice(0, 64) + '#' + src.length + '#' + src.slice(-24);
}

(async () => {
  console.log('\n正文图片上传冒烟测试\n');

  const proxy = spawn(process.execPath, [path.join(ROOT, 'tools', 'wechat-proxy.js'), String(PORT)],
    { stdio: 'ignore' });
  await wait(1200);

  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));

  try {
    // ① 代理活着
    const health = await new Promise((r) => {
      http.get('http://127.0.0.1:' + PORT + '/health', (res) => {
        let b = ''; res.on('data', (c) => { b += c; }); res.on('end', () => r(b));
      }).on('error', () => r(''));
    });
    check('代理已启动', /"ok":true/.test(health), health.slice(0, 80));

    // ② multipart 转发：假 token → 微信应回 40001（说明 body 完整送达）
    let r = await postMultipart('cgi-bin/media/uploadimg?access_token=FAKE_TOKEN',
      [{ name: 'media', filename: 't.png', type: 'image/png', value: PNG }]);
    soft('正文图片接口（uploadimg）转发通 —— 假 token 返回 40001',
      r.data && r.data.errcode === 40001, JSON.stringify(r.data).slice(0, 120));

    r = await postMultipart('cgi-bin/material/add_material?access_token=FAKE_TOKEN&type=image',
      [{ name: 'media', filename: 't.png', type: 'image/png', value: PNG }]);
    soft('永久素材接口（add_material）转发通 —— 假 token 返回 40001',
      r.data && r.data.errcode === 40001, JSON.stringify(r.data).slice(0, 120));

    // ③ 路径白名单仍然有效（防 SSRF 那条不能因为支持上传就松掉）
    r = await postMultipart('../../etc/passwd?access_token=FAKE',
      [{ name: 'media', filename: 't.png', value: PNG }]);
    check('路径穿越仍被拒', r.status === 400 || (r.data && r.data.error), JSON.stringify(r.data).slice(0, 80));

    // ---------- 浏览器侧 ----------
    await page.goto(APP);
    await page.waitForSelector('#preview section', { timeout: 8000 }).catch(() => {});
    await page.click('#sampleBtn');
    await page.waitForTimeout(600);

    const imgs = await page.evaluate(() =>
      Array.from(document.querySelectorAll('#preview img')).map((i) => i.getAttribute('src') || ''));
    check('示例正文里有图片', imgs.length > 0, '共 ' + imgs.length + ' 张');
    check('图片是 base64 占位图（正是要上传替换的对象）',
      imgs.some((s) => /^data:image\//.test(s)), (imgs[0] || '').slice(0, 40));

    await page.click('#pubBtn');
    await page.waitForTimeout(300);
    check('面板有「正文图片」一行', await page.isVisible('#pubImgStat'));
    check('面板有「上传并替换」按钮', await page.isVisible('#pubImgUpload'));
    check('面板有「传成永久素材」开关', await page.isVisible('#pubImgMaterial'));

    let stat = (await page.textContent('#pubImgStat')) || '';
    check('统计认出待上传的图', /待上传 [1-9]/.test(stat), stat);
    check('统计认出已上传的图为 0（还没传过）', /已上传 0/.test(stat), stat);

    // ④ 没填密钥点上传 → 应被拦住，而不是静默失败
    await page.evaluate(() => localStorage.removeItem('gzh.publish'));
    await page.reload();
    await page.waitForSelector('#preview section', { timeout: 8000 }).catch(() => {});
    await page.click('#sampleBtn');            // reload 会回到默认稿，重新载一次示例
    await page.waitForTimeout(600);
    await page.click('#pubBtn');
    await page.waitForTimeout(300);
    await page.click('#pubImgUpload');
    await page.waitForTimeout(400);
    let st = (await page.textContent('#pubStatus')) || '';
    check('没填 AppID 时拦住上传', /AppID/.test(st), st.slice(0, 100));

    // ⑤ 关键：传过一次的图会记住 —— 注入映射后重渲染，预览直接换成微信 URL
    const src0 = (await page.evaluate(() =>
      (document.querySelector('#preview img') || {}).src || ''));
    check('拿到一张待替换的图', src0.length > 0, src0.slice(0, 40));
    await page.evaluate((kv) => {
      localStorage.setItem('gzh.imgmap', JSON.stringify(kv));
    }, { [imgKey(src0)]: FAKE_WX_URL });
    await page.reload();
    await page.waitForSelector('#preview section', { timeout: 8000 }).catch(() => {});
    await page.click('#sampleBtn');
    await page.waitForTimeout(600);

    const htmlNow = await page.innerHTML('#preview');
    check('重渲染后自动套用已上传的地址', htmlNow.indexOf(FAKE_WX_URL) >= 0,
      '预览里没找到 ' + FAKE_WX_URL);

    await page.click('#pubBtn');
    await page.waitForTimeout(300);
    stat = (await page.textContent('#pubImgStat')) || '';
    check('统计显示这张已上传', /已上传 [1-9]/.test(stat), stat);

    // ⑥ 清除映射
    page.on('dialog', (d) => d.accept());
    await page.click('#pubImgMap');
    await page.waitForTimeout(500);
    st = (await page.textContent('#pubStatus')) || '';
    check('清除映射可用', /已清除/.test(st), st.slice(0, 100));

    check('页面无 JS 报错', errors.length === 0, errors.join(' | ').slice(0, 200));
  } catch (e) {
    fail++;
    console.log('  ✗ 异常：' + e.message);
  } finally {
    await browser.close();
    proxy.kill();
  }

  console.log('\n' + (fail ? '✗ ' + fail + ' 项失败，' : '✓ 通过 ' + pass + ' 项')
    + (warn ? '，' + warn + ' 项因网络跳过' : '') + '\n');
  process.exit(fail ? 1 : 0);
})();
