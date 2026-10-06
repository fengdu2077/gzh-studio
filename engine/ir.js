/* gzh-studio · AST → IR
 *
 * 这是 docs/06 §4「Markdown → IR 映射表」的实现。
 * 铁律：**本文件禁止出现任何颜色值、字号、HTML 标签**。
 * 一旦出现，多主题就废了。
 */
(function (global) {
  'use strict';

  var GZH = global.GZH = global.GZH || {};
  var unesc = GZH.unescapeText;

  /* ---------- 占位图回落 ----------
   * 只在「明确的空源 / 伪地址」时才换成占位图，真实 URL 一律放行，
   * 避免误判用户自己的图。占位图本身是 base64 资源（engine/placeholders.js
   * 生成），属于**内容**而非样式，因此不违反本文件「零外观信息」的铁律。
   */
  function pickSrc(raw, kind) {
    var spec = (GZH.placeholders || {})[kind];
    if (!spec) return { src: raw, placeholder: false };
    var need = GZH.needPlaceholder ? GZH.needPlaceholder(raw) : !raw;
    return need
      ? { src: spec.uri, w: spec.w, ratio: spec.ratio, placeholder: true }
      : { src: raw, placeholder: false };
  }

  /* ---------- front-matter 极简 YAML ----------
   * 只支持两种形态，够用即可：
   *   key: value
   *   key:
   *     - item
   */
  // 「写了这个键但没给值」的哨兵。`cover:` 与「根本没写 cover」必须分得开：
  // 前者是「要封面，图待补」，后者是「不要封面」。糊成一种就又把占位图强塞回去了。
  var EMPTY = { empty: true };

  function parseFrontMatter(lines) {
    var meta = {};
    var cur = null;
    (lines || []).forEach(function (line) {
      var arr = line.match(/^\s*-\s+(.*)$/);
      if (arr && cur) {
        if (!Array.isArray(meta[cur])) meta[cur] = [];
        meta[cur].push(unesc(arr[1].trim()));
        return;
      }
      var kv = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
      if (kv) {
        cur = kv[1];
        var v = unesc(kv[2].trim());
        meta[cur] = v === '' ? EMPTY : v;
      }
    });
    Object.keys(meta).forEach(function (k) {
      // 声明过、没值 → 空串。`cover:` 由此落到占位图；`author:` 空串仍被
      // `if (meta.author)` 挡掉，行为和以前一致。
      if (meta[k] === EMPTY) meta[k] = '';
      // 空容器（高退化）清成 undefined，方便模板条件段判断
      if (Array.isArray(meta[k]) && meta[k].length === 0) meta[k] = undefined;
    });
    return meta;
  }

  /* ---------- 主转换 ---------- */
  function toIR(ast) {
    var meta = {};
    var blocks = [];
    var chapterNo = 0;
    var pendingImage = null;   // 图片后面紧跟的段落会被当成图注

    (ast.blocks || []).forEach(function (b) {
      switch (b.type) {

        case 'frontmatter':
          meta = parseFrontMatter(b.lines);
          return;

        case 'heading':
          // H1 只在没有 front-matter title 时才当主标题
          if (b.level <= 1) { if (!meta.title) meta.title = unesc(b.text); return; }
          chapterNo++;
          var parts = unesc(b.text).split('@');
          blocks.push({
            role: 'chapter',
            index: GZH.pad2(chapterNo),
            title: parts[0].trim(),
            subtitle: parts[1] ? parts[1].trim() : ''
          });
          return;

        case 'paragraph': {
          var txt = unesc(b.text);
          // 只有「整段被斜体包住」才算图注（docs/06 §4）。
          // 别放宽成「图片后任意段落」——demo.md 里每张图后面都紧跟正文，
          // 那样会把「然后，直接给了我一个能互动的 3D 毛坯房」整段吞掉。
          if (pendingImage) {
            var italicCap = txt.match(/^\s*[*_]([^*_]+)[*_]\s*$/);
            if (italicCap) {
              pendingImage.caption = italicCap[1].trim();
              pendingImage = null;
              return;
            }
            pendingImage = null;
          }
          if (txt) blocks.push({ role: 'para', text: txt });
          return;
        }

        case 'quote': {
          /* 末行的 `@出处` 是来源，和章节标题的 `@ENGLISH` 同一套语法。
           * 以前 label 恒为写死的 'PROMPT · 原话'，作者想写自己的出处也改不了；
           * 现在写了 @ 就用作者的，没写仍退回原默认值（老稿输出不变）。 */
          var qt = unesc(b.text || '');
          // 默认出处以前写死在引擎里，想改只能改代码。
          // 现在稿子开头写一行 `quoteLabel: xxx` 就能改；没写就还是老样子。
          var qlabel = (typeof meta.quoteLabel === 'string' && meta.quoteLabel.trim())
            ? meta.quoteLabel.trim() : 'PROMPT · 原话';
          var qm = /(?:^|\n)[ \t]*@([^\n]+)[ \t]*$/.exec(qt);
          if (qm) {
            qlabel = qm[1].trim();
            qt = qt.slice(0, qm.index).replace(/[ \t\n]+$/, '');
          }
          blocks.push({ role: 'quote', label: qlabel, text: qt });
          return;
        }

        case 'image': {
          var p = pickSrc(b.src, 'image');
          var im = {
            role: 'image',
            src: p.src,
            placeholder: p.placeholder,
            alt: unesc(b.alt || '')
          };
          if (p.w) { im.w = p.w; im.ratio = p.ratio; }
          blocks.push(im);
          pendingImage = im;
          return;
        }

        case 'video': {
          // 视频在公众号里只能「先传素材库再插入」，任何 <video> 都没用，
          // 所以一律渲染成图片占位卡，并把原文件名写进图注提示该传哪个。
          var vs = (GZH.placeholders || {}).video;
          var v = { role: 'video', src: vs ? vs.uri : b.src, placeholder: true };
          if (vs) { v.w = vs.w; v.ratio = vs.ratio; }
          if (b.src) v.caption = '原视频：' + unesc(b.src);
          v.title = unesc(b.title || '');
          blocks.push(v);
          return;
        }

        case 'list':
          blocks.push({
            role: 'list',
            ordered: !!b.ordered,
            items: (b.items || []).map(unesc)
          });
          return;

        case 'code':
          blocks.push({ role: 'para', text: b.text });  // 微信不支持 <pre>，降级为段落
          return;

        case 'hr':
          // 先打占位，等全文块收齐后再分流（见文末 splitHr）
          blocks.push({ role: '__hr__' });
          return;

        case 'container':
          blocks.push(containerToBlock(b));
          return;
      }
    });

    /* front-matter 是**兼容路径**，不是推荐路径。
     *
     * 现在刊头卡 / 作者卡 / 看点卡都是自包含的 ::: 盒子，写在哪就渲染在哪。
     * 但早期稿子（以及 AI 按旧提示词生成的稿子）还在用 front-matter，
     * 所以这里仍旧把它翻译成同样三个盒子 —— **前提是用户没手写同名盒子**。
     * 手写优先，自动去重，避免一篇文章冒出两个刊头卡。
     */
    var declared = {};
    (ast.blocks || []).forEach(function (b) {
      if (b.type === 'container' && GZH.MODULES && GZH.MODULES[b.name]
        && GZH.MODULES[b.name].grammar) declared[b.name] = true;
    });
    function has(name) { return !!declared[name]; }

    var out = [];
    if (meta.title && !has('masthead')) {
      /* cover 三态在这里和 `:::masthead` 盒子（containerToBlock 的 slots）完全一致：
       *   没写 cover     → 作者就是不要封面，一张图都不放
       *   写了 cover:（空）→ 想要封面但还没图，放占位图提醒替换
       *   写了真地址      → 直接用
       *
       * 以前这里无条件 pickSrc(meta.cover)，于是「没写」也被当成「要占位图」——
       * 用 H1 起手的稿子（meta.title 来自 H1，根本没 front-matter）
       * 每张都会凭空冒出一张封面占位图，想做无封面的刊头卡无从下手。
       * 封面是**内容**，不是排版必需品：要不要图由作者决定，引擎不替他决定。 */
      var cp = (meta.cover === undefined || meta.cover === null) ? null : pickSrc(meta.cover, 'cover');
      out.push({
        role: 'masthead',
        account: meta.account || '',
        tagline: meta.tagline || '',
        issue: meta.issue || '',
        kicker: meta.kicker || '',
        lede: meta.lede || '',
        // 没写 cover → 空串 → 模板的 {{?cover}} 整段跳过，一个 <img> 都不输出
        cover: cp ? cp.src : '',
        // 打标记，让 UI 能明确告诉用户「封面还是占位图，可以自己填 URL」
        coverPlaceholder: cp ? cp.placeholder : false,
        title: meta.title
      });
    }
    if (meta.highlights && meta.highlights.length && !has('highlights')) {
      out.push({ role: 'highlights', label: '本文看点 · HIGHLIGHTS', items: meta.highlights });
    }
    out = out.concat(blocks);

    // 署名区同理：手写了 :::profile 就不再自动追加，否则按老的 front-matter author 补
    if (meta.author && !has('profile')) {
      out.push({
        role: 'signature',
        author: meta.author,
        initial: meta.author.charAt(0),
        role_: meta.roleline || 'CREATOR · AI PRACTITIONER',
        bio: meta.bio || '',
        footer: meta.footer || ''
      });
    }

    /* `---` 分流：文中是节奏断点，文末那条才是 END 收尾线
     *
     * 同一个 `---` 有两种语义。docs/07 里 divider(第 7 项) 和 endline(第 19 项)
     * 一直分开写着，但以前这里一律塞进 endline，于是文中每插一条分隔线
     * 就冒出一个 END —— 因为 endline 模板里写死了 END 字样。
     *
     * 规则：最后一条 hr 判 endline，其余判 divider。
     * 但若最后那条 hr 后面还跟着正文（说明它其实不在文末），降级回 divider。
     */
    var TAIL_ROLES = { profile: 1, signature: 1, cta: 1, endline: 1, divider: 1, '__hr__': 1 };
    var lastHr = -1;
    out.forEach(function (b, i) { if (b.role === '__hr__') lastHr = i; });

    out.forEach(function (b, i) {
      if (b.role !== '__hr__') return;
      var bodyAfter = false;
      for (var j = i + 1; j < out.length; j++) {
        if (!TAIL_ROLES[out[j].role]) { bodyAfter = true; break; }
      }
      b.role = (i === lastHr && !bodyAfter) ? 'endline' : 'divider';
    });

    return { v: 1, meta: meta, blocks: out };
  }

  /* 容器 → IR：查模块注册表，不再逐个 if (b.name === 'xxx')
   *
   * 以前每加一个容器模块就在这里多一段 if，那是「9 个文件 33 处」的重灾区之一。
   * 现在按 grammar 声明走一条固定流水线：
   *
   *   ① static  写死字段
   *   ② kv      容器内 `key: value` 行直接铺成同名字段（刊头卡 / 作者卡靠它实现「一个盒子装全部」）
   *   ③ map     声明式提取（title / text / items ...）
   *   ④ slots   声明的图片字段走占位图回落
   *   ⑤ derive  派生字段（头像首字）
   *   ⑥ defaults 兜底默认值
   *
   * ⚠️ map 的遍历顺序有语义：link 提取器会把链接从末行删掉，
   * 所以必须排在 join 前面，否则正文里会残留链接原文。
   */
  /* 把容器正文里的 `key: value` 行删掉（只删整行都是 kv 的，不动正常段落）。
   * 删的是副本，不改调用方的 body。 */
  function stripKVLines(inner) {
    return (inner || []).map(function (node) {
      if (node.type !== 'paragraph') return node;
      var kept = String(node.text).split('\n').filter(function (line) {
        return !/^[A-Za-z_][\w-]*\s*:/.test(line.trim());
      }).join('\n');
      return Object.assign({}, node, { text: kept });
    });
  }

  function containerToBlock(b) {
    var def = GZH.MODULES && GZH.MODULES[b.name];
    var g = def && def.grammar;

    // 未知容器 → 降级为普通段落，不静默丢弃
    if (!g || g.kind !== 'container') {
      return { role: 'para', text: innerToText(b.body) };
    }

    var helpers = {
      innerToText: innerToText,
      collectLines: collectLines,
      collectCols: collectCols,
      firstTitle: firstTitle,
      restText: restText,
      extractLastLink: extractLastLink
    };

    var out = { role: b.name };

    Object.keys(g.static || {}).forEach(function (k) { out[k] = g.static[k]; });

    // kv 行被读成字段之后，就该从正文里消失。
    // 以前不剔除，于是 `:::note` 里写 `title: xxx`，标题拿到了、
    // 正文里还留着一行「title: xxx」—— 因为正文用的是 join 提取器，
    // 它不像 rest 那样会跳过 kv 行。在这里统一剔除，所有提取器都受益。
    var body = b.body;
    if (g.kv) {
      collectKV(b.body).forEach(function (pair) { out[pair[0]] = pair[1]; });
      body = stripKVLines(b.body);
    }

    Object.keys(g.map || {}).forEach(function (field) {
      var ex = GZH.EXTRACTORS[g.map[field]];
      if (ex) out[field] = ex(Object.assign({}, b, { body: body }), helpers);
    });

    Object.keys(g.slots || {}).forEach(function (field) {
      /* 三种情况要分清：
       *   没写 cover 键     → 用户就是不要封面，什么都不生成
       *   写了 cover: （空） → 想要封面但还没图，放占位图提醒替换
       *   写了真地址        → 直接用
       * 以前把前两种混为一谈，导致「不写也会冒出一张占位图」，
       * 想做一个没封面的刊头根本无从下手。 */
      // 没写就是没写：连 Placeholder 标记也一并置 false，
      // 两条路径（盒子 / front-matter）交出来的 IR 形状保持一致。
      if (out[field] === undefined) { out[field + 'Placeholder'] = false; return; }
      var p = pickSrc(out[field], g.slots[field]);
      out[field] = p.src;
      if (p.w) { out.w = p.w; out.ratio = p.ratio; }
      // 打标记，让 UI 能提示「封面还是占位图，可以自己换」
      out[field + 'Placeholder'] = p.placeholder;
    });

    Object.keys(g.derive || {}).forEach(function (field) {
      var fn = (GZH.DERIVERS || {})[g.derive[field]];
      if (fn) out[field] = fn(out);
    });

    // 抽出来是空的就套默认值（如看点卡的「本文看点 · HIGHLIGHTS」）
    Object.keys(g.defaults || {}).forEach(function (k) {
      if (out[k] === undefined || out[k] === null || out[k] === '') out[k] = g.defaults[k];
    });
    return out;
  }

  /* 容器内 `key: value` 行 → [['cover','url'], ['kicker','本期实测'], ...]
   *
   * 这是刊头卡 / 作者卡能「一个盒子装全部」的关键：
   * 用户不用去文件头的 YAML 里找对应字段，写在哪个盒子里就归哪个盒子。
   */
  function collectKV(inner) {
    var out = [];
    (inner || []).forEach(function (node) {
      if (node.type !== 'paragraph') return;
      String(node.text).split('\n').forEach(function (line) {
        var m = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
        if (m) out.push([m[1], unesc(m[2].trim())]);
      });
    });
    return out;
  }

  // 第一个 ## 标题当主标题；没有标题就退一步取第一行非空文本
  function firstTitle(inner) {
    var list = inner || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].type === 'heading') return unesc(list[i].text);
    }
    for (var j = 0; j < list.length; j++) {
      if (list[j].type === 'paragraph') {
        var first = String(list[j].text).split('\n').filter(function (l) {
          return l.trim() && !/^[A-Za-z_][\w-]*\s*:/.test(l);
        })[0];
        if (first) return unesc(first.trim());
      }
    }
    return '';
  }

  // 扣掉 key:value 行和主标题之后剩下的正文（刊头卡的导语）
  function restText(inner) {
    var lines = [];
    (inner || []).forEach(function (node) {
      if (node.type === 'paragraph') {
        String(node.text).split('\n').forEach(function (line) {
          if (!line.trim()) return;
          if (/^[A-Za-z_][\w-]*\s*:/.test(line)) return;
          lines.push(unesc(line.trim()));
        });
      } else if (node.type === 'quote') {
        lines.push(unesc(node.text));
      }
    });
    return lines.join('\n').trim();
  }

  // body 内每一项各占一行（看点卡 / 列表）
  function collectLines(inner) {
    var out = [];
    (inner || []).forEach(function (node) {
      if (node.type === 'list') out = out.concat(node.items.map(unesc));
      else if (node.type === 'paragraph' && unesc(node.text)) out.push(unesc(node.text));
      else if (node.type === 'heading') out.push(unesc(node.text));
    });
    return out;
  }

  // 按 ## 标题 | 徽标 分栏（对照卡）
  function collectCols(inner) {
    var cols = [];
    (inner || []).forEach(function (node) {
      if (node.type !== 'heading') return;
      var parts = unesc(node.text).split('|');
      cols.push({ title: parts[0].trim(), badge: parts[1] ? parts[1].trim() : '', items: [] });
    });
    var cur = null;
    (inner || []).forEach(function (node) {
      if (node.type === 'heading') {
        var t = unesc(node.text).split('|')[0].trim();
        cur = cols.filter(function (c) { return c.title === t; })[0] || null;
      } else if (node.type === 'list' && cur) {
        cur.items = cur.items.concat(node.items.map(unesc));
      }
    });
    return cols;
  }

  // 最后一行若是链接，抽出来当按钮标题，并把链接从原文里删掉
  function extractLastLink(inner) {
    var list = inner || [];
    var last = list[list.length - 1];
    if (!last || last.type !== 'paragraph') return '';
    var m = String(last.text).match(/\[([^\]]+)\]\(([^)\s]+)\)\s*$/);
    if (!m) return '';
    last.text = last.text.replace(m[0], '').trim();
    return m[1];
  }

  function innerToText(inner) {
    var out = [];
    (inner || []).forEach(function (node) {
      if (node.type === 'paragraph') out.push(unesc(node.text));
      else if (node.type === 'heading') out.push(unesc(node.text));
      else if (node.type === 'list') out = out.concat(node.items.map(unesc));
      else if (node.type === 'quote') out.push(unesc(node.text));
    });
    return out.join('\n').trim();
  }

  GZH.toIR = toIR;
  GZH.parseFrontMatter = parseFrontMatter;

})(window);
