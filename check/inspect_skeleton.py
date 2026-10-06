# -*- coding: utf-8 -*-
'''从成品 HTML 反推模块骨架，用于校对主题 JSON / IR 契约是否与真实成品一致。

为什么要这个工具：
    engine/render.js 做出来之后，最重要的一件事是「能否逐模块复刻已有成品」。
    本脚本把成品的顶层（或指定层）section 摊平成人能读的清单，方便做差异比对。

用法:
    inspect_skeleton.py <成品.html> [深度]
        深度 = 1（默认）表示「容器」的直接子模块

输出:
    每个模块的 style 摘要 + 纯文本前若干字 + 是否含 img

坑提醒:
    必须自己数 section 的开闭深度。若把 void 元素（img/br/hr 等）算成需要闭合，
    深度会算错，整页会被吞成一个模块 —— 本脚本只统计 section，天然规避。
'''
import io
import re
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

SECTION = re.compile(r'<(/?)(section)\b[^>]*>', re.I)


def children(body):
    """返回 body 中深度为 1 的直接子 section：[(开标签全文, 整块 html)]。"""
    out, depth, anchor = [], 0, None
    for m in SECTION.finditer(body):
        if not m.group(1):                      # 开标签
            if depth == 0:
                anchor = (m.start(), m.group(0))
            depth += 1
        else:                                    # 闭标签
            depth -= 1
            if depth == 0 and anchor:
                out.append((anchor[1], body[anchor[0]:m.end()]))
                anchor = None
    return out


def norm(s):
    return re.sub(r':\s*', ':', re.sub(r'\s+', ' ', s))


def summarize(block):
    txt = re.sub(r'<[^>]+>', '', block)
    txt = re.sub(r'\s+', ' ', txt).strip()
    n_sub = len(re.findall(r'<section', block, re.I)) - 1
    has_img = bool(re.search(r'<img\b', block, re.I))
    return n_sub, has_img, txt


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return 1
    src = sys.argv[1]
    depth = int(sys.argv[2]) if len(sys.argv) > 2 else 1

    html = open(src, encoding='utf-8').read()

    # depth=1 的含义是「容器的直接子模块」，先剥掉最外层 wrapper
    body = html
    for _ in range(depth):
        kids = children(body)
        if len(kids) != 1:
            break
        _, seg = kids[0]
        body = seg[seg.find('>') + 1: seg.rfind('</section>')]

    mods = children(body)
    print(f'来源: {src}')
    print(f'层深: {depth}    模块数: {len(mods)}')
    print()

    for i, (head, block) in enumerate(mods, 1):
        n_sub, has_img, txt = summarize(block)
        print(f'#{i:>2}  子section={n_sub}  img={has_img}')
        print(f'    style: {norm(head)[:190]}')
        print(f'    text : {txt[:110]}')
        print()
    return 0


if __name__ == '__main__':
    sys.exit(main())
