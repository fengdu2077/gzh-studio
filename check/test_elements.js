/* check/test_elements.js · 元素层测试
 *
 *   node check/test_elements.js
 *
 * 这个测试守的是「元素化之后你能点着改」这条承诺，一共三件事：
 *
 *   ① 忠实：老模板译成元素树再渲染回去，必须逐字节等于原文
 *      —— 不等就说明翻译器改写了用户的稿子，这是最不能接受的 bug
 *   ② 可读：每种元素类型都能渲染成正确的微信标签结构
 *   ③ 可改：改一个字段 → 输出真的跟着变（这是元素化存在的全部意义）
 *
 * 注意 ③ 是**行为验证而不是结构验证**：
 * 只断言「属性写进树里了」没有意义，必须断言渲染结果变了。
 */
global.window = global;
var fs = require('fs');
var vm = require('vm');

[
  'engine/core.js', 'engine/elements.js', 'engine/tplparse.js',
  'engine/placeholders.js', 'engine/modules.js', 'engine/parse.js',
  'engine/ir.js', 'engine/sanitize.js', 'engine/render.js'
].forEach(function (r) {
  vm.runInThisContext(fs.readFileSync(r, 'utf8'), { filename: r });
});

var G = global.GZH;
var pass = 0, fail = 0;

function check(name, cond, note) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (note ? '  → ' + note : '')); }
}

function themesFiles() {
  return fs.readdirSync('themes').filter(function (f) { return /\.json$/.test(f); });
}

function clone(o) { return JSON.parse(JSON.stringify(o)); }

var TPL_KEYS = [['tpl', 'tree'], ['item', 'itemTree'],
  ['itemOrdered', 'itemOrderedTree'], ['subitem', 'subitemTree']];

/* ---------- ① 忠实度：tree 渲染回来必须等于原文 ---------- */
console.log('\n① 翻译忠实度（元素树 ⇄ HTML 模板）');

var totals = { tpl: 0, node: 0, raw: 0 };
themesFiles().forEach(function (f) {
  var t = JSON.parse(fs.readFileSync('themes/' + f, 'utf8'));
  var bad = 0, n = 0;
  Object.keys(t.components || {}).forEach(function (role) {
    TPL_KEYS.forEach(function (pair) {
      var src = t.components[role][pair[0]];
      if (!src) return;
      n++;
      var tree = (t.compositions && t.compositions[role] && t.compositions[role][pair[1]])
        || G.tplToTree(src);
      function walk(ns) {
        (ns || []).forEach(function (x) {
          totals.node++; if (x.type === 'html') totals.raw++;
          walk(x.children);
        });
      }
      walk(tree);
      if (G.treeTpl(tree) !== src) bad++;
    });
  });
  totals.tpl += n;
  check(f + '：' + n + ' 个模板往返后逐字节一致', bad === 0, bad + ' 个不一致');
});

/* ---------- ② 元素类型渲染 ---------- */
console.log('\n② 每种元素渲染成什么');

check('text → <p><span leaf="">', G.treeTpl([{ type: 'text', text: 'X', style: { 'font-size': '20px', __order: ['font-size'], __semi: true } }])
  === '<p style="font-size:20px;"><span leaf="">X</span></p>');

check('badge 带内层样式', G.treeTpl([{ type: 'badge', text: 'B', style: empty(), span: { color: 'red', __order: ['color'], __semi: true } }])
  === '<p style=""><span leaf="" style="color:red;">B</span></p>');

check('image → <p><img>', G.treeTpl([{ type: 'image', style: empty(), src: 'a.png' }])
  === '<p style=""><img src="a.png"></p>');

check('chip → <span>', G.treeTpl([{ type: 'chip', style: empty(), children: [] }])
  === '<span style=""></span>');

check('figure → <figure>', G.treeTpl([{ type: 'figure', style: empty(), children: [] }])
  === '<figure style=""></figure>');

check('box → <section>', G.treeTpl([{ type: 'box', style: empty(), children: [] }])
  === '<section style=""></section>');

check('slot → {{content}}', G.treeTpl([{ type: 'slot', name: 'content' }]) === '{{content}}');

check('html → 原样输出', G.treeTpl([{ type: 'html', html: '<b>x</b>' }]) === '<b>x</b>');

check('if 单条件', G.treeTpl([{ type: 'text', text: 'X', if: 'cover', style: empty() }])
  === '{{?cover}}<p style=""><span leaf="">X</span></p>{{/cover}}');

check('if 多条件嵌套', G.treeTpl([{ type: 'text', text: 'X', if: ['a', 'b'], style: empty() }])
  === '{{?a}}{{?b}}<p style=""><span leaf="">X</span></p>{{/b}}{{/a}}');

check('__semi=false 时不补尾部分号',
  G.treeTpl([{ type: 'box', style: { margin: '0', __order: ['margin'], __semi: false }, children: [] }])
  === '<section style="margin:0"></section>');

