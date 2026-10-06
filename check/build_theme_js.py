# -*- coding: utf-8 -*-
'''把 themes/*.json 编译成 file:// 可直接 <script> 加载的 .js 包装器。

为什么需要这一步：
    Chrome 在 file:// 下会拦掉 fetch() 和 ES Module（CORS）。
    而「双击 index.html 就能用」是本项目第一条产品约束。
    所以主题不能运行时去 fetch JSON，必须预先包成普通 script。

代价：JSON 改完要跑一次本脚本。
收益：零构建工具、零 node_modules、断网可用。

用法:
    build_theme_js.py
'''
import glob
import io
import json
import os
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
THEMES = os.path.join(ROOT, 'themes')

# 模板语法闸门（见 check/lint_templates.py —— 规则只在那里实现一次，
# 这里只负责「编译前必须过闸」这一步）
sys.path.insert(0, HERE)
from lint_templates import lint_theme  # noqa: E402


def main():
    os.makedirs(THEMES, exist_ok=True)
    files = sorted(glob.glob(os.path.join(THEMES, '*.json')))
    if not files:
        print('没有找到 themes/*.json')
        return 1

    index = {}
    failed = []
    for path in files:
        with open(path, encoding='utf-8') as f:
            data = json.load(f)

        tid = data.get('id')
        if not tid:
            print(f'跳过 {os.path.basename(path)}：缺少 id 字段')
            continue

        # ---- 语法闸门：不通过就不产出 .js ----
        problems = lint_theme(data)
        if problems:
            print(f'  ✗ {tid}：模板语法有问题，已阻止编译')
            for p in problems:
                print(f'      - {p}')
            failed.append(tid)
            continue

        out = os.path.join(THEMES, tid + '.js')
        payload = json.dumps(data, ensure_ascii=False, indent=2)
        with open(out, 'w', encoding='utf-8') as f:
            f.write('/* 自动生成，请勿手改。源文件：%s.json\n'
                    '   重新生成：python check/build_theme_js.py */\n'
                    % tid)
            f.write('(function(g){\n')
            f.write("  g.GZH_THEMES = g.GZH_THEMES || {};\n")
            f.write("  g.GZH_THEMES['%s'] = " % tid)
            f.write(payload)
            f.write(';\n})(window);\n')

        index[tid] = {
            'name': data.get('name', tid),
            'version': data.get('version', '0.0.0'),
            'variants': list((data.get('variants') or {}).keys()),
        }
        print(f'  ✓ {tid:<18} → {os.path.basename(out)}  ({len(payload)} 字节)')

    order = []
    for tid in index:
        order.append(tid)
    idx = os.path.join(THEMES, 'index.js')
    with open(idx, 'w', encoding='utf-8') as f:
        f.write('/* 自动生成，请勿手改。\n'
                '   重新生成：python check/build_theme_js.py */\n')
        f.write('(function(g){\n')
        f.write('  g.GZH_THEME_ORDER = %s;\n' % json.dumps(order, ensure_ascii=False))
        f.write('})(window);\n')

    print(f'\n主题清单 → themes/index.js  共 {len(index)} 套')
    if failed:
        print(f'⚠️  {len(failed)} 套主题因模板语法问题未编译：{", ".join(failed)}')
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
