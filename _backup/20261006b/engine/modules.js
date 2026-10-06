/* gzh-studio · 模块注册表 —— 【新增模块的唯一入口】
 *
 * 本文件是整个项目加组件的唯一改动点。以前加一个模块要动 9 个文件 33 处
 * （ir.js / render.js / fallback.js / 主题 JSON / index.html / docs 04·06·07·08），
 * 根因是「同一个模块的信息被拆散放在 4 个地方」。现在全部收拢到这里的每一条：
 *
 *   ┌ role ─────────────────────────────────────────────────────┐
 *   │ ui        左栏怎么显示（名字 / 分组 / 插入片段）           │
 *   │ grammar   Markdown 怎么识别、字段怎么提取（容器型才有）    │
 *   │ fallback  主题没写这个组件时的兜底模板                     │
 *   └───────────────────────────────────────────────────────────┘
 *
 * 下游全部自动：
 *   ir.js        → 按 grammar 查表，不再写 if (b.name === 'xxx')
 *   render.js    → 按 comp.source 取子项，不再写 if (role === 'xxx')
 *   GZH.FALLBACK → 由本表自动生成
 *   index.html   → 左栏遍历本表自动生成
 *
 * ⚠️ 新增一个模块只需在这里加一条，改完不用跑任何编译脚本。
 * ⚠️ 条目按「篇首 → 篇尾」书写，这个顺序就是左栏的显示顺序。
 */
