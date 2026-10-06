/* 自动生成，请勿手改。源文件：mist-editorial.json
   重新生成：python check/build_theme_js.py */
(function(g){
  g.GZH_THEMES = g.GZH_THEMES || {};
  g.GZH_THEMES['mist-editorial'] = {
  "id": "mist-editorial",
  "name": "雾青编辑",
  "version": 1,
  "derivedFrom": "fengdu_wechat_mist_compatible.html",
  "note": "复刻自 AI 生成的「雾青」排版（Downloads/fengdu_wechat_mist_compatible.html）。深墨青 #17262C 打底、雾青 #4E8FA3 作主色、金色 #E2A341 点缀，浅金 #FFF5DF 作荧光笔与提示框底。全篇零渐变，可直接发公众号。角色映射上做了两处主题级重定义：note = 深色结论卡（VERDICT），cta = 金色提示框（FENGDU NOTE）。",
  "tokens": {
    "accent": "#4E8FA3",
    "accentSub": "#3D7A8C",
    "accentSoft": "#EDF5F6",
    "accentSoft2": "#F5F8F8",
    "accentTint": "#DCE8E9",
    "accentTint2": "#C3D6D8",
    "accentLine": "#4E8FA3",
    "onAccent": "#FFFFFF",
    "cardBg": "#FFFFFF",
    "textMain": "#303A3D",
    "textStrong": "#17262C",
    "textMuted": "#768388",
    "textFaint": "#A0A8AA",
    "inkBg": "#17262C",
    "inkTitle": "#FFFFFF",
    "inkText": "#CDD3D5",
    "inkTextSoft": "#C9D0D2",
    "gold": "#E2A341",
    "goldSoft": "#FFF5DF",
    "pageBg": "#F3F4F4",
    "shadow": "0 3px 12px rgba({{accentRgb}},0.06)",
    "shadowMasthead": "0 4px 14px rgba({{accentRgb}},0.06)",
    "radius": "12px",
    "radiusSm": "10px",
    "radiusLg": "14px"
  },
  "base": {
    "fontFamily": "-apple-system,system-ui,'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif",
    "fontSize": "16px",
    "fontSizeTitle": "23px",
    "lineHeight": "1.9",
    "letterSpacing": "0.5px",
    "letterSpacingLabel": "2px",
    "align": "justify",
    "paraGap": "22px",
    "chapterGap": "46px",
    "cardGap": "30px",
    "itemGap": "12px"
  },
  "inlineStyle": {
    "codeBg": "{{accentSoft}}",
    "codeColor": "{{accent}}",
    "linkColor": "{{accent}}",
    "linkLine": "{{accentTint2}}",
    "strongColor": "{{textStrong}}",
    "strongBg": "{{goldSoft}}"
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
  },
  "components": {
    "masthead": {
      "from": ":::masthead",
      "tpl": "<section style=\"margin:0 0 34px;font-family:{{fontFamily}};\">{{?cover}}<figure style=\"margin:0 0 18px;line-height:0;\"><span leaf=\"\"><img data-w=\"1080\" data-ratio=\"0.4259\" style=\"max-width:100%;height:auto;display:block;margin:0 auto;border-radius:{{radiusSm}};\" src=\"{{cover}}\" /></span></figure>{{/cover}}{{?account}}<p style=\"margin:0 0 15px;font-size:12px;line-height:1.6;letter-spacing:{{letterSpacingLabel}};color:{{accent}};font-weight:700;\"><span leaf=\"\">{{account}}{{?tagline}} · {{tagline}}{{/tagline}}</span></p>{{/account}}{{?title}}<p style=\"margin:0 0 18px;font-size:30px;line-height:1.32;letter-spacing:0.2px;color:{{textStrong}};font-weight:700;\"><span leaf=\"\">{{title}}</span></p>{{/title}}{{?lede}}<p style=\"margin:0 0 18px;font-size:15px;line-height:1.85;letter-spacing:0.4px;color:{{textMuted}};\"><span leaf=\"\">{{lede}}</span></p>{{/lede}}{{?issue}}<p style=\"margin:0;font-size:12px;line-height:1.6;letter-spacing:0.4px;color:{{textFaint}};\"><span leaf=\"\">{{issue}}</span></p>{{/issue}}</section>"
    },
    "highlights": {
      "from": ":::highlights",
      "tpl": "<section style=\"margin-top:{{cardGap}};font-family:{{fontFamily}};\">{{?label}}<p style=\"margin:0 0 12px;font-size:11px;line-height:1.5;letter-spacing:{{letterSpacingLabel}};color:{{accent}};font-weight:700;\"><span leaf=\"\">{{label}}</span></p>{{/label}}{{content}}</section>",
      "item": "<section style=\"{{itemGap}}padding:16px 17px;border:1px solid {{accentTint}};border-radius:{{radiusSm}};background:{{cardBg}};\"><p style=\"margin:0 0 6px;font-size:12px;line-height:1.5;letter-spacing:1px;color:{{accent}};font-weight:700;\"><span leaf=\"\">{{no}}</span></p><p style=\"margin:0;font-size:14px;line-height:1.75;letter-spacing:{{letterSpacing}};color:{{textMain}};\"><span leaf=\"\">{{text}}</span></p></section>"
    },
    "chapter": {
      "from": "heading level 2",
      "tpl": "<section style=\"margin:{{chapterGap}} 0 22px;font-family:{{fontFamily}};\"><p style=\"margin:0 0 7px;font-size:11px;line-height:1.5;letter-spacing:{{letterSpacingLabel}};color:{{accent}};font-weight:700;\"><span leaf=\"\">{{?index}}{{index}}{{/index}}{{?subtitle}} / {{subtitle}}{{/subtitle}}</span></p>{{?title}}<p style=\"margin:0;padding:0 0 12px;border-bottom:2px solid {{accent}};font-size:{{fontSizeTitle}};line-height:1.5;letter-spacing:0.2px;color:{{textStrong}};font-weight:700;\"><span leaf=\"\">{{title}}</span></p>{{/title}}</section>"
    },
    "para": {
      "from": "paragraph",
      "tpl": "<section style=\"margin-top:{{paraGap}};font-family:{{fontFamily}};\"><p style=\"margin:0;font-size:{{fontSize}};line-height:{{lineHeight}};letter-spacing:{{letterSpacing}};text-align:{{align}};color:{{textMain}};\"><span leaf=\"\">{{text}}</span></p></section>"
    },
    "quote": {
      "from": "blockquote",
      "tpl": "<section style=\"margin-top:{{cardGap}};padding:20px;border-left:4px solid {{accent}};background:{{accentSoft}};\"><p style=\"margin:0;font-size:18px;line-height:1.8;letter-spacing:0.4px;color:{{textStrong}};font-weight:700;\"><span leaf=\"\">{{text}}</span></p>{{?label}}<p style=\"margin:10px 0 0;font-size:12px;line-height:1.6;letter-spacing:{{letterSpacing}};color:{{textMuted}};\"><span leaf=\"\">{{label}}</span></p>{{/label}}</section>"
    },
    "note": {
      "from": ":::note",
      "tpl": "<section style=\"margin-top:{{cardGap}};padding:23px 21px;border-radius:{{radiusLg}};background:{{inkBg}};\">{{?label}}<p style=\"margin:0 0 9px;font-size:11px;line-height:1.5;letter-spacing:{{letterSpacingLabel}};color:{{gold}};font-weight:700;\"><span leaf=\"\">{{label}}</span></p>{{/label}}{{?title}}<p style=\"margin:0 0 12px;font-size:20px;line-height:1.65;letter-spacing:0.2px;color:{{inkTitle}};font-weight:700;\"><span leaf=\"\">{{title}}</span></p>{{/title}}{{?text}}<p style=\"margin:0;font-size:14px;line-height:1.85;letter-spacing:0.3px;color:{{inkText}};\"><span leaf=\"\">{{text}}</span></p>{{/text}}</section>"
    },
    "compare": {
      "from": ":::compare",
      "tpl": "<section style=\"margin-top:{{cardGap}};display:flex;gap:{{itemGap}};\">{{content}}</section>",
      "item": "<section style=\"flex:1;min-width:0;background:{{cardBg}};border:1px solid {{accentTint}};border-radius:{{radiusSm}};padding:14px 15px;\">{{?badge}}<p style=\"margin:0 0 8px;font-size:9px;line-height:1.5;letter-spacing:{{letterSpacingLabel}};color:{{accent}};font-weight:700;\"><span leaf=\"\">{{badge}}</span></p>{{/badge}}<p style=\"margin:0 0 8px;font-size:14px;line-height:1.5;letter-spacing:{{letterSpacing}};color:{{textStrong}};font-weight:700;\"><span leaf=\"\">{{title}}</span></p>{{items}}</section>",
      "subitem": "<p style=\"margin:0;font-size:13px;line-height:1.75;letter-spacing:{{letterSpacing}};color:{{textMain}};\"><span leaf=\"\">· {{text}}</span></p>"
    },
    "cta": {
      "from": ":::cta",
      "tpl": "<section style=\"margin-top:{{cardGap}};padding:20px;border-radius:{{radius}};background:{{goldSoft}};\">{{?title}}<p style=\"margin:0 0 8px;font-size:11px;line-height:1.5;letter-spacing:1.5px;color:{{gold}};font-weight:700;\"><span leaf=\"\">{{title}}</span></p>{{/title}}{{?text}}<p style=\"margin:0;font-size:14px;line-height:1.8;letter-spacing:0.3px;color:{{textMain}};\"><span leaf=\"\">{{text}}</span></p>{{/text}}{{?action}}<p style=\"margin:14px 0 0;text-align:center;\"><span style=\"display:inline-block;background:{{accent}};color:{{onAccent}};font-size:13px;font-weight:700;padding:8px 20px;border-radius:8px;letter-spacing:{{letterSpacing}};text-align:center;\"><span leaf=\"\">{{action}}</span></span></p>{{/action}}</section>"
    },
    "image": {
      "from": "image",
      "tpl": "<section style=\"margin-top:{{cardGap}};\"><span style=\"display:block;\"><img src=\"{{src}}\"{{?w}} data-w=\"{{w}}\"{{/w}}{{?ratio}} data-ratio=\"{{ratio}}\"{{/ratio}} style=\"width:100%;display:block;margin:0 auto;border-radius:{{radiusSm}};\" /></span>{{?caption}}<p style=\"margin:8px 2px 0;font-size:12px;line-height:1.6;letter-spacing:{{letterSpacing}};color:{{textMuted}};text-align:center;\"><span leaf=\"\">{{caption}}</span></p>{{/caption}}</section>"
    },
    "video": {
      "from": "bare video filename",
      "tpl": "<section style=\"margin-top:{{cardGap}};\"><span style=\"display:block;\"><img src=\"{{src}}\"{{?w}} data-w=\"{{w}}\"{{/w}}{{?ratio}} data-ratio=\"{{ratio}}\"{{/ratio}} style=\"width:100%;display:block;margin:0 auto;border-radius:{{radiusSm}};\" /></span><p style=\"margin:8px 2px 0;font-size:12px;line-height:1.6;letter-spacing:{{letterSpacing}};color:{{textMuted}};text-align:center;\"><span leaf=\"\">待补视频{{?caption}} · {{caption}}{{/caption}}</span></p></section>"
    },
    "list": {
      "from": "list",
      "note": "item = 无序（雾青圆点）；itemOrdered = 有序（雾青序号）。ordered 为 true 时渲染器优先取 itemOrdered。",
      "tpl": "<section style=\"margin-top:{{cardGap}};font-family:{{fontFamily}};\">{{content}}</section>",
      "item": "<section style=\"display:flex;align-items:flex-start;gap:10px;{{itemGap}}\"><p style=\"margin:0;font-size:16px;line-height:{{lineHeight}};color:{{accent}};flex-shrink:0;\"><span leaf=\"\">·</span></p><p style=\"margin:0;flex:1;min-width:0;font-size:{{fontSize}};line-height:{{lineHeight}};letter-spacing:{{letterSpacing}};text-align:{{align}};color:{{textMain}};\"><span leaf=\"\">{{text}}</span></p></section>",
      "itemOrdered": "<section style=\"display:flex;align-items:flex-start;gap:10px;{{itemGap}}\"><p style=\"margin:0;font-size:12px;line-height:1.9;letter-spacing:1px;color:{{accent}};font-weight:700;flex-shrink:0;\"><span leaf=\"\">{{no}}</span></p><p style=\"margin:0;flex:1;min-width:0;font-size:{{fontSize}};line-height:{{lineHeight}};letter-spacing:{{letterSpacing}};text-align:{{align}};color:{{textMain}};\"><span leaf=\"\">{{text}}</span></p></section>"
    },
    "profile": {
      "from": ":::profile 作者卡",
      "tpl": "<section style=\"margin-top:{{cardGap}};padding:20px;background:{{accentSoft}};border:1px solid {{accentTint}};border-radius:{{radius}};\"><section style=\"display:flex;align-items:center;gap:12px;\"><span style=\"width:44px;height:44px;border-radius:50%;background:{{accent}};color:{{onAccent}};font-size:18px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;\"><span leaf=\"\">{{initial}}</span></span><section style=\"flex:1;min-width:0;\"><p style=\"margin:0;font-size:17px;line-height:1.35;letter-spacing:0.2px;color:{{textStrong}};font-weight:700;\"><span leaf=\"\">{{author}}</span></p>{{?roleline}}<p style=\"margin:3px 0 0;font-size:11px;line-height:1.6;letter-spacing:{{letterSpacingLabel}};color:{{accent}};font-weight:700;\"><span leaf=\"\">{{roleline}}</span></p>{{/roleline}}</section></section>{{?bio}}<p style=\"margin:14px 0 0;font-size:{{fontSize}};line-height:{{lineHeight}};letter-spacing:{{letterSpacing}};color:{{textMain}};\"><span leaf=\"\">{{bio}}</span></p>{{/bio}}{{?footer}}<p style=\"margin:8px 0 0;font-size:12px;line-height:1.7;letter-spacing:{{letterSpacing}};color:{{textMuted}};\"><span leaf=\"\">{{footer}}</span></p>{{/footer}}</section>"
    },
    "signature": {
      "from": "meta.author (auto)",
      "tpl": "<section style=\"margin-top:{{cardGap}};padding:24px 0 0;border-top:1px solid {{accentTint}};\"><p style=\"margin:0 0 7px;font-size:21px;line-height:1.5;letter-spacing:1px;color:{{accent}};font-weight:700;text-align:center;\"><span leaf=\"\">{{author}}</span></p>{{?role}}<p style=\"margin:0;font-size:12px;line-height:1.7;letter-spacing:{{letterSpacing}};color:{{textMuted}};text-align:center;\"><span leaf=\"\">{{role}}</span></p>{{/role}}{{?bio}}<p style=\"margin:4px 0 0;font-size:12px;line-height:1.7;letter-spacing:{{letterSpacing}};color:{{textMuted}};text-align:center;\"><span leaf=\"\">{{bio}}</span></p>{{/bio}}{{?footer}}<p style=\"margin:4px 0 0;font-size:12px;line-height:1.7;letter-spacing:{{letterSpacing}};color:{{textMuted}};text-align:center;\"><span leaf=\"\">{{footer}}</span></p>{{/footer}}</section>"
    },
    "divider": {
      "from": "hr (non-trailing)",
      "tpl": "<section style=\"margin:32px 0;\"><p style=\"margin:0;height:1px;background:{{accentTint}};font-size:0;line-height:0;overflow:hidden;\"><span leaf=\"\"> </span></p></section>"
    },
    "endline": {
      "from": "trailing hr",
      "tpl": "<section style=\"margin:36px 0 30px;display:flex;align-items:center;gap:12px;\"><span style=\"height:1px;background:{{accentTint}};flex:1;display:inline-block;overflow:hidden;font-size:0;line-height:0;\"><span leaf=\"\"> </span></span><span style=\"font-size:11px;font-weight:700;letter-spacing:{{letterSpacingLabel}};color:{{accent}};\"><span leaf=\"\">END</span></span><span style=\"height:1px;background:{{accentTint}};flex:1;display:inline-block;overflow:hidden;font-size:0;line-height:0;\"><span leaf=\"\"> </span></span></section>"
    }
  }
};
})(window);