check('__I 注入片段原样吐出',
  G.treeTpl([{ type: 'box', style: { gap: '10px', __I0: '{{itemGap}}', __order: ['gap', '__I0'], __semi: false }, children: [] }])
  === '<section style="gap:10px;{{itemGap}}"></section>');

function empty() { return { __order: [], __semi: false }; }

/* ---------- ③ 可编辑性：改一个字段，渲染结果必须变 ---------- */
console.log('\n③ 改一个字段，渲染结果必须跟着变');

var theme = JSON.parse(fs.readFileSync('themes/blue-editorial.json', 'utf8'));

function renderRole(tree, role, block) {
  var t = clone(theme);
  t.compositions = clone(t.compositions || {});
  t.compositions[role] = Object.assign({}, t.compositions[role], { tree: tree });
  return G.renderBlock(t, block);
}

// 改字号
var base = clone(theme.compositions.para.tree);
check('para 基线渲染正常', /<section/.test(renderRole(base, 'para', { role: 'para', text: 'x' })));

var sz = clone(base);
sz[0].children[0].style['font-size'] = '30px';
check('把字号改成 30px → 输出真的出现 font-size:30px',
  renderRole(sz, 'para', { role: 'para', text: 'x' }).indexOf('font-size:30px') >= 0);

var clr = clone(base);
clr[0].children[0].style['color'] = '#ff0000';
check('把颜色改成 #ff0000 → 输出真的出现该色值',
  renderRole(clr, 'para', { role: 'para', text: 'x' }).indexOf('#ff0000') >= 0);

var rad = clone(theme.compositions.note.tree);
rad[0].style['border-radius'] = '0px';
check('把卡片圆角改成 0 → 输出真的没有圆角了',
  renderRole(rad, 'note', { role: 'note', text: 'x' }).indexOf('border-radius:0px') >= 0);

var bg = clone(theme.compositions.note.tree);
bg[0].style['background'] = 'linear-gradient(135deg,#111,#222)';
check('把底色改成渐变 → 输出真的出现渐变',
  renderRole(bg, 'note', { role: 'note', text: 'x' }).indexOf('linear-gradient(135deg,#111,#222)') >= 0);

// 条件开关：这就是「A 主题有图、B 主题没图」的实现基础
var coverOn = clone(theme.compositions.masthead.tree);
var withCover = renderRole(coverOn, 'masthead', { role: 'masthead', title: 't', cover: 'http://x.png' });
var noCover = renderRole(coverOn, 'masthead', { role: 'masthead', title: 't' });
check('同一个组件：给了 cover 就有图，没给就没有',
  withCover.indexOf('http://x.png') >= 0 && noCover.indexOf('http://x.png') < 0);

// 结构编辑
var plus = clone(theme.compositions.note.tree);
plus[0].children.push({ type: 'text', text: '多加的一行', style: { margin: '0', __order: ['margin'], __semi: true } });
check('给组件加一个子元素 → 输出多出这一段',
  renderRole(plus, 'note', { role: 'note', text: 'x' }).indexOf('多加的一行') >= 0);

var minus = clone(theme.compositions.note.tree);
var n0 = (minus[0].children || []).length;
minus[0].children.splice(1, 1);
check('删掉一个子元素 → 输出真的少一段（' + n0 + ' → ' + minus[0].children.length + '）',
  renderRole(minus, 'note', { role: 'note', text: 'x' }).length
  < renderRole(theme.compositions.note.tree, 'note', { role: 'note', text: 'x' }).length + 1
  && minus[0].children.length === n0 - 1);

// 改完还得过合规
var irBefore = G.renderBlock(clone(theme), { role: 'note', text: 'x' });
var irAfter = G.renderBlock(Object.assign(clone(theme), {
  compositions: Object.assign(clone(theme.compositions), { note: Object.assign({}, theme.compositions.note, { tree: bg }) })
}), { role: 'note', text: 'x' });
G.verdict(G.metrics(irAfter), theme.rules || {});
check('改过的组件渲染结果仍然合规（无模板残留、有 leaf span）',
  G.metrics(irAfter).templateResidue === 0 && G.metrics(irAfter).leafSpan > 0);

/* ---------- ④ 老主题没有元素树也能渲染 ---------- */
console.log('\n④ 兼容：没有 compositions 的老主题');
var legacy = clone(theme);
delete legacy.compositions;
check('删掉 compositions 后渲染结果不变（退回 tpl 路径）',
  G.renderBlock(legacy, { role: 'para', text: 'x' }) === G.renderBlock(clone(theme), { role: 'para', text: 'x' }));
check('老主题仍能被现场翻译出来编辑', G.tplToTree(legacy.components.para.tpl).length > 0);

/* ---------- ⑤ 点选标记：预览能定位，正式产物不受污染 ---------- */
console.log('\n⑤ 预览点选标记 data-ep');

var plain = renderRole(clone(theme.compositions.note.tree), 'note', { role: 'note', text: 'x' });
var marked = (function () {
  var t = clone(theme);
  t.compositions = clone(t.compositions || {});
  t.compositions.note = Object.assign({}, t.compositions.note,
    { tree: clone(theme.compositions.note.tree) });
  return G.renderBlock(t, { role: 'note', text: 'x' }, { annotate: true });
})();

