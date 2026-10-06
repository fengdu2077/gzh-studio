# -*- coding: utf-8 -*-
"""生成三张「真实可渲染」的占位图，并编译成 engine/placeholders.js（base64 内联）。

为什么必须是真实图片而不是假 URL（历史教训）：
    微信编辑器遇到加载失败的地址只会显示「图片载入失败」并提供重试，
    没有可点击的替换目标；用户强行替换会破坏外层排版。
    所以占位图必须：真实存在 + 图上直接写明替换方法。

用法:
    python check/make_placeholders.py
产出:
    engine/placeholders.js    内含 GZH.placeholders.{cover,image,video}
"""

import base64
import io
import os
import sys

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONT_DIR = r'C:\Windows\Fonts'
REGULAR = os.path.join(FONT_DIR, 'msyh.ttc')
BOLD = os.path.join(FONT_DIR, 'msyhbd.ttc')

# 主题色（与 themes/blue-editorial.json 的 tokens 保持一致）
BG = (239, 246, 255)      # #eff6ff
BORDER = (147, 197, 253)  # #93c5fd
ACCENT = (37, 99, 235)    # #2563eb
MUTED = (100, 116, 139)   # #64748b
WHITE = (255, 255, 255)


def font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()


def center(draw, cy, text, ft, fill, w):
    """把 text 以垂直中心 cy、水平居中绘制。"""
    draw.text((w / 2, cy), text, font=ft, fill=fill, anchor='mm')


def text_h(ft, text):
    b = ft.getbbox(text)
    return b[3] - b[1]


def text_w(ft, text):
    b = ft.getbbox(text)
    return b[2] - b[0]


