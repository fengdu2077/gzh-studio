# 公众号排版组件库 —— 科技刊读风

> **使用说明**：本组件库为「科技刊读风」主题，所有组件使用**内联样式**，可直接复制粘贴到微信公众号编辑器。
>
> **设计风格**：科学蓝 `#2563eb` 单色点睛 + 大留白 + 圆润柔光。素描式极简：整篇不用任何色块重装饰，**唯一的强调手段是"深黑加粗"**，蓝色只出现在序号、英文小标签、边框和阴影里。适配 AI 实操、工具测评、案例复盘、深度教程类长文。
>
> **参考来源**：对公众号原文 DOM 实测逆向（`https://mp.weixin.qq.com/s/TPzww8h6m_oOn_V5jhmdIA`）——全文 **181 个 `<section>`、0 个 `<div>`、0 个 `<strong>`**，仅 6 类模块循环复用。数值（字号/行高/间距/色值）来自原文真实 inline style，非估算。
>
> **公众号平台限制须知**：
>
> - ❌ 不支持 `<style>`/`<script>`、CSS class/id、`position:fixed/absolute`、`float`、`@media`/`@keyframes`、`display:grid`
> - ✅ 支持内联 `style`、`display:flex`（有限）、`linear-gradient`、`border-radius`、`box-shadow`、`<section>/<p>/<span>/<strong>/<img>` 等基础标签
>
> **WeChat 兼容铁律**（本主题组件全部已按此写好，改动时必须遵守）：
>
> - **只用 `<section>` 做布局，绝对不用 `<div>`**——本风格的结构性特征，`<div>` 会被编辑器重排破坏
> - 所有"装饰性空元素"（渐变分割线、圆点、间距条）**必须在内部放 `<span leaf=""><br></span>` 占位**，否则微信会剥掉样式
> - **`<p>` 一律 `margin:0`，段落间距由外层 `<section>` 的 `margin-top` 承担**（这是本风格间距稳定的关键）
> - 不要把 `font-size`/`border-bottom` 打在 `<strong>` 上；高亮样式统一挂在外层 `<span>` 上
> - 结构化区域（图片说明、作者卡第二作者行）没有内容时**整块删掉**，不留空 section

---

## 设计变量速查表

```
主色（唯一强调色）：   #2563eb  科学蓝 —— 仅用于序号/英文标签/边框/阴影
主色浅：              #3b82f6  章节英文标签
主色超浅：            #93c5fd  渐变分割线端点
主色描边：            #dbeafe  所有卡片边框（统一 1px）
主色柔和阴影：        rgba(37,99,235,0.06)   卡片投影，整篇唯一阴影值
淡蓝渐变：            linear-gradient(135deg,#eff6ff,#ffffff)  卡片内渐变底
淡蓝渐变（署名卡）：   linear-gradient(135deg,#f0f7ff,#ffffff)
强调色（正文唯一）：   #111827（rgb(17,24,39)） + font-weight:600
正文字色：            #374151  深灰（不要用纯黑）
副标签色：            #9ca3af  中灰（英文小字、期号）
字    号：            15px（不可改）
行    高：            1.95（本风格最大特色，比常规 1.75 明显松）
两端对齐：            text-align:justify
字间距：              0（显式写 0，防止编辑器继承异常）
段 间 距：            20px（外层 section margin-top）
章节间距：            60px（章节标题外层 margin-top，段落的 3 倍）
图片外间距：          24px
容器宽度：            677px，padding:8px 16px
圆    角：            12px（卡片）/ 8px（图片内）/ 50%（圆点·头像）
```

字体栈：`'IBM Plex Sans',-apple-system,system-ui,'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif`

> **帽子参数（Knobs）—— 想微调只改这 6 个数，全局气质即变**：
>
> | 参数    | 默认   | 调大效果       | 调小效果     |
> | ----- | ---- | ---------- | -------- |
> | 正文行高  | 1.95 | 更透气、更强阅读呼吸 | 更紧凑、更快节奏 |
> | 段落间距  | 20px | 段落块更独立     | 更连贯密集    |
> | 章节间距  | 60px | 章节切换感更强    | 章节更连续    |
> | 圆角    | 12px | 更亲和、App 感  | 更硬朗、印刷感  |
> | 阴影透明度 | 0.06 | 更立体        | 更扁平干净    |
> | 图片内边距 | 6px  | 图片更多留边框留白  | 图片更满幅    |

---

## 组件 1 全局容器

```html
<section style="width:677px;margin:0 auto;padding:8px 16px;box-sizing:border-box;background:#ffffff;color:#374151;font-family:'IBM Plex Sans',-apple-system,system-ui,'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif;line-height:1.75;">

  

</section>
```

---

## 组件 2 刊头卡（专栏名 + 期号 + 封面图 + 导语）

> **文案策略（先读，比代码重要）**：
>
> - 上半部是「刊名行」：圆点 + 专栏名 + 渐变短线 + 期号；不是每张文章都必须，**有固定专栏才用**，一次性文章从 2b 起
> - **封面图规格（原文实测）**：`<figure style="margin:0;line-height:0;">` 包一层，内嵌 `<span leaf="">` 再放 `<img>`；图片 `data-ratio="0.426"`、`data-w="1080"` → **1080×460，约 2.35:1 的横幅**。`img` 样式固定 `max-width:100%;height:auto;display:block;margin:0 auto;`
> - **⚠️ `figure` 绝对不要加 `padding`**：图片必须**顶格铺满卡片宽度**（已发布文章实测 `_width="677px"`，即按容器满宽渲染，左右无留白）。若给 `figure` 或其外层套 `padding:44px 16px` 之类的内边距，图会被挤窄、四周出现白边——这是生成占位块时最容易犯的错。
> - **务必带 `data-w` 与 `data-ratio`**：检测引擎在图片加载超时时按 `data-w` 兜底取宽度，缺了可能误报宽度类问题。
> - 封面图**位置**：刊名行 → 封面图 → 导语（导语的 `border-top:1px solid #dbeafe` 就是封面与导语的分界）
> - 封面图没有真实 URL 时**整行 `<span>` 连同 `<img>` 一起删掉**，不要留占位符
> - **⚠️ 如果要给用户留「待替换」的封面位，绝对不能用 `src="__IMG_SRC__"` 这类假地址或本地路径** —— 微信读不到，编辑器会显示「图片载入失败 + 来源链接 http://127..._SRC__」，用户既无法点击替换、强行替换又会破坏外层结构。**正确做法：生成一张真实的占位图（1080×460，图上写明「封面图占位 · 请替换本图」），以 `base64` 内联进 `src`**。这样微信能正常渲染，用户点图选「替换」即可，版式不会坏。占位图生成脚本见工作目录 `_make_placeholder_cover.py`、内联脚本 `_embed_cover.py`。
> - 下半部导语：先一行 9px 英文/中文小标签（如 `EDITOR'S NOTE · 本期实测`），再一句 15px 深黑的话——**这句话是全文钩子，不要用外标题的原句复述**
> - 卡内导语**不加粗**，只靠 `#111827` 深色拉开与正文的层次
> - **英文标签用弯撇号**：写 `EDITOR’S NOTE`（U+2019），不要写直撇号 `EDITOR'S`——校验脚本会把直撇号判为半角标点 WARNING。此为「英文专名内保持原样」例外，不算违规