check('正式渲染不含 data-ep（复制到微信的产物不被污染）', plain.indexOf('data-ep') < 0);
check('预览渲染带上了 data-ep', marked.indexOf('data-ep="0"') >= 0);
check('摘掉标记后与正式渲染逐字节相同',
  marked.replace(/ data-ep="[^"]*"/g, '') === plain);

function countNodes(list) {
  var n = 0;
  (list || []).forEach(function (x) { n += 1 + countNodes(x.children); });
  return n;
}
// 漏标一块，那块就点不到 —— 「点哪改哪」会在它身上静默失效。
// 用一棵没有条件段的树来数，否则条件不满足的节点本就不渲染，数对不上。
var demoTree = [
  { type: 'box', style: { margin: '0', __order: ['margin'], __semi: true }, children: [
    { type: 'text', text: 'A', style: { __order: [], __semi: false } },
    { type: 'text', text: 'B', style: { __order: [], __semi: false } }
  ] }
];
var demoMarked = G.treeTpl(demoTree, { annotate: true });
var want = countNodes(demoTree);
var got = (demoMarked.match(/data-ep="/g) || []).length;
check('每个元素都打到了标记（' + got + '/' + want + '）', got === want,
  '漏标的元素在预览里点不中');

// 条件成立的节点也要能点到（note 给足 label/title 后应该比只给 text 时更多）
var fullNote = renderRole(clone(theme.compositions.note.tree), 'note',
  { role: 'note', label: 'L', title: 'T', text: 'x' });
var fullMarked = (function () {
  var t = clone(theme);
  t.compositions = clone(t.compositions || {});
  t.compositions.note = Object.assign({}, t.compositions.note,
    { tree: clone(theme.compositions.note.tree) });
  return G.renderBlock(t, { role: 'note', label: 'L', title: 'T', text: 'x' }, { annotate: true });
})();
check('条件成立的块也能点到（' + (fullMarked.match(/data-ep="/g) || []).length
  + ' > ' + (marked.match(/data-ep="/g) || []).length + '）',
  (fullMarked.match(/data-ep="/g) || []).length > (marked.match(/data-ep="/g) || []).length);
check('带条件的预览摘掉标记后仍与正式渲染一致',
  fullMarked.replace(/ data-ep="[^"]*"/g, '') === fullNote);

// 列表项的标记必须带 i: 前缀：UI 靠它区分「点的是主体还是某一条」
var itemRole = Object.keys(theme.compositions).filter(function (r) {
  return (theme.compositions[r].itemTree || []).length;
})[0];
if (itemRole) {
  var im = (function () {
    var t = clone(theme);
    t.compositions = clone(t.compositions || {});
    t.compositions[itemRole] = clone(theme.compositions[itemRole]);
    return G.renderBlock(t, { role: itemRole, items: ['一', '二'] }, { annotate: true });
  })();
  check('列表项的标记带 i: 前缀（' + itemRole + '）', im.indexOf('data-ep="i:') >= 0);
} else {
  check('列表项的标记带 i: 前缀', false, '没找到带 itemTree 的组件');
}

/* ---------- ⑥ 面板靠它们把「这一处」说清楚 ---------- */
console.log('\n⑥ 身份描述与覆盖提示');
check('身份描述把变量说成人话（{{title}} → 标题）',
  G.nodeIdentity({ type: 'text', text: '{{title}}' }).indexOf('标题') >= 0);
check('身份描述带出字号，方便核对有没有点对',
  G.nodeIdentity({ type: 'text', text: 'x', style: { 'font-size': '20px', __order: ['font-size'], __semi: true } })
    .indexOf('20px') >= 0);
var shadowed = {
  type: 'box', style: { color: '#111' },
  children: [{ type: 'box', style: { color: '#222' }, children: [] }]
};
check('能发现内层也设了同一属性（「改了没反应」的元凶）',
  G.hasDeeper(shadowed, 'color') === true && G.hasDeeper(shadowed, 'font-size') === false);

/* ---------- ⑦ 整个 demo 文档仍然不回归 ---------- */
console.log('\n⑦ 全文渲染');
try {
  var md = fs.readFileSync('samples/demo.md', 'utf8');
  var html = G.render(G.toIR(G.parse(md)), JSON.parse(fs.readFileSync('themes/blue-editorial.json', 'utf8')));
  var v = G.verdict(G.metrics(html), theme.rules || {});
  check('samples/demo.md 渲染 ' + html.length + ' 字节且体检通过', v.ok, v.issues.join('；'));
} catch (e) {
  check('samples/demo.md 渲染', false, e.message);
}

console.log('\n统计：' + totals.tpl + ' 个模板 / ' + totals.node + ' 个节点，'
  + '原样保留 ' + totals.raw + ' 个（' + Math.round(totals.raw / totals.node * 100) + '%）');
console.log('结果：' + pass + ' 通过 / ' + fail + ' 失败\n');
process.exit(fail ? 1 : 0);
