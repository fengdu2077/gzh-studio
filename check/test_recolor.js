/* gzh-studio · 换主色守卫（Node 环境）
 *
 * 用途：把主题的主色整套换成另一个色，看渲染结果里还有没有旧色残留。
 *
 * 为什么需要它：
 *   主题里任何一处「没走 token 的硬编码色」，单看主题文件是发现不了的 ——
 *   模板区可以做到零硬编码，但色值还可能藏在引擎脚本里，
 *   或者藏在某个 token 的值里（shadow 曾经就是 rgba(37,99,235,0.06) 写死）。
 *   症状只有一个：换完主色，某几处还是旧色，而且是靠肉眼才看得出来。
 *
 *   这个脚本把「肉眼」换成断言：改一套绿的上来，逐个 token 查旧值残留。
 *
 * 会自动覆盖 themes/ 下的每一套主题（按编译产物 themes/index.js 里的清单），
 * 所以新加主题不用改这个脚本，它会被自动盯上。
 *
 * 用法:
 *   node check/test_recolor.js [主题id]     不传 id 就查全部
 *
 * 退出码 0 = 全部跟变，1 = 有残留（会打印是哪个 token、残留几处）
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.dirname(__dirname);
global.window = global;

['engine/core.js', 'engine/placeholders.js', 'engine/modules.js',
  'engine/parse.js', 'engine/ir.js', 'engine/sanitize.js', 'engine/render.js',
  'themes/index.js'].forEach((rel) => {
  vm.runInThisContext(fs.readFileSync(path.join(ROOT, rel), 'utf8'), { filename: rel });
});

// 主题清单是编译产物：丢个新 JSON 进 themes/ 再编译，这里自动多一套
const ORDER = global.GZH_THEME_ORDER || [];
const ONLY = process.argv[2];
const IDS = ONLY ? [ONLY] : ORDER;

IDS.forEach((id) => {
  vm.runInThisContext(fs.readFileSync(path.join(ROOT, 'themes', id + '.js'), 'utf8'), { filename: id });
});

const GZH = global.GZH;

// 内置示例覆盖的 role 最全，用它当样本
const appHtml = fs.readFileSync(path.join(ROOT, 'app', 'index.html'), 'utf8');
const sm = appHtml.match(/<script type="text\/plain" id="sampleMd">([\s\S]*?)<\/script>/);
if (!sm) { console.error('app/index.html 里找不到 sampleMd'); process.exit(1); }
const md = sm[1].trim();

/* 一套绿色，用来替换蓝色主色系。
 * 注意：只换「跟着主色走」的那几个，文本色不动 —— 它们本来就不该跟主色。 */
const PATCH = {
  accent: '#16a34a',
  accentSub: '#22c55e',
  accentSoft: '#f0fdf4',
  accentSoft2: '#f0fdf4',
  accentTint: '#dcfce7',
  accentTint2: '#bbf7d0',
  accentLine: '#86efac',
};

const ir = GZH.toIR(GZH.parse(md));

console.log('换主色守卫 · 样本 = 内置示例 · 主题 = ' + IDS.join(', '));
console.log();

let totalBad = 0;

IDS.forEach((id) => {
  const theme = global.GZH_THEMES[id];
  if (!theme) {
    console.log('✗ 主题 ' + id + ' 没加载出来（themes/' + id + '.js 存在吗？）');
    totalBad++;
    return;
  }
  totalBad += checkTheme(id, theme);
});

console.log();
if (totalBad === 0) {
  console.log('结论: ' + IDS.length + ' 套主题换主色后全部跟变 ✓');
  process.exit(0);
} else {
  console.log('结论: 有 ' + totalBad + ' 处没跟着变 ✗ —— 说明还有硬编码色没收回 token');
  process.exit(1);
}

function checkTheme(id, theme) {
  const before = GZH.render(ir, theme);

  const green = JSON.parse(JSON.stringify(theme));
  Object.keys(PATCH).forEach((k) => { green.tokens[k] = PATCH[k]; });
  const after = GZH.render(ir, green);

  console.log('── ' + id + ' ──  ' + before.length + ' → ' + after.length + ' 字节');

  /* 逐个 token 查旧值残留。
   * 期望：改成新值之后，旧值在输出里一次都不该再出现。 */
  const rows = [];
  let bad = 0;

  Object.keys(PATCH).forEach((k) => {
    const oldVal = theme.tokens[k];
    // 只在「改之前确实出现过」的前提下才有意义，否则是模板根本没用到它
    const used = count(before, oldVal);
    const left = count(after, oldVal);
    const ok = left === 0;
    if (!ok) bad++;
    rows.push({ token: k, from: oldVal, to: PATCH[k], used, left, ok });
  });

  /* 派生项：没写在 PATCH 里，但换主色时应该自动跟着变 */
  const derived = [];
  const oldRgb = GZH.hexToRgbTriplet(theme.tokens.accent);
  derived.push({
    name: 'shadow（由 accentRgb 派生）',
    probe: 'rgba(' + oldRgb,
    used: count(before, 'rgba(' + oldRgb),
    left: count(after, 'rgba(' + oldRgb),
  });
  derived.push({
    name: '行内代码底色（引用 accentSoft）',
    probe: theme.tokens.accentSoft,
    used: count(before, 'background:' + theme.tokens.accentSoft),
    left: count(after, 'background:' + theme.tokens.accentSoft),
  });
  derived.push({
    name: '链接色（引用 accent）',
    probe: 'color:' + theme.tokens.accent,
    used: count(before, 'color:' + theme.tokens.accent),
    left: count(after, 'color:' + theme.tokens.accent),
  });
  derived.forEach((d) => {
    const ok = d.left === 0;
    if (!ok) bad++;
    rows.push({ token: d.name, from: d.probe, to: '（派生）', used: d.used, left: d.left, ok });
  });

  console.log('  ' + 'token / 部位'.padEnd(32) + '旧值'.padEnd(12) + '改前'.padEnd(8) + '残留'.padEnd(8) + '结果');
  rows.forEach((r) => {
    console.log(
      '  ' +
      r.token.padEnd(30) +
      String(r.from).padEnd(12) +
      String(r.used).padEnd(8) +
      String(r.left).padEnd(8) +
      (r.ok ? '✓' : '✗ 没跟着变')
    );
  });
  console.log();
  return bad;
}

function count(hay, needle) {
  if (!needle) return 0;
  return hay.split(needle).length - 1;
}