```html
<section style="background:#ffffff;border:1px solid #dbeafe;border-radius:12px;box-shadow:0 4px 14px rgba(37,99,235,0.06);">
  <section style="padding:13px 16px 12px;display:flex;align-items:center;">
    <span style="width:7px;height:7px;background:#2563eb;border-radius:50%;display:inline-block;flex-shrink:0;font-size:0;line-height:0;"><span leaf=""><br></span></span>
    <span style="font-size:9px;letter-spacing:0;color:#2563eb;margin-left:6px;"><span leaf="">{{专栏名 · 副刊名}}</span></span>
    <span style="flex:1;height:1px;background:linear-gradient(90deg,#bfdbfe,rgba(191,219,254,0));margin-left:8px;display:inline-block;overflow:hidden;font-size:0;line-height:0;"><span leaf=""><br></span></span>
    <span style="font-size:9px;letter-spacing:0;color:#9ca3af;margin-left:8px;"><span leaf="">{{2026.09}}</span></span>
  </section>
  <span style="display:block;"><img src="{{封面图URL}}" style="width:100%;display:block;margin:0 auto;" /></span>
  <section style="padding:15px 17px 17px;background:linear-gradient(135deg,#eff6ff,#ffffff);border-top:1px solid #dbeafe;">
    <section style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
      <p style="margin:0;font-size:9px;letter-spacing:0;color:#2563eb;"><span leaf="">{{EDITOR'S NOTE · 本期实测}}</span></p>
    </section>
    <p style="margin:0 0 7px;font-size:15px;line-height:1.7;color:#111827;"><span leaf="">{{导语金句}}</span></p>
  </section>
</section>
```

### 2b 无封面图 / 无专栏时的轻量版导语（直接用这个更常见）

```html
<section style="background:linear-gradient(135deg,#eff6ff,#ffffff);border:1px solid #dbeafe;border-radius:12px;padding:15px 17px 17px;box-shadow:0 4px 14px rgba(37,99,235,0.06);">
  <p style="margin:0 0 8px;font-size:9px;letter-spacing:0;color:#2563eb;"><span leaf="">{{EDITOR'S NOTE · 本期实测}}</span></p>
  <p style="margin:0;font-size:15px;line-height:1.7;color:#111827;"><span leaf="">{{导语金句}}</span></p>
</section>
```

---

## 组件 3 章节标题（双栏：大号序号 + 中文标题 / 英文标签）

> **本风格最强识别符号**，必须严格对齐：
>
> - 外层 `margin-top:60px`（首章也是 60px）；`display:flex;align-items:center;gap:16px`
> - 左栏：`flex-shrink:0`，两行——`01`（34px/800/#2563eb）在上，`PART`（8px/700/#9ca3af）在下
> - 右栏：`flex:1;min-width:0`，两行——中文标题（22px/#2563eb/行高 1.35）在上，英文标签（10px/#3b82f6）在下
> - 英文标签必须是**标题的英文译名**（实测→TEST、教程→TUTORIAL、总结→SUMMARY、思考→REFLECTION、引言→DATA COLLECTION）
> - 标题**不加粗**（weight 不写），靠 22px 字号和主色自立

```html
<section style="margin-top:60px;font-family:'IBM Plex Sans',-apple-system,system-ui,'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif;">
  <section style="display:flex;align-items:center;gap:16px;">
    <section style="text-align:center;flex-shrink:0;">
      <p style="margin:0;font-size:34px;font-weight:800;color:#2563eb;line-height:1;letter-spacing:0;"><span leaf="">01</span></p>
      <p style="margin:3px 0 0;font-size:8px;font-weight:700;color:#9ca3af;letter-spacing:0;"><span leaf="">PART</span></p>
    </section>
    <section style="flex:1;min-width:0;">
      <p style="margin:0 0 3px;font-size:22px;color:#2563eb;line-height:1.35;letter-spacing:0;"><span leaf="">{{章节标题}}</span></p>
      <p style="margin:0;font-size:10px;color:#3b82f6;letter-spacing:0;"><span leaf="">{{CHAPTER ENGLISH}}</span></p>
    </section>
  </section>
</section>
```

### 3b 结语章（末章沿用数字编号，不换符号）

> **铁律：末章必须用普通数字编号**（如 `05`），副标签仍写 `PART`，**HTML 与组件 3 完全一致**。
> **禁止**用 `∞`、`END`、`THE END` 等特殊符号替换序号，理由有三：
> 1. 本风格末尾已有组件 11 的 `END` 分割线，章节页再写一次 END 会出现两个结束信号，语义打架
> 2. `01/02/03…` 是序数，读者靠它判断"第几章、还剩多少"；`∞` 不是序数，插在 `PART` 上方语义断裂
> 3. 破坏左右两栏的视觉节奏——大号数字的稳定感正是这套版式的记忆点
>
> 末章需要的仪式感**只通过英文标签体现**：换成总结性词汇 `REFLECTION`（复盘/感悟）/ `SUMMARY`（总结）/ `CONCLUSION`（结论），按标题语义选一个。序号、字号、配色全部照旧。

```html
<section style="margin-top:60px;font-family:'IBM Plex Sans',-apple-system,system-ui,'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif;">
  <section style="display:flex;align-items:center;gap:16px;">
    <section style="text-align:center;flex-shrink:0;">
      <p style="margin:0;font-size:34px;font-weight:800;color:#2563eb;line-height:1;letter-spacing:0;"><span leaf="">05</span></p>
      <p style="margin:3px 0 0;font-size:8px;font-weight:700;color:#9ca3af;letter-spacing:0;"><span leaf="">PART</span></p>
    </section>
    <section style="flex:1;min-width:0;">
      <p style="margin:0 0 3px;font-size:22px;color:#2563eb;line-height:1.35;letter-spacing:0;"><span leaf="">{{结语标题}}</span></p>
      <p style="margin:0;font-size:10px;color:#3b82f6;letter-spacing:0;"><span leaf="">{{REFLECTION}}</span></p>
    </section>
  </section>
</section>
```

---

## 组件 4 正文段落（本风格 90% 的篇幅）

