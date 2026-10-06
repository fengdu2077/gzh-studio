/* gzh-studio · 主题编辑面板浏览器冒烟（Node + playwright-core）
 *
 * 这一轮的改动几乎全在 UI 层（尺度旋钮 / 模板编辑器 / 自建组件 / 占位图），
 * 引擎侧单元测试看不见它们，只能靠真实浏览器点一遍。
 *
 * 每条对应一个「用户应该能自己做到」的动作：
 *   改间距 → 改模板 → 造组件 → 导出带着走。
 *
 * 用法: node check/smoke_editor.js
 * 依赖: playwright-core
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
function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }

// 滑块不能用 fill，只能改 value 再自己派发 input
async function setRange(page, key, val) {
  await page.evaluate((o) => {
    const el = document.querySelector('#colorBody input[type=range][data-k="' + o.k + '"]');
    el.value = o.v;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, { k: key, v: val });
  await wait(220);
}

(async () => {
  console.log('\n主题编辑面板冒烟测试\n');

  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('dialog', (d) => d.accept());

  try {
    await page.goto(APP);
    await page.waitForSelector('#preview section', { timeout: 8000 }).catch(() => {});
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('#preview section', { timeout: 8000 }).catch(() => {});
    await page.click('#sampleBtn');
    await page.waitForTimeout(600);

    const themeId = await page.evaluate(() => document.getElementById('themeSel').value);
    check('默认主题已选中', !!themeId, themeId);

    // ---------- ① 面板与三个页签 ----------
    await page.click('#colorBtn');
    await page.waitForTimeout(300);
    check('主题编辑面板打开', await page.isVisible('#colorBody'));
    check('有三个页签', (await page.$$('#colorTabs .tab')).length === 3);
    check('默认在配色页', await page.isVisible('#colorBody input[type=color]'));

    // ---------- ② 尺度旋钮 ----------
    await page.click('#colorTabs .tab[data-tab="scale"]');
    await page.waitForTimeout(300);
    check('尺度页有滑块', await page.isVisible('#colorBody input[type=range][data-k="cardGap"]'));
    check('尺度页有字体下拉', await page.isVisible('#colorBody select[data-k="fontFamily"]'));

    const before = await page.innerHTML('#preview');
    await setRange(page, 'cardGap', '48');
    const after = await page.innerHTML('#preview');
    check('改之前正文里没有 48px 间距', before.indexOf('margin-top:48px') < 0);
    check('改卡片间距后预览跟着变', after.indexOf('margin-top:48px') >= 0);

    await setRange(page, 'fontSize', '18');
    check('改字号后预览跟着变', (await page.innerHTML('#preview')).indexOf('font-size:18px') >= 0);

    // ---------- ③ 改动持久化 ----------
    const savedOv = await page.evaluate(() =>
      localStorage.getItem('gzh.overrides.' + document.getElementById('themeSel').value) || '');
    check('尺度改动写进了 localStorage', /"base"/.test(savedOv) && /48px/.test(savedOv), savedOv.slice(0, 90));

    await page.reload();
    await page.waitForSelector('#preview section', { timeout: 8000 }).catch(() => {});
    await page.click('#sampleBtn');
    await page.waitForTimeout(600);
    check('刷新后改动还在', (await page.innerHTML('#preview')).indexOf('margin-top:48px') >= 0);

    // ---------- ④ 占位图跟着主题走 ----------
    const phBlue = await page.evaluate(() => window.GZH.placeholders.cover.uri || '');
    await page.selectOption('#themeSel', 'mist-editorial');
    await page.waitForTimeout(700);
    const phMist = await page.evaluate(() => window.GZH.placeholders.cover.uri || '');
    check('切主题后占位图重画了', !!phMist && phBlue !== phMist,
      '长度 ' + phBlue.length + ' → ' + phMist.length);

    await page.selectOption('#themeSel', themeId);
    await page.waitForTimeout(500);

    // ---------- ⑤ 组件编辑 ----------
    await page.click('#colorBtn');
    await page.waitForTimeout(200);
    await page.click('#colorTabs .tab[data-tab="comp"]');
    await page.waitForTimeout(400);
    check('组件页有组件列表', await page.isVisible('#colorBody .cmp-item'));
    // 现在默认是「元素」模式（点元素改属性，不出现 HTML 大文本框），
    // 源码模式要显式切换 —— 这一轮新增的能力，顺手在这里把两条路都验一下。
    check('组件页默认是元素模式', await page.isVisible('#colorBody .etree .enode'));
    check('元素模式有属性面板', await page.isVisible('#eprops'));
    await page.click('#colorBody [data-act="mode"][data-m="src"]');
    await page.waitForTimeout(350);
    check('切到源码模式有模板编辑框', await page.isVisible('#cmpTpl'));

    const tplBefore = await page.inputValue('#cmpTpl');
    await page.fill('#cmpTpl',
      '<section style="margin-top:8px;"><p style="margin:0;"><span leaf="">ZZEDITED {{text}}</span></p></section>');
    await page.waitForTimeout(400);
    check('改模板后组件预览同步', (await page.innerHTML('#cmpPrev')).indexOf('ZZEDITED') >= 0);
    check('模板体检有输出', ((await page.textContent('#cmpMsg')) || '').length > 0);

    // 违规模板要当场指出来
    await page.fill('#cmpTpl', '<div class="x" style="position:relative;"><p>裸奔文字</p></div>');
    await page.waitForTimeout(300);
    const badMsg = (await page.textContent('#cmpMsg')) || '';
    check('违规模板会被体检指出', /微信会拦/.test(badMsg) && /div/.test(badMsg), badMsg.slice(0, 90));

    await page.evaluate(() => {
      Array.prototype.slice.call(document.querySelectorAll('#colorBody [data-act="reset"]'))
        .forEach(function (b) { b.click(); });
    });
    await page.waitForTimeout(400);
    check('恢复默认模板可用', (await page.inputValue('#cmpTpl')) === tplBefore);

    // ---------- ⑥ 自建组件 ----------
    await page.click('#cmpNewBtn');
    await page.waitForTimeout(250);
    check('新建组件表单展开', await page.isVisible('#ncRole'));
    await page.fill('#ncName', '我的结论卡');
    await page.fill('#ncRole', 'verdict');
    await page.click('#ncOk');
    await page.waitForTimeout(500);

    check('自建组件出现在左栏', await page.evaluate(() =>
      !!document.querySelector('#modules .mod[data-role="verdict"]')));
    check('自建组件已注册进引擎（含 FALLBACK）', await page.evaluate(() =>
      !!(window.GZH.MODULES.verdict && window.GZH.MODULES.verdict.__custom
        && window.GZH.FALLBACK.verdict)));

    await page.evaluate(() => {
      const box = document.querySelector('#cmpTpl');
      box.value = '<section style="margin-top:8px;border-left:3px solid {{accent}};padding:2px 0 2px 14px;">'
        + '<p style="margin:0;"><span leaf="">ZZVERDICT {{text}}</span></p></section>';
      box.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.waitForTimeout(400);

    await page.evaluate(() => {
      const md = document.getElementById('md');
      md.value = ':::verdict\n这是结论卡正文ZZZ\n:::\n';
      md.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.waitForTimeout(600);
    const pv = await page.innerHTML('#preview');
    check('稿子里 :::verdict 渲染成了自定义模板',
      pv.indexOf('ZZVERDICT') >= 0 && pv.indexOf('ZZZ') >= 0, pv.slice(0, 160));

    // ---------- ⑦ 改动可被导出 ----------
    const ovNow = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('gzh.overrides.' + document.getElementById('themeSel').value) || '{}'));
    check('overrides 里带着自建组件', !!(ovNow.modules && ovNow.modules.verdict),
      JSON.stringify(ovNow.modules || {}).slice(0, 120));

    // ---------- ⑧ 隐藏 / 删除 ----------
    await page.click('#colorTabs .tab[data-tab="comp"]');
    await page.waitForTimeout(400);
    const hasVerdictBtn = await page.evaluate(() =>
      !!document.querySelector('#colorBody .cmp-item[data-role="verdict"]'));
    check('组件列表里有自建的 verdict', hasVerdictBtn);
    await page.click('#colorBody .cmp-item[data-role="verdict"]');
    await page.waitForTimeout(300);
    await page.evaluate(() => {
      const b = document.querySelector('#colorBody [data-act="hide"][data-role="verdict"]');
      if (b) b.click();
    });
    await page.waitForTimeout(400);
    check('隐藏后左栏不再显示', await page.evaluate(() =>
      !document.querySelector('#modules .mod[data-role="verdict"]')));

    await page.evaluate(() => {
      const b = document.querySelector('#colorBody [data-act="del"][data-role="verdict"]');
      if (b) b.click();
    });
    await page.waitForTimeout(500);
    check('删除自建组件后引擎里也没有了', await page.evaluate(() => !window.GZH.MODULES.verdict));

    // ---------- ⑨ 导出 → 再导入：发给朋友还能用吗 ----------
    await page.click('#cmpNewBtn');
    await page.waitForTimeout(250);
    await page.fill('#ncName', '我的结论卡');
    await page.fill('#ncRole', 'verdict');
    await page.click('#ncOk');
    await page.waitForTimeout(500);

    const dl = await Promise.all([
      page.waitForEvent('download', { timeout: 15000 }),
      page.click('#colorExport'),
    ]).then((r) => r[0]).catch(() => null);
    check('点导出会下载主题文件', !!dl, dl ? String(dl.suggestedFilename()) : '没等到 download 事件');

    if (dl) {
      const fs = require('fs');
      const txt = fs.readFileSync(await dl.path(), 'utf8');
      const m = txt.match(/g\.GZH_THEMES\['[a-z0-9_-]+'\] = ([\s\S]*?);\n\}\)\(window\);/);
      const obj = m ? JSON.parse(m[1]) : null;
      check('导出的主题能被 JSON 解析回来', !!obj);
      if (obj) {
        check('导出里带着自建组件的模板', !!(obj.components && obj.components.verdict && obj.components.verdict.tpl));
        check('导出里带着自建组件的定义', !!(obj.modules && obj.modules.verdict));
        check('导出里带着尺度改动', obj.base && obj.base.cardGap === '48px',
          JSON.stringify(obj.base || {}).slice(0, 80));
      }

      const filePath = await dl.path();
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      await page.waitForSelector('#preview section', { timeout: 8000 }).catch(() => {});
      await page.setInputFiles('#themeFile', filePath);
      await page.waitForTimeout(900);
      check('导入后左栏又出现了自建组件', await page.evaluate(() =>
        !!document.querySelector('#modules .mod[data-role="verdict"]')));
      check('导入后尺度改动也回来了', await page.evaluate(() =>
        window.GZH_THEMES[document.getElementById('themeSel').value].base.cardGap === '48px'));
    }

    check('页面无 JS 报错', errors.length === 0, errors.join(' | ').slice(0, 300));
  } catch (e) {
    fail++;
    console.log('  ✗ 异常：' + e.message + '\n    ' + String(e.stack || '').split('\n')[1]);
  } finally {
    await browser.close();
  }

  console.log('\n' + (fail ? '✗ ' + fail + ' 项失败' : '✓ 全部通过 ' + pass + ' 项') + '\n');
  process.exit(fail ? 1 : 0);
})();
