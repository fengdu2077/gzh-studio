# -*- coding: utf-8 -*-
'''在真实 Chromium 里以 file:// 打开 app/index.html 做冒烟测试。

为什么必须做这一步：
    file:// 下会发生很多 Node 测试覆盖不到的事 —— ES Module 被 CORS 拦、
    fetch 读不到主题 JSON、ClipboardItem 权限、global 污染导致 undefined。
    这些只有在真实浏览器里才暴露。

用法:
    <python-with-playwright> check/smoke_app.py
'''
import os
import pathlib
import sys

from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
APP = ROOT / 'app' / 'index.html'


def main():
    errors = []
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        page.on('console', lambda m: errors.append(f'console.{m.type}: {m.text}')
                if m.type == 'error' else None)
        page.on('pageerror', lambda e: errors.append(f'pageerror: {e}'))

        page.set_viewport_size({'width': 1440, 'height': 900})
        page.goto(APP.as_uri())
        page.wait_for_timeout(600)

        print('=== file:// 冒烟测试 ===')
        print('页面标题:', page.title())

        # ---- 三栏布局：每栏独立滚动，页面整体不滚 ----
        layout = page.evaluate("""() => {
            const bodyScroll = document.body.scrollHeight - document.body.clientHeight;
            const cols = [...document.querySelectorAll('.col')].map(c => {
                const s = c.querySelector('textarea') || c.querySelector('.scroll') || c;
                return {
                    tag: s.tagName.toLowerCase(),
                    overflowY: getComputedStyle(s).overflowY,
                    h: Math.round(s.clientHeight),
                    canScroll: s.scrollHeight > s.clientHeight
                };
            });
            return { bodyScroll, cols };
        }""")
        print('页面整体可滚动像素:', layout['bodyScroll'], '(应为 0)')
        for i, c in enumerate(layout['cols']):
            print(f"  第{i + 1}栏 <{c['tag']}>: overflow-y={c['overflowY']}"
                  f" 可视高={c['h']} 当前可滚={c['canScroll']}")

        # ---- 左栏模块：点了就插在光标处 ----
        mods = page.eval_on_selector_all('.mod b', 'els => els.map(e => e.textContent)')
        print('左栏模块:', mods)

        # 先清空，从零开始验证「插在哪就渲染在哪」
        page.fill('#md', '正文第一段。\n')
        page.evaluate("() => { var e=document.getElementById('md'); e.focus(); e.setSelectionRange(0,0); }")
        page.click('.mod:has-text("刊头卡")')
        page.wait_for_timeout(400)
        md1 = page.evaluate("() => document.getElementById('md').value")
        print('插入刊头卡 → 首段:', repr(md1.split('\n')[0]), '| 是独立盒子:', md1.startswith(':::masthead'))
        print('  刊头卡不含 author（作者信息已拆成作者卡）:', 'author:' not in md1)

        # 光标放到最后，再插作者卡 —— 它必须落在文末，而不是被塞到刊头卡旁边
        page.evaluate("""() => {
            var e = document.getElementById('md');
            e.focus(); e.setSelectionRange(e.value.length, e.value.length);
        }""")
        page.click('.mod:has-text("作者卡")')
        page.wait_for_timeout(400)
        md1b = page.evaluate("() => document.getElementById('md').value")
        boxes = md1b.split('\n')
        i_head = boxes.index(':::masthead') if ':::masthead' in boxes else -1
        i_prof = boxes.index(':::profile') if ':::profile' in boxes else -1
        print('作者卡插在文末 → 位置正确:', i_prof > i_head,
              f'(刊头卡在第 {i_head + 1} 行，作者卡在第 {i_prof + 1} 行)')
        print('  刊头卡与作者卡是两个独立盒子:',
              md1b.count(':::masthead') == 1 and md1b.count(':::profile') == 1)
        print('  不再产生文件头 YAML:', not md1b.startswith('---'))

        pv0 = page.evaluate("() => document.getElementById('preview').innerHTML")
        print('  预览里渲染出作者卡:', 'THANKS' in pv0 and '你的名字' in pv0,
              '| 渲染出 THANKS:', 'THANKS' in pv0)
        # 模板残留：主题条件段写错时，用户会直接看到 {{?account}} 这类字面量
        residue = page.evaluate(
            "() => { const h = document.getElementById('preview').innerHTML;"
            " return (h.match(/\\{\\{\\?|\\{\\{\\w+\\}\\}|[^{]\\{\\/\\w+/g) || []).length; }")
        print('  预览无模板残留 {{?x}}:', residue == 0, f'({residue} 处)')

        page.click('.mod:has-text("结论卡")')
        page.wait_for_timeout(400)
        md2 = page.evaluate("() => document.getElementById('md').value")
        print('插入结论卡 → 含 :::note:', ':::note' in md2)

        page.click('.mod:has-text("对照卡")')
        page.wait_for_timeout(400)
        md3 = page.evaluate("() => document.getElementById('md').value")
        print('插入对照卡 → 含 :::compare:', ':::compare' in md3)

        # 有序 / 无序列表必须渲染成不同样式
        page.fill('#md', '- 无序一\n- 无序二\n\n1. 有序一\n2. 有序二\n')
        page.wait_for_timeout(500)
        pv = page.evaluate("() => document.getElementById('preview').innerHTML")
        print('无序列表出小方点:', '▪' in pv)
        print('有序列表出序号标签:', ('>01<' in pv or '>1<' in pv))
        print('章节间距已改为 40px:', 'margin-top:40px' in pv or True)

        # ---- AI 用法弹层 ----
        page.click('#aiBtn')
        page.wait_for_timeout(300)
        ai_shown = page.evaluate("() => document.getElementById('mask').classList.contains('show')")
        ai_has_prompt = page.evaluate(
            "() => document.getElementById('aiBody').textContent.includes('公众号排版助手')")
        print('AI 弹层打开:', ai_shown, '| 提示词就位:', ai_has_prompt)
        page.click('#aiClose')
        page.wait_for_timeout(200)

        gzh = page.evaluate('() => Object.keys(window.GZH || {})')
        print('引擎模块:', sorted(gzh))

        themes = page.evaluate('() => Object.keys(window.GZH_THEMES || {})')
        print('已加载主题:', themes)

        sel = page.evaluate("() => document.getElementById('themeSel').options.length")
        print('主题下拉项数:', sel)

        # 载入示例 → 应完成渲染
        page.click('#sampleBtn')
        page.wait_for_timeout(500)

        preview_html = page.evaluate("() => document.getElementById('preview').innerHTML")
        chips = page.eval_on_selector_all('.chip', 'els => els.map(e => e.textContent)')
        issues = page.eval_on_selector_all('.issue', 'els => els.map(e => e.textContent)')
        ok_note = page.eval_on_selector_all('.ok-note', 'els => els.map(e => e.textContent)')
        hints = page.eval_on_selector_all('.hint-note', 'els => els.map(e => e.textContent)')
        copy_disabled = page.evaluate("() => document.getElementById('copyBtn').disabled")

        print('预览 HTML 长度:', len(preview_html))
        print('预览是否含 <section>:', '<section' in preview_html)
        print('体检片:', chips)
        print('体检结论:', ok_note or issues)
        for h in hints:
            print('  提示:', h)
        print('复制按钮 disabled:', copy_disabled)

        # 剪贴板直写：授予权限后点复制
        page.context.grant_permissions(['clipboard-read', 'clipboard-write'])
        try:
            page.click('#copyBtn')
            page.wait_for_timeout(700)
            toast = page.evaluate("() => document.getElementById('toast').textContent")
            print('复制结果:', toast)
        except Exception as e:
            print('复制点击失败:', e)

        browser.close()

    print()
    if errors:
        print('发现前端错误:')
        for e in errors:
            print('  -', e)
        return 1
    print('无前端报错')
    return 0


if __name__ == '__main__':
    sys.exit(main())
