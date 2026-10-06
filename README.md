# gzh-studio · 公众号 Markdown 排版工具

> 项目代号 `gzh-studio`（**待定名**，见 docs/02）。
> 一句话：**本地跑、零成本、多主题、粘贴干净的公众号排版工具。**

## 现在的进度

| 阶段 | 状态 |
| -- | -- |
| 单篇文章跑通（blue-editorial 主题） | ✅ v5 无渐变版，零告警 |
| 微信三大坑定位与解法 | ✅ 已全部复现并验证 |
| 发布后体检工具 | ✅ `check/check_published.py` |
| 项目骨架与文档（含 IR 契约） | ✅ docs/01–08 |
| **第一份机器可读主题** | ✅ `themes/blue-editorial.json`（14 个 role，模板从成品反推） |
| **渲染引擎六个模块** | ✅ `engine/`：modules（注册表）/ parse / ir / render / sanitize / clipboard |
| **三栏可视化工作台** | ✅ `app/index.html`，双击即用，file:// 实测通过 |
| 多主题（第 2 套） | ✅ `blue-gradient` 渐变版（135deg 卡片渐变，会触发微信渐变提示） |
| 多主题（第 3 套） | ✅ `mist-editorial` 雾青编辑（深墨青 + 雾青 + 金色，零渐变） |
| 封面图 / 视频素材自动化 | ⬜ 纯静态做不到，需服务端 |

## 怎么跑起来

```
双击 app/index.html
```

零构建、零依赖、断网可用。**三栏各自独立滚动，页面整体不滚：**

| 栏 | 干什么 |
| -- | -- |
| **左 · 模块** | 按「开头 / 正文 / 结尾」分组，点一下语法就插到中间 |
| **中 · 排版语法** | 生成的 Markdown，可直接改 |
| **右 · 预览** | 手机宽度预览 + 体检（体检区固定，滚预览时也看得见） |

右上角：

- **主题**下拉三套：
  - `blue-editorial` 无渐变版 —— 已实测零告警，**要发正式文章用这套**
  - `blue-gradient` 渐变版 —— 卡片是 135deg 渐变、分隔线是渐变线，即最初照参考成品复刻的效果；
    代价是会触发微信 `darkmode-no-gradient` 提示，手机深色模式下渐变卡内的字可能变淡
  - `mist-editorial` 雾青编辑 —— 深墨青 `#17262C` + 雾青 `#4E8FA3` + 金色 `#E2A341`，
    浅金底荧光笔加粗；零渐变，杂志感更强。对照稿见 `samples/demo-mist.md`
- **配色**：改 7 个主色，右侧即时预览；改满意了导出成一套新主题，或下载 `.js` 发给朋友
  （对方用「导入主题」打开即可，**不用装 Python**）。详见 `docs/08` §2.4
- **AI 用法**：弹层里是一份提示词，复制给任意 AI + 你的稿子，AI 直接吐排版语法（详见 `docs/08`）
- **载入示例**：内置演示稿，覆盖本套主题已实现的 14 个 role
- **复制到公众号**：走 `ClipboardItem` 直写原始 HTML。**不要用手动 Ctrl+A/Ctrl+C**，
  实测那样会带入 570 处浏览器计算样式污染、还会把 `display:flex` 抹成 0

下方七个体检片必须全绿才允许复制：`flex` / `渐变` / `start` / `left` / `leaf` / `污染` / `模板`。
其中 `模板` 片查的是**未替换的模板标记**（`{{?xxx}}` 这类字面量跑到了正文里）——
主题模板的条件段写错时唯一可见的症状，不拦下来就会被粘进公众号。

### 两条上手路径（都不需要记语法）

| 路 | 怎么用 |
| -- | -- |
| **A · 交给 AI** | 点「AI 用法」复制提示词，连同稿子发给 AI，把结果粘回中间栏 |
| **B · 可视化搭** | 左栏点模块 → 中间改文字 → 右侧看效果 |

见 `docs/08-两种上手方式.md`。

### 图片与视频都走「真实占位图」

刊物里凡是图（含刊头卡封面、正文配图、视频）在没有素材时，一律渲染成
**一张真实存在的 base64 占位图，图上直接写着替换方法**。

- 封面 1080×460（2.35:1）· 正文图 1080×720（3:2）· 视频 1080×608（16:9）
- md 里写 `![]()`（地址留空）或直接留空 → 自动落占位图
- 视频**永远**落占位图：公众号放不了 `<video>`，必须先传「素材库 → 视频」再插入；
  图注会带上原文件名，提示该传哪一个
- **绝不使用 `https://example.com/...` 这类假地址占位** —— 微信只会显示「图片载入失败」，
  没有可点击的替换目标，硬替换还会破坏外层排版（见 docs/03）

重新生成占位图：`python check/make_placeholders.py`（改配色或文案后跑一次）

