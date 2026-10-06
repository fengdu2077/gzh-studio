/* gzh-studio · 主题全组件覆盖测试
 *
 * 目的：任何一套主题，只要有一个组件模板写残了（变量拼错、条件段括号少一个、
 * 忘了包 span leaf），都必须在这里被抓住 —— 而不是等发到公众号才发现。
 *
 * 做法：
 *   1. 拿一份覆盖全部 role 的稿子，对 themes/index.js 清单里的每套主题各渲染一遍
 *   2. 再把每个 block 单独渲染一次，断言「非空 + 无 {{ 残留 + 无 undefined」
 *      （单独渲染是关键：整体渲染时坏掉的组件可能被别的输出掩盖）
 *   3. 过一遍该主题自己的 rules 体检
 *
 * 用法: node check/test_theme_coverage.js
 * 退出码 0 = 全绿，1 = 有组件没通过
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.dirname(__dirname);
global.window = global;

const ENGINE = [
  'engine/core.js', 'engine/placeholders.js', 'engine/modules.js',
  'engine/parse.js', 'engine/ir.js', 'engine/sanitize.js', 'engine/render.js',
];

// 先加载主题清单，再按清单把每套主题脚本跑起来
vm.runInThisContext(fs.readFileSync(path.join(ROOT, 'themes/index.js'), 'utf8'), { filename: 'themes/index.js' });
const ORDER = global.GZH_THEME_ORDER || [];
ORDER.forEach((id) => {
  const rel = 'themes/' + id + '.js';
  vm.runInThisContext(fs.readFileSync(path.join(ROOT, rel), 'utf8'), { filename: rel });
});
ENGINE.forEach((rel) => {
  vm.runInThisContext(fs.readFileSync(path.join(ROOT, rel), 'utf8'), { filename: rel });
});

const GZH = global.GZH;
const THEMES = global.GZH_THEMES || {};

/* 覆盖全部 role 的稿子。手写盒子优先，所以 profile 用例不放 front-matter。 */
const MD_BOXES = [
  ':::masthead',
  '## 全组件覆盖：标题',
  'kicker: COVERAGE',
  'issue: 2026.10',
  'account: 覆盖测试号',
  'tagline: TEST',
  '',
  '刊头导语一句话。',
  ':::',
  '',
  ':::highlights 看点标签',
  '- 第一条看点',
  '- 第二条看点',
  ':::',
  '',
  '正文段落，含 **加粗**、`行内代码` 和 [链接](https://example.com)。',
  '',
  '## 第一章 @CHAPTER ONE',
  '',
  '> 引述内容。',
  '>',
  '> @引述来源',
  '',
  ':::note 结论标签',
  'title: 结论标题',
  '',
  '结论正文。',
  ':::',
  '',
  ':::cta 提示标签',
  '提示正文。',
  ':::',
  '',
  '- 无序一',
  '- 无序二',
  '',
  '1. 有序一',
  '2. 有序二',
  '',
  ':::compare',
  '## 甲方案 | 推荐',
  '- 理由一',
  '## 乙方案 | 不推荐',
  '- 问题一',
  ':::',
  '',
  '![]()',
  '',
  '[demo.mp4]',
  '',
  '---',
  '',
  '正文最后一段。',
  '',
  '---',
  '',
  ':::profile',
  'author: 覆盖测试',
  'roleline: TESTER',
  'bio: 一句话简介。',
  'footer: 页脚一行。',
  ':::',
  '',
].join('\n');

// 第二条用例：front-matter 的 author 自动补 signature
const MD_SIG = [
  '---',
  'author: 覆盖测试',
  'roleline: TESTER',
  'bio: 一句话简介。',
  'footer: 页脚一行。',
  '---',
  '',
  '正文段落。',
  '',
  '---',
  '',
].join('\n');

let pass = 0, fail = 0;

function check(name, cond, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (extra ? '   → ' + extra : '')); }
}

function bad(html) {
  const problems = [];
  if (html.indexOf('{{') >= 0) problems.push('模板残留 {{');
  if (/\bundefined\b/.test(html)) problems.push('undefined');
  if (/\[object Object\]/.test(html)) problems.push('[object Object]');
  if (/\bNaN\b/.test(html)) problems.push('NaN');
  return problems;
}

ORDER.forEach((id) => {
  const theme = THEMES[id];
  console.log('\n── ' + id + ' (' + (theme && theme.name) + ') ──');
  if (!theme) { check('主题已注册', false, 'GZH_THEMES 里找不到 ' + id); return; }

  [['手写盒子', MD_BOXES], ['front-matter 署名', MD_SIG]].forEach((pair) => {
    const label = pair[0];
    let ir;
    try {
      ir = GZH.toIR(GZH.parse(pair[1]));
    } catch (e) {
      check(label + ' · 能解析', false, e.message);
      return;
    }
    const roles = ir.blocks.map((b) => b.role);

    // ① 每个 block 单独渲染：坏了就藏不住
    const emptyOnes = [];
    const dirtyOnes = [];
    ir.blocks.forEach((b, i) => {
      const html = GZH.render({ v: 1, meta: ir.meta, blocks: [b] }, theme);
      if (!html || !html.trim()) emptyOnes.push(b.role + '#' + i);
      const p = bad(html);
      if (p.length) dirtyOnes.push(b.role + '#' + i + ' [' + p.join(',') + ']');
    });
    check(label + ' · 每块单独渲染非空', emptyOnes.length === 0, emptyOnes.join(', '));
    check(label + ' · 每块无残留/undefined', dirtyOnes.length === 0, dirtyOnes.join('; '));

    // ② 整体渲染：无残留 + 过体检
    const html = GZH.render(ir, theme);
    const p = bad(html);
    check(label + ' · 整体无残留', p.length === 0, p.join(','));
    const v = GZH.verdict(GZH.metrics(html), theme.rules);
    check(label + ' · 体检通过', v.ok, JSON.stringify(v.issues || []));

    // ③ 该用的 role 真的出现了
    if (label === '手写盒子') {
      const need = ['masthead', 'highlights', 'chapter', 'para', 'quote', 'note',
        'cta', 'list', 'compare', 'image', 'video', 'divider', 'endline', 'profile'];
      const missing = need.filter((r) => roles.indexOf(r) < 0);
      check('覆盖到 ' + need.length + ' 个 role', missing.length === 0, '缺: ' + missing.join(','));
    } else {
      check('signature 自动补上', roles.indexOf('signature') >= 0, roles.join(','));
    }
  });

  // ④ 主题声明的组件数
  const n = Object.keys(theme.components || {}).length;
  check('声明组件数 ' + n, n > 0);
});

console.log('\n' + '─'.repeat(50));
console.log(fail === 0 ? '全绿：' + pass + ' 项' : '有 ' + fail + ' 项没过（共 ' + (pass + fail) + '）');
process.exit(fail === 0 ? 0 : 1);
