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
        meta[cur] = v === '' ? [] : v;
      }
    });
    // 空容器（高退化）统一清成 undefined，方便模板条件段判断
    Object.keys(meta).forEach(function (k) {
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

        case 'quote':
          blocks.push({ role: 'quote', label: 'PROMPT · 原话', text: unesc(b.text) });
          return;

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
      var cp = pickSrc(meta.cover, 'cover');
      out.push({
        role: 'masthead',
        account: meta.account || '',
        tagline: meta.tagline || '',
        issue: meta.issue || '',
        kicker: meta.kicker || '',
        lede: meta.lede || '',
        // 没写 cover 时自动落封面占位图 —— 刊头卡必须有图，缺图会显得没做完
        cover: cp.src,
        // 打标记，让 UI 能明确告诉用户「封面还是占位图，可以自己填 URL」
        coverPlaceholder: cp.placeholder,
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

    if (g.kv) {
      collectKV(b.body).forEach(function (pair) { out[pair[0]] = pair[1]; });
    }

    Object.keys(g.map || {}).forEach(function (field) {
      var ex = GZH.EXTRACTORS[g.map[field]];
      if (ex) out[field] = ex(b, helpers);
    });

    Object.keys(g.slots || {}).forEach(function (field) {
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
