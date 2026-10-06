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
          blocks.push({ role: 'endline' });
          return;

        case 'container':
          blocks.push(containerToBlock(b));
          return;
      }
    });

    // front-matter 的 highlights → 独立的区块，紧跟刊头卡之后
    var out = [];
    if (meta.title) {
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
    if (meta.highlights && meta.highlights.length) {
      out.push({ role: 'highlights', label: '本文看点 · HIGHLIGHTS', items: meta.highlights });
    }
    out = out.concat(blocks);

    // 签名区由 meta.author 自动生成，不需要写在 md 里
    if (meta.author) {
      out.push({
        role: 'signature',
        author: meta.author,
        initial: meta.author.charAt(0),
        role_: meta.roleline || 'CREATOR · AI PRACTITIONER',
        bio: meta.bio || '',
        footer: meta.footer || ''
      });
    }

    return { v: 1, meta: meta, blocks: out };
  }

  function containerToBlock(b) {
    var inner = b.body || [];

    // 看点卡独立成块：不再只能塞在 front-matter 里，可以自己决定放在哪
    if (b.name === 'highlights') {
      var hs = [];
      inner.forEach(function (node) {
        if (node.type === 'list') hs = hs.concat(node.items.map(unesc));
        else if (node.type === 'paragraph' && unesc(node.text)) hs.push(unesc(node.text));
        else if (node.type === 'heading') hs.push(unesc(node.text));
      });
      return { role: 'highlights', label: b.label || '本文看点 · HIGHLIGHTS', items: hs };
    }

    if (b.name === 'note') {
      var label = b.label || '';
      return { role: 'note', label: label, title: '', text: innerToText(inner) };
    }

    if (b.name === 'quote') {
      return { role: 'quote', label: b.label || '', text: innerToText(inner) };
    }

    if (b.name === 'cta') {
      var action = '';
      // 最后一行若是链接，抽出来当按钮
      var last = inner[inner.length - 1];
      if (last && last.type === 'paragraph') {
        var m = last.text.match(/\[([^\]]+)\]\(([^)\s]+)\)\s*$/);
        if (m) { action = m[1]; last.text = last.text.replace(m[0], '').trim(); }
      }
      return { role: 'cta', title: b.label || '', text: innerToText(inner), action: action };
    }

    if (b.name === 'compare') {
      var cols = [];
      inner.forEach(function (node) {
        if (node.type !== 'heading') return;
        var parts = unesc(node.text).split('|');
        var col = {
          title: parts[0].trim(),
          badge: parts[1] ? parts[1].trim() : '',
          items: []
        };
        cols.push(col);
      });
      // 把每个 heading 之后的列表归属到它那一栏
      var cur = null;
      inner.forEach(function (node) {
        if (node.type === 'heading') {
          cur = cols.find(function (c) { return c.title === unesc(node.text).split('|')[0].trim(); });
        } else if (node.type === 'list' && cur) {
          cur.items = cur.items.concat(node.items.map(unesc));
        }
      });
      return { role: 'compare', columns: cols };
    }

    // 未知容器 → 当普通块处理，不静默丢弃
    return { role: 'para', text: innerToText(inner) };
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