**改主题之后要跑一次**：`python check/build_theme_js.py`
（因为 `file://` 下 `fetch()` 被 CORS 拦，主题 JSON 必须预先编译成 `<script>` 可加载的 JS）

这一步同时是**模板语法闸门**：`{{?x}}` 与 `{{/x}}` 写残或不成对，它会直接拒绝编译并指出位置。
2026-10-06 作者卡踩过一次（端点括号残缺 → 用户看到满屏 `{{?account}}`），闸门是那次加的。

## 给自己的验收清单

> `smoke_app.py` 需要装了 playwright + chromium 的 Python。
> 本机可用的是 `C:\Users\kifun\.workbuddy\binaries\python\envs\default\Scripts\python.exe`。

| 命令 | 作用 |
| -- | -- |
| `node check/test_engine.js` | 跑 `samples/demo.md` 全流程，输出 role 分布与体检结论 |
| `node check/test_engine.js --sample` | 跑 App 内置示例（覆盖本套主题已实现的 14 个组件） |
| `node check/test_recolor.js` | 换主色守卫：遍历全部主题，旧色残留必须为 0 |
| `node check/test_theme_coverage.js` | 全组件覆盖：每套主题的每个组件单独渲染，不许空、不许有 `{{` 残留 |
| `node check/test_divider.js` | 分隔线与 END 收尾线的分流规则 |
| `python check/smoke_app.py` | 真实 Chromium 以 `file://` 打开，检查报错、三栏滚动、模块插入、复制链路 |
| `python check/inspect_skeleton.py <html>` | 把成品摊平成模块清单，用于和原成品做 diff |
| `python check/check_published.py <url\|mhtml>` | 发布后体检，退出码 1 = 不干净 |
| `python check/make_placeholders.py` | 重新生成三张占位图 → `engine/placeholders.js` |
| `python check/build_theme_js.py` | 主题 JSON → JS（**改完主题必跑**；模板条件段不成对会拒绝编译） |
| `python check/lint_templates.py` | 模板语法闸门：查 `themes/*.json` + `engine/modules.js` 兜底模板的条件段 |

## 目录

```
gzh-studio/
├─ docs/
│  ├─ 01-需求文档.md                  ← 要做什么、不做什么
│  ├─ 02-技术选型对比.md               ← 5 个方案的完整对比与推荐
│  ├─ 03-微信排版规范与踩坑清单.md      ← ★ 全部血泪教训，改代码前必读
│  ├─ 04-主题开发规范.md               ← 新增一套主题要怎么做
│  ├─ 05-竞品调研-md2wechat.md         ← 对手在卖什么、我们的差异在哪
│  ├─ 06-引擎架构与IR契约.md           ← ★ engine/ 的实现说明书，开工前必读
│  ├─ 07-组件清单-role注册表.md         ← ★ role 权威来源，改组件前必读（§2 数字待修订）
│  └─ 08-两种上手方式.md               ← AI 路径 + 可视化路径，改 UI 前必读
├─ themes/           主题定义（本期先落 blue-editorial）
├─ engine/           渲染引擎（Markdown → 微信 HTML）
│  └─ placeholders.js  ← 由 make_placeholders.py 生成的三张占位图
├─ app/              可视化 Web App（双击 index.html 即用）
├─ check/            本地校验 + 发布后体检 + 资源生成
├─ samples/          示例 md 与输出样例
└─ reference/        历史资产（gzh-design skill 原文与本轮产出） 
```

## 建议阅读顺序

```
第一次接触本项目  →  01 需求  →  02 选型  →  08 上手方式  →  06 架构与 IR 契约
要动手写代码      →  03 踩坑清单（必读）  →  06（对着实现）
要改界面 / 降门槛  →  08 两种上手方式  →  app/index.html
要新增一套主题    →  04 主题规范  →  07 组件清单  →  06 §5 降级链
贴完文章有告警    →  跑 check/check_published.py，别靠猜
```

**`engine/render.js` 的验收标准只有一个：能否逐模块复刻 `samples/输出样例-blue-editorial-无渐变.html`。
比对用 `check/inspect_skeleton.py` 把两边摊平成同一份清单再 diff。**

## 三句话原则

1. **渲染必须确定性**：同一份 Markdown + 同一套主题，永远得到同一个 HTML。不依赖 LLM。
2. **复制链接必须程序化**：一律 `ClipboardItem` 直写原始 HTML，**永远不要让用户手动 Ctrl+A/Ctrl+C**（见 docs/03 第 1 条）。
3. **每篇必体检**：贴完跑 `check/check_published.py`，用数据判断干不干净，不看编辑器的提示条数。

补充一条给实现者的：**IR 里禁止出现任何颜色、字号、终局布局信息** —— 一旦出现，多主题就废了。
这条要在代码 review 时把关（见 06 §1 的分界线）。
