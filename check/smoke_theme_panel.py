# -*- coding: utf-8 -*-
'''配色面板冒烟测试（Playwright）

验证的是一整条闭环，不只是「面板能不能打开」：

    改一个主色 → 阴影/链接/加粗跟着变
              → 导出成主题文件
              → 刷新后还在下拉里（localStorage 持久化）
              → 把这个文件给「另一个人」，他用「导入主题」能直接用

只改主色却能让阴影跟着变，是「主题令牌化」那一步的收益；
这条链路一旦断掉，肉眼很难发现 —— 所以固化成断言。

用法:
    python check/smoke_theme_panel.py
'''
import io
import pathlib
import sys

from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
APP = (ROOT / 'app' / 'index.html').resolve().as_uri()
OUT = ROOT / '_probe_export.js'

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

GREEN = '#16a34a'
BLUE = '#2563eb'
GREEN_RGB = 'rgba(22,163,74'
BLUE_RGB = 'rgba(37,99,235'

fails = []


def check(label, ok, extra=''):
    print(('  ✓ ' if ok else '  ✗ ') + label + (('  ' + extra) if extra else ''))
    if not ok:
        fails.append(label)


def sel_options(pg):
    return pg.eval_on_selector_all('#themeSel option', 'els => els.map(e => e.value)')


with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page()
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(APP)
    pg.wait_for_timeout(700)

    # 内置主题套数（themes/ 下有几套）—— 后面的断言都写相对值，
    # 否则往 themes/ 加一套主题，这个测试就会假失败
    BASE = len(sel_options(pg))
    print('   内置主题 %d 套: %s' % (BASE, sel_options(pg)))

    pg.click('#sampleBtn')
    pg.wait_for_timeout(400)
    before = pg.inner_html('#preview')
    print('① 载入示例，预览', pg.inner_text('#statBytes'))
    print('   改色前：主色 #2563eb ×%d，shadow 蓝 ×%d'
          % (before.count(BLUE), before.count(BLUE_RGB)))

    # ---- 打开面板 ----
    pg.click('#colorBtn')
    pg.wait_for_timeout(300)
    print('② 配色面板')
    check('面板打开', pg.is_visible('#colorMask .modal'))
    n_colors = pg.eval_on_selector_all('.crow input[type=color]', 'els => els.length')
    check('色项数 = 7（只暴露跟主色走的）', n_colors == 7, '实际 %d' % n_colors)

    # ---- 只改一个主色 ----
    pg.eval_on_selector('input[data-k=accent]', """el => {
      el.value = '%s';
      el.dispatchEvent(new Event('input', {bubbles: true}));
    }""" % GREEN)
    pg.wait_for_timeout(400)
    after = pg.inner_html('#preview')
    print('③ 只改「主色」一个值之后')
    check('旧主色不再出现', after.count(BLUE) == 0, '残留 %d' % after.count(BLUE))
    check('新主色已生效', after.count(GREEN) > 0, '出现 %d 次' % after.count(GREEN))
    check('阴影跟着变绿（accentRgb 派生）',
          after.count(GREEN_RGB) > 0 and after.count(BLUE_RGB) == 0,
          '绿 %d / 蓝残留 %d' % (after.count(GREEN_RGB), after.count(BLUE_RGB)))

    # ---- 导出 ----
    with pg.expect_download(timeout=8000) as di:
        pg.click('#colorExport')
    d = di.value
    d.save_as(str(OUT))
    txt = OUT.read_text(encoding='utf-8')
    print('④ 导出')
    check('文件名带 .js', d.suggested_filename.endswith('.js'), d.suggested_filename)
    check('导出内容含新主色', GREEN in txt)
    check('导出内容不含未展开引用', '{{accentRgb}}' in txt or 'accentRgb' not in txt)

    # ---- 就地注册 + 持久化 ----
    print('⑤ 导出后')
    opts = sel_options(pg)
    check('下拉里出现新主题', len(opts) == BASE + 1, str(opts))

    pg.reload()
    pg.wait_for_timeout(800)
    opts2 = sel_options(pg)
    check('刷新后仍在（localStorage 持久化）', len(opts2) == BASE + 1, str(opts2))

    # ---- 朋友侧：拿到文件用「导入主题」打开 ----
    print('⑥ 另一台机器（新页面 = 新的 localStorage）')
    pg2 = b.new_page()
    errs2 = []
    pg2.on('pageerror', lambda e: errs2.append(str(e)))
    pg2.goto(APP)
    pg2.wait_for_timeout(700)
    check('导入前是内置的 %d 套' % BASE, len(sel_options(pg2)) == BASE, str(sel_options(pg2)))

    pg2.set_input_files('#themeFile', str(OUT))
    pg2.wait_for_timeout(700)
    opts3 = sel_options(pg2)
    check('导入后多出 1 套', len(opts3) == BASE + 1, str(opts3))

    pg2.click('#sampleBtn')
    pg2.wait_for_timeout(400)
    html2 = pg2.inner_html('#preview')
    check('导入的主题渲染出绿色', GREEN in html2)

    # ---- 重置 ----
    # reload 之后预览是空的，得先重新载入示例；而且要「先改色再重置」才测得到真东西
    print('⑦ 重置（原主题上改色 → 重置）')
    pg.click('#sampleBtn')
    pg.wait_for_timeout(400)
    pg.select_option('#themeSel', index=0)
    pg.wait_for_timeout(300)
    pg.click('#colorBtn')
    pg.wait_for_timeout(300)
    pg.eval_on_selector('input[data-k=accent]', """el => {
      el.value = '%s';
      el.dispatchEvent(new Event('input', {bubbles: true}));
    }""" % GREEN)
    pg.wait_for_timeout(400)
    changed = pg.inner_html('#preview')
    check('原主题上改色后变绿', GREEN in changed and BLUE not in changed)

    pg.click('#colorReset')
    pg.wait_for_timeout(400)
    back = pg.inner_html('#preview')
    check('重置回原配色', BLUE in back and GREEN not in back)

    check('无前端报错', not errs and not errs2, str(errs + errs2))
    b.close()

OUT.unlink(missing_ok=True)

print()
if fails:
    print('结论: %d 项未通过 ✗ —— %s' % (len(fails), '、'.join(fails)))
    sys.exit(1)
print('结论: 配色面板闭环全部通过 ✓')
