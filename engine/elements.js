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

  /* ---------- 属性分组：给 UI 用的「人话分区」 ----------
   *
   * 为什么需要分组：一个节点身上可能有 8~12 条样式，摊平给用户看就是一串
   * CSS 名。按「你想改什么」分堆之后，用户找的是「颜色」这一类，不是
   * `color` 这个属性名 —— 这是「不会 HTML 也能改」的第一道门槛。
   *
   * 没被任何组收走的属性统一落到「其他」，所以这张表不需要穷举 CSS。
   */
  var GROUPS = [
    ['文字', ['font-size', 'font-weight', 'line-height', 'letter-spacing', 'color',
      'text-align', 'font-family', 'font-style', 'text-decoration',
      'text-indent', 'word-spacing', 'white-space', 'word-break']],
    ['颜色与背景', ['background', 'background-color', 'opacity', 'box-shadow']],
    ['间距', ['margin', 'margin-top', 'margin-bottom', 'margin-left', 'margin-right',
      'padding', 'padding-top', 'padding-bottom', 'padding-left', 'padding-right', 'gap']],
    ['边框与圆角', ['border', 'border-top', 'border-bottom', 'border-left', 'border-right',
      'border-radius', 'border-top-left-radius']],
    ['尺寸与排列', ['width', 'max-width', 'min-width', 'height', 'min-height', 'max-height',
      'display', 'flex', 'align-items', 'justify-content', 'vertical-align',
      'overflow', 'transform']]
  ];

  /* 常用改动：面板顶部的一排快捷入口。
   * 用户不用先在下拉里找到「font-size」再点「加」，直接点「字号」就有了。
   * def 是新建时的默认值 —— 给一个能立刻看出变化的数，别给空值。 */
  var QUICK = [
    ['font-size', '字号', '16px'],
    ['color', '文字色', '#333333'],
    ['background', '背景', '#f5f5f5'],
    ['border-radius', '圆角', '8px'],
    ['padding', '内边距', '12px'],
    ['margin', '外边距', '0 0 12px'],
    ['line-height', '行高', '1.7'],
    ['box-shadow', '阴影', '0 2px 8px rgba(0,0,0,.06)']
  ];

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

  /* annotate：给预览用的「定位标记」
   * ------------------------------------------------------------------
   * 渲染时可选地在每个元素上打一个 data-ep="0.1.2"（元素在树里的路径）。
   * 有了它，预览里点哪一块就能反查出「改的是树里哪个节点」——
   * 这是「所见即所选」的地基。
   *
   * 这个标记**只给本地预览用**：正式渲染（复制到公众号那条链路）从来不开，
   * 所以产物里不会出现 data-ep，不影响微信红线。
   * 默认关闭，只有 UI 显式传 opt.annotate 才生效。
   */
  function markOf(path, opt) {
    if (!opt || !opt.annotate || !path) return '';
    return ' data-ep="' + (opt.prefix || '') + path.join('.') + '"';
  }

  // html 类型是一整段原始 HTML，没有「自己的根标签」可以挂属性，
  // 所以把标记塞进第一个开标签里。塞不进去（比如以文本开头）就跳过 ——
  // 那块仍然能在树里选中，只是预览里点不到。
  function markHtml(html, mark) {
    if (!mark) return html;
    return html.replace(/<([a-zA-Z][a-zA-Z0-9]*)([\s>])/, function (m, tag, tail) {
      return '<' + tag + mark + (tail === '>' ? ' ' : '') + (tail === '>' ? '' : tail);
    });
  }

  function nodeTpl(n, opt, path) {
    if (!n) return '';
    var type = n.type || 'box';
    var mark = markOf(path, opt);
    var body = '';

    if (type === 'html') {
      body = markHtml(n.html || '', mark);
    } else if (type === 'slot') {
      // 槽位渲染成变量文本，没有标签可挂 —— 靠父元素命中，不影响使用
      body = '{{' + (n.name || 'content') + '}}';
    } else if (type === 'text' || type === 'badge') {
      var inner = '<span leaf=""';
      if (type === 'badge' && n.span) inner += ' style="' + styleStr(n.span) + '"';
      inner += '>' + (n.text == null ? '{{text}}' : n.text) + '</span>';
      body = '<p style="' + styleStr(n.style) + '"' + mark + '>' + inner + '</p>';
    } else if (type === 'image') {
      var img = '<img src="' + (n.src == null ? '{{src}}' : n.src) + '"';
      if (n.imgStyle) img += ' style="' + styleStr(n.imgStyle) + '"';
      img += '>';
      body = '<p style="' + styleStr(n.style) + '"' + mark + '>' + img + '</p>';
    } else if (type === 'chip' || type === 'figure') {
      // 内联小容器（<span>）/ 图文块（<figure>）：都是「有样式的一段内容」
      var tag = type === 'chip' ? 'span' : 'figure';
      body = '<' + tag + ' style="' + styleStr(n.style) + '"' + mark + '>'
        + childrenTpl(n.children, opt, path) + '</' + tag + '>';
    } else {
      // box / grid / divider / spacer：都是 <section>
      body = '<section style="' + styleStr(n.style) + '"' + mark + '>'
        + childrenTpl(n.children, opt, path)
        + '</section>';
    }

    return wrapIf(n, body);
  }

  function childrenTpl(list, opt, base) {
    base = base || [];
    return (list || []).map(function (n, i) {
      return nodeTpl(n, opt, base.concat([i]));
    }).join('');
  }

  function treeTpl(nodes, opt) {
    return childrenTpl(nodes, opt, []);
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

  // 元素身上写给人看的文字（把 {{title}} 这类变量还原成「标题」这样的白话）
  function readable(s) {
    var t = String(s == null ? '' : s).replace(/\{\{|\}\}/g, '').trim();
    var known = {
      title: '标题', subtitle: '副标题', lede: '导语', text: '正文', content: '正文内容',
      kicker: '眉题', tagline: '标语', issue: '期号', account: '账号名', caption: '图注',
      label: '标签', bio: '简介', footer: '页脚', author: '作者', initial: '头像首字',
      roleline: '身份行', action: '按钮字', badge: '角标', src: '图片地址', no: '序号'
    };
    if (known[t]) return known[t];
    return t;
  }

  /* 「这一处是干什么的」—— 面板顶部那句话。
   * 用户判断「我有没有点对地方」全靠它：光说「盒子」等于没说，
   * 说「区块 · 里面 3 块 · 高 120px」才对得上眼睛看到的东西。 */
  function nodeIdentity(n) {
    if (!n) return '';
    var ty = TYPES[n.type] || { label: n.type || '元素' };
    var bits = [ty.label];
    if (n.type === 'text' || n.type === 'badge') {
      var t = readable(n.text);
      bits.push(t ? '「' + t.slice(0, 14) + '」' : '（空）');
    } else if (n.type === 'slot') {
      bits.push('内容填在 ' + readable(n.name || 'content'));
    } else if (n.type === 'image') {
      bits.push(readable(n.src).slice(0, 16) || '图片');
    } else if (n.type === 'html') {
      return '原始 HTML 块（没拆成元素）';
    } else if (n.type === 'divider') {
      var h = n.style && n.style['border-top'] ? '（' + n.style['border-top'] + '）' : '';
      bits.push(h);
    } else if (n.children && n.children.length) {
      bits.push('里面 ' + n.children.length + ' 块');
    }
    var st = n.style || {};
    var hint = [];
    if (st['font-size']) hint.push('字号 ' + st['font-size']);
    if (st['color']) hint.push('文字色 ' + st['color']);
    if (st['background'] || st['background-color']) hint.push('有底色');
    if (st['height']) hint.push('高 ' + st['height']);
    if (hint.length) bits.push('· ' + hint.slice(0, 2).join(' · '));
    return bits.join(' ');
  }

  /* 子树里是否也设了同一个样式属性。
   * 用来解释「我明明改了颜色，怎么没反应」—— 内层自己写了 color，
   * 外层的就被盖住了。提前说一句，比让用户怀疑人生强。 */
  function hasDeeper(n, key) {
    var kids = n && n.children;
    if (!kids) return false;
    for (var i = 0; i < kids.length; i++) {
      var c = kids[i];
      if (c.style && c.style[key] !== undefined && c.style[key] !== '') return true;
      if (hasDeeper(c, key)) return true;
    }
    return false;
  }

  GZH.ELEMENT_TYPES = TYPES;
  GZH.CSS_PROPS = PROPS;
  GZH.CSS_ENUMS = ENUMS;
  GZH.CSS_GROUPS = GROUPS;
  GZH.CSS_QUICK = QUICK;
  GZH.propMeta = propMeta;
  GZH.styleStr = styleStr;
  GZH.treeTpl = treeTpl;
  GZH.nodeTpl = nodeTpl;
  GZH.nodeSummary = nodeSummary;
  GZH.nodeIdentity = nodeIdentity;
  GZH.readable = readable;
  GZH.hasDeeper = hasDeeper;

})(window);
