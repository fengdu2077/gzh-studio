/* gzh-studio · 刊头卡封面「三态」测试
 *
 * 背景：封面曾经是两态 —— 写了用真图，没写/留空一律塞占位图。
 * 于是「刊头卡不带封面」这个正当的排版选择根本做不出来：
 * 用 # 标题起手的稿子没有手写 :::masthead，引擎自动补刊头卡时
 * 顺手也补了一张封面占位图，作者连说「我不要封面」的地方都没有。
 *
 * 现在两条路径（:::masthead 盒子 / front-matter+H1 自动补）共用一套规则：
 *   没写 cover        → 一个 <img> 都不输出
 *   cover: （空/伪地址）→ 占位图
 *   cover: 真地址      → 原样使用
 *
 * 这个脚本专门守住这条规则，防止以后改 ir.js 时又把「没写」和「留空」混为一谈。
 *
 * 用法: node check/test_cover.js
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
  'themes/mist-editorial.js',
].forEach((rel) => {
  vm.runInThisContext(fs.readFileSync(path.join(ROOT, rel), 'utf8'), { filename: rel });
});

const GZH = global.GZH;
const theme = global.GZH_THEMES['blue-editorial'];
const COVER_PH = GZH.placeholders.cover.uri;

let pass = 0, fail = 0;

function ir(md) { return GZH.toIR(GZH.parse(md)); }

function mastheadHtml(md, t) {
  const blocks = ir(md).blocks;
  const html = GZH.render({ blocks: blocks }, t || theme);
  return { html, mh: blocks.filter((b) => b.role === 'masthead')[0] };
}

function check(name, cond, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (extra ? '   ' + extra : '')); }
}

const BOX = (coverLine) => ':::masthead\n## 标题\n' + coverLine + 'account: 风渡2077\n\n导语。\n:::\n';
const FM = (coverLine) => '---\ntitle: 标题\n' + coverLine + '---\n\n正文。\n';
const H1 = (coverLine) => (coverLine ? '' : '') + '# 标题\n\n正文。\n';

console.log('\n刊头卡封面三态测试\n');

console.log('① :::masthead 盒子');
{
  const a = mastheadHtml(BOX(''));
  check('不写 cover → IR 里没有 cover 值', !a.mh.cover, JSON.stringify(a.mh.cover));
  check('不写 cover → HTML 里一个 <img> 都没有', !/<img/.test(a.html));
  check('不写 cover → coverPlaceholder 为 false', a.mh.coverPlaceholder === false);

  const b = mastheadHtml(BOX('cover: \n'));
  check('cover 留空 → 落占位图', b.html.indexOf(COVER_PH) >= 0);
  check('cover 留空 → coverPlaceholder 为 true', b.mh.coverPlaceholder === true);

  const c = mastheadHtml(BOX('cover: https://cdn.example.cn/a.jpg\n'));
  check('cover 真地址 → 原样使用', c.html.indexOf('https://cdn.example.cn/a.jpg') >= 0);
  check('cover 真地址 → 不落占位图', c.html.indexOf(COVER_PH) < 0);
  check('cover 真地址 → coverPlaceholder 为 false', c.mh.coverPlaceholder === false);
}

console.log('\n② front-matter（旧稿兼容路径）');
{
  const a = mastheadHtml(FM(''));
  check('没写 cover → 自动补的刊头卡也不放图', !/<img/.test(a.html));
  check('没写 cover → cover 为空串', a.mh.cover === '');

  const b = mastheadHtml(FM('cover: \n'));
  check('cover 留空 → 自动补的刊头卡落占位图', b.html.indexOf(COVER_PH) >= 0);

  const c = mastheadHtml(FM('cover: https://cdn.example.cn/b.jpg\n'));
  check('cover 真地址 → 自动补的刊头卡用真图', c.html.indexOf('https://cdn.example.cn/b.jpg') >= 0);
}

console.log('\n③ 只有 # 标题（最常见的 AI 生成稿形态）');
{
  const a = mastheadHtml(H1(''));
  check('自动生成了刊头卡', !!a.mh);
  check('且不带封面占位图（本轮修的那个 bug）', !/<img/.test(a.html));
}

console.log('\n④ 换主题不影响这条规则（mist-editorial）');
{
  const t = global.GZH_THEMES['mist-editorial'];
  const a = mastheadHtml(BOX(''), t);
  check('mist 下不写 cover → 无图', !/<img/.test(a.html));
  const b = mastheadHtml(BOX('cover: \n'), t);
  check('mist 下 cover 留空 → 有占位图', /<img/.test(b.html));
}

console.log('\n' + (fail ? '✗ ' + fail + ' 项失败，' : '✓ 全部通过，') + pass + ' 项通过\n');
process.exit(fail ? 1 : 0);
