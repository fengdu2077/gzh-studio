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
    'author', 'initial', 'roleline', 'action', 'badge'];

  /* 主题整理结果做单槽缓存：一次渲染里 theme 是同一个对象，
   * 不必每个 block 都重算一遍派生与引用展开。 */
  var _prepKey = null, _prepVal = null;

  function prepared(theme) {
    if (_prepKey === theme && _prepVal) return _prepVal;
    _prepKey = theme;
    _prepVal = GZH.prepareTheme(theme);
    return _prepVal;
  }

  function buildVars(theme, block) {
    return Object.assign({}, theme.tokens, theme.base, block);
  }

  // 组件没声明 source 时，看 block 上哪个字段是数组。
  // 注意这里判断的是「数据形态」而不是「role 叫什么」，所以加新模块不用改这里。
  /* 取一个组件的「模板源」
   *
   * 优先取元素树（theme.compositions[role].tree），没有才退回 HTML 字符串
   * （components[role].tpl / FALLBACK）。两条路最终都收敛成**同一个模板字符串**，
   * 因为元素树的渲染产物就是模板串 —— 见 tplparse 的忠实度校验，
   * 已证明两者逐字节一致（check/build_compositions.js 会强制校验）。
   *
   * 这样做的理由是「同一个能力对老主题也生效」：
   * 导入一个 2026-10 之前的主题（没有 compositions），引擎照旧渲染，字节不变。
   *
   * KEY_MAP 把旧字段名映射到元素树字段名 —— 提取원的共同任务是取源，不是为了写成安徽。
   */
  var KEY_MAP = {
    tpl: 'tree',
    item: 'itemTree',
    itemOrdered: 'itemOrderedTree',
    subitem: 'subitemTree'
  };

  function pickComp(theme, role) {
    var compo = theme.compositions && theme.compositions[role];
    var legacy = (theme.components && theme.components[role]) || GZH.FALLBACK[role];
    var out = {};

    Object.keys(KEY_MAP).forEach(function (k) {
      if (compo && compo[KEY_MAP[k]]) out[k] = GZH.treeTpl(compo[KEY_MAP[k]]);
      else if (legacy && legacy[k]) out[k] = legacy[k];
    });

    out.source = (compo && compo.source) || (legacy && legacy.source);
    out.__fromTree = !!(compo && compo.tree);
    return out;
  }

  // 组件没声明 source 时，看 block 上哪个字段是数组。
  // 注意这里判断的是「数据形态」而不是「role 叫什么」，所以加新模块不用改这里。
  function pickItemSource(block) {
    if (Array.isArray(block.columns)) return 'columns';
    return 'items';
  }

  /* 把列表渲染成一串 item 模板
   *
   * 元素可以是字符串（普通列表项），也可以是对象（对照卡的一栏）。
   * 对象形态若同时声明了 comp.subitem，就把它的 items 再渲染一层填进 {{items}}。
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

      if (typeof raw === 'string') {
        v.text = inline(raw, theme.inlineStyle);
      } else {
        Object.keys(raw).forEach(function (k) {
          v[k] = typeof raw[k] === 'string' ? inline(raw[k], theme.inlineStyle) : raw[k];
        });
        // 一栏底下的多条理由
        if (comp.subitem && Array.isArray(raw.items)) {
          v.items = raw.items.map(function (t) {
            return fill(comp.subitem, Object.assign(buildVars(theme, block), { text: inline(t, theme.inlineStyle) }));
          }).join('');
        }
      }

      v.no = (raw && typeof raw === 'object' && raw.no) ? raw.no : GZH.pad2(i + 1);
      v.itemGap = i === 0 ? '' : 'margin-top:' + gap + ';';
      return fill(tpl, v);
    }).join('');
  }

  function renderBlock(rawTheme, block) {
    // 主题先过一遍派生与引用展开，后面拿到的 token 都是可直接用的字面量
    var theme = prepared(rawTheme);
    var comp = pickComp(theme, block.role);
    if (!comp.tpl && !comp.item) return '';

    var v = buildVars(theme, block);

    // 行内字段统一过一遍 inline()（内部已做 HTML 转义）
    Object.keys(block).forEach(function (k) {
      if (INLINE_FIELDS.indexOf(k) >= 0 && typeof block[k] === 'string') {
        v[k] = inline(block[k], theme.inlineStyle);
      }
    });

    // 签名区的 role 字段与 IR 保留字冲突，改用 role_ 传入
    if (v.role_ !== undefined) v.role = v.role_;

    // {{content}} 槽位：先渲染子项，再回填
    //
    // 以前这里写成 if (role === 'highlights' || role === 'list')，等于让通用渲染器
    // 认识业务模块名 —— 每加一个有子项的模块就得多改一处。
    // 现在只看数据：子项从哪个字段来由组件自己声明（comp.source），
    // 没声明就按 block 上现成的数组字段推断。全程不知道 role 叫什么。
    if (comp.item) {
      var srcKey = comp.source || pickItemSource(block);
      v.content = renderItems(comp, block[srcKey], theme, block);
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