(function (global) {
  'use strict';

  var GZH = global.GZH = global.GZH || {};

  /* ============================================================
   * 字段提取器（容器型模块的共用语）
   *
   * 签名统一：(astNode, helpers) => value
   * 加新容器时从这里挑现成的组合，实在不够用才在这里加一个通用提取器。
   * ============================================================ */
  var EXTRACTORS = {
    // :::xxx 后面那一行当小标签
    label: function (b) { return b.label || ''; },

    // body 内所有文本 / 列表项合并成一段
    join: function (b, helpers) { return helpers.innerToText(b.body); },

    // body 内每一项各占一行（看点卡用）
    lines: function (b, helpers) { return helpers.collectLines(b.body); },

    // 按 ## 标题 | 徽标 分栏（对照卡用）
    cols: function (b, helpers) { return helpers.collectCols(b.body); },

    // 最后一行若是链接，抽出来当按钮标题
    //
    // ⚠️ 这个提取器有副作用：它会把链接从最后一行里删掉，
    // 所以 grammar.map 里必须排在 join 前面，否则正文会残留链接原文。
    link: function (b, helpers) { return helpers.extractLastLink(b.body); }
  };

  /* ============================================================
   * 模块定义（按篇首 → 篇尾排列，左栏顺序由此决定）
   * ============================================================ */
  var MODULES = {

    /* ---------- 刊头 ---------- */

    masthead: {
      ui: { label: '刊头卡', group: '文章开头', fm: 'masthead', top: true,
        snippet: 'title: 文章标题\nkicker: 本期实测\nissue: 2026.10\nlede: 一句话导语，提炼全文最重要的那个结论。\ncover: \n',
        hint: 'title / lede / cover\ncover 留空 → 自动占位图' },
      fallback: {
        tpl: '<section style="margin-top:{{cardGap}};font-family:{{fontFamily}};"><p style="margin:0;font-size:24px;font-weight:700;color:{{textStrong}};line-height:1.4;letter-spacing:{{letterSpacing}};"><span leaf="">{{title}}</span></p>{{?lede}}<p style="margin:12px 0 0;font-size:{{fontSize}};line-height:1.8;color:{{textMuted}};letter-spacing:{{letterSpacing}};"><span leaf="">{{lede}}</span></p>{{/lede}}</section>'
      }
    },

    /* ---------- 容器型（:::xxx ... :::） ---------- */

    highlights: {
      ui: { label: '看点卡', group: '文章开头',
        snippet: ':::highlights 本文看点\n- 第一条看点\n- 第二条看点\n- 第三条看点\n:::\n',
        hint: ':::highlights\n章节 ≥3 时才放' },
      grammar: {
        kind: 'container', static: {},
        map: { label: 'label', items: 'lines' },
        defaults: { label: '本文看点 · HIGHLIGHTS' }
      },
      fallback: {
        tpl: '<section style="margin-top:{{cardGap}};font-family:{{fontFamily}};">{{?label}}<p style="margin:0 0 10px;font-size:9px;font-weight:800;letter-spacing:{{letterSpacing}};color:{{accent}};"><span leaf="">{{label}}</span></p>{{/label}}{{content}}</section>',
        item: '<section style="display:flex;gap:8px;{{itemGap}}"><p style="margin:0;font-size:12px;font-weight:700;color:{{accent}};flex-shrink:0;letter-spacing:{{letterSpacing}};"><span leaf="">{{no}}</span></p><p style="margin:0;font-size:14px;line-height:1.7;color:{{textMain}};letter-spacing:{{letterSpacing}};"><span leaf="">{{text}}</span></p></section>'
      }
    },

    /* ---------- 正文骨架 ---------- */

    chapter: {
      ui: { label: '章节标题', group: '正文',
        snippet: '## 章节标题 @THE CHALLENGE\n',
        hint: '## 标题 @ENGLISH' },
      fallback: {
        tpl: '<section style="margin-top:{{chapterGap}};font-family:{{fontFamily}};"><p style="margin:0;font-size:20px;font-weight:600;color:{{accent}};line-height:1.4;letter-spacing:{{letterSpacing}};"><span leaf="">{{index}} {{title}}</span></p>{{?subtitle}}<p style="margin:4px 0 0;font-size:10px;color:{{textMuted}};letter-spacing:{{letterSpacing}};"><span leaf="">{{subtitle}}</span></p>{{/subtitle}}</section>'
      }
    },

    para: {
      ui: { label: '正文段落', group: '正文',
        snippet: '这里写正文。**加粗**会变深色强调，`行内代码`会变浅底标签。\n',
        hint: '直接写' },
      fallback: {
        tpl: '<section style="margin-top:{{paraGap}};font-family:{{fontFamily}};"><p style="margin:0;font-size:{{fontSize}};line-height:{{lineHeight}};text-align:{{align}};color:{{textMain}};letter-spacing:{{letterSpacing}};"><span leaf="">{{text}}</span></p></section>'
      }
    },

    list: {
      // 同一个 role 可以有多个 UI 入口（无序 / 有序），渲染靠 block.ordered 区分
      ui: [
        { label: '无序列表', group: '正文', snippet: '- 第一条\n- 第二条\n', hint: '- 项目  小方点' },
        { label: '有序列表', group: '正文', snippet: '1. 第一步\n2. 第二步\n', hint: '1. 2. 显示序号标签' }
      ],
      fallback: {
        tpl: '<section style="margin-top:{{cardGap}};font-family:{{fontFamily}};">{{content}}</section>',
        item: '<p style="margin:0;font-size:{{fontSize}};line-height:{{lineHeight}};color:{{textMain}};letter-spacing:{{letterSpacing}};"><span leaf="">· {{text}}</span></p>'
      }
    },

    quote: {
      ui: { label: '引述卡', group: '正文',
        snippet: '> 这里放原文照抄的内容。\n',
        hint: '> 引文' },
      grammar: { kind: 'container', static: {}, map: { label: 'label', text: 'join' } },
      fallback: {
        tpl: '<section style="margin-top:{{cardGap}};border-left:3px solid {{accentTint}};padding:2px 0 2px 14px;">{{?label}}<p style="margin:0 0 6px;font-size:9px;font-weight:800;letter-spacing:{{letterSpacing}};color:{{accent}};"><span leaf="">{{label}}</span></p>{{/label}}<p style="margin:0;font-size:{{fontSize}};line-height:{{lineHeight}};text-align:{{align}};color:{{textMain}};letter-spacing:{{letterSpacing}};"><span leaf="">{{text}}</span></p></section>'
      }
    },

    note: {
      ui: { label: '结论卡', group: '正文',
        snippet: ':::note 结论 · VERDICT\n这里写你自己的判断。\n:::\n',
        hint: ':::note 标题' },
      grammar: { kind: 'container', static: { title: '' }, map: { label: 'label', text: 'join' } },
      fallback: {
        tpl: '<section style="margin-top:{{cardGap}};border-left:3px solid {{accent}};padding:2px 0 2px 14px;">{{?label}}<p style="margin:0 0 6px;font-size:9px;font-weight:800;letter-spacing:{{letterSpacing}};color:{{accent}};"><span leaf="">{{label}}</span></p>{{/label}}<p style="margin:0;font-size:{{fontSize}};line-height:{{lineHeight}};text-align:{{align}};color:{{textMain}};letter-spacing:{{letterSpacing}};"><span leaf="">{{text}}</span></p></section>'
      }
    },

    compare: {
      ui: { label: '对照卡', group: '正文',
        snippet: ':::compare\n## 方案甲 | 推荐\n- 第一条理由\n## 方案乙 | 不推荐\n- 第一个问题\n:::\n',
        hint: ':::compare' },
      grammar: { kind: 'container', static: {}, map: { columns: 'cols' } },
      // source 告诉渲染器：子项来自 block.columns 而不是 block.items
      fallback: {
        source: 'columns',
        tpl: '<section style="margin-top:{{cardGap}};font-family:{{fontFamily}};">{{content}}</section>',
        item: '<section style="margin-top:{{cardGap}};background:{{cardBg}};border:1px solid {{accentTint}};border-radius:{{radius}};padding:12px 14px;"><p style="margin:0 0 6px;font-size:14px;font-weight:600;color:{{textStrong}};letter-spacing:{{letterSpacing}};"><span leaf="">{{title}}</span></p>{{items}}</section>',
        subitem: '<p style="margin:0;font-size:13px;line-height:1.75;color:{{textMain}};letter-spacing:{{letterSpacing}};"><span leaf="">• {{text}}</span></p>'
      }
    },

    /* ---------- 媒体 ---------- */

    image: {
      ui: { label: '图片', group: '正文',
        snippet: '![]()\n',
        hint: '![]() 留空 = 占位图' },
      fallback: {
        tpl: '<section style="margin-top:{{cardGap}};"><span style="display:block;"><img src="{{src}}"{{?w}} data-w="{{w}}"{{/w}}{{?ratio}} data-ratio="{{ratio}}"{{/ratio}} style="width:100%;display:block;margin:0 auto;border-radius:8px;" /></span>{{?caption}}<p style="margin:8px 2px 0;font-size:12px;color:{{textMuted}};line-height:1.6;letter-spacing:{{letterSpacing}};text-align:center;"><span leaf="">{{caption}}</span></p>{{/caption}}</section>'
      }
    },

    video: {
      ui: { label: '视频占位', group: '正文',
        snippet: '[demo.mp4]\n',
        hint: '[文件名.mp4]' },
      fallback: {
        tpl: '<section style="margin-top:{{cardGap}};background:{{accentSoft}};border:1px dashed {{accentTint2}};border-radius:{{radius}};padding:20px 16px;text-align:center;"><p style="margin:0 0 4px;font-size:13px;color:{{accent}};letter-spacing:{{letterSpacing}};text-align:center;"><span leaf="">待补视频</span></p><p style="margin:0;font-size:12px;color:{{textMuted}};letter-spacing:{{letterSpacing}};text-align:center;"><span leaf="">{{src}}</span></p></section>'
      }
    },

    /* ---------- 收尾 ---------- */

    endline: {
      ui: [
        { label: '分隔线', group: '正文', snippet: '---\n', hint: '---' },
        { label: 'END 收尾线', group: '文章结尾', once: true, snippet: '---\n', hint: '文末 ---  署名区自动生成' }
      ],
      fallback: {
        tpl: '<section style="margin:26px 4px 22px;"><p style="margin:0;font-size:12px;color:{{textMuted}};letter-spacing:{{letterSpacing}};text-align:center;"><span leaf="">· · ·</span></p></section>'
      }
    },

    cta: {
      ui: { label: '行动引导', group: '文章结尾', once: true,
        snippet: ':::cta 想试试的话\n按这个顺序走一遍就够了。\n[点这里开始](https://example.com)\n:::\n',
        hint: ':::cta 引导语' },
      // link 必须排在 join 前：它会把链接从末行删掉
      grammar: { kind: 'container', static: {}, map: { action: 'link', title: 'label', text: 'join' } },
      fallback: {
        tpl: '<section style="margin-top:{{cardGap}};text-align:center;">{{?title}}<p style="margin:0 0 6px;font-size:{{fontSize}};font-weight:600;color:{{textStrong}};line-height:1.7;letter-spacing:{{letterSpacing}};text-align:center;"><span leaf="">{{title}}</span></p>{{/title}}{{?text}}<p style="margin:0;font-size:14px;line-height:1.8;color:{{textMain}};letter-spacing:{{letterSpacing}};text-align:center;"><span leaf="">{{text}}</span></p>{{/text}}{{?action}}<p style="margin:10px 0 0;font-size:13px;color:{{accent}};letter-spacing:{{letterSpacing}};text-align:center;"><span leaf="">{{action}}</span></p>{{/action}}</section>'
      }
    },

    signature: {
      // 由 front-matter 的 author 自动追加，不出现在左栏
      fallback: {
        tpl: '<section style="margin:{{cardGap}} 4px 24px;"><p style="margin:0;font-size:14px;color:{{textMuted}};letter-spacing:{{letterSpacing}};text-align:right;"><span leaf="">— {{author}}</span></p></section>'
      }
    }
  };

  /* ============================================================
   * front-matter 预设
   *
   * 不是 role，是「一组要写进文件头的字段」。同理加一组只改这里。
   * ============================================================ */
  var FM_PRESETS = {
    profile: {
      ui: { label: '作者与公众号', group: '基础信息', once: true, top: true, fm: 'profile',
        snippet: 'account: 你的公众号名\nauthor: 你的名字\nroleline: CREATOR · AI PRACTITIONER\n'
          + 'bio: 一两句话说清你是谁、在写什么。\n'
          + 'footer: 如果觉得有收获，欢迎点赞、在看、转发三连。\n',
        hint: 'account / author / bio\n一次填好，篇篇复用' }
    }
  };

  /* ============================================================
   * 由注册表派生出下游需要的结构（不要再手写第二份）
   * ============================================================ */

  // 降级模板表：老文件 fallback.js 的继任者
  var FALLBACK = {};
  Object.keys(MODULES).forEach(function (role) {
    if (MODULES[role].fallback) FALLBACK[role] = MODULES[role].fallback;
  });

  GZH.MODULES = MODULES;
  GZH.FM_PRESETS = FM_PRESETS;
  GZH.FALLBACK = FALLBACK;
  GZH.EXTRACTORS = EXTRACTORS;

  // 容器的 (markdown 名 → grammar)，供 ir.js 判断哪些 ::: 是已知容器
  GZH.containerAliases = function () {
    var m = {};
    Object.keys(MODULES).forEach(function (role) {
      var g = MODULES[role].grammar;
      if (g && g.kind === 'container') m[role] = g;
    });
    return m;
  };

})(window);
