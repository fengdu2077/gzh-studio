/* gzh-studio · IR + 主题 → HTML
 *
 * 这里是 docs/06 §1 里那段核心伪代码的真实实现：
 *
 *   const comp = theme.components[block.role] ?? FALLBACK[block.role]
 *
 * 一行决定了「新增主题不必写全组件」。
 *
 * 同样禁止反向依赖：本文件不 import ir.js 的任何逻辑，也不知道文章讲什么。
 */
(function (global) {
  'use strict';

  var GZH = global.GZH = global.GZH || {};
  var fill = GZH.fill, inline = GZH.inline;

  /* 需要走行内标记的字段（会渲染成 <span>，所以要先转义再放行） */
  var INLINE_FIELDS = ['title', 'subtitle', 'lede', 'text', 'kicker', 'tagline',
    'issue', 'account', 'cover', 'caption', 'label', 'bio', 'footer',
    'author', 'initial', 'action', 'badge'];

  function buildVars(theme, block) {
    return Object.assign({}, theme.tokens, theme.base, block);
  }

  /* 把一行文本渲染成 item 模板需要的变量
   *
   * 有序列表优先取 comp.itemOrdered —— 之前有序无序共用一套模板，
   * 序号 1. 2. 3. 被抹成了同一个圆点，这是「列表效果差」的直接原因。
   * 主题没写 itemOrdered 就退回 item，不报错。
   */
  function renderItems(comp, items, theme, block) {
    var tpl = (block.ordered && comp.itemOrdered) ? comp.itemOrdered : comp.item;
    if (!tpl || !items || !items.length) return '';
    var gap = theme.base.itemGap || '10px';
    return items.map(function (raw, i) {
      var v = buildVars(theme, block);
      var text = typeof raw === 'string' ? raw : (raw.text || '');
      v.text = inline(text);
      v.no = typeof raw === 'object' && raw.no ? raw.no : GZH.pad2(i + 1);
      v.itemGap = i === 0 ? '' : 'margin-top:' + gap + ';';
      return fill(tpl, v);
    }).join('');
  }

  function renderBlock(theme, block) {
    var comp = (theme.components && theme.components[block.role]) || GZH.FALLBACK[block.role];
    if (!comp) return '';

    var v = buildVars(theme, block);

    // 行内字段统一过一遍 inline()（内部已做 HTML 转义）
    Object.keys(block).forEach(function (k) {
      if (INLINE_FIELDS.indexOf(k) >= 0 && typeof block[k] === 'string') {
        v[k] = inline(block[k]);
      }
    });

    // 图片尺寸属性：主题 rules 要求必带，缺的话填安全默认值
    if (block.role === 'image') {
      if (block.w === undefined) v.w = '';
      if (block.ratio === undefined) v.ratio = '';
    }
    // 签名区的 role 字段与 IR 保留字冲突，改用 role_ 传入
    if (block.role === 'signature') v.role = block.role_ || '';

    // {{content}} 槽位：先渲染子项，再回填
    if (comp.item) {
      if (block.role === 'highlights' || block.role === 'list') {
        v.content = renderItems(comp, block.items, theme, block);
      } else if (block.role === 'compare') {
        v.content = (block.columns || []).map(function (col) {
          var cv = buildVars(theme, block);
          cv.title = inline(col.title);
          cv.badge = col.badge ? inline(col.badge) : '';
          cv.items = (col.items || []).map(function (t) {
            return fill(comp.subitem || '<p>{{text}}</p>', Object.assign({}, cv, { text: inline(t) }));
          }).join('');
          return fill(comp.item, cv);
        }).join('');
      }
    }

    return fill(comp.tpl, v);
  }

  function render(ir, theme) {
    if (!theme) throw new Error('render: 缺少主题');
    return (ir.blocks || []).map(function (b) {
      return renderBlock(theme, b);
    }).join('\n');
  }

  GZH.render = render;
  GZH.renderBlock = renderBlock;

})(window);