> **写法要点（逐条对齐原文实测）**：
>
> - **每个段落独立包一层 `<section style="margin-top:20px;font-family:…">`**，内部 `<p style="margin:0;…">`——间距在 section 上，p 永远 margin:0
> - `line-height:1.95`、`text-align:justify`、`letter-spacing:0` 显式写全
> - **段落要短**：原文平均 1–2 句一段，不要写大段落
> - 每篇把握节奏：连续 4–6 段纯正文后，插一张图或一个小标签，避免长墙

```html
<section style="margin-top:20px;font-family:'IBM Plex Sans',-apple-system,system-ui,'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif;">
  <p style="margin:0;font-size:15px;line-height:1.95;text-align:justify;color:#374151;letter-spacing:0;">
    <span leaf="">{{正文内容，其中 1~3 处用组件 5a 标记}}</span>
  </p>
</section>
```

---

## 组件 5 行内强调样式（6 种变体 + 使用策略）

### 5a. 深黑加粗（默认主力，每段 1~3 处）

> **本风格的灵魂**：强调只用深色 + 600 字重，**不用主色加粗**。这样蓝色才能保持"点睛"地位。

```html
<span textstyle="" style="color:rgb(17,24,39);font-weight:600;">{{关键词短语}}</span>
```

### 5b. 主色小标签（每篇 ≤3 处，用于专有名词/产品名）

```html
<span style="color:#2563eb;font-weight:600;">{{关键词}}</span>
```

### 5c. 淡蓝下划线（焦点句，每篇 ≤5 处）

```html
<span style="border-bottom:2px solid #bfdbfe;font-weight:600;">{{关键点}}</span>
```

### 5d. 浅蓝背景高亮（次要关键词）

```html
<span style="background:#eff6ff;color:#2563eb;padding:1px 4px;border-radius:3px;">{{次要关键词}}</span>
```

### 5e. 荧光笔（底部半高亮，长句强调）

```html
<span style="background:linear-gradient(to bottom,transparent 55%,#dbeafe 55%);padding:0 2px;">{{长句片段}}</span>
```

### 5f. 行内代码

```html
<span style="background:#f3f4f6;color:#2563eb;font-family:'IBM Plex Sans',Consolas,Monaco,monospace;font-size:13px;padding:1px 5px;border-radius:3px;">{{code}}</span>
```

**行内强调优先级（出现频率）**：5a 深黑加粗（80%）> 5c 下划线（10%）> 5b 主色（5%）> 5d/5e/5f（5%）。

---

## 组件 6 引用 / 提示块（3 种变体）

### 6a. 浅蓝渐变左竖条引用（正文中的引述、他人观点）

```html
<section style="margin-top:20px;background:linear-gradient(135deg,#eff6ff,#ffffff);border-left:3px solid #2563eb;border-radius:0 10px 10px 0;padding:14px 16px;">
  <p style="margin:0;font-size:15px;line-height:1.95;text-align:justify;color:#374151;letter-spacing:0;"><span leaf="">{{引用内容}}</span></p>
</section>
```

### 6b. 淡蓝描边提示卡（注意事项、踩坑、核心结论）

```html
<section style="margin-top:24px;background:#ffffff;border:1px solid #dbeafe;border-radius:12px;padding:14px 16px;box-shadow:0 3px 12px rgba(37,99,235,0.06);">
  <p style="margin:0 0 6px;font-size:9px;font-weight:800;letter-spacing:0;color:#2563eb;"><span leaf="">{{NOTE · 注意}}</span></p>
  <p style="margin:0;font-size:15px;line-height:1.95;text-align:justify;color:#374151;letter-spacing:0;"><span leaf="">{{提示内容}}</span></p>
</section>
```

### 6c. 灰底轻量旁注（补充说明、个人吐槽）

```html
<section style="margin-top:20px;border-left:3px solid #e5e7eb;padding:6px 0 6px 14px;">
  <p style="margin:0;font-size:14px;line-height:1.9;color:#9ca3af;letter-spacing:0;"><span leaf="">{{旁注内容}}</span></p>
</section>
```

---

## 组件 7 有序要点（原文实测的「bullet-less」写法）

> 原文用 `• ` 前缀 + 正文样式写要点，**不用任何列表边框**。保持一致性。

```html
<section style="margin-top:20px;font-family:'IBM Plex Sans',-apple-system,system-ui,'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif;">
  <p style="margin:0;font-size:15px;line-height:1.95;text-align:justify;color:#374151;letter-spacing:0;">
    <span leaf="">• {{要点一，<span textstyle="" style="color:rgb(17,24,39);font-weight:600;">内含 1 处深黑强调</span>}}</span>
  </p>
</section>
```


### 7b 步骤标号（教程类用 STEP 编号）

```html
<section style="margin-top:24px;font-family:'IBM Plex Sans',-apple-system,system-ui,'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif;">
  <section style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
    <p style="margin:0;font-size:9px;font-weight:800;color:#ffffff;background:#2563eb;border-radius:4px;padding:2px 8px;letter-spacing:0;"><span leaf="">STEP 01</span></p>
    <p style="margin:0;font-size:15px;font-weight:600;color:#111827;letter-spacing:0;"><span leaf="">{{步骤小标题}}</span></p>
  </section>
  <p style="margin:0;font-size:15px;line-height:1.95;text-align:justify;color:#374151;letter-spacing:0;"><span leaf="">{{步骤内容}}</span></p>
</section>
```

---

## 组件 8 数据 / 要点卡片组

### 8a 两列版

```html
<section style="margin-top:24px;display:flex;gap:12px;">
  <section style="flex:1;min-width:0;background:#ffffff;border:1px solid #dbeafe;border-radius:12px;padding:14px 12px;text-align:center;box-shadow:0 3px 12px rgba(37,99,235,0.06);">
    <p style="margin:0 0 4px;font-size:24px;font-weight:800;color:#2563eb;letter-spacing:0;"><span leaf="">{{数值}}</span></p>
    <p style="margin:0;font-size:12px;color:#9ca3af;letter-spacing:0;"><span leaf="">{{指标名}}</span></p>
  </section>
  <section style="flex:1;min-width:0;background:#ffffff;border:1px solid #dbeafe;border-radius:12px;padding:14px 12px;text-align:center;box-shadow:0 3px 12px rgba(37,99,235,0.06);">
    <p style="margin:0 0 4px;font-size:24px;font-weight:800;color:#2563eb;letter-spacing:0;"><span leaf="">{{数值}}</span></p>
    <p style="margin:0;font-size:12px;color:#9ca3af;letter-spacing:0;"><span leaf="">{{指标名}}</span></p>
  </section>
</section>
```

### 8b 三列版

