/* gzh-studio · 分隔线角色分流测试
 *
 * 背景：`---` 在文里有两种语义 —— 文中是节奏断点（divider），
 * 文末那条才是 END 收尾线（endline）。以前 ir.js 一律塞 endline，
 * 于是文中每插一条分隔线就冒出一个 END。
 *
 * 这个脚本专门守住那条分流规则，防止以后改 ir.js 时又合回去。
 *
 * 用法: node check/test_divider.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.dirname(__dirname);
global.window = global;

[
  'engine/core.js',
  'engine/elements.js',
  'engine/tplparse.js',
  'engine/placeholders.js',
  'engine/modules.js',
  'engine/parse.js',
  'engine/ir.js',
  'engine/sanitize.js',
  'engine/render.js',
  'themes/blue-editorial.js',
].forEach((rel) => {
  vm.runInThisContext(fs.readFileSync(path.join(ROOT, rel), 'utf8'), { filename: rel });
});

const GZH = global.GZH;
const theme = global.GZH_THEMES['blue-editorial'];

// endline 的标志是模板里写死的 END 字样
const END_MARK = '>END<';
// divider 的标志是中间那颗 5px 圆点（主题 divider.tpl）
const DOT_MARK = 'width:5px;height:5px;border-radius:50%';

let pass = 0, fail = 0;

function run(md) {
  const ir = GZH.toIR(GZH.parse(md));
  const html = GZH.render(ir, theme);
  return {
    roles: ir.blocks.map((b) => b.role),
    ends: GZH.countOcc ? GZH.countOcc(html, END_MARK) : html.split(END_MARK).length - 1,
    dots: GZH.countOcc ? GZH.countOcc(html, DOT_MARK) : html.split(DOT_MARK).length - 1,
    html,
  };
}

function check(name, cond, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (extra ? '   ' + extra : '')); }
}

console.log('\n分隔线分流测试\n');

/* ① 文中的 --- 后面还有正文 → 必须是 divider，不能出现 END */
console.log('① 文中单条 ---（后面还有正文）');
{
  const r = run('第一段。\n\n---\n\n第二段。\n');
  check('角色是 divider', r.roles.indexOf('divider') >= 0, JSON.stringify(r.roles));
  check('没有 endline', r.roles.indexOf('endline') < 0, JSON.stringify(r.roles));
  check('渲染不出 END', r.ends === 0, 'END 出现 ' + r.ends + ' 次');
  check('渲染出圆点分隔线', r.dots === 1, '圆点 ' + r.dots + ' 个');
}

/* ② 文末的 --- → endline，保留 END */
console.log('② 文末单条 ---');
{
  const r = run('第一段。\n\n---\n');
  check('角色是 endline', r.roles.indexOf('endline') >= 0, JSON.stringify(r.roles));
  check('渲染出 END', r.ends === 1, 'END 出现 ' + r.ends + ' 次');
}

/* ③ 文中 + 文末各一条 → 只有文末那条是 END */
console.log('③ 文中一条 + 文末一条');
{
  const r = run('第一段。\n\n---\n\n第二段。\n\n---\n');
  const d = r.roles.filter((x) => x === 'divider').length;
  const e = r.roles.filter((x) => x === 'endline').length;
  check('恰好 1 个 divider', d === 1, 'divider ' + d + ' 个');
  check('恰好 1 个 endline', e === 1, 'endline ' + e + ' 个');
  check('END 全文只出现 1 次', r.ends === 1, 'END ' + r.ends + ' 次');
  check('圆点出现 1 次', r.dots === 1, '圆点 ' + r.dots + ' 个');
}

/* ④ 文末 --- 后面跟署名卡 → 仍算文末收尾线 */
console.log('④ 文末 --- 后接作者卡');
{
  const r = run('第一段。\n\n---\n\n:::profile\nauthor: 风渡\n:::\n');
  check('角色是 endline（作者卡属于收尾块）', r.roles.indexOf('endline') >= 0, JSON.stringify(r.roles));
  check('END 出现 1 次', r.ends === 1, 'END ' + r.ends + ' 次');
}

/* ⑤ 最后一条 --- 后面还有正文 → 降级回 divider，不能霸占 END */
console.log('⑤ 两条 --- 都在文中（末尾还有正文）');
{
  const r = run('第一段。\n\n---\n\n第二段。\n\n---\n\n第三段。\n');
  const d = r.roles.filter((x) => x === 'divider').length;
  check('两条都是 divider', d === 2, 'divider ' + d + ' 个');
  check('全文没有 END', r.ends === 0, 'END ' + r.ends + ' 次');
}

/* ⑥ 渲染产物仍然过微信体检（分隔线不能引入告警） */
console.log('⑥ 微信合规体检');
{
  const r = run('第一段。\n\n---\n\n第二段。\n\n---\n');
  const v = GZH.verdict(GZH.metrics(r.html), theme.rules);
  check('体检通过', v.ok !== false, JSON.stringify(v.issues || v));
  check('模板无残留', (GZH.metrics(r.html).templateResidue || 0) === 0);
}

console.log('\n' + (fail === 0
  ? '结论: 分流规则全部正常 (' + pass + '/' + pass + ') ✓'
  : '结论: 有 ' + fail + ' 项失败 (' + pass + ' 通过 / ' + (pass + fail) + ' 项) ✗'));
console.log('');

process.exit(fail === 0 ? 0 : 1);