def dashed(draw, box, dash=16, gap=11, width=3):
    """画虚线矩形边框（按整段长度均分，避免末尾留小尾巴）。"""
    x0, y0, x1, y1 = box
    for sx, sy, ex, ey in ((x0, y0, x1, y0), (x1, y0, x1, y1),
                           (x1, y1, x0, y1), (x0, y1, x0, y0)):
        length = abs(ex - sx) + abs(ey - sy)
        vertical = (sx == ex)
        step = dash + gap
        # 段数向下取整，再按段数反推步长 → 首尾都落在角上
        n = max(1, int(length // step))
        real_step = length / n
        for i in range(n):
            pos = i * real_step
            end = min(pos + dash, length)
            if end - pos < 4:
                continue
            if vertical:
                y_a = sy + pos if ey > sy else sy - pos
                y_b = sy + end if ey > sy else sy - end
                draw.line((sx, y_a, sx, y_b), fill=BORDER, width=width)
            else:
                x_a = sx + pos if ex > sx else sx - pos
                x_b = sx + end if ex > sx else sx - end
                draw.line((x_a, sy, x_b, sy), fill=BORDER, width=width)


def build(name, size, title, lines, draw_icon, icon_w=150):
    w, h = size
    img = Image.new('RGB', (w, h), BG)
    d = ImageDraw.Draw(img)
    box = (20, 20, w - 21, h - 21)
    dashed(d, box)

    avail_h = (box[3] - box[1]) - 34
    avail_w = w - 2 * 70
    g_icon_title, g_title_line, g_line = 46, 32, 18

    # 超框就整体缩字号（三张画布高宽比差别大，写死字号必有一张翻车）
    ts, ls, iw = 64, 34, icon_w
    for _ in range(20):
        ft_title, ft_line = font(BOLD, ts), font(REGULAR, ls)
        icon_h = iw * 0.72
        title_h = text_h(ft_title, title)
        line_h = max((text_h(ft_line, l) for l in lines), default=0)
        total = (icon_h + g_icon_title + title_h + g_title_line
                 + line_h * len(lines) + g_line * (len(lines) - 1))
        widest = max([text_w(ft_title, title)]
                     + [text_w(ft_line, l) for l in lines])
        if total <= avail_h and widest <= avail_w:
            break
        ts, ls, iw = int(ts * 0.95), int(ls * 0.95), iw * 0.96

    y = (h - total) / 2
    draw_icon(d, (w / 2 - iw / 2, y, w / 2 + iw / 2, y + icon_h))
    y += icon_h + g_icon_title + title_h / 2
    center(d, y, title, ft_title, ACCENT, w)

    y += title_h / 2 + g_title_line + line_h / 2
    for ln in lines:
        center(d, y, ln, ft_line, MUTED, w)
        y += line_h + g_line

    buf = io.BytesIO()
    # 调色板量化，压缩体积
    img.convert('P', palette=Image.ADAPTIVE, colors=64).save(
        buf, format='PNG', optimize=True)
    return img, buf.getvalue()


def _frame(d, box, radius=14, stroke=7):
    x0, y0, x1, y1 = box
    d.rounded_rectangle((x0, y0, x1, y1), radius=radius,
                        outline=ACCENT, width=stroke)
    return x0, y0, x1, y1


def icon_cover(d, box):
    """封面图标：刊头卡结构 —— 顶部实心条 + 下方图片区（山形）"""
    x0, y0, x1, y1 = _frame(d, box)
    w, h = x1 - x0, y1 - y0
    d.rounded_rectangle((x0, y0, x1, y0 + h * 0.30), radius=13, fill=ACCENT)
    d.rectangle((x0, y0 + h * 0.18, x1, y0 + h * 0.32), fill=ACCENT)
    d.polygon([(x0 + w * 0.13, y1 - h * 0.13),
               (x0 + w * 0.40, y0 + h * 0.54),
               (x0 + w * 0.62, y0 + h * 0.80),
               (x0 + w * 0.74, y0 + h * 0.64),
               (x0 + w * 0.88, y1 - h * 0.13)], fill=ACCENT)


def icon_image(d, box):
    """正文图片图标：矩形框 + 山形 + 太阳"""
    x0, y0, x1, y1 = _frame(d, box)
    w, h = x1 - x0, y1 - y0
    m = w * 0.15
    ix0, iy0, ix1, iy1 = x0 + m, y0 + m, x1 - m, y1 - m
    d.polygon([(ix0, iy1), ((ix0 + ix1) / 2, iy0 + (iy1 - iy0) * 0.24),
               (ix1, iy1)], fill=ACCENT)
    r = w * 0.072
    d.ellipse((ix1 - r * 2.1 - w * 0.05, iy0,
               ix1 - w * 0.05, iy0 + r * 2.1), fill=ACCENT)


def icon_video(d, box):
    """视频图标：圆角矩形 + 播放三角"""
    x0, y0, x1, y1 = _frame(d, box)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    s = (y1 - y0) * 0.24
    d.polygon([(cx - s * 0.60, cy - s), (cx - s * 0.60, cy + s),
               (cx + s * 0.95, cy)], fill=ACCENT)


SPECS = [
    ('cover', (1080, 460), '封面图占位 · 请替换本图',
     ['替换成你自己的封面（建议 1080 × 460，约 2.35 : 1）',
      '操作：单击选中本图 → 上传封面覆盖即可'],
     icon_cover, 168),
    ('image', (1080, 720), '正文图片占位 · 请替换本图',
     ['选中本图 → 替换为你的配图',
      '（本图仅用于占位，发布前请务必替换）'],
     icon_image, 186),
    ('video', (1080, 608), '视频占位 · 请替换本图',
     ['公众号不支持直接粘贴视频文件',
      '操作：后台「素材库 → 视频」上传后插入此处',
      '再把这张占位图删掉即可'],
     icon_video, 168),
]


def main():
    if not os.path.exists(REGULAR):
        print('缺少中文字体:', REGULAR)
        sys.exit(1)

    out = {}
    print('生成占位图：')
    for name, size, title, lines, icon_fn, icon_size in SPECS:
        img, data = build(name, size, title, lines, icon_fn, icon_size)
        b64 = base64.b64encode(data).decode('ascii')
        uri = 'data:image/png;base64,' + b64
        w, h = size
        out[name] = {'uri': uri, 'w': w, 'h': h,
                     'ratio': round(h / w, 4), 'bytes': len(data)}
        print(f'  {name:<6} {w}×{h}  ratio={h / w:.4f}  '
              f'PNG {len(data) / 1024:.1f}KB  base64 {len(b64) / 1024:.1f}KB')

    js = ['// 由 check/make_placeholders.py 自动生成，请勿手改。',
          '// 占位图为何必须是真实 base64 图片见该脚本头部注释。',
          '(function (G) {',
          '  G.placeholders = {']
    for name, meta in out.items():
        js.append(f"    {name}: {{")
        js.append(f"      w: {meta['w']}, h: {meta['h']}, ratio: {meta['ratio']},")
        js.append(f"      uri: '{meta['uri']}'")
        js.append('    },')
    js[-1] = js[-1].rstrip(',')
    js += ['  };',
           '',
           '  // 判断一个 src 是否需要回落到占位图。',
           '  // 只认「明确的空/伪地址」，真实 URL 一律放行（避免误判用户自己的图）。',
           '  var FAKE = /^(?:https?:\\/\\/(?:[\\w.-]*\\.)?example\\.(?:com|org)|#|placeholder)$/i;',
           '  G.needPlaceholder = function (src) {',
           '    if (!src) return true;',
           '    var s = String(src).trim();',
           '    return s === "" || s === "#" || FAKE.test(s);',
           '  };',
           '})(window.GZH = window.GZH || {});',
           '']

    target = os.path.join(ROOT, 'engine', 'placeholders.js')
    with open(target, 'w', encoding='utf-8') as f:
        f.write('\n'.join(js))
    total = sum(m['bytes'] for m in out.values())
    print(f'\n已写入 {os.path.relpath(target, ROOT)}'
          f'（{len(out)} 张，源图合计 {total / 1024:.1f}KB）')


if __name__ == '__main__':
    main()