```html
<section style="margin-top:24px;display:flex;gap:10px;">
  <section style="flex:1;min-width:0;background:#ffffff;border:1px solid #dbeafe;border-radius:12px;padding:12px 8px;text-align:center;box-shadow:0 3px 12px rgba(37,99,235,0.06);">
    <p style="margin:0 0 4px;font-size:20px;font-weight:800;color:#2563eb;letter-spacing:0;"><span leaf="">{{数值}}</span></p>
    <p style="margin:0;font-size:11px;color:#9ca3af;letter-spacing:0;"><span leaf="">{{指标名}}</span></p>
  </section>
  
  
</section>
```

### 8c 表格（真实数据表）

```html
<section style="margin-top:24px;border:1px solid #dbeafe;border-radius:12px;overflow:hidden;box-shadow:0 3px 12px rgba(37,99,235,0.06);">
  <section style="display:flex;background:linear-gradient(135deg,#eff6ff,#ffffff);border-bottom:1px solid #dbeafe;">
    <p style="flex:1;margin:0;padding:10px 12px;font-size:13px;font-weight:800;color:#2563eb;letter-spacing:0;"><span leaf="">{{列1}}</span></p>
    <p style="flex:1;margin:0;padding:10px 12px;font-size:13px;font-weight:800;color:#2563eb;letter-spacing:0;"><span leaf="">{{列2}}</span></p>
  </section>
  <section style="display:flex;border-bottom:1px solid #f3f4f6;">
    <p style="flex:1;margin:0;padding:10px 12px;font-size:14px;color:#374151;letter-spacing:0;"><span leaf="">{{数据1}}</span></p>
    <p style="flex:1;margin:0;padding:10px 12px;font-size:14px;color:#374151;letter-spacing:0;"><span leaf="">{{数据2}}</span></p>
  </section>
  
</section>
```

---

## 组件 9 图片容器（统一描边卡，本风格第二大识别点）

> **所有图片必须套同一层：外层 `margin-top:24px` → 中层 `border:1px solid #dbeafe; border-radius:12px; padding:6px; box-shadow:0 3px 12px rgba(37,99,235,0.06)` → 图片 `border-radius:8px`**。  
> 这个"6px 内补白 + 淡蓝细描边 + 同色系微阴影"的组合让截图看起来像带边框印刷插页，是本风格最值钱的一处细节。

```html
<section style="margin-top:24px;">
  <section style="background:#ffffff;border:1px solid #dbeafe;border-radius:12px;padding:6px;box-shadow:0 3px 12px rgba(37,99,235,0.06);">
    <span style="display:block;"><img src="{{图片URL}}" style="width:100%;display:block;margin:0 auto;border-radius:8px;" /></span>
  </section>
</section>
```

### 9b 带图注版

```html
<section style="margin-top:24px;">
  <section style="background:#ffffff;border:1px solid #dbeafe;border-radius:12px;padding:6px;box-shadow:0 3px 12px rgba(37,99,235,0.06);">
    <span style="display:block;"><img src="{{图片URL}}" style="width:100%;display:block;margin:0 auto;border-radius:8px;" /></span>
  </section>
  <p style="margin:8px 0 0;text-align:center;font-size:12px;color:#9ca3af;letter-spacing:0;"><span leaf="">{{图注，原文无图注时整行删掉}}</span></p>
</section>
```

### 9c 双图并排

```html
<section style="margin-top:24px;display:flex;gap:12px;">
  <section style="flex:1;min-width:0;background:#ffffff;border:1px solid #dbeafe;border-radius:12px;padding:6px;box-shadow:0 3px 12px rgba(37,99,235,0.06);">
    <span style="display:block;"><img src="{{图1}}" style="width:100%;display:block;margin:0 auto;border-radius:8px;" /></span>
  </section>
  <section style="flex:1;min-width:0;background:#ffffff;border:1px solid #dbeafe;border-radius:12px;padding:6px;box-shadow:0 3px 12px rgba(37,99,235,0.06);">
    <span style="display:block;"><img src="{{图2}}" style="width:100%;display:block;margin:0 auto;border-radius:8px;" /></span>
  </section>
</section>
```

---

## 组件 10 素材占位板块（待补图/GIF/视频）

```html
<section style="margin-top:24px;background:linear-gradient(135deg,#eff6ff,#ffffff);border:1px dashed #bfdbfe;border-radius:12px;padding:28px 16px;text-align:center;">
  <p style="margin:0 0 4px;font-size:13px;color:#2563eb;letter-spacing:0;"><span leaf="">🖼 {{待补：截图名称}}</span></p>
  <p style="margin:0;font-size:12px;color:#9ca3af;letter-spacing:0;"><span leaf="">{{说明：这里放 XXX 截图}}</span></p>
</section>
```

---

## 组件 11 END 收尾分割线（左右渐隐 + END 字样）

```html
<section style="margin:26px 4px 22px;display:flex;align-items:center;gap:12px;">
  <span style="height:1px;background:linear-gradient(90deg,rgba(37,99,235,0),#93c5fd);flex:1;display:inline-block;overflow:hidden;font-size:0;line-height:0;"><span leaf="">&nbsp;</span></span>
  <span style="font-size:9px;font-weight:800;letter-spacing:0;color:#2563eb;"><span leaf="">END</span></span>
  <span style="height:1px;background:linear-gradient(90deg,#93c5fd,rgba(37,99,235,0));flex:1;display:inline-block;overflow:hidden;font-size:0;line-height:0;"><span leaf="">&nbsp;</span></span>
</section>
```

---

## 组件 12 尾部作者签名区

> - 头像圆位显示**作者名首字**；有真实头像 URL 才换成 `<img>`，没有就保留文字首位
> - **第一句必须用户自填**：给了署名/简介就填入，没给就保留 `{{作者名}}` / `{{一句话简介}}` 占位并在交付时提示替换
> - 第二句互动引导通用；第三行 `THANKS FOR READING` 固定保留
> - **原文末尾已有作者自述段落时，沿用原文，不要重复生成第二个签名区**

```html
<section style="margin:0 4px 24px;padding:18px;background:linear-gradient(135deg,#f0f7ff,#ffffff);border:1px solid #dbeafe;border-radius:12px;">
  <section style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
    <section style="width:38px;height:38px;border-radius:50%;background:#2563eb;text-align:center;line-height:38px;flex-shrink:0;">
      <span style="font-size:17px;font-weight:900;color:#ffffff;"><span leaf="">{{木}}</span></span>
    </section>
    <section style="min-width:0;">
      <p style="margin:0 0 2px;font-size:14px;font-weight:900;color:#111827;"><span leaf="">{{作者名}}</span></p>
      <p style="margin:0;font-size:9px;color:#9ca3af;letter-spacing:0;"><span leaf="">{{PROGRAMMER · AI PRACTITIONER}}</span></p>
    </section>
  </section>
  <p style="margin:0 0 10px;font-size:13px;line-height:1.8;color:#374151;"><span leaf="">我是{{作者名}}，{{一句话简介}}。</span></p>
  <p style="margin:0 0 10px;font-size:13px;line-height:1.8;color:#374151;"><span leaf="">如果你觉得今天这篇有收获，欢迎<strong style="color:#2563eb;">点赞、在看、转发</strong>三连，我们下篇见。</span></p>
  <p style="font-size:9px;color:#9ca3af;letter-spacing:0;margin:14px 0 0;text-align:center;"><span leaf="">THANKS FOR READING</span></p>
</section>
```

