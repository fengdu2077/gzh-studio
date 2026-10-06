/* gzh-studio · Markdown 块解析
 *
 * 输出：扁平的 AST 块数组 [{type, ...}]，不含任何外观信息。
 *
 * 为什么自己写而不用 marked：
 *   1. 目标是 IR（含自定义容器块），marked 产出的是标准 HTML，还得二次反解
 *   2. 公众号只需要有限语法，自研解析器 ~150 行就够，且零依赖、断网可用
 *   3. file:// 下不想背一个 vendor 文件的加载风险
 */
(function (global) {
  'use strict';

  var GZH = global.GZH = global.GZH || {};

  var RE = {
    fence: /^```/,
    heading: /^(#{1,6})\s+(.*)$/,
    quote: /^>\s?(.*)$/,
    ul: /^[-*+]\s+(.*)$/,
    ol: /^(\d+)[.)]\s+(.*)$/,
    hr: /^(-{3,}|\*{3,}|_{3,})\s*$/,
    containerOpen: /^:::(\w+)\s*(.*)$/,
    containerClose: /^:::\s*$/,
    // src 允许为空：`![]()` 是「这里要放图但先留占位」的合法写法
    image: /^!\[([^\]]*)\]\(([^)\s]*)\)\s*$/,
    video: /^([^\s]+\.(mp4|mov|webm|m4v))\s*$/i,
    blank: /^\s*$/
  };

  function parse(md) {
    var lines = String(md || '').replace(/\r\n?/g, '\n').split('\n');
    var blocks = [];
    var i = 0;

    // ---------- front-matter ----------
    if (lines.length && /^---\s*$/.test(lines[0])) {
      var end = -1;
      for (var k = 1; k < lines.length; k++) {
        if (/^---\s*$/.test(lines[k])) { end = k; break; }
      }
      if (end > 0) {
        blocks.push({ type: 'frontmatter', lines: lines.slice(1, end) });
        i = end + 1;
      }
    }

    while (i < lines.length) {
      var raw = lines[i];
      var line = raw.replace(/\s+$/, '');

      if (RE.blank.test(line)) { i++; continue; }

      // 代码块：整段吞掉，内部不再解析
      if (RE.fence.test(line)) {
        var lang = line.replace(/^```/, '').trim();
        var buf = [];
        i++;
        while (i < lines.length && !RE.fence.test(lines[i].trim())) { buf.push(lines[i]); i++; }
        i++; // 跳过收尾 ```
        blocks.push({ type: 'code', lang: lang, text: buf.join('\n') });
        continue;
      }

      // 容器块 :::name label ... :::
      var cOpen = line.match(RE.containerOpen);
      if (cOpen) {
        var name = cOpen[1];
        var label = (cOpen[2] || '').trim();
        var inner = [];
        i++;
        while (i < lines.length && !RE.containerClose.test(lines[i].trim())) { inner.push(lines[i]); i++; }
        i++; // 跳过收尾 :::
        // 容器内部递归解析，这样 :::compare 里能写 ## 和 -
        blocks.push({ type: 'container', name: name, label: label, body: parse(inner.join('\n')).blocks });
        continue;
      }

      if (RE.hr.test(line)) { blocks.push({ type: 'hr' }); i++; continue; }

      var h = line.match(RE.heading);
      if (h) { blocks.push({ type: 'heading', level: h[1].length, text: h[2].trim() }); i++; continue; }

      // 引用块：连续 > 行合成一块
      if (RE.quote.test(line)) {
        var qbuf = [];
        while (i < lines.length && RE.quote.test(lines[i])) { qbuf.push(lines[i].match(RE.quote)[1]); i++; }
        blocks.push({ type: 'quote', text: qbuf.join('\n').trim() });
        continue;
      }

      var img = line.match(RE.image);
      if (img) { blocks.push({ type: 'image', alt: img[1], src: img[2] }); i++; continue; }

      // 视频占位：某些导出器会把文件名写成 \[xxx\_name\.mp4\] 的转义形态，
      // 所以先剥掉方括号与反斜杠再匹配，否则会被当成普通正文段落。
      var probe = line.replace(/^\[/, '').replace(/\]$/, '').replace(/\\/g, '');
      var vid = probe.match(RE.video);
      if (vid) {
        blocks.push({ type: 'video', src: GZH.unescapeText(vid[1]), title: '' });
        i++;
        continue;
      }

      // 列表：连续同类行合成一块
      if (RE.ul.test(line) || RE.ol.test(line)) {
        var ordered = RE.ol.test(line);
        var items = [];
        while (i < lines.length) {
          var m = ordered ? lines[i].match(RE.ol) : lines[i].match(RE.ul);
          if (!m) break;
          items.push(ordered ? m[2] : m[1]);
          i++;
        }
        blocks.push({ type: 'list', ordered: ordered, items: items.map(trimKeep) });
        continue;
      }

      // 普通段落：吃到空行或下一种块开始
      var pbuf = [];
      while (i < lines.length && !RE.blank.test(lines[i]) && !isBlockStart(lines[i])) { pbuf.push(lines[i]); i++; }
      if (pbuf.length) blocks.push({ type: 'paragraph', text: pbuf.join('\n').trim() });
      else i++;
    }

    return { blocks: blocks };
  }

  function trimKeep(s) { return String(s).trim(); }

  function isBlockStart(line) {
    return RE.fence.test(line) || RE.heading.test(line) || RE.quote.test(line) ||
      RE.hr.test(line) || RE.containerOpen.test(line) || RE.image.test(line) ||
      RE.ul.test(line) || RE.ol.test(line) || RE.video.test(line);
  }

  GZH.parse = parse;

})(window);
