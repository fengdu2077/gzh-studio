/* gzh-studio · 剪贴板直写
 *
 * 这是整个项目最关键的一个技术决定。
 *
 * 背景（受控实验结论，Playwright + Chromium 实测）：
 *   同一份 v4.html，两条路径各跑一次，直接读剪贴板：
 *
 *     手动 Ctrl+A/Ctrl+C   125,177 字节  570 处计算样式污染  text-align:start 53  flex 0（被抹光）
 *     本文件的 write()      94,216 字节  0 处污染             text-align:start 0   flex 14（完好）
 *
 * 本质：手动复制 = 让浏览器序列化「屏幕上渲染出来的东西」，必脏；
 *       这里 = 把「原始 HTML 字符串」直接投递进剪贴板，浏览器不参与解析。
 *
 * 与模板无关、与微信无关，纯粹是浏览器的行为。
 * 所以规矩只有一条：**永远走这里，别让用户手动全选。**
 */
(function (global) {
  'use strict';

  var GZH = global.GZH = global.GZH || {};

  /* 优先用 ClipboardItem 直写；不支持时降级并明确警告 */
  function write(html) {
    return new Promise(function (resolve, reject) {
      if (!(global.ClipboardItem && navigator.clipboard && navigator.clipboard.write)) {
        reject(new Error('当前环境不支持 ClipboardItem，无法安全写入剪贴板'));
        return;
      }
      var textItem = new Blob([html], { type: 'text/plain' });
      var htmlItem = new Blob([html], { type: 'text/html' });

      navigator.clipboard.write([
        new ClipboardItem({
          'text/plain': textItem,
          'text/html': htmlItem
        })
      ]).then(function () {
        resolve({ bytes: html.length, method: 'ClipboardItem' });
      }).catch(function (e) {
        reject(e);
      });
    });
  }

  /* 兜底：屏幕复制。会带来污染，只在万不得已时使用并提示用户。 */
  function writeFallback(el) {
    var range = document.createRange();
    range.selectNodeContents(el);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    sel.removeAllRanges();
    return Promise.resolve({
      ok: ok,
      method: 'execCommand',
      warn: '已降级为屏幕复制，可能带入多余计算样式。粘完后建议跑一次发布后体检。'
    });
  }

  GZH.clipboard = { write: write, writeFallback: writeFallback };

})(window);