---

## 组件 13 本文看点（导读目录卡）

> **触发**：章节 ≥3 个时生成，位置在**刊头卡之后、开场正文之前**（或开场正文之后、第一章之前，二选一，一篇只用一次）。
> **内容铁律**：展示**精选 3 个核心看点**，不是完整章节列表；章节多于 3 个时挑最重要的 3 个，不要硬塞、也不要让读者误以为只有 3 章。
> **写法**：看点写成"读者能拿走什么"（一句结论/一个结果），不要写成章节标题的复述。

```html
<section style="margin-top:24px;background:#ffffff;border:1px solid #dbeafe;border-radius:12px;padding:16px 18px;box-shadow:0 3px 12px rgba(37,99,235,0.06);">
  <p style="margin:0 0 12px;font-size:9px;font-weight:800;letter-spacing:0;color:#2563eb;"><span leaf="">本文看点 · HIGHLIGHTS</span></p>
  <section style="display:flex;align-items:flex-start;gap:10px;">
    <p style="margin:0;font-size:11px;font-weight:800;color:#ffffff;background:#2563eb;border-radius:4px;padding:2px 7px;flex-shrink:0;letter-spacing:0;"><span leaf="">01</span></p>
    <p style="margin:0;font-size:14px;font-weight:600;color:#111827;line-height:1.6;letter-spacing:0;"><span leaf="">{{看点一}}</span></p>
  </section>
  <section style="display:flex;align-items:flex-start;gap:10px;margin-top:10px;">
    <p style="margin:0;font-size:11px;font-weight:800;color:#ffffff;background:#2563eb;border-radius:4px;padding:2px 7px;flex-shrink:0;letter-spacing:0;"><span leaf="">02</span></p>
    <p style="margin:0;font-size:14px;font-weight:600;color:#111827;line-height:1.6;letter-spacing:0;"><span leaf="">{{看点二}}</span></p>
  </section>
  <section style="display:flex;align-items:flex-start;gap:10px;margin-top:10px;">
    <p style="margin:0;font-size:11px;font-weight:800;color:#ffffff;background:#2563eb;border-radius:4px;padding:2px 7px;flex-shrink:0;letter-spacing:0;"><span leaf="">03</span></p>
    <p style="margin:0;font-size:14px;font-weight:600;color:#111827;line-height:1.6;letter-spacing:0;"><span leaf="">{{看点三}}</span></p>
  </section>
</section>
```

---

## 组件 14 信息卡（核心判断提炼）

> **用途**：把一段长论述后的**核心判断/结论**拎出来单独成块，给读者一个停顿点。
> **与 6a 引用块的区别（不要混用）**：6a 是**引述他人**；信息卡是**作者自己的判断**，且带 `eyebrow` 小标签。
> **与 6b 提示卡的区别**：6b 是注意事项/踩坑；信息卡是正面结论。
> **每篇 1–2 个**，多了会稀释。

```html
<section style="margin-top:24px;background:linear-gradient(135deg,#eff6ff,#ffffff);border-left:3px solid #2563eb;border-radius:0 12px 12px 0;padding:16px 18px;">
  <p style="margin:0 0 8px;font-size:9px;font-weight:800;letter-spacing:0;color:#2563eb;"><span leaf="">{{eyebrow，如：本期结论}}</span></p>
  <p style="margin:0 0 6px;font-size:16px;font-weight:600;color:#111827;line-height:1.7;letter-spacing:0;"><span leaf="">{{核心判断句}}</span></p>
  <p style="margin:0;font-size:14px;line-height:1.8;color:#374151;letter-spacing:0;"><span leaf="">{{补充说明，一句话}}</span></p>
</section>
```

---

## 组件 15 方案对照（两方案并排）

> **触发**：出现 A/B 方案、两版预算、两种朝向/路线等天然对比。**这是把散在文字里的对比救回来的关键模块。**
> **结构**：两列 flex，各 12px 描边卡；顶部标题条用浅蓝渐变底 + 主色字，下方要点列表。
> **要点写"事实 + 后果"**，不要只写名词。

```html
<section style="margin-top:24px;display:flex;gap:12px;">
  <section style="flex:1;min-width:0;background:#ffffff;border:1px solid #dbeafe;border-radius:12px;overflow:hidden;box-shadow:0 3px 12px rgba(37,99,235,0.06);">
    <section style="background:linear-gradient(135deg,#eff6ff,#ffffff);border-bottom:1px solid #dbeafe;padding:10px 14px;">
      <p style="margin:0;font-size:13px;font-weight:800;color:#2563eb;letter-spacing:0;"><span leaf="">{{方案A名}}</span></p>
    </section>
    <section style="padding:12px 14px;">
      <p style="margin:0 0 8px;font-size:14px;line-height:1.8;color:#374151;letter-spacing:0;"><span leaf="">• {{要点一}}</span></p>
      <p style="margin:0;font-size:14px;line-height:1.8;color:#374151;letter-spacing:0;"><span leaf="">• {{要点二}}</span></p>
    </section>
  </section>
  <section style="flex:1;min-width:0;background:#ffffff;border:1px solid #dbeafe;border-radius:12px;overflow:hidden;box-shadow:0 3px 12px rgba(37,99,235,0.06);">
    <section style="background:linear-gradient(135deg,#eff6ff,#ffffff);border-bottom:1px solid #dbeafe;padding:10px 14px;">
      <p style="margin:0;font-size:13px;font-weight:800;color:#2563eb;letter-spacing:0;"><span leaf="">{{方案B名}}</span></p>
    </section>
    <section style="padding:12px 14px;">
      <p style="margin:0 0 8px;font-size:14px;line-height:1.8;color:#374151;letter-spacing:0;"><span leaf="">• {{要点一}}</span></p>
      <p style="margin:0;font-size:14px;line-height:1.8;color:#374151;letter-spacing:0;"><span leaf="">• {{要点二}}</span></p>
    </section>
  </section>
</section>
```

---

## 组件 16 行动引导（文末 CTA）

