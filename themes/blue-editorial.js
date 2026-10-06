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
    "shadow": "0 3px 12px rgba({{accentRgb}},0.06)",
    "shadowMasthead": "0 4px 14px rgba({{accentRgb}},0.06)",
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
      "tpl": "<section style=\"background:{{cardBg}};border:1px solid {{accentTint}};border-radius:{{radius}};box-shadow:{{shadowMasthead}};overflow:hidden;\"><section style=\"padding:13px 16px 12px;display:flex;align-items:center;\"><span style=\"width:7px;height:7px;background:{{accent}};border-radius:50%;display:inline-block;flex-shrink:0;font-size:0;line-height:0;\"><span leaf=\"\"><br></span></span><span style=\"font-size:9px;letter-spacing:{{letterSpacing}};color:{{accent}};margin-left:6px;\"><span leaf=\"\">{{account}} · {{tagline}}</span></span><span style=\"flex:1;height:1px;background:linear-gradient(90deg,{{accentTint2}},rgba({{accentTint2Rgb}},0));margin-left:8px;display:inline-block;overflow:hidden;font-size:0;line-height:0;\"><span leaf=\"\"><br></span></span><span style=\"font-size:9px;letter-spacing:{{letterSpacing}};color:{{textMuted}};margin-left:8px;\"><span leaf=\"\">{{issue}}</span></span></section>{{?cover}}<figure style=\"margin:0;line-height:0;\"><span leaf=\"\"><img data-w=\"1080\" data-ratio=\"0.4259\" style=\"max-width:100%;height:auto;display:block;margin:0 auto;\" src=\"{{cover}}\" /></span></figure>{{/cover}}{{?lede}}<section style=\"padding:15px 17px 17px;background:{{accentSoft}};border-top:1px solid {{accentTint}};\"><p style=\"margin:0 0 7px;font-size:9px;letter-spacing:{{letterSpacing}};color:{{accent}};\"><span leaf=\"\">EDITOR’S NOTE · {{kicker}}</span></p><p style=\"margin:0;font-size:{{fontSize}};line-height:1.7;color:{{textStrong}};\"><span leaf=\"\">{{lede}}</span></p></section>{{/lede}}</section>"
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
      "tpl": "<section style=\"margin:0 4px 24px;padding:18px;background:{{accentSoft2}};border:1px solid {{accentTint}};border-radius:{{radius}};\"><section style=\"display:flex;align-items:center;gap:12px;\"><span style=\"width:44px;height:44px;border-radius:50%;background:{{accent}};color:{{onAccent}};font-size:18px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;\"><span leaf=\"\">{{initial}}</span></span><section style=\"flex:1;min-width:0;\"><p style=\"margin:0;font-size:16px;font-weight:700;color:{{textStrong}};line-height:1.35;letter-spacing:{{letterSpacing}};\"><span leaf=\"\">{{author}}</span></p><p style=\"margin:3px 0 0;font-size:9px;font-weight:700;color:{{textMuted}};letter-spacing:{{letterSpacing}};\"><span leaf=\"\">{{role}}</span></p></section></section>{{?bio}}<p style=\"margin:14px 0 0;font-size:{{fontSize}};line-height:{{lineHeight}};color:{{textMain}};letter-spacing:{{letterSpacing}};\"><span leaf=\"\">{{bio}}</span></p>{{/bio}}}{{?footer}}<p style=\"margin:10px 0 0;font-size:13px;line-height:1.8;color:{{textMuted}};letter-spacing:{{letterSpacing}};\"><span leaf=\"\">{{footer}}</span></p>{{/footer}}<p style=\"margin:14px 0 0;font-size:9px;font-weight:700;color:{{accentTint2}};letter-spacing:{{letterSpacing}};text-align:right;\"><span leaf=\"\">THANKS</span></p></section>"
    },
    "divider": {
      "from": "hr (non-trailing)",
      "tpl": "<section style=\"margin:24px 60px;display:flex;align-items:center;gap:10px;\"><span style=\"height:1px;background:{{accentTint}};flex:1;display:inline-block;overflow:hidden;font-size:0;line-height:0;\"><span leaf=\"\"> </span></span><span style=\"width:5px;height:5px;border-radius:50%;background:{{accentTint2}};display:inline-block;flex-shrink:0;overflow:hidden;font-size:0;line-height:0;\"><span leaf=\"\"> </span></span><span style=\"height:1px;background:{{accentTint}};flex:1;display:inline-block;overflow:hidden;font-size:0;line-height:0;\"><span leaf=\"\"> </span></span></section>"
    },
    "endline": {
      "from": "trailing hr",
      "tpl": "<section style=\"margin:26px 4px 22px;display:flex;align-items:center;gap:12px;\"><span style=\"height:1px;background:linear-gradient(90deg,rgba({{accentRgb}},0),{{accentLine}});flex:1;display:inline-block;overflow:hidden;font-size:0;line-height:0;\"><span leaf=\"\"> </span></span><span style=\"font-size:9px;font-weight:800;letter-spacing:{{letterSpacing}};color:{{accent}};\"><span leaf=\"\">END</span></span><span style=\"height:1px;background:linear-gradient(90deg,{{accentLine}},rgba({{accentRgb}},0));flex:1;display:inline-block;overflow:hidden;font-size:0;line-height:0;\"><span leaf=\"\"> </span></span></section>"
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
  },
  "compositions": {
    "masthead": {
      "tree": [
        {
          "type": "box",
          "style": {
            "background": "{{cardBg}}",
            "border": "1px solid {{accentTint}}",
            "border-radius": "{{radius}}",
            "box-shadow": "{{shadowMasthead}}",
            "overflow": "hidden",
            "__order": [
              "background",
              "border",
              "border-radius",
              "box-shadow",
              "overflow"
            ],
            "__semi": true
          },
          "children": [
            {
              "type": "grid",
              "style": {
                "padding": "13px 16px 12px",
                "display": "flex",
                "align-items": "center",
                "__order": [
                  "padding",
                  "display",
                  "align-items"
                ],
                "__semi": true
              },
              "children": [
                {
                  "type": "chip",
                  "style": {
                    "width": "7px",
                    "height": "7px",
                    "background": "{{accent}}",
                    "border-radius": "50%",
                    "display": "inline-block",
                    "flex-shrink": "0",
                    "font-size": "0",
                    "line-height": "0",
                    "__order": [
                      "width",
                      "height",
                      "background",
                      "border-radius",
                      "display",
                      "flex-shrink",
                      "font-size",
                      "line-height"
                    ],
                    "__semi": true
                  },
                  "children": [
                    {
                      "type": "html",
                      "html": "<span leaf=\"\"><br></span>"
                    }
                  ]
                },
                {
                  "type": "chip",
                  "style": {
                    "font-size": "9px",
                    "letter-spacing": "{{letterSpacing}}",
                    "color": "{{accent}}",
                    "margin-left": "6px",
                    "__order": [
                      "font-size",
                      "letter-spacing",
                      "color",
                      "margin-left"
                    ],
                    "__semi": true
                  },
                  "children": [
                    {
                      "type": "html",
                      "html": "<span leaf=\"\">{{account}} · {{tagline}}</span>"
                    }
                  ]
                },
                {
                  "type": "chip",
                  "style": {
                    "flex": "1",
                    "height": "1px",
                    "background": "linear-gradient(90deg,{{accentTint2}},rgba({{accentTint2Rgb}},0))",
                    "margin-left": "8px",
                    "display": "inline-block",
                    "overflow": "hidden",
                    "font-size": "0",
                    "line-height": "0",
                    "__order": [
                      "flex",
                      "height",
                      "background",
                      "margin-left",
                      "display",
                      "overflow",
                      "font-size",
                      "line-height"
                    ],
                    "__semi": true
                  },
                  "children": [
                    {
                      "type": "html",
                      "html": "<span leaf=\"\"><br></span>"
                    }
                  ]
                },
                {
                  "type": "chip",
                  "style": {
                    "font-size": "9px",
                    "letter-spacing": "{{letterSpacing}}",
                    "color": "{{textMuted}}",
                    "margin-left": "8px",
                    "__order": [
                      "font-size",
                      "letter-spacing",
                      "color",
                      "margin-left"
                    ],
                    "__semi": true
                  },
                  "children": [
                    {
                      "type": "html",
                      "html": "<span leaf=\"\">{{issue}}</span>"
                    }
                  ]
                }
              ]
            },
            {
              "type": "figure",
              "style": {
                "margin": "0",
                "line-height": "0",
                "__order": [
                  "margin",
                  "line-height"
                ],
                "__semi": true
              },
              "children": [
                {
                  "type": "html",
                  "html": "<span leaf=\"\"><img data-w=\"1080\" data-ratio=\"0.4259\" style=\"max-width:100%;height:auto;display:block;margin:0 auto;\" src=\"{{cover}}\" /></span>"
                }
              ],
              "if": [
                "cover"
              ]
            },
            {
              "type": "box",
              "style": {
                "padding": "15px 17px 17px",
                "background": "{{accentSoft}}",
                "border-top": "1px solid {{accentTint}}",
                "__order": [
                  "padding",
                  "background",
                  "border-top"
                ],
                "__semi": true
              },
              "children": [
                {
                  "type": "text",
                  "text": "EDITOR’S NOTE · {{kicker}}",
                  "style": {
                    "margin": "0 0 7px",
                    "font-size": "9px",
                    "letter-spacing": "{{letterSpacing}}",
                    "color": "{{accent}}",
                    "__order": [
                      "margin",
                      "font-size",
                      "letter-spacing",
                      "color"
                    ],
                    "__semi": true
                  }
                },
                {
                  "type": "text",
                  "text": "{{lede}}",
                  "style": {
                    "margin": "0",
                    "font-size": "{{fontSize}}",
                    "line-height": "1.7",
                    "color": "{{textStrong}}",
                    "__order": [
                      "margin",
                      "font-size",
                      "line-height",
                      "color"
                    ],
                    "__semi": true
                  }
                }
              ],
              "if": [
                "lede"
              ]
            }
          ]
        }
      ]
    },
    "highlights": {
      "tree": [
        {
          "type": "box",
          "style": {
            "margin-top": "{{cardGap}}",
            "background": "{{cardBg}}",
            "border": "1px solid {{accentTint}}",
            "border-radius": "{{radius}}",
            "padding": "16px 18px",
            "box-shadow": "{{shadow}}",
            "__order": [
              "margin-top",
              "background",
              "border",
              "border-radius",
              "padding",
              "box-shadow"
            ],
            "__semi": true
          },
          "children": [
            {
              "type": "text",
              "text": "{{label}}",
              "style": {
                "margin": "0 0 12px",
                "font-size": "9px",
                "font-weight": "800",
                "letter-spacing": "{{letterSpacing}}",
                "color": "{{accent}}",
                "__order": [
                  "margin",
                  "font-size",
                  "font-weight",
                  "letter-spacing",
                  "color"
                ],
                "__semi": true
              },
              "if": [
                "label"
              ]
            },
            {
              "type": "slot",
              "name": "content"
            }
          ]
        }
      ],
      "itemTree": [
        {
          "type": "grid",
          "style": {
            "display": "flex",
            "align-items": "flex-start",
            "gap": "10px",
            "__I0": "{{itemGap}}",
            "__order": [
              "display",
              "align-items",
              "gap",
              "__I0"
            ],
            "__semi": false
          },
          "children": [
            {
              "type": "text",
              "text": "{{no}}",
              "style": {
                "margin": "0",
                "font-size": "11px",
                "font-weight": "800",
                "color": "{{onAccent}}",
                "background": "{{accent}}",
                "border-radius": "4px",
                "padding": "2px 7px",
                "flex-shrink": "0",
                "letter-spacing": "{{letterSpacing}}",
                "__order": [
                  "margin",
                  "font-size",
                  "font-weight",
                  "color",
                  "background",
                  "border-radius",
                  "padding",
                  "flex-shrink",
                  "letter-spacing"
                ],
                "__semi": true
              }
            },
            {
              "type": "text",
              "text": "{{text}}",
              "style": {
                "margin": "0",
                "font-size": "14px",
                "font-weight": "600",
                "color": "{{textStrong}}",
                "line-height": "1.6",
                "letter-spacing": "{{letterSpacing}}",
                "__order": [
                  "margin",
                  "font-size",
                  "font-weight",
                  "color",
                  "line-height",
                  "letter-spacing"
                ],
                "__semi": true
              }
            }
          ]
        }
      ]
    },
    "chapter": {
      "tree": [
        {
          "type": "box",
          "style": {
            "margin-top": "{{chapterGap}}",
            "font-family": "{{fontFamily}}",
            "__order": [
              "margin-top",
              "font-family"
            ],
            "__semi": true
          },
          "children": [
            {
              "type": "grid",
              "style": {
                "display": "flex",
                "align-items": "center",
                "gap": "16px",
                "__order": [
                  "display",
                  "align-items",
                  "gap"
                ],
                "__semi": true
              },
              "children": [
                {
                  "type": "box",
                  "style": {
                    "text-align": "center",
                    "flex-shrink": "0",
                    "__order": [
                      "text-align",
                      "flex-shrink"
                    ],
                    "__semi": true
                  },
                  "children": [
                    {
                      "type": "text",
                      "text": "{{index}}",
                      "style": {
                        "margin": "0",
                        "font-size": "34px",
                        "font-weight": "800",
                        "color": "{{accent}}",
                        "line-height": "1",
                        "letter-spacing": "{{letterSpacing}}",
                        "text-align": "center",
                        "__order": [
                          "margin",
                          "font-size",
                          "font-weight",
                          "color",
                          "line-height",
                          "letter-spacing",
                          "text-align"
                        ],
                        "__semi": true
                      }
                    },
                    {
                      "type": "text",
                      "text": "PART",
                      "style": {
                        "margin": "3px 0 0",
                        "font-size": "8px",
                        "font-weight": "700",
                        "color": "{{textMuted}}",
                        "letter-spacing": "{{letterSpacing}}",
                        "text-align": "center",
                        "__order": [
                          "margin",
                          "font-size",
                          "font-weight",
                          "color",
                          "letter-spacing",
                          "text-align"
                        ],
                        "__semi": true
                      }
                    }
                  ]
                },
                {
                  "type": "box",
                  "style": {
                    "flex": "1",
                    "min-width": "0",
                    "__order": [
                      "flex",
                      "min-width"
                    ],
                    "__semi": true
                  },
                  "children": [
                    {
                      "type": "text",
                      "text": "{{title}}",
                      "style": {
                        "margin": "0 0 3px",
                        "font-size": "{{fontSizeTitle}}",
                        "color": "{{accent}}",
                        "line-height": "1.35",
                        "letter-spacing": "{{letterSpacing}}",
                        "__order": [
                          "margin",
                          "font-size",
                          "color",
                          "line-height",
                          "letter-spacing"
                        ],
                        "__semi": true
                      }
                    },
                    {
                      "type": "text",
                      "text": "{{subtitle}}",
                      "style": {
                        "margin": "0",
                        "font-size": "10px",
                        "color": "{{accentSub}}",
                        "letter-spacing": "{{letterSpacing}}",
                        "__order": [
                          "margin",
                          "font-size",
                          "color",
                          "letter-spacing"
                        ],
                        "__semi": true
                      },
                      "if": [
                        "subtitle"
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    "para": {
      "tree": [
        {
          "type": "box",
          "style": {
            "margin-top": "{{paraGap}}",
            "font-family": "{{fontFamily}}",
            "__order": [
              "margin-top",
              "font-family"
            ],
            "__semi": true
          },
          "children": [
            {
              "type": "text",
              "text": "{{text}}",
              "style": {
                "margin": "0",
                "font-size": "{{fontSize}}",
                "line-height": "{{lineHeight}}",
                "text-align": "{{align}}",
                "color": "{{textMain}}",
                "letter-spacing": "{{letterSpacing}}",
                "__order": [
                  "margin",
                  "font-size",
                  "line-height",
                  "text-align",
                  "color",
                  "letter-spacing"
                ],
                "__semi": true
              }
            }
          ]
        }
      ]
    },
    "quote": {
      "tree": [
        {
          "type": "box",
          "style": {
            "margin-top": "{{cardGap}}",
            "background": "{{cardBg}}",
            "border": "1px solid {{accentTint}}",
            "border-radius": "{{radius}}",
            "padding": "14px 16px",
            "box-shadow": "{{shadow}}",
            "__order": [
              "margin-top",
              "background",
              "border",
              "border-radius",
              "padding",
              "box-shadow"
            ],
            "__semi": true
          },
          "children": [
            {
              "type": "text",
              "text": "{{label}}",
              "style": {
                "margin": "0 0 6px",
                "font-size": "9px",
                "font-weight": "800",
                "letter-spacing": "{{letterSpacing}}",
                "color": "{{accent}}",
                "__order": [
                  "margin",
                  "font-size",
                  "font-weight",
                  "letter-spacing",
                  "color"
                ],
                "__semi": true
              },
              "if": [
                "label"
              ]
            },
            {
              "type": "text",
              "text": "{{text}}",
              "style": {
                "margin": "0",
                "font-size": "{{fontSize}}",
                "line-height": "{{lineHeight}}",
                "text-align": "{{align}}",
                "color": "{{textMain}}",
                "letter-spacing": "{{letterSpacing}}",
                "__order": [
                  "margin",
                  "font-size",
                  "line-height",
                  "text-align",
                  "color",
                  "letter-spacing"
                ],
                "__semi": true
              }
            }
          ]
        }
      ]
    },
    "note": {
      "tree": [
        {
          "type": "box",
          "style": {
            "margin-top": "{{cardGap}}",
            "background": "{{accentSoft}}",
            "border-left": "3px solid {{accent}}",
            "border-radius": "0 {{radius}} {{radius}} 0",
            "padding": "16px 18px",
            "__order": [
              "margin-top",
              "background",
              "border-left",
              "border-radius",
              "padding"
            ],
            "__semi": true
          },
          "children": [
            {
              "type": "text",
              "text": "{{label}}",
              "style": {
                "margin": "0 0 8px",
                "font-size": "9px",
                "font-weight": "800",
                "letter-spacing": "{{letterSpacing}}",
                "color": "{{accent}}",
                "__order": [
                  "margin",
                  "font-size",
                  "font-weight",
                  "letter-spacing",
                  "color"
                ],
                "__semi": true
              },
              "if": [
                "label"
              ]
            },
            {
              "type": "text",
              "text": "{{title}}",
              "style": {
                "margin": "0 0 6px",
                "font-size": "16px",
                "font-weight": "600",
                "color": "{{textStrong}}",
                "line-height": "1.7",
                "letter-spacing": "{{letterSpacing}}",
                "__order": [
                  "margin",
                  "font-size",
                  "font-weight",
                  "color",
                  "line-height",
                  "letter-spacing"
                ],
                "__semi": true
              },
              "if": [
                "title"
              ]
            },
            {
              "type": "text",
              "text": "{{text}}",
              "style": {
                "margin": "0",
                "font-size": "14px",
                "line-height": "1.8",
                "color": "{{textMain}}",
                "letter-spacing": "{{letterSpacing}}",
                "__order": [
                  "margin",
                  "font-size",
                  "line-height",
                  "color",
                  "letter-spacing"
                ],
                "__semi": true
              }
            }
          ]
        }
      ]
    },
    "compare": {
      "tree": [
        {
          "type": "grid",
          "style": {
            "margin-top": "{{cardGap}}",
            "display": "flex",
            "gap": "12px",
            "__order": [
              "margin-top",
              "display",
              "gap"
            ],
            "__semi": true
          },
          "children": [
            {
              "type": "slot",
              "name": "content"
            }
          ]
        }
      ],
      "itemTree": [
        {
          "type": "box",
          "style": {
            "flex": "1",
            "min-width": "0",
            "background": "{{cardBg}}",
            "border": "1px solid {{accentTint}}",
            "border-radius": "{{radius}}",
            "padding": "14px 15px",
            "box-shadow": "{{shadow}}",
            "__order": [
              "flex",
              "min-width",
              "background",
              "border",
              "border-radius",
              "padding",
              "box-shadow"
            ],
            "__semi": true
          },
          "children": [
            {
              "type": "text",
              "text": "{{title}}",
              "style": {
                "margin": "0 0 8px",
                "font-size": "14px",
                "font-weight": "600",
                "color": "{{textStrong}}",
                "line-height": "1.5",
                "letter-spacing": "{{letterSpacing}}",
                "__order": [
                  "margin",
                  "font-size",
                  "font-weight",
                  "color",
                  "line-height",
                  "letter-spacing"
                ],
                "__semi": true
              }
            },
            {
              "type": "text",
              "text": "{{badge}}",
              "style": {
                "margin": "0 0 8px",
                "font-size": "9px",
                "font-weight": "700",
                "color": "{{accent}}",
                "letter-spacing": "{{letterSpacing}}",
                "__order": [
                  "margin",
                  "font-size",
                  "font-weight",
                  "color",
                  "letter-spacing"
                ],
                "__semi": true
              },
              "if": [
                "badge"
              ]
            },
            {
              "type": "slot",
              "name": "items"
            }
          ]
        }
      ],
      "subitemTree": [
        {
          "type": "text",
          "text": "• {{text}}",
          "style": {
            "margin": "0",
            "font-size": "13px",
            "line-height": "1.75",
            "color": "{{textMain}}",
            "letter-spacing": "{{letterSpacing}}",
            "__order": [
              "margin",
              "font-size",
              "line-height",
              "color",
              "letter-spacing"
            ],
            "__semi": true
          }
        }
      ]
    },
    "cta": {
      "tree": [
        {
          "type": "box",
          "style": {
            "margin-top": "{{cardGap}}",
            "background": "{{accentSoft2}}",
            "border": "1px solid {{accentTint}}",
            "border-radius": "{{radius}}",
            "padding": "18px",
            "text-align": "center",
            "box-shadow": "{{shadow}}",
            "__order": [
              "margin-top",
              "background",
              "border",
              "border-radius",
              "padding",
              "text-align",
              "box-shadow"
            ],
            "__semi": true
          },
          "children": [
            {
              "type": "text",
              "text": "{{title}}",
              "style": {
                "margin": "0 0 6px",
                "font-size": "{{fontSize}}",
                "font-weight": "600",
                "color": "{{textStrong}}",
                "line-height": "1.7",
                "letter-spacing": "{{letterSpacing}}",
                "text-align": "center",
                "__order": [
                  "margin",
                  "font-size",
                  "font-weight",
                  "color",
                  "line-height",
                  "letter-spacing",
                  "text-align"
                ],
                "__semi": true
              },
              "if": [
                "title"
              ]
            },
            {
              "type": "text",
              "text": "{{text}}",
              "style": {
                "margin": "0 0 14px",
                "font-size": "14px",
                "line-height": "1.8",
                "color": "{{textMain}}",
                "letter-spacing": "{{letterSpacing}}",
                "text-align": "center",
                "__order": [
                  "margin",
                  "font-size",
                  "line-height",
                  "color",
                  "letter-spacing",
                  "text-align"
                ],
                "__semi": true
              },
              "if": [
                "text"
              ]
            },
            {
              "type": "html",
              "html": "<p style=\"margin:0;text-align:center;\"><span style=\"display:inline-block;background:{{accent}};color:{{onAccent}};font-size:13px;font-weight:700;padding:8px 22px;border-radius:8px;letter-spacing:{{letterSpacing}};text-align:center;\"><span leaf=\"\">{{action}}</span></span></p>",
              "if": [
                "action"
              ]
            }
          ]
        }
      ]
    },
    "image": {
      "tree": [
        {
          "type": "box",
          "style": {
            "margin-top": "{{cardGap}}",
            "__order": [
              "margin-top"
            ],
            "__semi": true
          },
          "children": [
            {
              "type": "box",
              "style": {
                "background": "{{cardBg}}",
                "border": "1px solid {{accentTint}}",
                "border-radius": "{{radius}}",
                "padding": "6px",
                "box-shadow": "{{shadow}}",
                "__order": [
                  "background",
                  "border",
                  "border-radius",
                  "padding",
                  "box-shadow"
                ],
                "__semi": true
              },
              "children": [
                {
                  "type": "chip",
                  "style": {
                    "display": "block",
                    "__order": [
                      "display"
                    ],
                    "__semi": true
                  },
                  "children": [
                    {
                      "type": "html",
                      "html": "<img src=\"{{src}}\"{{?w}} data-w=\"{{w}}\"{{/w}}{{?ratio}} data-ratio=\"{{ratio}}\"{{/ratio}} style=\"width:100%;display:block;margin:0 auto;border-radius:8px;\" />"
                    }
                  ]
                }
              ]
            },
            {
              "type": "text",
              "text": "{{caption}}",
              "style": {
                "margin": "8px 2px 0",
                "font-size": "12px",
                "color": "{{textMuted}}",
                "line-height": "1.6",
                "letter-spacing": "{{letterSpacing}}",
                "text-align": "center",
                "__order": [
                  "margin",
                  "font-size",
                  "color",
                  "line-height",
                  "letter-spacing",
                  "text-align"
                ],
                "__semi": true
              },
              "if": [
                "caption"
              ]
            }
          ]
        }
      ]
    },
    "video": {
      "tree": [
        {
          "type": "box",
          "style": {
            "margin-top": "{{cardGap}}",
            "__order": [
              "margin-top"
            ],
            "__semi": true
          },
          "children": [
            {
              "type": "box",
              "style": {
                "background": "{{cardBg}}",
                "border": "1px solid {{accentTint}}",
                "border-radius": "{{radius}}",
                "padding": "6px",
                "box-shadow": "{{shadow}}",
                "__order": [
                  "background",
                  "border",
                  "border-radius",
                  "padding",
                  "box-shadow"
                ],
                "__semi": true
              },
              "children": [
                {
                  "type": "chip",
                  "style": {
                    "display": "block",
                    "__order": [
                      "display"
                    ],
                    "__semi": true
                  },
                  "children": [
                    {
                      "type": "html",
                      "html": "<img src=\"{{src}}\"{{?w}} data-w=\"{{w}}\"{{/w}}{{?ratio}} data-ratio=\"{{ratio}}\"{{/ratio}} style=\"width:100%;display:block;margin:0 auto;border-radius:8px;\" />"
                    }
                  ]
                }
              ]
            },
            {
              "type": "text",
              "text": "{{caption}}",
              "style": {
                "margin": "8px 2px 0",
                "font-size": "12px",
                "color": "{{textMuted}}",
                "line-height": "1.6",
                "letter-spacing": "{{letterSpacing}}",
                "text-align": "center",
                "__order": [
                  "margin",
                  "font-size",
                  "color",
                  "line-height",
                  "letter-spacing",
                  "text-align"
                ],
                "__semi": true
              },
              "if": [
                "caption"
              ]
            }
          ]
        }
      ]
    },
    "list": {
      "tree": [
        {
          "type": "box",
          "style": {
            "margin-top": "{{cardGap}}",
            "font-family": "{{fontFamily}}",
            "__order": [
              "margin-top",
              "font-family"
            ],
            "__semi": true
          },
          "children": [
            {
              "type": "slot",
              "name": "content"
            }
          ]
        }
      ],
      "itemTree": [
        {
          "type": "grid",
          "style": {
            "display": "flex",
            "align-items": "flex-start",
            "gap": "10px",
            "__I0": "{{itemGap}}",
            "__order": [
              "display",
              "align-items",
              "gap",
              "__I0"
            ],
            "__semi": false
          },
          "children": [
            {
              "type": "text",
              "text": "▪",
              "style": {
                "margin": "0",
                "font-size": "11px",
                "line-height": "{{lineHeight}}",
                "color": "{{accent}}",
                "flex-shrink": "0",
                "letter-spacing": "{{letterSpacing}}",
                "__order": [
                  "margin",
                  "font-size",
                  "line-height",
                  "color",
                  "flex-shrink",
                  "letter-spacing"
                ],
                "__semi": true
              }
            },
            {
              "type": "text",
              "text": "{{text}}",
              "style": {
                "margin": "0",
                "flex": "1",
                "min-width": "0",
                "font-size": "{{fontSize}}",
                "line-height": "{{lineHeight}}",
                "color": "{{textMain}}",
                "text-align": "{{align}}",
                "letter-spacing": "{{letterSpacing}}",
                "__order": [
                  "margin",
                  "flex",
                  "min-width",
                  "font-size",
                  "line-height",
                  "color",
                  "text-align",
                  "letter-spacing"
                ],
                "__semi": true
              }
            }
          ]
        }
      ],
      "itemOrderedTree": [
        {
          "type": "grid",
          "style": {
            "display": "flex",
            "align-items": "flex-start",
            "gap": "10px",
            "__I0": "{{itemGap}}",
            "__order": [
              "display",
              "align-items",
              "gap",
              "__I0"
            ],
            "__semi": false
          },
          "children": [
            {
              "type": "chip",
              "style": {
                "display": "inline-flex",
                "align-items": "center",
                "justify-content": "center",
                "min-width": "20px",
                "height": "20px",
                "padding": "0 5px",
                "background": "{{accent}}",
                "color": "{{onAccent}}",
                "font-size": "11px",
                "font-weight": "700",
                "border-radius": "5px",
                "flex-shrink": "0",
                "margin-top": "4px",
                "letter-spacing": "{{letterSpacing}}",
                "overflow": "hidden",
                "__order": [
                  "display",
                  "align-items",
                  "justify-content",
                  "min-width",
                  "height",
                  "padding",
                  "background",
                  "color",
                  "font-size",
                  "font-weight",
                  "border-radius",
                  "flex-shrink",
                  "margin-top",
                  "letter-spacing",
                  "overflow"
                ],
                "__semi": true
              },
              "children": [
                {
                  "type": "html",
                  "html": "<span leaf=\"\">{{no}}</span>"
                }
              ]
            },
            {
              "type": "text",
              "text": "{{text}}",
              "style": {
                "margin": "0",
                "flex": "1",
                "min-width": "0",
                "font-size": "{{fontSize}}",
                "line-height": "{{lineHeight}}",
                "color": "{{textMain}}",
                "text-align": "{{align}}",
                "letter-spacing": "{{letterSpacing}}",
                "__order": [
                  "margin",
                  "flex",
                  "min-width",
                  "font-size",
                  "line-height",
                  "color",
                  "text-align",
                  "letter-spacing"
                ],
                "__semi": true
              }
            }
          ]
        }
      ]
    },
    "profile": {
      "tree": [
        {
          "type": "box",
          "style": {
            "margin-top": "{{cardGap}}",
            "padding": "18px",
            "background": "{{accentSoft2}}",
            "border": "1px solid {{accentTint}}",
            "border-radius": "{{radius}}",
            "__order": [
              "margin-top",
              "padding",
              "background",
              "border",
              "border-radius"
            ],
            "__semi": true
          },
          "children": [
            {
              "type": "text",
              "text": "{{account}}",
              "style": {
                "margin": "0 0 12px",
                "font-size": "9px",
                "font-weight": "800",
                "letter-spacing": "{{letterSpacing}}",
                "color": "{{accent}}",
                "__order": [
                  "margin",
                  "font-size",
                  "font-weight",
                  "letter-spacing",
                  "color"
                ],
                "__semi": true
              },
              "if": [
                "account"
              ]
            },
            {
              "type": "grid",
              "style": {
                "display": "flex",
                "align-items": "center",
                "gap": "12px",
                "__order": [
                  "display",
                  "align-items",
                  "gap"
                ],
                "__semi": true
              },
              "children": [
                {
                  "type": "chip",
                  "style": {
                    "width": "44px",
                    "height": "44px",
                    "border-radius": "50%",
                    "background": "{{accent}}",
                    "color": "{{onAccent}}",
                    "font-size": "18px",
                    "font-weight": "700",
                    "display": "inline-flex",
                    "align-items": "center",
                    "justify-content": "center",
                    "flex-shrink": "0",
                    "overflow": "hidden",
                    "__order": [
                      "width",
                      "height",
                      "border-radius",
                      "background",
                      "color",
                      "font-size",
                      "font-weight",
                      "display",
                      "align-items",
                      "justify-content",
                      "flex-shrink",
                      "overflow"
                    ],
                    "__semi": true
                  },
                  "children": [
                    {
                      "type": "html",
                      "html": "<span leaf=\"\">{{initial}}</span>"
                    }
                  ]
                },
                {
                  "type": "box",
                  "style": {
                    "flex": "1",
                    "min-width": "0",
                    "__order": [
                      "flex",
                      "min-width"
                    ],
                    "__semi": true
                  },
                  "children": [
                    {
                      "type": "text",
                      "text": "{{author}}",
                      "style": {
                        "margin": "0",
                        "font-size": "16px",
                        "font-weight": "700",
                        "color": "{{textStrong}}",
                        "line-height": "1.35",
                        "letter-spacing": "{{letterSpacing}}",
                        "__order": [
                          "margin",
                          "font-size",
                          "font-weight",
                          "color",
                          "line-height",
                          "letter-spacing"
                        ],
                        "__semi": true
                      }
                    },
                    {
                      "type": "text",
                      "text": "{{roleline}}",
                      "style": {
                        "margin": "3px 0 0",
                        "font-size": "9px",
                        "font-weight": "700",
                        "color": "{{textMuted}}",
                        "letter-spacing": "{{letterSpacing}}",
                        "__order": [
                          "margin",
                          "font-size",
                          "font-weight",
                          "color",
                          "letter-spacing"
                        ],
                        "__semi": true
                      }
                    }
                  ]
                }
              ]
            },
            {
              "type": "text",
              "text": "{{bio}}",
              "style": {
                "margin": "14px 0 0",
                "font-size": "{{fontSize}}",
                "line-height": "{{lineHeight}}",
                "color": "{{textMain}}",
                "letter-spacing": "{{letterSpacing}}",
                "__order": [
                  "margin",
                  "font-size",
                  "line-height",
                  "color",
                  "letter-spacing"
                ],
                "__semi": true
              },
              "if": [
                "bio"
              ]
            },
            {
              "type": "text",
              "text": "{{footer}}",
              "style": {
                "margin": "10px 0 0",
                "font-size": "13px",
                "line-height": "1.8",
                "color": "{{textMuted}}",
                "letter-spacing": "{{letterSpacing}}",
                "__order": [
                  "margin",
                  "font-size",
                  "line-height",
                  "color",
                  "letter-spacing"
                ],
                "__semi": true
              },
              "if": [
                "footer"
              ]
            },
            {
              "type": "text",
              "text": "THANKS",
              "style": {
                "margin": "14px 0 0",
                "font-size": "9px",
                "font-weight": "700",
                "color": "{{accentTint2}}",
                "letter-spacing": "{{letterSpacing}}",
                "text-align": "right",
                "__order": [
                  "margin",
                  "font-size",
                  "font-weight",
                  "color",
                  "letter-spacing",
                  "text-align"
                ],
                "__semi": true
              }
            }
          ]
        }
      ]
    },
    "signature": {
      "tree": [
        {
          "type": "box",
          "style": {
            "margin": "0 4px 24px",
            "padding": "18px",
            "background": "{{accentSoft2}}",
            "border": "1px solid {{accentTint}}",
            "border-radius": "{{radius}}",
            "__order": [
              "margin",
              "padding",
              "background",
              "border",
              "border-radius"
            ],
            "__semi": true
          },
          "children": [
            {
              "type": "grid",
              "style": {
                "display": "flex",
                "align-items": "center",
                "gap": "12px",
                "__order": [
                  "display",
                  "align-items",
                  "gap"
                ],
                "__semi": true
              },
              "children": [
                {
                  "type": "chip",
                  "style": {
                    "width": "44px",
                    "height": "44px",
                    "border-radius": "50%",
                    "background": "{{accent}}",
                    "color": "{{onAccent}}",
                    "font-size": "18px",
                    "font-weight": "700",
                    "display": "inline-flex",
                    "align-items": "center",
                    "justify-content": "center",
                    "flex-shrink": "0",
                    "overflow": "hidden",
                    "__order": [
                      "width",
                      "height",
                      "border-radius",
                      "background",
                      "color",
                      "font-size",
                      "font-weight",
                      "display",
                      "align-items",
                      "justify-content",
                      "flex-shrink",
                      "overflow"
                    ],
                    "__semi": true
                  },
                  "children": [
                    {
                      "type": "html",
                      "html": "<span leaf=\"\">{{initial}}</span>"
                    }
                  ]
                },
                {
                  "type": "box",
                  "style": {
                    "flex": "1",
                    "min-width": "0",
                    "__order": [
                      "flex",
                      "min-width"
                    ],
                    "__semi": true
                  },
                  "children": [
                    {
                      "type": "text",
                      "text": "{{author}}",
                      "style": {
                        "margin": "0",
                        "font-size": "16px",
                        "font-weight": "700",
                        "color": "{{textStrong}}",
                        "line-height": "1.35",
                        "letter-spacing": "{{letterSpacing}}",
                        "__order": [
                          "margin",
                          "font-size",
                          "font-weight",
                          "color",
                          "line-height",
                          "letter-spacing"
                        ],
                        "__semi": true
                      }
                    },
                    {
                      "type": "text",
                      "text": "{{role}}",
                      "style": {
                        "margin": "3px 0 0",
                        "font-size": "9px",
                        "font-weight": "700",
                        "color": "{{textMuted}}",
                        "letter-spacing": "{{letterSpacing}}",
                        "__order": [
                          "margin",
                          "font-size",
                          "font-weight",
                          "color",
                          "letter-spacing"
                        ],
                        "__semi": true
                      }
                    }
                  ]
                }
              ]
            },
            {
              "type": "text",
              "text": "{{bio}}",
              "style": {
                "margin": "14px 0 0",
                "font-size": "{{fontSize}}",
                "line-height": "{{lineHeight}}",
                "color": "{{textMain}}",
                "letter-spacing": "{{letterSpacing}}",
                "__order": [
                  "margin",
                  "font-size",
                  "line-height",
                  "color",
                  "letter-spacing"
                ],
                "__semi": true
              },
              "if": [
                "bio"
              ]
            },
            {
              "type": "html",
              "html": "}"
            },
            {
              "type": "text",
              "text": "{{footer}}",
              "style": {
                "margin": "10px 0 0",
                "font-size": "13px",
                "line-height": "1.8",
                "color": "{{textMuted}}",
                "letter-spacing": "{{letterSpacing}}",
                "__order": [
                  "margin",
                  "font-size",
                  "line-height",
                  "color",
                  "letter-spacing"
                ],
                "__semi": true
              },
              "if": [
                "footer"
              ]
            },
            {
              "type": "text",
              "text": "THANKS",
              "style": {
                "margin": "14px 0 0",
                "font-size": "9px",
                "font-weight": "700",
                "color": "{{accentTint2}}",
                "letter-spacing": "{{letterSpacing}}",
                "text-align": "right",
                "__order": [
                  "margin",
                  "font-size",
                  "font-weight",
                  "color",
                  "letter-spacing",
                  "text-align"
                ],
                "__semi": true
              }
            }
          ]
        }
      ]
    },
    "divider": {
      "tree": [
        {
          "type": "grid",
          "style": {
            "margin": "24px 60px",
            "display": "flex",
            "align-items": "center",
            "gap": "10px",
            "__order": [
              "margin",
              "display",
              "align-items",
              "gap"
            ],
            "__semi": true
          },
          "children": [
            {
              "type": "chip",
              "style": {
                "height": "1px",
                "background": "{{accentTint}}",
                "flex": "1",
                "display": "inline-block",
                "overflow": "hidden",
                "font-size": "0",
                "line-height": "0",
                "__order": [
                  "height",
                  "background",
                  "flex",
                  "display",
                  "overflow",
                  "font-size",
                  "line-height"
                ],
                "__semi": true
              },
              "children": [
                {
                  "type": "html",
                  "html": "<span leaf=\"\"> </span>"
                }
              ]
            },
            {
              "type": "chip",
              "style": {
                "width": "5px",
                "height": "5px",
                "border-radius": "50%",
                "background": "{{accentTint2}}",
                "display": "inline-block",
                "flex-shrink": "0",
                "overflow": "hidden",
                "font-size": "0",
                "line-height": "0",
                "__order": [
                  "width",
                  "height",
                  "border-radius",
                  "background",
                  "display",
                  "flex-shrink",
                  "overflow",
                  "font-size",
                  "line-height"
                ],
                "__semi": true
              },
              "children": [
                {
                  "type": "html",
                  "html": "<span leaf=\"\"> </span>"
                }
              ]
            },
            {
              "type": "chip",
              "style": {
                "height": "1px",
                "background": "{{accentTint}}",
                "flex": "1",
                "display": "inline-block",
                "overflow": "hidden",
                "font-size": "0",
                "line-height": "0",
                "__order": [
                  "height",
                  "background",
                  "flex",
                  "display",
                  "overflow",
                  "font-size",
                  "line-height"
                ],
                "__semi": true
              },
              "children": [
                {
                  "type": "html",
                  "html": "<span leaf=\"\"> </span>"
                }
              ]
            }
          ]
        }
      ]
    },
    "endline": {
      "tree": [
        {
          "type": "grid",
          "style": {
            "margin": "26px 4px 22px",
            "display": "flex",
            "align-items": "center",
            "gap": "12px",
            "__order": [
              "margin",
              "display",
              "align-items",
              "gap"
            ],
            "__semi": true
          },
          "children": [
            {
              "type": "chip",
              "style": {
                "height": "1px",
                "background": "linear-gradient(90deg,rgba({{accentRgb}},0),{{accentLine}})",
                "flex": "1",
                "display": "inline-block",
                "overflow": "hidden",
                "font-size": "0",
                "line-height": "0",
                "__order": [
                  "height",
                  "background",
                  "flex",
                  "display",
                  "overflow",
                  "font-size",
                  "line-height"
                ],
                "__semi": true
              },
              "children": [
                {
                  "type": "html",
                  "html": "<span leaf=\"\"> </span>"
                }
              ]
            },
            {
              "type": "chip",
              "style": {
                "font-size": "9px",
                "font-weight": "800",
                "letter-spacing": "{{letterSpacing}}",
                "color": "{{accent}}",
                "__order": [
                  "font-size",
                  "font-weight",
                  "letter-spacing",
                  "color"
                ],
                "__semi": true
              },
              "children": [
                {
                  "type": "html",
                  "html": "<span leaf=\"\">END</span>"
                }
              ]
            },
            {
              "type": "chip",
              "style": {
                "height": "1px",
                "background": "linear-gradient(90deg,{{accentLine}},rgba({{accentRgb}},0))",
                "flex": "1",
                "display": "inline-block",
                "overflow": "hidden",
                "font-size": "0",
                "line-height": "0",
                "__order": [
                  "height",
                  "background",
                  "flex",
                  "display",
                  "overflow",
                  "font-size",
                  "line-height"
                ],
                "__semi": true
              },
              "children": [
                {
                  "type": "html",
                  "html": "<span leaf=\"\"> </span>"
                }
              ]
            }
          ]
        }
      ]
    }
  }
};
})(window);
