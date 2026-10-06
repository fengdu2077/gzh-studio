/* 自动生成，请勿手改。源文件：blue-editorial.json
   重新生成：python check/build_theme_js.py */
(function(g){
  g.GZH_THEMES = g.GZH_THEMES || {};
  g.GZH_THEMES['blue-editorial'] = {
  "id": "blue-editorial",
  "name": "科技刊读风",
  "version": "1.0.0",
  "derivedFrom": "samples/输出样例-blue-editorial-无渐变.html（已发布零告警成品）",
  "note": "所有 components 的 HTML 均从成品逐段反推，非设计稿。仅 list / signature / compare 三项为按同套设计语言推导。",
  "tokens": {
    "accent": "#2563eb",
    "accentSub": "#3b82f6",
    "accentSoft": "#eff6ff",
    "accentSoft2": "#f0f7ff",
    "accentTint": "#dbeafe",
    "accentTint2": "#bfdbfe",
    "accentLine": "#93c5fd",
    "onAccent": "#ffffff",
    "cardBg": "#ffffff",
    "textMain": "#374151",
    "textStrong": "#111827",
    "textMuted": "#9ca3af",
    "shadow": "0 3px 12px rgba(37,99,235,0.06)",
    "shadowMasthead": "0 4px 14px rgba(37,99,235,0.06)",
    "radius": "12px"
  },
  "base": {
    "fontFamily": "'IBM Plex Sans',-apple-system,system-ui,'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif",
    "fontSize": "15px",
    "fontSizeTitle": "22px",
    "lineHeight": "1.95",
    "letterSpacing": "0",
    "align": "justify",
    "paraGap": "20px",
    "chapterGap": "40px",
    "cardGap": "24px",
    "itemGap": "12px"
  },
  "components": {
    "masthead": {
      "from": ":::masthead（旧稿兼容 front-matter）",
      "tpl": "<section style=\"background:{{cardBg}};border:1px solid {{accentTint}};border-radius:{{radius}};box-shadow:{{shadowMasthead}};overflow:hidden;\"><section style=\"padding:13px 16px 12px;display:flex;align-items:center;\"><span style=\"width:7px;height:7px;background:{{accent}};border-radius:50%;display:inline-block;flex-shrink:0;font-size:0;line-height:0;\"><span leaf=\"\"><br></span></span><span style=\"font-size:9px;letter-spacing:{{letterSpacing}};color:{{accent}};margin-left:6px;\"><span leaf=\"\">{{account}} · {{tagline}}</span></span><span style=\"flex:1;height:1px;background:linear-gradient(90deg,{{accentTint2}},rgba(191,219,254,0));margin-left:8px;display:inline-block;overflow:hidden;font-size:0;line-height:0;\"><span leaf=\"\"><br></span></span><span style=\"font-size:9px;letter-spacing:{{letterSpacing}};color:{{textMuted}};margin-left:8px;\"><span leaf=\"\">{{issue}}</span></span></section>{{?cover}}<figure style=\"margin:0;line-height:0;\"><span leaf=\"\"><img data-w=\"1080\" data-ratio=\"0.4259\" style=\"max-width:100%;height:auto;display:block;margin:0 auto;\" src=\"{{cover}}\" /></span></figure>{{/cover}}{{?lede}}<section style=\"padding:15px 17px 17px;background:{{accentSoft}};border-top:1px solid {{accentTint}};\"><p style=\"margin:0 0 7px;font-size:9px;letter-spacing:{{letterSpacing}};color:{{accent}};\"><span leaf=\"\">EDITOR’S NOTE · {{kicker}}</span></p><p style=\"margin:0;font-size:{{fontSize}};line-height:1.7;color:{{textStrong}};\"><span leaf=\"\">{{lede}}</span></p></section>{{/lede}}</section>"
    },
    "highlights": {
      "from": "front-matter highlights",
      "tpl": "<section style=\"margin-top:{{cardGap}};background:{{cardBg}};border:1px solid {{accentTint}};border-radius:{{radius}};padding:16px 18px;box-shadow:{{shadow}};\">{{?label}}<p style=\"margin:0 0 12px;font-size:9px;font-weight:800;letter-spacing:{{letterSpacing}};color:{{accent}};\"><span leaf=\"\">{{label}}</span></p>{{/label}}{{content}}</section>",
      "item": "<section style=\"display:flex;align-items:flex-start;gap:10px;{{itemGap}}\"><p style=\"margin:0;font-size:11px;font-weight:800;color:{{onAccent}};background:{{accent}};border-radius:4px;padding:2px 7px;flex-shrink:0;letter-spacing:{{letterSpacing}};\"><span leaf=\"\">{{no}}</span></p><p style=\"margin:0;font-size:14px;font-weight:600;color:{{textStrong}};line-height:1.6;letter-spacing:{{letterSpacing}};\"><span leaf=\"\">{{text}}</span></p></section>"
    },
    "chapter": {
      "from": "heading level 2",
      "tpl": "<section style=\"margin-top:{{chapterGap}};font-family:{{fontFamily}};\"><section style=\"display:flex;align-items:center;gap:16px;\"><section style=\"text-align:center;flex-shrink:0;\"><p style=\"margin:0;font-size:34px;font-weight:800;color:{{accent}};line-height:1;letter-spacing:{{letterSpacing}};text-align:center;\"><span leaf=\"\">{{index}}</span></p><p style=\"margin:3px 0 0;font-size:8px;font-weight:700;color:{{textMuted}};letter-spacing:{{letterSpacing}};text-align:center;\"><span leaf=\"\">PART</span></p></section><section style=\"flex:1;min-width:0;\"><p style=\"margin:0 0 3px;font-size:{{fontSizeTitle}};color:{{accent}};line-height:1.35;letter-spacing:{{letterSpacing}};\"><span leaf=\"\">{{title}}</span></p>{{?subtitle}}<p style=\"margin:0;font-size:10px;color:{{accentSub}};letter-spacing:{{letterSpacing}};\"><span leaf=\"\">{{subtitle}}</span></p>{{/subtitle}}</section></section></section>"
    },
    "para": {
      "from": "paragraph",
      "tpl": "<section style=\"margin-top:{{paraGap}};font-family:{{fontFamily}};\"><p style=\"margin:0;font-size:{{fontSize}};line-height:{{lineHeight}};text-align:{{align}};color:{{textMain}};letter-spacing:{{letterSpacing}};\"><span leaf=\"\">{{text}}</span></p></section>"
    },
    "quote": {
      "from": "blockquote",
      "tpl": "<section style=\"margin-top:{{cardGap}};background:{{cardBg}};border:1px solid {{accentTint}};border-radius:{{radius}};padding:14px 16px;box-shadow:{{shadow}};\">{{?label}}<p style=\"margin:0 0 6px;font-size:9px;font-weight:800;letter-spacing:{{letterSpacing}};color:{{accent}};\"><span leaf=\"\">{{label}}</span></p>{{/label}}<p style=\"margin:0;font-size:{{fontSize}};line-height:{{lineHeight}};text-align:{{align}};color:{{textMain}};letter-spacing:{{letterSpacing}};\"><span leaf=\"\">{{text}}</span></p></section>"
    },
    "note": {
      "from": "container :::note",
      "tpl": "<section style=\"margin-top:{{cardGap}};background:{{accentSoft}};border-left:3px solid {{accent}};border-radius:0 {{radius}} {{radius}} 0;padding:16px 18px;\">{{?label}}<p style=\"margin:0 0 8px;font-size:9px;font-weight:800;letter-spacing:{{letterSpacing}};color:{{accent}};\"><span leaf=\"\">{{label}}</span></p>{{/label}}{{?title}}<p style=\"margin:0 0 6px;font-size:16px;font-weight:600;color:{{textStrong}};line-height:1.7;letter-spacing:{{letterSpacing}};\"><span leaf=\"\">{{title}}</span></p>{{/title}}<p style=\"margin:0;font-size:14px;line-height:1.8;color:{{textMain}};letter-spacing:{{letterSpacing}};\"><span leaf=\"\">{{text}}</span></p></section>"
    },
    "compare": {
      "from": "container :::compare",
      "tpl": "<section style=\"margin-top:{{cardGap}};display:flex;gap:12px;\">{{content}}</section>",
      "item": "<section style=\"flex:1;min-width:0;background:{{cardBg}};border:1px solid {{accentTint}};border-radius:{{radius}};padding:14px 15px;box-shadow:{{shadow}};\"><p style=\"margin:0 0 8px;font-size:14px;font-weight:600;color:{{textStrong}};line-height:1.5;letter-spacing:{{letterSpacing}};\"><span leaf=\"\">{{title}}</span></p>{{?badge}}<p style=\"margin:0 0 8px;font-size:9px;font-weight:700;color:{{accent}};letter-spacing:{{letterSpacing}};\"><span leaf=\"\">{{badge}}</span></p>{{/badge}}{{items}}</section>",
      "subitem": "<p style=\"margin:0;font-size:13px;line-height:1.75;color:{{textMain}};letter-spacing:{{letterSpacing}};\"><span leaf=\"\">• {{text}}</span></p>"
    },
    "cta": {
      "from": "container :::cta",
      "tpl": "<section style=\"margin-top:{{cardGap}};background:{{accentSoft2}};border:1px solid {{accentTint}};border-radius:{{radius}};padding:18px;text-align:center;box-shadow:{{shadow}};\">{{?title}}<p style=\"margin:0 0 6px;font-size:{{fontSize}};font-weight:600;color:{{textStrong}};line-height:1.7;letter-spacing:{{letterSpacing}};text-align:center;\"><span leaf=\"\">{{title}}</span></p>{{/title}}{{?text}}<p style=\"margin:0 0 14px;font-size:14px;line-height:1.8;color:{{textMain}};letter-spacing:{{letterSpacing}};text-align:center;\"><span leaf=\"\">{{text}}</span></p>{{/text}}{{?action}}<p style=\"margin:0;text-align:center;\"><span style=\"display:inline-block;background:{{accent}};color:{{onAccent}};font-size:13px;font-weight:700;padding:8px 22px;border-radius:8px;letter-spacing:{{letterSpacing}};text-align:center;\"><span leaf=\"\">{{action}}</span></span></p>{{/action}}</section>"
    },
    "image": {
      "from": "image",
      "tpl": "<section style=\"margin-top:{{cardGap}};\"><section style=\"background:{{cardBg}};border:1px solid {{accentTint}};border-radius:{{radius}};padding:6px;box-shadow:{{shadow}};\"><span style=\"display:block;\"><img src=\"{{src}}\"{{?w}} data-w=\"{{w}}\"{{/w}}{{?ratio}} data-ratio=\"{{ratio}}\"{{/ratio}} style=\"width:100%;display:block;margin:0 auto;border-radius:8px;\" /></span></section>{{?caption}}<p style=\"margin:8px 2px 0;font-size:12px;color:{{textMuted}};line-height:1.6;letter-spacing:{{letterSpacing}};text-align:center;\"><span leaf=\"\">{{caption}}</span></p>{{/caption}}</section>"
    },
    "video": {
      "from": "bare video filename",
      "tpl": "<section style=\"margin-top:{{cardGap}};\"><section style=\"background:{{cardBg}};border:1px solid {{accentTint}};border-radius:{{radius}};padding:6px;box-shadow:{{shadow}};\"><span style=\"display:block;\"><img src=\"{{src}}\"{{?w}} data-w=\"{{w}}\"{{/w}}{{?ratio}} data-ratio=\"{{ratio}}\"{{/ratio}} style=\"width:100%;display:block;margin:0 auto;border-radius:8px;\" /></span></section>{{?caption}}<p style=\"margin:8px 2px 0;font-size:12px;color:{{textMuted}};line-height:1.6;letter-spacing:{{letterSpacing}};text-align:center;\"><span leaf=\"\">{{caption}}</span></p>{{/caption}}</section>"
    },
    "list": {
      "from": "list",
      "note": "item = 无序（色块小方点）；itemOrdered = 有序（主色序号标签）。ordered 为 true 时渲染器优先取 itemOrdered。",
      "tpl": "<section style=\"margin-top:{{cardGap}};font-family:{{fontFamily}};\">{{content}}</section>",
      "item": "<section style=\"display:flex;align-items:flex-start;gap:10px;{{itemGap}}\"><p style=\"margin:0;font-size:11px;line-height:{{lineHeight}};color:{{accent}};flex-shrink:0;letter-spacing:{{letterSpacing}};\"><span leaf=\"\">▪</span></p><p style=\"margin:0;flex:1;min-width:0;font-size:{{fontSize}};line-height:{{lineHeight}};color:{{textMain}};text-align:{{align}};letter-spacing:{{letterSpacing}};\"><span leaf=\"\">{{text}}</span></p></section>",
      "itemOrdered": "<section style=\"display:flex;align-items:flex-start;gap:10px;{{itemGap}}\"><span style=\"display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;padding:0 5px;background:{{accent}};color:{{onAccent}};font-size:11px;font-weight:700;border-radius:5px;flex-shrink:0;margin-top:4px;letter-spacing:{{letterSpacing}};overflow:hidden;\"><span leaf=\"\">{{no}}</span></span><p style=\"margin:0;flex:1;min-width:0;font-size:{{fontSize}};line-height:{{lineHeight}};color:{{textMain}};text-align:{{align}};letter-spacing:{{letterSpacing}};\"><span leaf=\"\">{{text}}</span></p></section>"
    },
    "profile": {
      "from": ":::profile 作者卡（放开头=简介，放结尾=署名区）",
      "tpl": "<section style=\"margin-top:{{cardGap}};padding:18px;background:{{accentSoft2}};border:1px solid {{accentTint}};border-radius:{{radius}};\">{{?account}}<p style=\"margin:0 0 12px;font-size:9px;font-weight:800;letter-spacing:{{letterSpacing}};color:{{accent}};\"><span leaf=\"\">{{account}}</span></p>{{/account}}<section style=\"display:flex;align-items:center;gap:12px;\"><span style=\"width:44px;height:44px;border-radius:50%;background:{{accent}};color:{{onAccent}};font-size:18px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;\"><span leaf=\"\">{{initial}}</span></span><section style=\"flex:1;min-width:0;\"><p style=\"margin:0;font-size:16px;font-weight:700;color:{{textStrong}};line-height:1.35;letter-spacing:{{letterSpacing}};\"><span leaf=\"\">{{author}}</span></p><p style=\"margin:3px 0 0;font-size:9px;font-weight:700;color:{{textMuted}};letter-spacing:{{letterSpacing}};\"><span leaf=\"\">{{roleline}}</span></p></section></section>{{?bio}}<p style=\"margin:14px 0 0;font-size:{{fontSize}};line-height:{{lineHeight}};color:{{textMain}};letter-spacing:{{letterSpacing}};\"><span leaf=\"\">{{bio}}</span></p>{{/bio}}{{?footer}}<p style=\"margin:10px 0 0;font-size:13px;line-height:1.8;color:{{textMuted}};letter-spacing:{{letterSpacing}};\"><span leaf=\"\">{{footer}}</span></p>{{/footer}}<p style=\"margin:14px 0 0;font-size:9px;font-weight:700;color:{{accentTint2}};letter-spacing:{{letterSpacing}};text-align:right;\"><span leaf=\"\">THANKS</span></p></section>"
    },
    "signature": {
      "from": "meta.author (auto)",
      "tpl": "<section style=\"margin:0 4px 24px;padding:18px;background:{{accentSoft2}};border:1px solid {{accentTint}};border-radius:{{radius}};\"><section style=\"display:flex;align-items:center;gap:12px;\"><span style=\"width:44px;height:44px;border-radius:50%;background:{{accent}};color:{{onAccent}};font-size:18px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;\"><span leaf=\"\">{{initial}}</span></span><section style=\"flex:1;min-width:0;\"><p style=\"margin:0;font-size:16px;font-weight:700;color:{{textStrong}};line-height:1.35;letter-spacing:{{letterSpacing}};\"><span leaf=\"\">{{author}}</span></p><p style=\"margin:3px 0 0;font-size:9px;font-weight:700;color:{{textMuted}};letter-spacing:{{letterSpacing}};\"><span leaf=\"\">{{role}}</span></p></section></section>{{?bio}}<p style=\"margin:14px 0 0;font-size:{{fontSize}};line-height:{{lineHeight}};color:{{textMain}};letter-spacing:{{letterSpacing}};\"><span leaf=\"\">{{bio}}</span></p>{{{/bio}}}{{?footer}}<p style=\"margin:10px 0 0;font-size:13px;line-height:1.8;color:{{textMuted}};letter-spacing:{{letterSpacing}};\"><span leaf=\"\">{{footer}}</span></p>{{{/footer}}}<p style=\"margin:14px 0 0;font-size:9px;font-weight:700;color:{{accentTint2}};letter-spacing:{{letterSpacing}};text-align:right;\"><span leaf=\"\">THANKS</span></p></section>"
    },
    "endline": {
      "from": "trailing hr",
      "tpl": "<section style=\"margin:26px 4px 22px;display:flex;align-items:center;gap:12px;\"><span style=\"height:1px;background:linear-gradient(90deg,rgba(37,99,235,0),{{accentLine}});flex:1;display:inline-block;overflow:hidden;font-size:0;line-height:0;\"><span leaf=\"\"> </span></span><span style=\"font-size:9px;font-weight:800;letter-spacing:{{letterSpacing}};color:{{accent}};\"><span leaf=\"\">END</span></span><span style=\"height:1px;background:linear-gradient(90deg,{{accentLine}},rgba(37,99,235,0));flex:1;display:inline-block;overflow:hidden;font-size:0;line-height:0;\"><span leaf=\"\"> </span></span></section>"
    }
  },
  "variants": {
    "default": {
      "name": "科技刊读风（无渐变，默认）"
    },
    "with-gradient": {
      "name": "科技刊读风（带渐变卡）",
      "note": "会触发微信 darkmode-no-gradient 提示，且手机深色模式下渐变卡内的字可能看不见。谨慎使用。",
      "overrides": {
        "rules.maxGradient135": 2
      }
    }
  },
  "rules": {
    "maxGradient135": 0,
    "maxGradientTotal": 3,
    "forbidTextAlign": [
      "left",
      "start",
      "end"
    ],
    "requireImgDataAttrs": [
      "data-w",
      "data-ratio"
    ],
    "requireLeafSpan": true,
    "allowFlex": true,
    "forbidTags": [
      "div",
      "script",
      "style",
      "pre"
    ],
    "forbidAttrs": [
      "class",
      "id"
    ]
  }
};
})(window);