> **位置**：结语章之后、END 分割线之前。**与组件 12 签名区不重复**——签名区是「人」（头像+简介），行动引导是「事」（邀请读者做一个具体动作）。
> **按钮**：公众号不支持真 `<button>`，用 `display:inline-block` 的 `<span>` 模拟，**不可点击**，文案要写成描述性而非承诺性（如"在豆包里新建任务试试"而不是"立即体验"）。
> **篇幅**：一篇最多一个；原文结尾已有明确引导句的，并入此处，不要重复生成。

```html
<section style="margin-top:24px;background:linear-gradient(135deg,#f0f7ff,#ffffff);border:1px solid #dbeafe;border-radius:12px;padding:18px;text-align:center;box-shadow:0 3px 12px rgba(37,99,235,0.06);">
  <p style="margin:0 0 6px;font-size:15px;font-weight:600;color:#111827;line-height:1.7;letter-spacing:0;"><span leaf="">{{主标题，一句邀请}}</span></p>
  <p style="margin:0 0 14px;font-size:14px;line-height:1.8;color:#374151;letter-spacing:0;"><span leaf="">{{副文，说明做什么}}</span></p>
  <p style="margin:0;">
    <span style="display:inline-block;background:#2563eb;color:#ffffff;font-size:13px;font-weight:700;padding:8px 22px;border-radius:8px;letter-spacing:0;"><span leaf="">{{按钮文案}}</span></span>
  </p>
</section>
```

---

## 完整文章模板骨架

```html
<section style="width:677px;margin:0 auto;padding:8px 16px;box-sizing:border-box;background:#ffffff;color:#374151;font-family:'IBM Plex Sans',-apple-system,system-ui,'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif;line-height:1.75;">
  —— 全部组件按下面的顺序装配在容器内 ——
</section>
```

**装配顺序（自上而下）**：

1. **刊头卡**（组件 2 / 2b）——有专栏名与封面图用 2，否则用 2b；导语不超过 3 句
2. **本文看点**（组件 13）——章节 ≥3 个时生成，精选 3 个
3. **开场正文**（组件 4 × N）——第一章之前的铺垫
4. **第一章**（组件 3 章节标题，margin-top 60px）
5. **章内元素**：正文 4 → 图片卡 9（每 4~6 段一张）→ 引用 6a/6c → 提示卡 6b → **信息卡 14**（长论述后收结论）→ **方案对照 15**（出现 A/B 时）→ 数据卡 8
6. **第二至第 N 章**（组件 3，每章 margin-top 60px，**章与章之间不加分割线**）
7. **结语章**（组件 3b：沿用数字编号，英文标签换 REFLECTION / SUMMARY）
8. **行动引导**（组件 16，可选，一篇最多一个，在 END 之前）
9. **END 分割线**（组件 11）
10. **作者签名区**（组件 12）


**骨架铁律**：

- 刊头卡在最前，**章节之间不加分割线**——60px 留白 + 大号蓝色序号已经足够切分（这是本风格与"分割线型"主题最大的区别）
- 全文只有 **1 个 END（组件 11）+ 1 个签名区（组件 12）**
- 全文只有 **1 个本文看点（组件 13）+ 最多 1 个行动引导（组件 16）**
- 图片统一走组件 9，**不允许出现裸 `<img>`**

---

## 视觉层级（3 层递进）

| 层级      | 样式                              | 用途        | 频率             |
| ------- | ------------------------------- | --------- | -------------- |
| **锚点层** | 章节序号 `01`（组件 3）/ 数据卡大数字（组件 8）   | 章节切换、关键数据 | 每章 1 次，全文 ≤8 处 |
| **标记层** | 深黑加粗 5a（默认）                     | 正文关键词     | 每段 1~3 处       |
| **容器层** | 刊头卡 2 / 图片卡 9 / 提示卡 6b / 作者卡 12 | 结构化区块     | 按需             |

**克制原则（本风格的成败所在）**：

- **正文强调只用深黑加粗 5a**，蓝色 5b 全文 ≤3 处——违反这条，整篇就会从"克制The Economist 风"退化成"到处高亮的自媒体风"
- 全文**只有一个阴影值** `0 3px 12px rgba(37,99,235,0.06)`（刊头卡是更强的 4px/14px 变体），不要引入第二组阴影
- 全文**只有一个描边色** `#dbeafe`
- 区块之间靠留白分隔，不靠分割线
- 不用四周虚线框套标题（占位组件 10 的 dashed 是唯一例外）

---

## 文章类型 → 组件组合配方

按 SKILL.md 第 3 步判定的文章类型选配方；核心组件构成本篇排版主旋律，点缀组件按内容出现处使用，**一篇文章点缀组件种类 ≤2**，避免花哨。

| 文章类型                 | 核心组件组合                        | 点缀组件          |
| -------------------- | ----------------------------- | ------------- |
| AI 实操 / 案例复盘（本风格主场景） | 章节 3 + 正文 4 + 图片卡 9（大量截图）     | 本文看点 13、信息卡 14、方案对照 15、提示卡 6b |
| 教程 / 操作指南            | 章节 3 + STEP 标号 7b + 通用库代码块 1a | 提示卡 6b、图片卡 9  |
| 工具测评 / 盘点            | 章节 3 + 数据卡 8a/8b + 图片卡 9      | 有序要点 7、表格 8c  |
| 观点 / 深度分析            | 章节 3 + 正文 4 + 渐变引用 6a         | 灰底旁注 6c       |
| 数据复盘 / 报告            | 数据卡 8a/8b + 表格 8c + 图片卡 9     | 有序要点 7        |
| 访谈 / 人物特稿            | 章节 3 + 渐变引用 6a（引语）+ 图片卡 9     | 灰底旁注 6c       |
| 生活 / 情感随笔            | 章节 3 + 正文 4（最短段落）+ 灰底旁注 6c    | 图片卡 9         |

所有类型共用固定结构：刊头卡 2/2b + 本文看点 13（章节 ≥3 时）+ 编号章节 3（末章 3b，仅英文标签换总结性词）+ END 11 + 签名 12。行动引导 16 按需要插入结语章与 END 之间。

---

## Markdown → 科技刊读风 映射规则

