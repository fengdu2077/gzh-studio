# -*- coding: utf-8 -*-
r'''模板语法闸门 —— 检查所有「{{?x}} … {{/x}}」条件段是否写全。

为什么需要它：
    2026-10-06，作者卡的 tpl 被写成 `{{?account} … {/account}` ——
    端点括号各缺一个。engine/core.js 的 fill() 用的是

        /\{\{\?(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g

    匹配不上就**原样输出**：不报错、不警告，用户看到的是满屏 `{{?account}}`
    直接出现在文章正文里。这类错误渲染器无法自救（它按设计只认识合法语法），
    只能在这里拦。

两个模板来源都要查：
    themes/*.json        → 主题自己的模板（lint_theme）
    engine/modules.js    → 兜底模板 FALLBACK（lint_modules_js）
                          未实现的 role 全靠它出效果，改动频率不比主题低

规则只在这一个文件里实现一次；build_theme_js.py 调它做编译前拦截，
也可以单独跑它自查全项目。

用法:
    python check/lint_templates.py          # 查全部，有问题退出码 1
'''
import glob
import io
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

OPEN = re.compile(r'\{\{\?(\w+)\}\}')                 # 合法开头
CLOSE = re.compile(r'\{\{/(\w+)\}\}')                 # 合法收尾
BAD_OPEN = re.compile(r'\{\{\?(\w+)\}(?!\})')         # {{?x}   少一个 }
BAD_CLOSE = re.compile(r'(?<!\{)\{/(\w+)\}(?!\})')    # {/x}    少一个 {


def lint_template(where, tpl):
    """检查一段模板字符串，返回问题列表（空 = 通过）。"""
    bad = []
    if not isinstance(tpl, str):
        return bad

    for m in BAD_OPEN.finditer(tpl):
        bad.append('%s：开头标签残缺 `{{?%s}`，应为 `{{?%s}}`' % (where, m.group(1), m.group(1)))
    for m in BAD_CLOSE.finditer(tpl):
        bad.append('%s：收尾标签残缺 `{/%s}`，应为 `{{/%s}}`' % (where, m.group(1), m.group(1)))

    opens, closes = OPEN.findall(tpl), CLOSE.findall(tpl)
    for k in sorted(set(opens)):
        n_o, n_c = opens.count(k), closes.count(k)
        if n_o != n_c:
            bad.append('%s：条件段 `%s` 开闭不配对（开 %d / 闭 %d）' % (where, k, n_o, n_c))
    for k in sorted(set(closes) - set(opens)):
        bad.append('%s：条件段 `%s` 有收尾没有开头' % (where, k))
    return bad


def _walk(node, path, out):
    if isinstance(node, dict):
        for k, v in node.items():
            _walk(v, '%s.%s' % (path, k), out)
    elif isinstance(node, str):
        out.extend(lint_template(path, node))


def lint_theme(data):
    """检查一套主题（components 及其它所有字符串字段）。"""
    problems = []
    for cname, comp in (data.get('components') or {}).items():
        _walk(comp, 'components.%s' % cname, problems)
    for k, v in data.items():
        if k != 'components':
            _walk(v, k, problems)
    return problems


# modules.js 里的模板都写成 'tpl': '...' 或 "tpl": "..."，单行字符串
JS_TPL = re.compile(r"""['"]?(?:tpl|itemOrdered|item|subitem)['"]?\s*:\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")""")


def lint_modules_js(path=None):
    """检查 engine/modules.js 里的兜底模板。"""
    path = path or os.path.join(ROOT, 'engine', 'modules.js')
    if not os.path.exists(path):
        return []
    src = io.open(path, encoding='utf-8').read()
    problems = []
    for i, m in enumerate(JS_TPL.finditer(src), 1):
        body = m.group(1) if m.group(1) is not None else m.group(2)
        line = src[:m.start()].count('\n') + 1
        problems.extend(lint_template('engine/modules.js:%d' % line, body))
    return problems


def lint_json_file(path):
    with io.open(path, encoding='utf-8') as f:
        return lint_theme(json.load(f))


def main():
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    total = 0

    print('=== themes/*.json ===')
    for path in sorted(glob.glob(os.path.join(ROOT, 'themes', '*.json'))):
        name = os.path.basename(path)
        problems = lint_json_file(path)
        total += len(problems)
        print('  %s %s' % ('✓' if not problems else '✗', name))
        for p in problems:
            print('      - %s' % p)

    print('=== engine/modules.js（兜底模板）===')
    problems = lint_modules_js()
    total += len(problems)
    print('  %s FALLBACK 模板' % ('✓' if not problems else '✗'))
    for p in problems:
        print('      - %s' % p)

    print()
    if total:
        print('模板语法闸门：不通过，共 %d 个问题' % total)
        return 1
    print('模板语法闸门：通过')
    return 0


if __name__ == '__main__':
    sys.exit(main())
