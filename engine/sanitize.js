/* gzh-studio · 合规后处理 + 体检计数
 *
 * 做两件事：
 *   1. 按 theme.rules 做卡口（把本轮所有踩过的坑固化成机器可校验的阈值）
 *   2. 产出体检指标，供 UI 决定是否放行复制
 *
 * 三道红线（来自需求文档质量红线，每条都是实测出来的）：
 *   text-align:start  = 0      ← 规范 §1.6 禁用值，曾真实出现 53 处
 *   text-align:left   = 0      ← 已发布零告警对照组实测为 0
 *   display:flex      = 源文件数 = 剪贴板数 = 已发布数（对不上就是复制链接脏了）
 */
(function (global) {
  'use strict';

  var GZH = global.GZH = global.GZH || {};

  // 浏览器把「渲染后的计算样式」塞进剪贴板时留下的指纹。
  // 人不会手写这些属性，出现即证明经过了浏览器序列化。
  var BROWSER_JUNK = [
    'font-variant-ligatures', 'font-variant-caps', 'font-variant-numeric',
    'orphans', 'widows', '-webkit-text-stroke-width', 'text-decoration-thickness',
    'word-spacing', 'text-indent', 'text-transform', 'font-variant-east-asian'
  ];

  function metrics(html) {
    var h = String(html || '');
    function count(re) { var m = h.match(re); return m ? m.length : 0; }

    var taMap = {};
    (h.match(/text-align:\s*([a-zA-Z-]+)/g) || []).forEach(function (s) {
      var v = s.replace(/text-align:\s*/, '');
      taMap[v] = (taMap[v] || 0) + 1;
    });

    var junk = 0;
    BROWSER_JUNK.forEach(function (p) {
      junk += count(new RegExp(p.replace(/[-]/g, '\\-') + '\\s*:', 'g'));
    });

    // 占位图（base64 内联）数量 —— 提醒用户发布前替换
    var ph = count(/data:image\/png;base64,/g);
    // 疑似「会过期的临时图片链接」：飞书云文档、带签名参数的 OSS/COS 直链等。
    // 这类链接刚粘进去能看，过几小时就变死图，必须提前警告。
    var TEMP = /https?:\/\/[^"'\s>]*(?:feishu\.cn|larksuite\.com|authcode=|X-Amz-Signature|Signature=|sign=)[^"'\s>]*/gi;
    var temp = (h.match(TEMP) || []).length;

    // 未替换的模板标记 —— 主题模板语法写错时的唯一可见症状。
    // 2026-10-06 真实案例：作者卡 tpl 写成 `{{?account}...{/account}`
    // （端点括号残缺），fill() 的正则不匹配就原样输出，用户看到满屏 {{?account}}。
    // 三种指纹都算：残缺开头 {{?、残缺收尾 {/x、没被替换的普通变量 {{x}}。
    var tplResidue = count(/\{\{\?/g)
      + count(/\{\{\w+\}\}/g)
      + count(/[^{]\{\/\w+/g);

    return {
      bytes: h.length,
      div: count(/<div\b/g),
      script: count(/<script\b/g),
      styleTag: count(/<style\b/g),
      classAttr: count(/\sclass=/g),
      idAttr: count(/\sid=/g),
      pre: count(/<pre\b/g),
      leafSpan: count(/<span leaf="">/g),
      flex: count(/display:flex/g),
      gradient: count(/linear-gradient/g),
      gradient135: count(/linear-gradient\(\s*135deg/g),
      textAlign: taMap,
      start: taMap.start || 0,
      left: taMap.left || 0,
      browserJunk: junk,
      placeholder: ph,
      tempLink: temp,
      templateResidue: tplResidue
    };
  }

  function checkAgainstRules(m, rules) {
    rules = rules || {};
    var issues = [];

    if (typeof rules.maxGradient135 === 'number' && m.gradient135 > rules.maxGradient135) {
      issues.push('压文字的 135deg 渐变 ' + m.gradient135 + ' 处，超出上限 ' + rules.maxGradient135 + '（会触发 darkmode-no-gradient）');
    }
    if (typeof rules.maxGradientTotal === 'number' && m.gradient > rules.maxGradientTotal) {
      issues.push('渐变总数 ' + m.gradient + ' 超上限 ' + rules.maxGradientTotal);
    }
    (rules.forbidTextAlign || []).forEach(function (v) {
      if (m.textAlign[v]) issues.push('出现 text-align:' + v + ' × ' + m.textAlign[v] + '（禁用值）');
    });
    (rules.forbidTags || []).forEach(function (t) {
      if (m[t === 'script' ? 'script' : t === 'style' ? 'styleTag' : t]) {
        issues.push('出现禁用标签 <' + t + '>');
      }
    });
    if (rules.requireLeafSpan && m.leafSpan === 0) {
      issues.push('一个 <span leaf=""> 都没有，微信可能丢文字');
    }
    if (m.browserJunk > 0) {
      issues.push('检出 ' + m.browserJunk + ' 处浏览器计算样式污染 —— 说明这份 HTML 经过了手动复制');
    }
    // 模板残留：按模板错误处理，不放行复制。
    // 这类问题不是「文章内容不好」，是引擎产出本身就是坏的，必须硬拦。
    if (m.templateResidue > 0) {
      issues.push('检出 ' + m.templateResidue + ' 处未替换的模板标记（形如 {{?xxx}}）'
        + ' —— 主题模板的条件段写错了，检查 themes/*.json 里 {{?x}} 与 {{/x}} 是否成对，改完跑 check/build_theme_js.py');
    }
    return issues;
  }

  // 是否允许放行复制：任何一条红线不达标都不放行
  function verdict(m, rules) {
    var issues = checkAgainstRules(m, rules);
    return { ok: issues.length === 0, issues: issues, metrics: m };
  }

  GZH.metrics = metrics;
  GZH.checkAgainstRules = checkAgainstRules;
  GZH.verdict = verdict;
  GZH.BROWSER_JUNK = BROWSER_JUNK;

})(window);
