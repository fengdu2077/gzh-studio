/* gzh-studio · 元素树编辑器浏览器冒烟（Node + playwright-core）
 *
 * 这一轮的核心是「能不能可视化编辑组件里的单个元素」。
 * 引擎单元测试（check/test_elements.js）只证明数据结构成立，
 * 证明不了**界面上点得到**。所以这里用真实浏览器把每条动作走一遍：
 *
 *   点元素 → 改字号 → 改颜色 → 加子元素 → 删元素 → 导出带走
 *
 * 用法:NODE_PATH="C:/Users/kifun/.workbuddy/binaries/node/workspace/node_modules" node check/smoke_elements.js
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
  console.log('\n元素树编辑器冒烟测试\n');

  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e.stack || e)));
  page.on('dialog', (d) => d.accept());

  const prevHTML = () => page.evaluate(() => document.getElementById('preview').innerHTML);
  const bodyHTML = () => page.evaluate(() =>
    document.getElementById('preview').innerHTML);

  try {
    await page.goto(APP);
    await page.waitForSelector('#preview section', { timeout: 8000 }).catch(() => {});
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('#preview section', { timeout: 8000 }).catch(() => {});
    await page.click('#sampleBtn');
    await page.waitForTimeout(600);

    // ---------- ① 组件页签默认就是元素模式 ----------
    await page.click('#colorBtn');
    await page.waitForTimeout(250);
    await page.click('#colorTabs .tab[data-tab="comp"]');
    await page.waitForTimeout(350);

    check('组件页签出现元素树', await page.evaluate(() =>
      !!document.querySelector('#colorBody .etree .enode')));
    check('组件页签出现属性面板', await page.evaluate(() =>
      !!document.getElementById('eprops')));

    const nodeCount = await page.$$eval('#colorBody .etree .enode', (els) => els.length);
    check('默认选中的组件有元素节点可点（' + nodeCount + ' 个）', nodeCount > 0);

    // ---------- ② 点节点 → 属性面板跟着变 ----------
    const nodes = await page.$$eval('#colorBody .etree .enode',
      (els) => els.map((e) => e.getAttribute('data-path')));
    check('每个节点带路径标记', nodes.every((p) => !!p), nodes.join(','));

    // 找一个「有字号」的节点（文本类）
    await page.click('#colorBody .cmp-item[data-role="para"]').catch(() => {});
    await page.waitForTimeout(300);
    const paths = await page.$$eval('#colorBody .etree .enode',
      (els) => els.map((e) => e.getAttribute('data-path')));
    await page.click('#colorBody .etree .enode[data-path="' + paths[paths.length - 1] + '"]');
    await page.waitForTimeout(300);

    const propCount = await page.$$eval('#colorBody #eprops .eprow', (els) => els.length);
    check('点中节点后属性面板列出可改项（' + propCount + ' 行）', propCount > 1);

    const hasPx = await page.evaluate(() => !!document.querySelector('#colorBody #eprops input.ep-px'));
    const hasColor = await page.evaluate(() => !!document.querySelector('#colorBody #eprops input[type=color]'));
    check('字号给的是数字框', hasPx);
    check('颜色给的是取色器', hasColor);

    // ---------- ③ 改字号 → 全文预览真的变 ----------
    const before = await prevHTML();
    await page.evaluate(() => {
      const el = document.querySelector('#colorBody #eprops input.ep-px');
      el.value = '31';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.waitForTimeout(400);
    const afterSize = await prevHTML();
    check('改字号后全文预览出现新值', afterSize.indexOf('31px') >= 0 && afterSize !== before);

    // ---------- ④ 改颜色 → 全文预览真的变 ----------
    await page.evaluate(() => {
      const el = document.querySelector('#colorBody #eprops input[type=color]');
      el.value = '#ff00aa';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.waitForTimeout(400);
    const afterColor = await prevHTML();
    check('改颜色后全文预览出现新色值', afterColor.indexOf('#ff00aa') >= 0);

    // ---------- ⑤ 刷新后改动还在（改动真的被持久化） ----------
    await page.reload();
    await page.waitForSelector('#preview section', { timeout: 8000 }).catch(() => {});
    await page.click('#sampleBtn');
    await page.waitForTimeout(600);
    const afterReload = await prevHTML();
    check('刷新后改动仍然生效', afterReload.indexOf('#ff00aa') >= 0);

    // ---------- ⑥ 结构编辑：加一个子元素 ----------
    await page.click('#colorBtn');
    await page.waitForTimeout(250);
    await page.click('#colorTabs .tab[data-tab="comp"]');
    await page.waitForTimeout(300);
    await page.click('#colorBody .cmp-item[data-role="note"]').catch(() => {});
    await page.waitForTimeout(300);
    await page.click('#colorBody .etree .enode[data-path="0"]');
    await page.waitForTimeout(300);

    const addBtn = await page.$('#colorBody [data-eact="addchild"]');
    check('支持添加子元素（容器类型才有这个按钮）', !!addBtn);
    if (addBtn) {
      // 默认类型是 box（空盒子），这里显式选「文字」好验证渲染结果
      await page.selectOption('#colorBody .ep-newtype', 'text').catch(() => {});
      const n0 = await page.$$eval('#colorBody .etree .enode', (e) => e.length);
      await addBtn.click();
      await page.waitForTimeout(400);
      const n1 = await page.$$eval('#colorBody .etree .enode', (e) => e.length);
      check('添加后元素树多了一个节点（' + n0 + ' → ' + n1 + '）', n1 === n0 + 1);
      // 用组件自己的预览框做判定 —— 全文预览里可能压根没有 :::note 这个盒子
      const prev1 = await page.evaluate(() =>
        (document.getElementById('cmpPrev') || {}).innerHTML || '');
      check('添加的子元素渲染进了组件预览', prev1.indexOf('新文字') >= 0, prev1.slice(0, 80));

      // ---------- ⑦ 结构编辑：删除节点 ----------
      await page.click('#colorBody .etree .enode:last-child');
      await page.waitForTimeout(250);
      await page.evaluate(() => {
        const b = document.querySelector('#colorBody [data-eact="delnode"]');
        if (b) b.click();
      });
      await page.waitForTimeout(400);
      const n2 = await page.$$eval('#colorBody .etree .enode', (e) => e.length);
      check('删除后元素树少了一个节点（' + n1 + ' → ' + n2 + '）', n2 === n1 - 1);
    }

    // ---------- ⑧ 源码模式还在（元素做不到的地方留了出口） ----------
    await page.evaluate(() => {
      const b = document.querySelector('#colorBody [data-act="mode"][data-m="src"]');
      if (b) b.click();
    });
    await page.waitForTimeout(350);
    check('可以切回源码模式', await page.evaluate(() => !!document.getElementById('cmpTpl')));

    await page.evaluate(() => {
      const b = document.querySelector('#colorBody [data-act="mode"][data-m="tree"]');
      if (b) b.click();
    });
    await page.waitForTimeout(350);
    check('可以再切回元素模式', await page.evaluate(() =>
      !!document.querySelector('#colorBody .etree .enode')));

    // ---------- ⑨ 导出把元素树的改动带走 ----------
    await page.click('#colorTabs .tab[data-tab="comp"]');
    await page.waitForTimeout(250);
    // 导出文件不是纯 JSON，是 build_theme_js.py 那种 `GZH_THEMES['id'] = {...}` 形态
    const dl = await Promise.all([
      page.waitForEvent('download', { timeout: 15000 }),
      page.click('#colorExport'),
    ]).then((r) => r[0]).catch(() => null);
    check('点导出会下载主题文件', !!dl, dl ? String(dl.suggestedFilename()) : '没等到 download 事件');

    let exported = '';
    if (dl) {
      const filepath = await dl.path();
      if (filepath) exported = require('fs').readFileSync(filepath, 'utf8');
    }
    check('导出的主题里带着元素树', exported.indexOf('"compositions"') >= 0,
      exported.slice(0, 60));
    check('导出内容含被改过的色值', exported.indexOf('#ff00aa') >= 0);

    // 导入回来也要能用 —— 这才是「发给朋友还能改」的意思
    if (dl) {
      const filepath = await dl.path();
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      await page.waitForSelector('#preview section', { timeout: 8000 }).catch(() => {});
      await page.setInputFiles('#themeFile', filepath);
      await page.waitForTimeout(900);
      check('导入后元素改动跟着回来了', await page.evaluate(() => {
        const id = document.getElementById('themeSel').value;
        const c = window.GZH_THEMES[id] && window.GZH_THEMES[id].compositions;
        return !!(c && JSON.stringify(c).indexOf('#ff00aa') >= 0);
      }));
    }

    check('页面无 JS 报错', errors.length === 0, errors.join(' | ').slice(0, 400));

  } catch (e) {
    fail++;
    console.log('  ✗ 运行异常: ' + String(e).slice(0, 300));
  }

  await browser.close();
  console.log('\n结果：' + pass + ' 通过 / ' + fail + ' 失败\n');
  process.exit(fail ? 1 : 0);
})();
