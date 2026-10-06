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
   *
   * 配色以前写死在函数体里（#eff6ff / #2563eb / #bfdbfe / #111827），
   * 主题根本管不到 —— 换个主色，卡片变绿了链接还是蓝的。
   * 现在改成由第二参数传入；不传就退回下面这套兜底值，
   * 所以「没有主题声明」的老场景输出与以前逐字节一致。
   */
  var INLINE_FALLBACK = {
    codeBg: '#eff6ff',
    codeColor: '#2563eb',
    linkColor: '#2563eb',
    linkLine: '#bfdbfe',
    strongColor: '#111827',
    strongBg: ''   // 空 = 不加底，只加粗上色（老主题的行为）
  };

  function inline(text, style) {
    var s = style || {};
    function pick(k) {
      var v = s[k];
      return (v === undefined || v === null || v === '') ? INLINE_FALLBACK[k] : v;
    }
    var codeBg = pick('codeBg'), codeColor = pick('codeColor');
    var linkColor = pick('linkColor'), linkLine = pick('linkLine');
    var strongColor = pick('strongColor');
    // 荧光笔：给了底色的加粗才会带底。不给就是纯加粗，
    // 所以「没声明」的主题输出与以前逐字节一致。
    var strongBg = pick('strongBg');

    var out = esc(text);

    // `代码` → 等宽浅底 span
    out = out.replace(/`([^`]+)`/g, function (m, c) {
      return '<span style="font-family:Menlo,Consolas,monospace;font-size:0.9em;background:' + codeBg + ';color:' + codeColor + ';padding:1px 5px;border-radius:4px;">' + c + '</span>';
    });

    // [文字](链接)
    out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, t, href) {
      return '<a href="' + escAttr(href) + '" style="color:' + linkColor + ';text-decoration:none;border-bottom:1px solid ' + linkLine + ';">' + t + '</a>';
    });

    // **加粗**（strongBg 非空时是荧光笔效果）
    var strongStyle = 'color:' + strongColor + ';font-weight:600;'
      + (strongBg ? 'background:' + strongBg + ';padding:1px 3px;' : '');
    out = out.replace(/\*\*([^*]+)\*\*/g, function (m, t) {
      return '<span style="' + strongStyle + '">' + t + '</span>';
    });

    return out;
  }

  /* ---------- 主题值的派生与引用展开 ----------
   *
   * 两件事，都是为了消灭「主题管不到的硬编码」：
   *
   * 1. accentRgb：从主色 #2563eb 派生出 "37,99,235"。
   *    rgba() 要的是三元组而不是 hex，以前只能把
   *    rgba(37,99,235,0.06) 整个写死在 shadow 这个 token 的值里 ——
   *    换主色后卡片变绿了、外圈那抹阴影还是蓝的。
   *
   * 2. 引用展开：token 的值里允许写 {{另一个token}}。
   *    主题只要把 shadow 写成 "0 3px 12px rgba({{accentRgb}},0.06)"，
   *    换主色时它自己就跟着变，不需要人记得改。
   *
   * 只作用于 tokens，不动 block —— 用户正文里出现 {{}} 不该被当成引用。
   */
  var HEX6 = /^#([0-9a-fA-F]{6})$/;

  function hexToRgbTriplet(hex) {
    var m = HEX6.exec(String(hex == null ? '' : hex).trim());
    if (!m) return '';
    var n = parseInt(m[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255].join(',');
  }

  function resolveRefs(vars) {
    var out = {};
    Object.keys(vars).forEach(function (k) { out[k] = vars[k]; });
    Object.keys(out).forEach(function (k) {
      var v = out[k];
      if (typeof v === 'string' && v.indexOf('{{') >= 0) out[k] = fill(v, out);
    });
    return out;
  }

  /* 行内标记配色的默认来源：引用同名 token，而不是把色值再抄一份。
   * 主题想单独定制（比如链接不想跟主色一样）就写 inlineStyle 覆盖。 */
  var INLINE_REFS = {
    codeBg: '{{accentSoft}}',
    codeColor: '{{accent}}',
    linkColor: '{{accent}}',
    linkLine: '{{accentTint2}}',
    strongColor: '{{textStrong}}'
  };

  /* 把主题整理成渲染直接可用的形态。
   * 返回的是新对象，不改调用方传进来的 theme。 */
  function prepareTheme(theme) {
    var tokens = Object.assign({}, theme.tokens);

    // 每个 #rrggbb 形式的 token 自动派生一个同名的 Rgb 三元组（accent → accentRgb）。
    // rgba() 要的是三元组而不是 hex，不派生的后果就是模板里只能写死
    // rgba(37,99,235,0.06) 这种值 —— 换主色时它纹丝不动。
    // 自动派生而不是让主题逐个手写，是为了避免「加个颜色 token 就得记得加个 Rgb」。
    var derived = {};
    Object.keys(tokens).forEach(function (k) {
      if (tokens[k + 'Rgb'] !== undefined) return;
      if (typeof tokens[k] === 'string' && HEX6.test(tokens[k].trim())) {
        derived[k + 'Rgb'] = hexToRgbTriplet(tokens[k]);
      }
    });
    Object.keys(derived).forEach(function (k) { tokens[k] = derived[k]; });

    tokens = resolveRefs(tokens);

    var refs = Object.assign({}, INLINE_REFS, theme.inlineStyle || {});
    var inlineStyle = {};
    Object.keys(refs).forEach(function (k) {
      inlineStyle[k] = fill(String(refs[k]), tokens);
    });

    return {
      tokens: tokens,
      base: theme.base || {},
      components: theme.components || {},
      inlineStyle: inlineStyle
    };
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
  GZH.hexToRgbTriplet = hexToRgbTriplet;
  GZH.resolveRefs = resolveRefs;
  GZH.prepareTheme = prepareTheme;
  GZH.INLINE_REFS = INLINE_REFS;
  GZH.INLINE_FALLBACK = INLINE_FALLBACK;

})(window);