| Markdown 元素             | 对应组件                                       | 说明                               |
| ----------------------- | ------------------------------------------ | -------------------------------- |
| `# 标题`                  | 不使用                                        | 公众号文章标题在平台设置                     |
| 文章开头 `> 引言`             | 组件 2 / 2b 刊头卡导语区                           | 首段放进去做钩子                         |
| `## 章节标题`               | 组件 3 章节标题                                  | 双栏 01/PART/中文/英文标签；末章 3b 沿用数字编号，英文标签换 REFLECTION/SUMMARY |
| `### 子标题`               | 组件 7b STEP 标号 或 组件 5a 深黑加粗起头               | 本风格**无独立小标题组件**，不要新造样式           |
| 普通段落                    | 组件 4 正文段落                                  | 15px/1.95/justify；每段主动标 1~3 处 5a |
| `**加粗文字**`              | 组件 5a 深黑加粗（默认）                             | **本风格默认不用主色加粗**                  |
| `==高亮文字==`              | 组件 5d 浅蓝背景高亮                               | 次要关键词                            |
| `<u>下划线</u>` / `++文字++` | 组件 5c 淡蓝下划线                                | 焦点句，≤5 处                         |
| `~~删除线~~`               | `text-decoration:line-through` + `#9ca3af` | 被淘汰概念                            |
| 行内 `` `code` ``         | 组件 5f 行内代码                                 |                                  |
| `> 引用段落`（他人观点）          | 组件 6a 浅蓝渐变左竖条                              |                                  |
| `> 引用段落`（旁注/吐槽）         | 组件 6c 灰底左竖条                                |                                  |
| 注意事项 / 踩坑               | 组件 6b 淡蓝描边提示卡                              |                                  |
| `- 无序列表`                | 组件 7 有序要点（`• ` 前缀 + 正文样式）                  | **不用列表容器，直接排段落**                 |
| `1. 2. 3.` 编号列表         | 组件 7b STEP 标号（教程）或 组件 7（`• `）              |                                  |
| ` ``` 多行代码块 ``` `       | 通用库 1a 深色 / 1b 浅色（左竖条换 `#2563eb`）          | 每行一个 `<p style="margin:0">`      |
| 数据对比                    | 组件 8a 两列 / 8b 三列数据卡                        |                                  |
| Markdown 表格             | 组件 8c 表格                                   | 偶数行浅蓝底                           |
| `![](图片)`               | 组件 9 图片容器                                  | 必套描边卡，禁止裸 img                    |
| `![说明](图片)`             | 组件 9b 带图注                                  |                                  |
| 待补截图 / GIF              | 组件 10 素材占位板块                               |                                  |
| `---`                   | **不使用组件**（本风格章节间不用分割线）                     | 若要分隔用 60px 留白                    |
| 章节 ≥3 个                 | 组件 13 本文看点                                  | 刊头卡后，精选 3 个，不是全量目录                 |
| 长论述后的核心结论                | 组件 14 信息卡                                  | 每篇 1~2 个；作者自己的判断，带 eyebrow       |
| A/B 方案、两版预算、两种路线         | 组件 15 方案对照                                 | 两列并排，要点写"事实 + 后果"                 |
| 文末需要读者做动作                | 组件 16 行动引导                                 | 一篇最多一个，在 END 之前；与签名区不重复           |
| 文末                      | 组件 11 END + 组件 12 签名                       | 各仅一处                             |

---

## ⚠️ 关于微信「内容结构检测」告警（必读，血的教训）

微信编辑器会对粘贴内容报两类告警，本风格**天生就会触发**，**一律不要去"清零式修复"**：

| 告警 | 触发原因 | 正确处理 |
| -- | ---- | ---- |
| `darkmode-no-gradient` | **渐变压着文字**（卡片底 `135deg` 铺太多），触发规范 §4.1.2 | **按 §4.1.3 只转「有文字的」，把 `135deg` 配额压回 2 处**，见下方「精准处理」 |
| 「文字对齐异常」 | 段落**没有显式声明** `text-align`，靠继承 | **把隐式写成显式**，见下 |

### 「文字对齐异常」的真正原因与解法（已实测定位 · 二次修正）

**不是** `start`/`end`（规范 §1.6 只禁这两个值，本风格从不使用）。

**第一版结论（部分正确）**：显式 `text-align` 覆盖率太低 —— 已发布 83%、本风格初版 38%。这个方向没错，但**只说对了一半**。

**⚠️ 第二版结论（关键补充）**：**`text-align` 的值也有讲究，别补 `left`。** 实测取值分布：

| 取值 | 已发布（零报错） | 本风格初版 | 全量补 align 后（仍报错） |
| -- | ---- | ---- | ---- |
| `justify` | 127 | 39 | 81 |
| `center` | 7 | 13 | 38 |
| **`left`** | **0** | **0** | **50 ← 新增，就是它惹的祸** |

补 align 脚本把"继承到的默认值 = left"也显式写了出来，于是凭空多出 50 个 `left`。**微信点名报的就是其中一个（END 分隔线的 span）**，而该 span 与已发布版的**唯一差异**就是多了一个 `text-align:left`。

**修正后的规则**：
- ✅ 只补继承值为 **`justify` / `center`** 的节点；
- ❌ 继承值为 **`left`（即没任何祖先声明，走默认值）的节点一律保持裸奔，不要补** —— 已发布文章就是这么处理的；
- 删掉已补的 `left` 是**恒等回退**，渲染零变化（`left` 本来就是默认值）。

**实现要点（踩过的坑）**：
1. **不要给 `<span leaf="">` 加任何 style** —— 那是微信的叶子标记，污染后会产生 `style=""` 等脏属性。跳过 `leaf` span。
2. 同时跳过纯装饰 span（含 `font-size:0`，或设了 `width`/`height` 的色块/线条）。
3. 只补 `<p>` 和裸文本 `<span>`，`<section>` 容器可不动。
4. **不要用 HTMLParser 重写文件**——它会丢掉 HTML 注释。若后续流程依赖注释定位（如换图脚本的锚点），会失效；改用更保守的文本替换，或让下游不依赖注释。
5. **改完必须验证 END 段**：把 END 的 `<span style="font-size:9px;...">` 与已发布版逐字节比对，两者应完全一致（该 span **不带** `text-align`）。

### ✅ `darkmode-no-gradient` 的推荐解：精准处理（已产线验证）

不要再纠结"要不要用渐变" —— **按 §4.1.3 一刀切：渐变上方是否有文字。**

1. **`90deg` 装饰渐隐线（无文字）→ 全部原样保留**：END 左右渐隐线、刊头顶部横线。内部只放 `<span leaf=""><br></span>` 或 `&nbsp;`，算法不做处理，天然合规。
2. **`135deg` 卡片底（有文字）→ 只留 2 处**：刊头卡卡头部 + 签名区卡片（与已发布原文一致）。**超出的转各自起始纯色** `#eff6ff` / `#f0f7ff`。
3. 若某处的渐变异色、或让用户手机上看不清字，**必须改**——不要为了留渐变而留渐变。

**⚠️ 这不是可选的"层次优化"，是真实的可用性缺陷**：用户实测在手机上看不到渐变容器里的字，**只有光标选中反色后才看得出来**。深色模式算法把渐变 mix 成纯色后文字颜色不翻转 → 深色字压深色底 → 隐形。发布前务必用手机深色模式验一遍。

### 🔘 两个正式变体：选一个作为默认

本风格现在有两个等价产出，**排版完全一致，只差"有没有 135deg 卡片底"**：

