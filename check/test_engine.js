/* gzh-studio · 引擎冒烟测试（Node 环境）
 *
 * 用途：不打开浏览器就能验证 parse → toIR → render → metrics 整条链路。
 *
 * 用法:
 *   node check/test_engine.js [markdown 文件]
 *   默认读 samples/demo.md
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.dirname(__dirname);

// 浏览器环境里脚本挂在 window 上，这里把 window 指向 global 来复用同一份代码
global.window = global;

const FILES = [
  'engine/core.js',
  'engine/placeholders.js',
  'engine/modules.js',
  'engine/parse.js',
  'engine/ir.js',
  'engine/sanitize.js',
  'engine/render.js',
  'themes/blue-editorial.js',
];

FILES.forEach((rel) => {
  const full = path.join(ROOT, rel);
  vm.runInThisContext(fs.readFileSync(full, 'utf8'), { filename: rel });
});

const GZH = global.GZH;
const theme = global.GZH_THEMES['blue-editorial'];

let mdPath = process.argv[2];
let md;
if (mdPath === '--sample') {
  // 直接读 App 内置的示例块 —— 不重复维护一份样例文件
  const appHtml = fs.readFileSync(path.join(ROOT, 'app', 'index.html'), 'utf8');
  const m = appHtml.match(/<script type="text\/plain" id="sampleMd">([\s\S]*?)<\/script>/);
  if (!m) { console.error('app/index.html 里找不到 sampleMd'); process.exit(1); }
  md = m[1].trim();
  mdPath = 'app/index.html#sampleMd';
} else {
  mdPath = mdPath || path.join(ROOT, 'samples', 'demo.md');
  md = fs.readFileSync(mdPath, 'utf8');
}

console.log('输入:', mdPath.startsWith('app') ? mdPath : path.relative(ROOT, mdPath), `(${md.length} 字节)`);
console.log('主题:', theme.name, `(${theme.id} v${theme.version})`);
console.log();

const ast = GZH.parse(md);
console.log('① parse  →  AST 块数:', ast.blocks.length);
const kinds = {};
ast.blocks.forEach((b) => { kinds[b.type] = (kinds[b.type] || 0) + 1; });
console.log('           AST 构成:', JSON.stringify(kinds));

const ir = GZH.toIR(ast);
console.log('② toIR   →  IR 块数:', ir.blocks.length);
const roles = {};
ir.blocks.forEach((b) => { roles[b.role] = (roles[b.role] || 0) + 1; });
console.log('           role 分布:', JSON.stringify(roles, null, 0));

const html = GZH.render(ir, theme);
console.log('③ render →  HTML 长度:', html.length, '字节');

const m = GZH.metrics(html);
console.log('④ metrics:', JSON.stringify({
  section: (html.match(/<section/g) || []).length,
  leafSpan: m.leafSpan,
  flex: m.flex,
  gradient: m.gradient,
  textAlign: m.textAlign,
  browserJunk: m.browserJunk,
  placeholder: m.placeholder,
  tempLink: m.tempLink,
  templateResidue: m.templateResidue,
}, null, 0));

// ⑤ 模板残留：主题模板写错时唯一可见的症状。
// 规则本身在 check/build_theme_js.py 里（编译期拦截），这里只查结果，
// 避免同一套规则在两种语言里各写一遍。
console.log('⑤ 模板残留:', m.templateResidue === 0
  ? '无 ✓'
  : m.templateResidue + ' 处 ✗ —— 主题模板的条件段没成对，跑 check/build_theme_js.py 看详情');

const v = GZH.verdict(m, theme.rules);
console.log();
if (v.ok) {
  console.log('体检: 通过');
} else {
  console.log('体检: 未通过');
  v.issues.forEach((s) => console.log('   -', s));
}

const out = path.join(ROOT, '_test_output.html');
fs.writeFileSync(out, html, 'utf8');
console.log('\n产出已写入:', path.relative(ROOT, out));

// 检查 IR 是否泄漏了外观信息（docs/06 的铁律）
const irText = JSON.stringify(ir);
const BAD = ['#2563eb', '#eff6ff', 'font-size', '<section', 'margin-top'];
const leaks = BAD.filter((k) => irText.includes(k));
console.log('IR 外观泄漏检查:', leaks.length ? '发现 ' + leaks.join(', ') : '干净');
