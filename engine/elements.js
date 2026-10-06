/* gzh-studio · 元素层：属性化的渲染单元
 *
 * 为什么要有这一层
 * ------------------------------------------------------------------
 * 以前主题里存的是「一整段 HTML 字符串」（components.*.tpl）。
 * 字符串里的 22px 程序不知道它是字号，旁边的 1080 也不知道是宽度还是行高，
 * 所以 UI 只能给一个 textarea —— 「能不能让我自己改」到这里就断了（docs/09、docs/10）。
 *
 * 这一层把渲染单元换成属性化的 JSON：
 *
 *   { type:'text', text:'{{title}}', style:{ 'font-size':'20px', '__order':['font-size'] } }
 *
 * 每个值都是独立字段，UI 可以给它配数字框、取色器、下拉框。
 *
 * 关于 __order / __semi 这两个看着像元数据的字段
 * ------------------------------------------------------------------
 * 它们是「忠于原文」的代价，不是偷懒：
 *
 *   style 字典本身是无序的，但 CSS 输出顺序会改变字符串结果。
 *   为了让「翻译过来的元素树」与「原来的 tpl」渲染结果逐字节一致，
 *   必须记住原来的书写顺序（__order）和末尾有没有分号（__semi）。
 *
 *   它们只是输出顺序的提示，**不改变「每个值是可编辑字段」这个性质** ——
 *   UI 不显示这两个字段，用户也永远不需要碰它们。
 *   翻译器（engine/tplparse.js）自动生成，人手写的元素树可以不写，
 *   不写就按字典顺序输出。
 *
 * 最后一步仍然是 fill()
 * ------------------------------------------------------------------
 * 元素树渲染出来的是**模板字符串**（里面还留着 {{title}} / {{?cover}}…{{/cover}}），
 * 最后由 render.js 统一跑一次 GZH.fill()。
 * 所以变量与条件段的语义跟老链路完全同源 —— 这也是字节级等价的基础。
 */
