#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""体检已张贴到公众号的文章：抓取在线页面（或读本地 html/mhtml），报告
① 有没有被浏览器「计算样式」污染（这是「文字对齐异常」的头号元凶）
② text-align 取值分布是否符合配额
③ 渐变配额是否超标

用法:
    check_published.py <url>                 # 抓在线文章
    check_published.py <file.html|mhtml>     # 读本地导出

退出码: 0=干净  1=发现污染
"""
import os
import re
import subprocess
import sys

UA = ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/120.0 Safari/537.36')

HEX = {
    'rgb(37, 99, 235)': '#2563eb', 'rgb(17, 24, 39)': '#111827',
    'rgb(55, 65, 81)': '#374151', 'rgb(156, 163, 175)': '#9ca3af',
    'rgb(239, 246, 255)': '#eff6ff', 'rgb(240, 247, 255)': '#f0f7ff',
    'rgb(219, 234, 254)': '#dbeafe', 'rgb(191, 219, 254)': '#bfdbfe',
    'rgb(255, 255, 255)': '#ffffff', 'rgb(147, 197, 253)': '#93c5fd',
}

VOID = {'img', 'br', 'hr', 'input', 'meta', 'link', 'source', 'col',
        'area', 'base', 'embed', 'param', 'track', 'wbr'}

# 浏览器「计算样式」的指纹：这些属性人不会手写
FINGERPRINT = ['font-variant-ligatures', 'font-variant-caps', 'orphans', 'widows',
               '-webkit-text-stroke-width', 'text-decoration-thickness',
               'word-spacing', 'text-transform', 'text-indent']


def norm(h):
    for k, v in HEX.items():
        h = h.replace(k, v)
    return re.sub(r';\s+', ';', re.sub(r':\s+', ':', h))


def load_mhtml(path):
    import quopri
    raw = open(path, 'rb').read().decode('utf-8', errors='replace')
    parts = []
    for blk in re.split(r'(?m)^------MultipartBoundary', raw)[1:]:
        k = blk.find('quoted-printable')
        if k < 0:
            continue
        j = blk.find('\r\n\r\n', k)
        if j < 0:
            j = blk.find('\n\n', k)
        if j < 0:
            continue
        body = blk[j + 4:]
        tail = re.search(r'(?m)^------MultipartBoundary', body)
        if tail:
            body = body[:tail.start()]
        parts.append(quopri.decodestring(body.encode('utf-8', 'ignore'))
                     .decode('utf-8', errors='replace'))
    return '\n'.join(parts)


def js_content(h):
    i = h.find('id="js_content"')
    if i < 0:
        return h
    start = h.rfind('<div', 0, i + 20)
    tre = re.compile(r'<(/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?(/?)>')
    depth, pos, end = 0, start, None
    while True:
        m = tre.search(h, pos)
        if not m:
            break
        close, tag, sc = m.group(1), m.group(2).lower(), m.group(3)
        if tag in VOID or sc:
            pos = m.end()
            continue
        depth += -1 if close else 1
        pos = m.end()
        if depth == 0:
            end = m.end()
            break
    return h[start:end if end else start + 200000]


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(2)
    target = sys.argv[1]

    if target.startswith('http'):
        html = subprocess.run(['curl', '-sL', '-A', UA, '--max-time', '60', target],
                              capture_output=True).stdout.decode('utf-8', 'replace')
    else:
        html = load_mhtml(target) if target.lower().endswith('.mhtml') \
            else open(target, encoding='utf-8', errors='replace').read()

    body = norm(js_content(html))

    counts = {k: len(re.findall(re.escape(k), body)) for k in FINGERPRINT}
    polluted = sum(counts.values())
    start_ta = len(re.findall(r'text-align:start', body))
    left_ta = len(re.findall(r'text-align:left', body))
    dist = {
        'start': start_ta,
        'justify': len(re.findall(r'text-align:justify', body)),
        'center': len(re.findall(r'text-align:center', body)),
        'left': left_ta,
    }
    grad = len(re.findall('linear-gradient', body))
    grad135 = len(re.findall(r'linear-gradient\(135deg', body))

    print('📋 公众号发布体检:', target[:70])
    print()
    print(f'  正文字节        : {len(body)}')
    print(f'  section         : {len(re.findall("<section", body))}')
    print()
    dirty = False
    if polluted:
        print(f'  ❌ 浏览器计算样式污染 : {polluted} 处')
        for k, v in counts.items():
            if v:
                print(f'        {k:26} x{v}')
        dirty = True
    else:
        print('  ✅ 无浏览器计算样式污染')
    if start_ta:
        print(f'  ❌ text-align:start  : {start_ta} 处（规范 §1.6 禁用值 → 触发「文字对齐异常」）')
        dirty = True
    else:
        print('  ✅ text-align:start  : 0')
    if left_ta:
        print(f'  ⚠  text-align:left   : {left_ta} 处（对照稿为 0，建议去掉）')
    print(f'  text-align 分布: {dist}')
    print(f'  linear-gradient: {grad}  (135deg = {grad135}，配额 2)')
    if grad135 > 2:
        print(f'  ⚠  135deg 卡片底超配额（>2）→ 可能触发 darkmode-no-gradient')
        dirty = True
    print()
    if dirty:
        print('  结论: 不干净。多半是「从渲染页 Ctrl+A/Ctrl+C 复制」导致，'
              '请改用预览页的「复制到公众号」按钮。')
        sys.exit(1)
    print('  结论: ✅ 干净')
    sys.exit(0)


if __name__ == '__main__':
    main()
