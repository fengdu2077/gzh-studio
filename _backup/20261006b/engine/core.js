/* gzh-studio · 核心工具
 *
 * 设计约束：必须能在 file:// 下跑。
 *   - 不能用 ES Module（Chrome 对 file:// 的模块走 CORS，会直接报错）
 *   - 不能用 fetch() 读主题（同样被 CORS 拦）
 * 所以全部走传统 script + 全局命名空间 window.GZH。
 */
(function (global) {
  'use strict';

  var GZH = global.GZH = global.GZH || {};

  /* ---------- 转义 ---------- */

  // HTML 转义：只处理文本，模板本身的标签不经过这里
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // 属性转义：src / 标题这类要塞进引号里的值
  function escAttr(s) {
    return esc(s).replace(/"/g, '&quot;');
  }

  /* ---------- 模板填充 ----------
   *
   * 两种语法（docs/06 §6.2）：
   *   {{key}}              普通变量，缺失则填空串
   *   {{?key}}...{{/key}}  条件段，值为空/undefined 时整段不输出
   *
   * 条件段支持嵌套（递归），因为 image 模板里 {{?w}} 嵌在属性位上。
   */
  function fill(tpl, vars) {
    if (!tpl) return '';
    var out = tpl.replace(/\{\{\?(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, function (m, key, body) {
      var v = vars[key];
      var keep = !(v === undefined || v === null || v === '');
      return keep ? fill(body, vars) : '';
    });
    out = out.replace(/\{\{(\w+)\}\}/g, function (m, key) {
      var v = vars[key];
      return (v === undefined || v === null) ? '' : String(v);
    });
    return out;
  }

  /* ---------- 行内标记渲染 ----------
   *
   * docs/06 §2.3：支持 **加粗**、`代码`、[文字](链接)。
   * 输入先用 esc() 转义，再只放行这三种结构，避免注入。
   */
  function inline(text) {
    var out = esc(text);

    // `代码` → 等宽浅底 span
    out = out.replace(/`([^`]+)`/g, function (m, c) {
      return '<span style="font-family:Menlo,Consolas,monospace;font-size:0.9em;background:#eff6ff;color:#2563eb;padding:1px 5px;border-radius:4px;">' + c + '</span>';
    });

    // [文字](链接)
    out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, t, href) {
      return '<a href="' + escAttr(href) + '" style="color:#2563eb;text-decoration:none;border-bottom:1px solid #bfdbfe;">' + t + '</a>';
    });

    // **加粗**
    out = out.replace(/\*\*([^*]+)\*\*/g, function (m, t) {
      return '<span style="color:#111827;font-weight:600;">' + t + '</span>';
    });

    return out;
  }

  // markdown 转义符还原：豆包导出的 md 里常见 `2\.1` `\-`
  function unescapeText(s) {
    return String(s == null ? '' : s).replace(/\\([\\`*_{}\[\]()#+\-.!>~|])/g, '$1');
  }

  /* ---------- 小工具 ---------- */

  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  function countOcc(hay, needle) {
    if (!needle) return 0;
    return hay.split(needle).length - 1;
  }

  GZH.esc = esc;
  GZH.escAttr = escAttr;
  GZH.fill = fill;
  GZH.inline = inline;
  GZH.unescapeText = unescapeText;
  GZH.pad2 = pad2;
  GZH.countOcc = countOcc;

})(window);
