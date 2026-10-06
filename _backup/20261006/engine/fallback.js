/* gzh-studio · 内置降级模板
 *
 * docs/06 §5.2 的二级降级实现。主题没写的组件，由这里兜底。
 *
 * 设计原则：**降级后必须仍能出成品，绝不报错、绝不留白**。
 * 宁可朴素，也不能崩。
 *
 * 注意：compare 的降级是「两张独立卡片」而不是「拆掉 flex」。
 * 历史上为了消除告警把 display:flex 全改成 inline-block，结果十几处排版崩掉。
 * 这里的教训固化成规则：可以牺牲布局效果，但不动布局原语。
 */
(function (global) {
  'use strict';

  var GZH = global.GZH = global.GZH || {};

  GZH.FALLBACK = {
    para: {
      tpl: '<section style="margin-top:{{paraGap}};font-family:{{fontFamily}};"><p style="margin:0;font-size:{{fontSize}};line-height:{{lineHeight}};text-align:{{align}};color:{{textMain}};letter-spacing:{{letterSpacing}};"><span leaf="">{{text}}</span></p></section>'
    },

    chapter: {
      tpl: '<section style="margin-top:{{chapterGap}};font-family:{{fontFamily}};"><p style="margin:0;font-size:20px;font-weight:600;color:{{accent}};line-height:1.4;letter-spacing:{{letterSpacing}};"><span leaf="">{{index}} {{title}}</span></p>{{?subtitle}}<p style="margin:4px 0 0;font-size:10px;color:{{textMuted}};letter-spacing:{{letterSpacing}};"><span leaf="">{{subtitle}}</span></p>{{/subtitle}}</section>'
    },

    masthead: {
      tpl: '<section style="margin-top:{{cardGap}};font-family:{{fontFamily}};"><p style="margin:0;font-size:24px;font-weight:700;color:{{textStrong}};line-height:1.4;letter-spacing:{{letterSpacing}};"><span leaf="">{{title}}</span></p>{{?lede}}<p style="margin:12px 0 0;font-size:{{fontSize}};line-height:1.8;color:{{textMuted}};letter-spacing:{{letterSpacing}};"><span leaf="">{{lede}}</span></p>{{/lede}}</section>'
    },

    highlights: {
      tpl: '<section style="margin-top:{{cardGap}};font-family:{{fontFamily}};">{{?label}}<p style="margin:0 0 10px;font-size:9px;font-weight:800;letter-spacing:{{letterSpacing}};color:{{accent}};"><span leaf="">{{label}}</span></p>{{/label}}{{content}}</section>',
      item: '<section style="display:flex;gap:8px;{{itemGap}}"><p style="margin:0;font-size:12px;font-weight:700;color:{{accent}};flex-shrink:0;letter-spacing:{{letterSpacing}};"><span leaf="">{{no}}</span></p><p style="margin:0;font-size:14px;line-height:1.7;color:{{textMain}};letter-spacing:{{letterSpacing}};"><span leaf="">{{text}}</span></p></section>'
    },

    quote: {
      tpl: '<section style="margin-top:{{cardGap}};border-left:3px solid {{accentTint}};padding:2px 0 2px 14px;">{{?label}}<p style="margin:0 0 6px;font-size:9px;font-weight:800;letter-spacing:{{letterSpacing}};color:{{accent}};"><span leaf="">{{label}}</span></p>{{/label}}<p style="margin:0;font-size:{{fontSize}};line-height:{{lineHeight}};text-align:{{align}};color:{{textMain}};letter-spacing:{{letterSpacing}};"><span leaf="">{{text}}</span></p></section>'
    },

    note: {
      tpl: '<section style="margin-top:{{cardGap}};border-left:3px solid {{accent}};padding:2px 0 2px 14px;">{{?label}}<p style="margin:0 0 6px;font-size:9px;font-weight:800;letter-spacing:{{letterSpacing}};color:{{accent}};"><span leaf="">{{label}}</span></p>{{/label}}<p style="margin:0;font-size:{{fontSize}};line-height:{{lineHeight}};text-align:{{align}};color:{{textMain}};letter-spacing:{{letterSpacing}};"><span leaf="">{{text}}</span></p></section>'
    },

    compare: {
      tpl: '<section style="margin-top:{{cardGap}};font-family:{{fontFamily}};">{{content}}</section>',
      item: '<section style="margin-top:{{cardGap}};background:{{cardBg}};border:1px solid {{accentTint}};border-radius:{{radius}};padding:12px 14px;"><p style="margin:0 0 6px;font-size:14px;font-weight:600;color:{{textStrong}};letter-spacing:{{letterSpacing}};"><span leaf="">{{title}}</span></p>{{items}}</section>',
      subitem: '<p style="margin:0;font-size:13px;line-height:1.75;color:{{textMain}};letter-spacing:{{letterSpacing}};"><span leaf="">• {{text}}</span></p>'
    },

    cta: {
      tpl: '<section style="margin-top:{{cardGap}};text-align:center;">{{?title}}<p style="margin:0 0 6px;font-size:{{fontSize}};font-weight:600;color:{{textStrong}};line-height:1.7;letter-spacing:{{letterSpacing}};text-align:center;"><span leaf="">{{title}}</span></p>{{/title}}{{?text}}<p style="margin:0;font-size:14px;line-height:1.8;color:{{textMain}};letter-spacing:{{letterSpacing}};text-align:center;"><span leaf="">{{text}}</span></p>{{/text}}{{?action}}<p style="margin:10px 0 0;font-size:13px;color:{{accent}};letter-spacing:{{letterSpacing}};text-align:center;"><span leaf="">{{action}}</span></p>{{/action}}</section>'
    },

    image: {
      tpl: '<section style="margin-top:{{cardGap}};"><span style="display:block;"><img src="{{src}}"{{?w}} data-w="{{w}}"{{/w}}{{?ratio}} data-ratio="{{ratio}}"{{/ratio}} style="width:100%;display:block;margin:0 auto;border-radius:8px;" /></span>{{?caption}}<p style="margin:8px 2px 0;font-size:12px;color:{{textMuted}};line-height:1.6;letter-spacing:{{letterSpacing}};text-align:center;"><span leaf="">{{caption}}</span></p>{{/caption}}</section>'
    },

    video: {
      tpl: '<section style="margin-top:{{cardGap}};background:{{accentSoft}};border:1px dashed {{accentTint2}};border-radius:{{radius}};padding:20px 16px;text-align:center;"><p style="margin:0 0 4px;font-size:13px;color:{{accent}};letter-spacing:{{letterSpacing}};text-align:center;"><span leaf="">待补视频</span></p><p style="margin:0;font-size:12px;color:{{textMuted}};letter-spacing:{{letterSpacing}};text-align:center;"><span leaf="">{{src}}</span></p></section>'
    },

    list: {
      tpl: '<section style="margin-top:{{cardGap}};font-family:{{fontFamily}};">{{content}}</section>',
      item: '<p style="margin:0;font-size:{{fontSize}};line-height:{{lineHeight}};color:{{textMain}};letter-spacing:{{letterSpacing}};"><span leaf="">· {{text}}</span></p>'
    },

    signature: {
      tpl: '<section style="margin:{{cardGap}} 4px 24px;"><p style="margin:0;font-size:14px;color:{{textMuted}};letter-spacing:{{letterSpacing}};text-align:right;"><span leaf="">— {{author}}</span></p></section>'
    },

    endline: {
      tpl: '<section style="margin:26px 4px 22px;"><p style="margin:0;font-size:12px;color:{{textMuted}};letter-spacing:{{letterSpacing}};text-align:center;"><span leaf;">· · ·</span></p></section>'
    }
  };

})(window);
