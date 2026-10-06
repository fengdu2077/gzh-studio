/* 把现有主题的 HTML 模板翻译成元素树，写进 themes/*.json 的 compositions。
 *
 *   node check/build_compositions.js
 *
 * 为什么必须跑「忠实度校验」才能写入
 * ------------------------------------------------------------------
 * 翻译器写错一个字符，用户就会发现「我什么都没改，稿子变了」。
 * 所以这里对每一个模板做一次往返校验：
 *
 *   tree = tplToTree(tpl)
 *   treeTpl(tree) === tpl   ← 不等就当场报错、不落盘
 *
 * 这条不等式是整个迁移的安全阀：它保证「换存储格式」这件事
 * **不改变任何一个字节的输出**，所以原有的渲染基线测试不用改。
 *
 * 为什么保留 components.*.tpl 不删
 * ------------------------------------------------------------------
 * ① 回归基准：下次改翻译器时还能再验一遍忠实度
 * ② 用户手写的 tpl 覆盖（localStorage 里的老改动）仍然有效
 * ③ 翻译器出问题时，渲染链路可以立刻退回 old path
 * 代价是每个主题文件大约翻倍，可以接受。
 */
global.window = global;
const fs = require('fs');
const path = require('path');
const vm = require('vm');

['engine/core.js', 'engine/elements.js', 'engine/tplparse.js'].forEach(function (r) {
  vm.runInThisContext(fs.readFileSync(path.join(process.cwd(), r), 'utf8'), { filename: r });
});

const G = global.GZH;
const TPL_KEYS = [
  ['tpl', 'tree'],
  ['item', 'itemTree'],
  ['itemOrdered', 'itemOrderedTree'],
  ['subitem', 'subitemTree']
];

let totalTpl = 0, totalNodes = 0, htmlNodes = 0, failed = 0;

function countTree(ns) {
  (ns || []).forEach(function (n) {
    totalNodes++;
    if (n.type === 'html') htmlNodes++;
    countTree(n.children);
  });
}

fs.readdirSync('themes').filter(function (f) { return /\.json$/.test(f); }).forEach(function (f) {
  const file = 'themes/' + f;
  const raw = fs.readFileSync(file, 'utf8');
  const crlf = raw.indexOf('\r\n') >= 0;     // 行尾要原样带回，不然会出现整文件 diff
  const t = JSON.parse(raw);

  if (!t.components) return;
  const comps = {};
  let ok = 0;

  Object.keys(t.components).forEach(function (role) {
    const c = t.components[role];
    const o = {};
    let has = false;
    TPL_KEYS.forEach(function (pair) {
      if (!c[pair[0]]) return;
      const tree = G.tplToTree(c[pair[0]]);
      const back = G.treeTpl(tree);
      if (back !== c[pair[0]]) {
        failed++;
        console.error('  ✗ 忠实度校验失败：' + f + ' / ' + role + '.' + pair[0]);
        console.error('    原: ' + JSON.stringify(c[pair[0]].slice(0, 160)));
        console.error('    回: ' + JSON.stringify(back.slice(0, 160)));
        throw new Error('翻译不忠实，已中止（' + f + ' 未写入）');
      }
      o[pair[1]] = tree;
      countTree(tree);
      totalTpl++; ok++; has = true;
    });
    if (!has) return;
    if (c.source) o.source = c.source;
    comps[role] = o;
  });

  t.compositions = comps;
  fs.writeFileSync(file, JSON.stringify(t, null, 2).split('\n').join(crlf ? '\r\n' : '\n'));

  const size = fs.statSync(file).size;
  console.log('  ' + f.padEnd(24) + ok + ' 个模板 → 元素树 | 文件 ' + (size / 1024).toFixed(0) + ' KB');
});

console.log('\n合计 ' + totalTpl + ' 个模板，' + totalNodes + ' 个节点，'
  + '其中原样保留 ' + htmlNodes + ' 个（' + Math.round(htmlNodes / totalNodes * 100) + '%）'
  + '，翻译忠实 ' + (failed ? '✗ ' + failed : '✓ 全部逐字节一致'));
