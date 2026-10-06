/* gzh-studio · 命令行渲染器
 *
 * 用途：把一份 Markdown 用指定主题渲染成公众号正文（纯 <section>），
 * 落到文件或 stdout，供预览页 / 人工比对使用。
 *
 * 用法:
 *   node check/render.js <markdown> <themeId> [输出文件]
 *   不写输出文件就打 stdout。跑 `node check/render.js` 不带参数可列出可用主题。
 *
 * 例：
 *   node check/render.js samples/demo-mist.md mist-editorial samples/preview-mist.html
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
].forEach((rel) => {
  vm.runInThisContext(fs.readFileSync(path.join(ROOT, rel), 'utf8'), { filename: rel });
});

// 主题是编译产物（file:// 下不能用 fetch 读 JSON），所以直接加载 themes/*.js
fs.readdirSync(path.join(ROOT, 'themes'))
  .filter((f) => /\.js$/.test(f) && f !== 'index.js')
  .forEach((f) => {
    vm.runInThisContext(fs.readFileSync(path.join(ROOT, 'themes', f), 'utf8'), { filename: f });
  });

const GZH = global.GZH;
const themes = global.GZH_THEMES || {};

const mdPath = process.argv[2];
const themeId = process.argv[3];
const outPath = process.argv[4];

if (!mdPath || !themeId) {
  console.log('用法: node check/render.js <markdown> <themeId> [输出文件]');
  console.log('可用主题:', Object.keys(themes).join(' / ') || '(无，先跑 check/build_theme_js.py)');
  process.exit(1);
}

const theme = themes[themeId];
if (!theme) {
  console.error('找不到主题:', themeId, '｜可用:', Object.keys(themes).join(' / '));
  process.exit(1);
}

const md = fs.readFileSync(path.resolve(mdPath), 'utf8');
const ir = GZH.toIR(GZH.parse(md));
const html = GZH.render(ir, theme);

const m = GZH.metrics(html);
const v = GZH.verdict(m, theme.rules);

if (outPath) {
  fs.writeFileSync(path.resolve(outPath), html, 'utf8');
  console.log('写出:', outPath, `(${html.length} 字节)`);
} else {
  process.stdout.write(html);
}

const imgs = (html.match(/<img/g) || []).length;
console.log(`主题: ${theme.name} (${theme.id})  图片 ${imgs} 张（其中占位图 ${m.placeholder} 处）`);
console.log(v.ok ? '体检: 通过' : '体检: 未通过\n  - ' + v.issues.join('\n  - '));
process.exit(v.ok ? 0 : 1);
