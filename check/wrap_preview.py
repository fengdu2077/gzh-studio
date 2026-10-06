#!/usr/bin/env python3
"""把已校验的公众号正文片段（纯 <section>）包成带「复制」按钮的浏览器预览页。

用户打开预览页 → 点右上角「复制到公众号」→ **原始 HTML 被直接写进剪贴板**
（ClipboardItem + Blob，text/html）→ 到公众号编辑器 Ctrl/⌘+V 粘贴即可。

⚠ 为什么不用 selectNodeContents + execCommand('copy')：
那条路等于让浏览器「序列化屏幕上的东西」，Chrome 会把**渲染后的计算样式**整个写进
剪贴板 —— 实测混入 orphans / widows / font-variant-ligatures / text-transform /
word-spacing / -webkit-text-stroke-width / text-decoration-thickness，以及最致命的
**text-align:start**（官方规范 §1.6 明令禁止的取值）。用户粘贴后微信立刻报
「文字对齐异常」。对照一篇已发布的专业文章，这类属性出现 0 次 —— 对方显然是用
程序化写剪贴板的方式发文的。

按钮和 JS 只存在于预览外壳里，**不在 GZH_RAW_HTML 里**，所以粘进公众号的
仍是干净合规的正文，不含 <script>/<button>。校验请对原始 section 文件跑
validate_gzh_html.py（本预览页含 script/style，不参与校验）。

用法:
    wrap_preview.py <section.html> [output.html]
    默认输出 <section去扩展名>_预览.html
"""

import json
import os
import sys


def escape_for_js(s):
    """把 HTML 源码安全地嵌进 <script> 里的 JS 字符串字面量。"""
    lit = json.dumps(s, ensure_ascii=False)
    # 防止内容里的 </script> 提前闭合脚本
    lit = lit.replace('</script', r'<\/script').replace('</SCRIPT', r'<\/SCRIPT')
    return lit


def main():
    if len(sys.argv) < 2:
        print("用法: wrap_preview.py <section.html> [output.html]")
        sys.exit(1)
    src = sys.argv[1]
    if not os.path.isfile(src):
        print(f"✗ 找不到文件: {src}")
        sys.exit(1)

    content = open(src, encoding="utf-8").read().strip()
    tpl_path = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                            "..", "assets", "preview-template.html")
    tpl = open(tpl_path, encoding="utf-8").read()

    title = os.path.splitext(os.path.basename(src))[0]

    # 先注入原始 HTML 字符串（供剪贴板直写），再插入渲染内容（供屏幕显示）。
    # 顺序有讲究：GZH_RAW_HTML 必须插在 <!--GZH_CONTENT--> 之前，
    # 否则渲染内容里的样式会出现在 JS 字符串里。
    out_html = (tpl.replace("{{TITLE}}", title)
                   .replace("/*GZH_RAW_HTML*/\"\"", escape_for_js(content))
                   .replace("<!--GZH_CONTENT-->", content))

    out = sys.argv[2] if len(sys.argv) > 2 else os.path.splitext(src)[0] + "_预览.html"
    open(out, "w", encoding="utf-8").write(out_html)
    print(f"✓ 已生成带「复制」按钮的预览页: {out}")
    print("  用 Chrome/Edge 打开它，点右上角「复制到公众号」，再去公众号编辑器 Ctrl/⌘+V 粘贴。")
    print("  ⚠ 必须用按钮复制。手动 Ctrl+A/Ctrl+C 会让浏览器把计算样式写进去，")
    print("    混入 text-align:start，触发微信「文字对齐异常」。")


if __name__ == "__main__":
    main()
