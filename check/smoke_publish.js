/* gzh-studio · 发布面板浏览器冒烟（Node + playwright-core）
 *
 * 为什么要单独测这一块：
 *   1. 页面是 file:// 打开的（origin 为 null），它去 fetch 本机代理会不会被拦，
 *      **只能靠真实浏览器验证** —— 这是整个发布链路最大的未知数。
 *   2. 代理转发微信 API 是否通，靠一个假 AppID 触发 40013 来验证。
 *
 * 用法: node check/smoke_publish.js
 * 依赖: playwright-core（已装在本机 node workspace）+ 能访问 api.weixin.qq.com
 */
'use strict';

const path = require('path');
const { spawn } = require('child_process');
const { chromium } = require('playwright-core');

const ROOT = path.dirname(__dirname);
const APP = 'file:///' + path.join(ROOT, 'app', 'index.html').replace(/\\/g, '/');
const PORT = 8899;
const PROXY = 'http://127.0.0.1:' + PORT;

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

(async () => {
  console.log('\n发布面板冒烟测试\n');

  // ① 起代理
  const proxy = spawn(process.execPath, [path.join(ROOT, 'tools', 'wechat-proxy.js'), String(PORT)],
    { stdio: 'ignore' });
  await wait(1200);

  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));

  try {
    await page.goto(APP);
    await page.waitForSelector('#preview section', { timeout: 8000 }).catch(() => {});

    // 载入示例，保证有正文可发
    await page.click('#sampleBtn');
    await page.waitForTimeout(600);
    const bytes = await page.textContent('#statBytes');
    check('示例已渲染', /字节/.test(bytes || ''), bytes);

    // ② 打开发布面板
    await page.click('#pubBtn');
    await page.waitForTimeout(300);
    check('发布面板打开', await page.isVisible('#pubBody'));
    check('有代理地址输入框', await page.isVisible('#pubProxy'));
    check('有 AppSecret 输入框', await page.isVisible('#pubSecret'));

    // ③ 面板填值 → 存进 localStorage
    await page.fill('#pubProxy', PROXY);
    await page.fill('#pubAppId', 'wxTESTAPPID');
    await page.fill('#pubSecret', 'TESTSECRET');
    await page.click('#pubBody'); // 触发 change 落盘
    await page.waitForTimeout(200);
    const saved = await page.evaluate(() => localStorage.getItem('gzh.publish') || '');
    check('配置已写入 localStorage', saved.indexOf('wxTESTAPPID') >= 0, saved.slice(0, 80));
    check('AppSecret 存的是明文（仅本机，已提示风险）', saved.indexOf('TESTSECRET') >= 0);

    // ④ 关键：file:// 页面能不能 fetch 本机代理
    await page.click('#pubPing');
    await page.waitForTimeout(1500);
    let status = (await page.textContent('#pubStatus')) || '';
    check('浏览器能连上本机代理（CORS 通）', /代理正常/.test(status), status.slice(0, 120));

    // ⑤ 查公网 IP
    // 首次查 IP 要走 DNS + TLS 到 ipify，实测 3 秒不够，给足 8 秒
    await page.click('#pubIpBtn');
    await page.waitForTimeout(8000);
    status = (await page.textContent('#pubStatus')) || '';
    const ipText = (await page.textContent('#pubIp')) || '';
    soft('能取到本机公网 IP', /^\d+\.\d+\.\d+\.\d+$/.test(ipText.trim()), ipText);

    // ⑥ 测试连接：假 AppID → 微信应回 40013，说明转发链路通
    await page.click('#pubTest');
    await page.waitForTimeout(3000);
    status = (await page.textContent('#pubStatus')) || '';
    soft('转发微信 API 通（假 AppID 返回 40013）', /40013|invalid appid/.test(status), status.slice(0, 160));

    // ⑦ 没填封面时点发送 → 应被拦住
    await page.click('#pubSend');
    await page.waitForTimeout(800);
    status = (await page.textContent('#pubStatus')) || '';
    check('缺封面时拦住发送', /封面 media_id/.test(status), status.slice(0, 120));

    // ⑧ 清除密钥
    page.on('dialog', (d) => d.accept());
    await page.click('#pubClear');
    await page.waitForTimeout(400);
    const after = await page.evaluate(() => localStorage.getItem('gzh.publish') || '');
    check('清除密钥后 localStorage 里没有 AppSecret', after.indexOf('TESTSECRET') < 0);

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
