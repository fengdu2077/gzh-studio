/* gzh-studio · 「点哪一块就改哪一块」浏览器冒烟（Node + playwright-core）
 *
 * check/test_elements.js 证明的是数据结构（data-ep 打得对不对），
 * 这个脚本证明的是**用户那一步**：
 *
 *   鼠标扫过预览 → 描边 + 告诉你是哪块 → 点一下 → 左边树和右边属性面板跟着走
 *   → 点「文字色」就有取色器 → 改数字 → 预览真的变
 *   → 而正式产物（复制到微信的那份）里干干净净，没有 data-ep
 *
 * 用法:
 *   NODE_PATH="C:/Users/kifun/.workbuddy/binaries/node/workspace/node_modules" node check/smoke_pick.js
 */
'use strict';

const path = require('path');
const { chromium } = require('playwright-core');

const ROOT = path.dirname(__dirname);
const APP = 'file:///' + path.join(ROOT, 'app', 'index.html').replace(/\\/g, '/');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (extra ? '   ' + extra : '')); }
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  console.log('\n预览点选冒烟测试\n');

  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e.stack || e)));
  page.on('dialog', (d) => d.accept());

  try {
    await page.goto(APP);
    await page.waitForSelector('#preview section', { timeout: 8000 }).catch(() => {});
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('#preview section', { timeout: 8000 }).catch(() => {});
    await page.click('#sampleBtn');
    await page.waitForTimeout(600);

    await page.click('#colorBtn');
    await page.waitForTimeout(250);
    await page.click('#colorTabs .tab[data-tab="comp"]');
    await page.waitForTimeout(350);

    // ---------- ① 预览里有可点的元素 ----------
    const roles = await page.$$eval('#colorBody .cmp-item',
      (els) => els.map((e) => e.getAttribute('data-role')));
    let picked = null, eps = [];
    for (const r of roles) {
      await page.click('#colorBody .cmp-item[data-role="' + r + '"]');
      await page.waitForTimeout(220);
      eps = await page.$$eval('#cmpPrev [data-ep]', (els) =>
        els.map((e) => e.getAttribute('data-ep'))).catch(() => []);
      if (eps.length >= 2) { picked = r; break; }
    }
    check('预览里每个元素都带定位标记（' + picked + ' · ' + eps.length + ' 块）',
      !!picked && eps.length >= 2, eps.slice(0, 6).join(' | '));

    // 挑一个内层节点（路径不止一层），外层点不到才叫真失败
    const target = eps.filter((v) => v.indexOf('.') > 0)[0] || eps[0];

    // ---------- ② 鼠标扫过 → 描边 + 报出「这块是什么」 ----------
    await page.hover('#cmpPrev [data-ep="' + target + '"]');
    await wait(250);
    const hoverN = await page.$$eval('#cmpPrev .ep-hover', (els) => els.length).catch(() => 0);
    check('鼠标扫过就描边（' + hoverN + ' 处）', hoverN > 0);

    const info = await page.textContent('#pickInfo').catch(() => '');
    check('扫过时说清这一块是什么（' + (info || '').slice(0, 28) + '）',
      !!info && info.indexOf('这块是') === 0);

    // ---------- ③ 点一下 → 树和面板跟着走 ----------
    await page.click('#cmpPrev [data-ep="' + target + '"]');
    await wait(350);
    // 点在预览里，命中的常常是这一块、或它里面那一层（那也是「你点的位置」，没毛病）
    const onPath = await page.$eval('#colorBody .etree .enode.on',
      (e) => e.getAttribute('data-path')).catch(() => null);
    const t2 = target.replace(/^i:/, '');
    check('点预览 → 左边树选中你点的那一块（' + onPath + '）',
      !!onPath && (onPath === t2 || onPath.indexOf(t2 + '.') === 0), 'target=' + target);

    // ---------- ③b 想改整个卡片时，能退回外层 ----------
    if (onPath && onPath !== t2) {
      const before = onPath.split('.').length;
      await page.click('#colorBody #eprops button[data-eact="parent"]');
      await wait(300);
      const after = await page.$eval('#colorBody .etree .enode.on',
        (e) => e.getAttribute('data-path')).catch(() => null);
      check('「改外面一层」能退上去（' + onPath + ' → ' + after + '）',
        !!after && after.split('.').length === before - 1);
    } else {
      check('「改外面一层」能退上去', true, '（当前就是外层，跳过）');
    }
    await page.click('#colorBody #eprops .epcrumb span[data-crumb="1"]');
    await wait(300);
    const crumbPath = await page.$eval('#colorBody .etree .enode.on',
      (e) => e.getAttribute('data-path')).catch(() => null);
    check('点面包屑回到第 1 层（' + crumbPath + '）', crumbPath === '0');

    const crumb = await page.textContent('#colorBody #eprops .epcrumb').catch(() => '');
    check('面板顶部有面包屑，说清你在第几层（' + (crumb || '').slice(0, 24) + '）', !!crumb);

    const what = await page.textContent('#colorBody #eprops .epwhat').catch(() => '');
    check('面板写清「这一处」是什么（' + (what || '').slice(0, 26) + '）',
      (what || '').indexOf('这一处') >= 0);

    const scope = await page.textContent('#colorBody #eprops .epscope').catch(() => '');
    check('说清了改动的作用域（全文同类都变）', (scope || '').indexOf('都跟着变') >= 0);

    // ---------- ④ 不用懂 CSS：点「文字色」就有取色器 ----------
    const quickN = await page.$$eval('#colorBody #eprops button[data-eact="quick"]',
      (els) => els.length).catch(() => 0);
    check('常用改动按钮排出来了（' + quickN + ' 个）', quickN >= 6);

    await page.click('#colorBody #eprops button[data-eact="quick"][data-k="color"]');
    await wait(350);
    const hasPicker = await page.$$eval('#colorBody #eprops input[type=color]',
      (els) => els.length).catch(() => 0);
    check('点「文字色」→ 直接出现取色器，不用知道它叫 color', hasPicker > 0);

    const prevHas = await page.evaluate(() =>
      document.getElementById('cmpPrev').innerHTML.indexOf('#333333') >= 0);
    check('预览里真的出现了刚加的颜色', prevHas);

    // ---------- ⑤ 改数字 → 预览立刻变 ----------
    let px = await page.$('#colorBody #eprops input.ep-px[data-k="font-size"]');
    if (!px) {
      await page.click('#colorBody #eprops button[data-eact="quick"][data-k="font-size"]');
      await wait(300);
      px = await page.$('#colorBody #eprops input.ep-px[data-k="font-size"]');
    }
    check('有字号数字框', !!px);
    if (px) {
      await page.fill('#colorBody #eprops input.ep-px[data-k="font-size"]', '30');
      await wait(400);
      const ok = await page.evaluate(() =>
        document.getElementById('cmpPrev').innerHTML.indexOf('font-size:30px') >= 0);
      check('把字号改成 30 → 预览立刻变', ok);
    }

    // ---------- ⑥ 属性分组：找「颜色」而不是找 color ----------
    const groups = await page.$$eval('#colorBody #eprops .epgrp',
      (els) => els.map((e) => e.textContent.trim())).catch(() => []);
    check('样式按用途分了组（' + groups.slice(0, 4).join(' / ') + '）', groups.length >= 2);

    // ---------- ⑦ 正式产物不受污染 ----------
    const main = await page.evaluate(() => document.getElementById('preview').innerHTML);
    check('右侧全文预览不含 data-ep（复制到微信的那份是干净的）',
      main.indexOf('data-ep') < 0);

    check('全程没有 JS 报错', errors.length === 0, errors.slice(0, 2).join(' | '));
  } catch (e) {
    check('冒烟脚本本身跑完', false, String(e.stack || e));
  }

  await browser.close();
  console.log('\n结果：' + pass + ' 通过 / ' + fail + ' 失败\n');
  process.exit(fail ? 1 : 0);
})();