(function (global) {
  'use strict';

  var GZH = global.GZH = global.GZH || {};

  /* ---------- CSS 属性元数据：名字 → 怎么给它配控件 ----------
   *
   * ctrl 的取值决定了 UI 显示什么：
   *   px      数字 + px（字号、圆角、间距）
   *   num     纯数字（行高、字重倍数）
   *   color   取色器 + 文本框（可填 {{token}}）
   *   paint   文本框 + 「改成渐变」按钮（背景可能是渐变）
   *   box     四边合一（margin / padding 的简写，如 "0 0 12px"）
   *   enum    下拉框
   *   text    文本框（兜底，任何没列到的属性都能改，只是没有专用控件）
   */
  var PROP_LIST = [
    ['margin', '外边距', 'box'],
    ['margin-top', '上间距', 'px'],
    ['margin-bottom', '下间距', 'px'],
    ['margin-left', '左间距', 'px'],
    ['margin-right', '右间距', 'px'],
    ['padding', '内边距', 'box'],
    ['padding-top', '上内距', 'px'],
    ['padding-bottom', '下内距', 'px'],
    ['padding-left', '左内距', 'px'],
    ['padding-right', '右内距', 'px'],
    ['font-size', '字号', 'px'],
    ['font-weight', '字重', 'weight'],
    ['line-height', '行高', 'num'],
    ['letter-spacing', '字间距', 'px'],
    ['color', '文字色', 'color'],
    ['background', '背景', 'paint'],
    ['background-color', '背景色', 'color'],
    ['border', '边框', 'text'],
    ['border-top', '上边框', 'text'],
    ['border-bottom', '下边框', 'text'],
    ['border-left', '左边框', 'text'],
    ['border-right', '右边框', 'text'],
    ['border-radius', '圆角', 'px'],
    ['border-top-left-radius', '左上圆角', 'px'],
    ['box-shadow', '阴影', 'text'],
    ['text-align', '对齐', 'align'],
    ['text-decoration', '装饰线', 'text'],
    ['font-family', '字体', 'text'],
    ['font-style', '倾斜', 'text'],
    ['display', '布局', 'text'],
    ['flex', '弹性', 'text'],
    ['gap', '栏间距', 'px'],
    ['align-items', '纵向对齐', 'text'],
    ['justify-content', '横向分布', 'text'],
    ['width', '宽度', 'text'],
    ['max-width', '最大宽度', 'text'],
    ['min-width', '最小宽度', 'text'],
    ['height', '高度', 'px'],
    ['min-height', '最小高度', 'px'],
    ['max-height', '最大高度', 'px'],
    ['opacity', '不透明度', 'num'],
    ['vertical-align', '基线对齐', 'text'],
    ['white-space', '空白处理', 'text'],
    ['word-break', '断词', 'text'],
    ['word-spacing', '词间距', 'px'],
    ['text-indent', '首行缩进', 'px'],
    ['overflow', '溢出', 'text'],
    ['transform', '变换', 'text']
  ];

  var PROPS = {};
  PROP_LIST.forEach(function (r) { PROPS[r[0]] = { label: r[1], ctrl: r[2] }; });

  // 没登记的属性也给个兜底：任何属性都能改，只是没有专用控件。
  // 这保证了「元素系统不需要穷举 CSS」—— 遇到没见过的属性不会把整棵子树打成 html。
  function propMeta(k) {
    return PROPS[k] || { label: k, ctrl: 'text' };
  }

  var ENUMS = {
    'text-align': ['left', 'center', 'right', 'justify'],
    'font-weight': ['300', '400', '500', '600', '700', 'bold', 'normal'],
    'font-style': ['normal', 'italic'],
    'display': ['flex', 'block', 'inline-block', 'inline'],
    'align-items': ['center', 'flex-start', 'flex-end', 'stretch'],
    'justify-content': ['center', 'space-between', 'flex-start', 'flex-end']
  };

  /* ---------- style 字典 → CSS 字符串 ---------- */
  function styleStr(st) {
    if (!st) return '';
    var meta = ['__order', '__semi'];
    var keys = st.__order
      ? st.__order.filter(function (k) { return Object.prototype.hasOwnProperty.call(st, k); })
      : Object.keys(st).filter(function (k) { return meta.indexOf(k) < 0; });
    var s = keys.map(function (k) {
      // __I0 / __I1 是翻译器记下的「整体注入片段」（如 {{itemGap}}），没有键，原样吐出
      if (String(k).indexOf('__I') === 0) return st[k] == null ? '' : st[k];
      return k + ':' + (st[k] == null ? '' : st[k]);
    }).join(';');
    // __semi===false 表示原字符串末尾没有分号（罕见，但翻译器会如实记录下来）
    return st.__semi === false || !s ? s : s + ';';
  }

  /* ---------- 元素类型 ----------
   * 只决定「标签长什么样」，样式一律走 style 字典，不做二次抽象。
   */
  var TYPES = {
    box:     { label: '盒子', withChildren: true, desc: '容器，渲染成 <section>' },
    grid:    { label: '分栏', withChildren: true, desc: '横向排列的子元素' },
    divider: { label: '分隔线', withChildren: false, desc: '一条线，渲染成空 <section>' },
    spacer:  { label: '空白', withChildren: false, desc: '一段留白，渲染成空 <section>' },
    text:    { label: '文字', withChildren: false, desc: '一段文字，自动包 <span leaf="">' },
    badge:   { label: '标签', withChildren: false, desc: '带底色的小标签' },
    image:   { label: '图片', withChildren: false, desc: '一张图' },
    chip:    { label: '小块', withChildren: true, desc: '内联小容器，渲染成 <span>（头像圆 / 序号 / 装饰条）' },
    figure:  { label: '图文块', withChildren: true, desc: '渲染成 <figure>' },
    slot:    { label: '子项槽', withChildren: false, desc: '列表 / 高亮的 {{content}} 落在这里' },
    html:    { label: '原样', withChildren: false, desc: '保留原始 HTML，做不到的效果留在这里' }
  };

  /* ---------- 渲染：元素树 → 模板字符串 ---------- */
  function wrapIf(node, body) {
    var conds = node.if == null ? [] : (Array.isArray(node.if) ? node.if : [node.if]);
    conds = conds.filter(function (c) { return c; });
    for (var i = conds.length - 1; i >= 0; i--) {
      body = '{{?' + conds[i] + '}}' + body + '{{/' + conds[i] + '}}';
    }
    return body;
  }

  function nodeTpl(n) {
    if (!n) return '';
    var type = n.type || 'box';
    var body = '';

    if (type === 'html') {
      body = n.html || '';
    } else if (type === 'slot') {
      body = '{{' + (n.name || 'content') + '}}';
    } else if (type === 'text' || type === 'badge') {
      var inner = '<span leaf=""';
      if (type === 'badge' && n.span) inner += ' style="' + styleStr(n.span) + '"';
      inner += '>' + (n.text == null ? '{{text}}' : n.text) + '</span>';
      body = '<p style="' + styleStr(n.style) + '">' + inner + '</p>';
    } else if (type === 'image') {
      var img = '<img src="' + (n.src == null ? '{{src}}' : n.src) + '"';
      if (n.imgStyle) img += ' style="' + styleStr(n.imgStyle) + '"';
      img += '>';
      body = '<p style="' + styleStr(n.style) + '">' + img + '</p>';
    } else if (type === 'chip' || type === 'figure') {
      // 内联小容器（<span>）/ 图文块（<figure>）：都是「有样式的一段内容」
      var tag = type === 'chip' ? 'span' : 'figure';
      body = '<' + tag + ' style="' + styleStr(n.style) + '">' + childrenTpl(n.children) + '</' + tag + '>';
    } else {
      // box / grid / divider / spacer：都是 <section>
      body = '<section style="' + styleStr(n.style) + '">'
        + childrenTpl(n.children)
        + '</section>';
    }

    return wrapIf(n, body);
  }

  function childrenTpl(list) {
    return (list || []).map(nodeTpl).join('');
  }

  function treeTpl(nodes) {
    return childrenTpl(nodes);
  }

  /* ---------- 给 UI 用的辅助：从元素里取一句话摘要 ---------- */
  function nodeSummary(n) {
    if (!n) return '';
    if (n.type === 'html') return '原样 HTML';
    if (n.type === 'slot') return '子项槽 {{' + (n.name || 'content') + '}}';
    if (n.type === 'text' || n.type === 'badge') return String(n.text || '').replace(/\{\{|\}\}/g, '').slice(0, 24);
    if (n.type === 'image') return '图 ' + String(n.src || '').replace(/\{\{|\}\}/g, '').slice(0, 20);
    return (TYPES[n.type] || { label: n.type }).label;
  }

  GZH.ELEMENT_TYPES = TYPES;
  GZH.CSS_PROPS = PROPS;
  GZH.CSS_ENUMS = ENUMS;
  GZH.propMeta = propMeta;
  GZH.styleStr = styleStr;
  GZH.treeTpl = treeTpl;
  GZH.nodeTpl = nodeTpl;
  GZH.nodeSummary = nodeSummary;

})(window);
