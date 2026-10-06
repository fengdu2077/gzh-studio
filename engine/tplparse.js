/* gzh-studio · 模板 → 元素树（自动翻译器）
 *
 * 存在的理由：一次迁移 3 套主题 × 15 个组件
 * ------------------------------------------------------------------
 * 手写 45 个组件的元素树既慢又容易错。这里做的是一个**保守**翻译器：
 *
 *   能干净译成元素的，译；
 *   译出来可能丢一个字符的，整块保留为 html 节点（渲染结果与原样一致）。
 *
 * 保守的代价是「有一小部分节点不可逐项编辑」，
 * 但换来的是 **迁移零回归** —— 这是 docs/10 §5 阶段 2 的前提。
 *
 * 对每个节点都记下原文片段（raw），所以 html 兜底是直接抄原文，不是重新拼出来的。
 *
 * 它也用在运行时：App 导入一个没带 compositions 的老主题时，
 * 可以当场把它的 tpl 译成元素树给用户改 —— 新能力立刻对老主题生效。
 */
(function (global) {
  'use strict';

  var GZH = global.GZH = global.GZH || {};

  var VOID = ['img', 'br', 'hr', 'input', 'meta', 'link'];

  /* ---------- 1. 切成节点 ----------
   * 产物只有四种：tag / group(条件段) / tpl(模板变量) / text。
   */
  function parseAttrs(s) {
    var attrs = {}, order = [];
    var re = /([^\s=]+)(?:="([^"]*)")?/g, m;
    while ((m = re.exec(s)) !== null) {
      var k = m[1].toLowerCase();
      if (attrs[k] !== undefined) continue;
      attrs[k] = m[2] === undefined ? '' : m[2];
      order.push(k);
    }
    return { attrs: attrs, order: order, raw: s || '' };
  }

  function parseNodes(src, pos) {
    var out = [];
    pos = pos || 0;

    while (pos < src.length) {
      var rest = src.slice(pos);

      if (rest.substr(0, 2) === '{{') {
        var closeM = /^\{\{\/(\w+)\}\}/.exec(rest);
        if (closeM) return { nodes: out, pos: pos + closeM[0].length };

        var openM = /^\{\{\?(\w+)\}\}/.exec(rest);
        if (openM) {
          var inner = parseNodes(src, pos + openM[0].length);
          out.push({ kind: 'group', name: openM[1], children: inner.nodes });
          pos = inner.pos;
          continue;
        }

        var tplM = /^\{\{[^}]*\}\}/.exec(rest);
        if (tplM) {
          out.push({ kind: 'tpl', text: tplM[0] });
          pos += tplM[0].length;
          continue;
        }
        out.push({ kind: 'text', text: '{' });
        pos += 1;
        continue;
      }

      if (rest.charAt(0) === '<') {
        if (/^<!--/.test(rest)) {
          var ce = src.indexOf('-->', pos);
          pos = ce < 0 ? src.length : ce + 3;
          continue;
        }

        var endM = /^<\/([a-zA-Z0-9]+)\s*>/.exec(rest);
        if (endM) return { nodes: out, pos: pos + endM[0].length };

        // 注意两件事：
        // ① 条件段可以嵌在属性位上（如 <img src="" {{?w}} data-w="{{w}}"{{/w}}），
        //    属性之间可能没有空格、值闭包后面可能紧跟下一段，所以前导用 \s*；
        // ② 不能排除 '/' —— {{/w}} 里就有斜杠，排掉会让整个标签匹配失败、
        //    退化成一堆碎文本节点。自闭合交给末尾的 (\/?) 和 VOID 表判断。
        var tagM = /^<([a-zA-Z0-9]+)((?:\s*[^\s=<>]+(?:="[^"]*")?)*)\s*(\/?)>/.exec(rest);
        if (tagM) {
          var name = tagM[1].toLowerCase();
          var selfClose = tagM[3] === '/' || VOID.indexOf(name) >= 0;
          if (selfClose) {
            out.push({ kind: 'tag', name: name, attrs: parseAttrs(tagM[2] || ''), children: null, raw: tagM[0] });
            pos += tagM[0].length;
            continue;
          }
          var inner2 = parseNodes(src, pos + tagM[0].length);
          var endAt = inner2.pos;
          out.push({
            kind: 'tag', name: name, attrs: parseAttrs(tagM[2] || ''),
            children: inner2.nodes, raw: src.slice(pos, endAt)
          });
          pos = endAt;
          continue;
        }

        out.push({ kind: 'text', text: '<' });
        pos += 1;
        continue;
      }

      var stop = src.length;
      var i1 = src.indexOf('<', pos);
      var i2 = src.indexOf('{{', pos);
      if (i1 >= 0) stop = Math.min(stop, i1);
      if (i2 >= 0) stop = Math.min(stop, i2);
      if (stop === pos) stop = pos + 1;
      out.push({ kind: 'text', text: src.slice(pos, stop) });
      pos = stop;
    }

    return { nodes: out, pos: pos };
  }

  /* ---------- 2. 样式字符串 → 有序字典 ---------- */
  function parseStyle(s) {
    var out = {}, order = [];
    if (s == null) { out.__order = order; return out; }
    // 条件段嵌在 style 里（{{?w}}width:{{w}};{{/w}}）：无法映射成属性，整节点走 html 兜底
    if (String(s).indexOf('{{?') >= 0) return null;
    var semi = /;\s*$/.test(s);
    var inject = 0;
    String(s).split(';').forEach(function (part) {
      if (!part || !part.trim()) return;
      var i = part.indexOf(':');
      // 「display:flex;gap:10px;{{itemGap}}」最后那个片段没有键，
      // 它是一个整体注入的样式串（第一项留给它的 margin-top 就是这么实现的）。
      // 丢掉会让列表间距失效，所以按序存成 __I0 / __I1，渲染时原样吐出。
      if (i < 0) {
        var key = '__I' + (inject++);
        out[key] = part.trim();
        order.push(key);
        return;
      }
      var k = part.slice(0, i).trim();
      var v = part.slice(i + 1).trim();
      if (!k) return;
      out[k] = v;
      order.push(k);
    });
    out.__order = order;
    out.__semi = semi;
    return out;
  }

  /* ---------- 3. 节点 → 元素 ---------- */
  function withIf(el, conds) {
    if (conds && conds.length) el.if = conds.slice();
    return el;
  }

  function mkHtml(raw, conds) {
    return withIf({ type: 'html', html: raw }, conds);
  }

  // inline 内容还原成字符串（可能是 文本 + {{变量}} 混合）
  function inlineText(nodes) {
    return (nodes || []).map(function (n) {
      if (n.kind === 'text') return n.text;
      if (n.kind === 'tpl') return n.text;
      return null;                 // 嵌套标签 → 不还原
    }).filter(function (x) { return x !== null; }).join('');
  }

  function significant(nodes) {
    return (nodes || []).filter(function (n) {
      return !(n.kind === 'text' && !/\S/.test(n.text));
    });
  }

  function pToElement(n) {
    var A = n.attrs.attrs;
    var st = parseStyle(A.style);
    if (!st) return null;
    if (n.attrs.order.some(function (a) { return a !== 'style'; })) return null;

    var kids = significant(n.children);
    if (kids.length !== 1) return null;

    var k = kids[0];

    if (k.kind === 'tag' && k.name === 'span') {
      var other = Object.keys(k.attrs.attrs).filter(function (a) { return a !== 'leaf' && a !== 'style'; });
      if (other.length) return null;
      if (k.attrs.attrs.leaf !== '' && k.attrs.attrs.leaf !== undefined) { /* leaf 必须是空串 */ }
      if (k.attrs.attrs.leaf === undefined) return null;   // 必须是 <span leaf="">
      if (k.attrs.attrs.leaf !== '') return null;

      // 用完整 children（不过滤空白）：<span leaf=""> </span> 里那个空格是有意义的，
      // 过滤掉会让分隔线的高度塌掉。
      var content = inlineText(k.children);
      // 内容里有标签（<strong> / <a> 等行内标记）→ inlineText 会返回带 null，已过滤；
      // 这里用长度对比判断是否真的还原完整
      if (significant(k.children).some(function (c) { return c.kind === 'tag' || c.kind === 'group'; })) return null;

      if (k.attrs.attrs.style === undefined) {
        return { type: 'text', text: content, style: st };
      }
      var spanSt = parseStyle(k.attrs.attrs.style);
      if (!spanSt) return null;
      return { type: 'badge', text: content, style: st, span: spanSt };
    }

    if (k.kind === 'tag' && k.name === 'img') {
      var keys = Object.keys(k.attrs.attrs).filter(function (a) { return k.attrs.attrs[a] !== undefined; });
      if (keys.some(function (a) { return a !== 'src' && a !== 'style'; })) return null;
      var ist = parseStyle(k.attrs.attrs.style);
      return {
        type: 'image',
        style: st,
        src: k.attrs.attrs.src === undefined ? '{{src}}' : k.attrs.attrs.src,
        imgStyle: ist && Object.keys(ist).filter(function (x) { return x.indexOf('__') !== 0; }).length ? ist : undefined
      };
    }

    return null;
  }

  function tagToElement(n) {
    if (n.name === 'span') {
      // 有 leaf 的是「文字承载者」，交给父级 <p> 处理（text / badge）；
      // 只有 style 的是内联小容器 —— 头像圆、序号、装饰条都是它。
      var hasLeaf = Object.prototype.hasOwnProperty.call(n.attrs.attrs, 'leaf');
      var keysS = Object.keys(n.attrs.attrs).filter(function (a) { return a !== 'style'; });
      if (hasLeaf || keysS.length) return null;
      var stC = parseStyle(n.attrs.attrs.style);
      if (!stC) return null;
      return { type: 'chip', style: stC, children: toTree(n.children) };
    }

    if (n.name === 'figure') {
      var keysF = Object.keys(n.attrs.attrs).filter(function (a) { return a !== 'style'; });
      if (keysF.length) return null;
      var stF = parseStyle(n.attrs.attrs.style);
      if (!stF) return null;
      return { type: 'figure', style: stF, children: toTree(n.children) };
    }

    if (n.name === 'p') return pToElement(n);

    if (n.name === 'img') {
      var A2 = n.attrs.attrs;
      var keys = Object.keys(A2).filter(function (a) { return A2[a] !== undefined; });
      if (keys.some(function (a) { return a !== 'src' && a !== 'style'; })) return null;
      var ist2 = parseStyle(A2.style);
      return {
        type: 'image',
        style: {},
        src: A2.src === undefined ? '{{src}}' : A2.src,
        imgStyle: ist2 && Object.keys(ist2).filter(function (x) { return x.indexOf('__') !== 0; }).length ? ist2 : undefined
      };
    }

    if (n.name === 'section') {
      var stS = parseStyle(n.attrs.attrs.style);
      if (!stS) return null;
      var kids = toTree(n.children);
      if (!kids.length) {
        var isLine = /(^|;)border(-top|-bottom|-left|-right)?\s*:/.test(String(n.attrs.attrs.style || ''));
        return { type: isLine ? 'divider' : 'spacer', style: stS };
      }
      return {
        type: /display\s*:\s*flex/.test(String(n.attrs.attrs.style || '')) ? 'grid' : 'box',
        style: stS,
        children: kids
      };
    }

    return null;
  }

  function toTree(nodes, conds) {
    conds = conds || [];
    var out = [];

    (nodes || []).forEach(function (n) {
      if (n.kind === 'group') {
        out = out.concat(toTree(n.children, conds.concat([n.name])));
        return;
      }
      if (n.kind === 'text') {
        if (!/\S/.test(n.text)) return;          // 空白节点：不参与渲染，丢掉不影响结果
        out.push(mkHtml(n.text, conds));
        return;
      }
      if (n.kind === 'tpl') {
        var m = /^\{\{(\w+)\}\}$/.exec(n.text);
        out.push(m ? withIf({ type: 'slot', name: m[1] }, conds) : mkHtml(n.text, conds));
        return;
      }
      // kind === 'tag'
      var el = tagToElement(n);
      out.push(el ? withIf(el, conds) : mkHtml(n.raw, conds));
    });

    return out;
  }

  function tplToTree(tpl) {
    if (!tpl) return [];
    try {
      return toTree(parseNodes(String(tpl), 0).nodes);
    } catch (e) {
      // 解析失败绝不静默：宁可退回「整段原样」，也不能悄悄少渲染一块
      return [{ type: 'html', html: String(tpl) }];
    }
  }

  GZH.tplToTree = tplToTree;
  GZH.parseStyleDict = parseStyle;

})(window);