| 变体 | `linear-gradient` | 构成 | 结果 |
| -- | -- | -- | -- |
| **v5 无渐变（推荐默认）** | **3** | 3 条 `90deg` 装饰渐隐线（无文字） | **零 `darkmode-no-gradient`** |
| v4 原版 | 5 | 上述 3 条 **+ 2 处 `135deg` 卡片底**（压文字） | 会有 1 条 `darkmode-no-gradient` 提示 |

**只剩 3 条装饰线时不会被告警** —— 用户实测验证过：贴无渐变版本时编辑器只报「文字对齐异常」，渐变提示一条没有；贴带 `135deg` 的版本必定出现。这是 §4.1.3 的直接印证。

**代价评估（无渐变）**：几乎为零。因为 §4.1.2 说了，**深色模式下算法本来就会把渐变 mix 成纯色**，所以两版在深色模式下肉眼差别很小；差别只在浅色模式下卡片头少一层极浅的 `#eff6ff→#ffffff` 过渡。**用一条看不见的层次换零告警 + 手机上不会隐形，划算。**

**生成方式**：先出正常版本，再把 135deg 卡片底按起始色替换（`#eff6ff` / `#f0f7ff`）。参考 `豆包3D样板间_v5_无渐变.html` 的生成脚本，按容器特征逐个替换，**倒序处理避免 offset 漂移**，`flex` / `text-align` 保持不变。

> ⚠️ 不要为了减少数量就保留一部分 135deg —— 实测即便压到与对照稿相同的 2 处，**提示依然存在**。要么全留（接受 1 条提示），要么全去（零提示），中间状态没有意义。

### `darkmode-no-gradient` 的三条出路

按官方规范 §4.1.2 / §4.1.3 / §4.6：

1. **§4.1.3 纯背景可以使用渐变** —— 渐变**上方无文字**时算法不做处理。所以装饰性渐变线/色块（内部只放 `<span leaf=""><br></span>` 或 `&nbsp;`）**天然合规**，不用改。本风格的 END 左右渐隐线、刊头卡渐隐线都属于此类。
2. **§4.6 `data-ignore-dm`** —— 给节点加 `data-ignore-dm="text-bg-gradient"` 跳过该节点的渐变检测。**仅对标记节点生效，后代各自违规仍会报**，所以每处都要单独加。零视觉改动。
3. **改成纯色** —— 取渐变的起始色（`#eff6ff` / `#f0f7ff` 均在本风格色板内）。注意会失去浅色模式下的层次；**深色模式下算法本来就会把渐变 mix 成纯色**，所以纯色版在深色模式与渐变版几乎无差。

**⚠️ 卡片底渐变配额（精确版，别再记错）**：已发布零告警原文**共 5 处渐变**，`135deg` 卡片底**只有 2 处**，其余 3 处是 `90deg` 装饰渐隐线：

| # | 角度 | 位置 | 容器特征 | 上面有无文字 |
| -- | -- | -- | -- | -- |
| 1 | 90deg | 刊头顶部横线 | `padding:13px 16px 12px` | 无（装饰） |
| 2 | **135deg** | **刊头卡卡头部** | `padding:15px 17px 17px` | **有**（`#111827` 标题） |
| 3 | 90deg | END 左渐隐线 | `margin:26px 4px 22px` | 无（装饰） |
| 4 | 90deg | END 右渐隐线 | `margin:26px 4px 22px` | 无（装饰） |
| 5 | **135deg** | **签名区卡片** | `margin:0 4px 24px;padding:18px` | **有**（`#111827` 署名） |

**配额就是 2 处 `135deg`**。本风格初版铺了 9 处 → 超过配额的部分全部转纯色，剩下的应与上表**逐项对齐**。

> 注：这 2 处压着文字却不告警，是因为 `#eff6ff→#ffffff` / `#f0f7ff→#ffffff` 的**终点是纯白**，深色模式下算法 mix 后接近白底，深色字仍然可读，算法放行。**但这是"刚好够用"，不是可以随意加的额度**。

---

## 常见错误自查表（生成后逐条过）

| #  | 检查项     | 常见错误                                                 |
| -- | ------- | ---------------------------------------------------- |
| 1  | 布局标签    | 出现 `<div>` —— 本风格必须是纯 `<section>`                    |
| 2  | 段落间距    | `<p>` 写了 `margin-top` —— 必须 `margin:0`，间距挂外层 section |
| 3  | 强调色     | 正文里满篇 `#2563eb` 加粗 —— 应 95% 用 `#111827` 深黑加粗         |
| 4  | 图片      | 出现未套描边卡的裸 `<img>`                                    |
| 5  | 阴影/描边   | 出现 `#dbeafe` 和 `rgba(37,99,235,0.06)` 之外的第二套值        |
| 6  | 章节命名    | 英文标签照抄 `DATA COLLECTION` —— 必须按中文标题现译                |
| 7  | FLEX 子项 | flex 两列的子 `<section>` 忘写 `min-width:0`（长中文会把卡片撑破）    |
| 8  | 装饰空元素   | 圆点/渐变线内部没放 `<span leaf=""><br></span>`               |
| 9  | 署名      | 写死了他人署名（如"木马人"）或留下未替换的 `{{}}`                        |
| 10 | 全文      | `<span leaf="">` 漏包导致粘贴后样式丢失                         |
| 11 | 看点数量    | 组件 13 塞了全部章节（应为精选 3 个）；或章节少于 3 个也硬加看点卡                |
| 12 | 模块撞车    | 信息卡 14 与引用块 6a 混用（6a 引述他人、14 是自己的判断）；行动引导 16 与签名区 12 说同一件事 |
| 13 | 对照失衡    | 组件 15 两侧要点数量不等、或只写名词没有后果，对比不成立                        |
| 14 | 渐变滥用    | 渐变卡片头铺了满篇 —— 原文只在少数几处用（`135deg #eff6ff→#fff` 原文仅 1 处）。铺太多会失去层次 |
| 15 | 瞎修告警    | 为消微信 `darkmode-no-gradient` /「文字对齐异常」而拆掉 flex 或清空渐变 —— **见上方专节，禁止** |
| 16 | 补 align 补出 `left` | 全量补 align 时把默认值 `left` 也写死了 —— 已发布版 `left` 数为 0，补了反而被告警。**只补 `justify` / `center`** |
| 17 | 渐变配额超限 | `135deg` 卡片底超过 2 处（对照页的配额）—— excess 一律转起始纯色。**这会让手机深色模式下文字看不见** |
| 18 | 误判修好了 | 看到告警条数变少/位置挪了就以为解决了 —— **唯一标准是用户真机效果**。涉及到渲染类告警，必须让用户拿手机（开深色模式）验一遍 |
