#!/usr/bin/env python3
"""
Oceanfish 个人站点 — 内容添加工具

从 Markdown 文件自动生成博客文章或项目页面。
自动更新 JSON 索引并生成对应的 HTML 详情页。

用法:
    python scripts/add-content.py path/to/your-file.md

Markdown 文件格式 (YAML front-matter + Markdown 正文):
---
title: 文章标题
date: 2026-07-01
tags: [技术, 生活]
type: blog       # blog 或 project
link: https://...  # 仅 project 类型需要，填 GitHub 链接
---

正文内容，支持标准 Markdown 语法。
"""

import json
import os
import re
import sys
from datetime import date
from html import escape as h
from pathlib import Path


# ── 配置 ──────────────────────────────────────────────
REPO_ROOT = Path(__file__).resolve().parent.parent
BLOG_JSON = REPO_ROOT / "blog" / "posts.json"
PROJECTS_JSON = REPO_ROOT / "projects" / "projects.json"
BLOG_DIR = REPO_ROOT / "blog"
PROJECTS_DIR = REPO_ROOT / "projects"


# ── Markdown → HTML 简易转换 ──────────────────────────

def md_to_html(text):
    """将 Markdown 文本转换为 HTML（支持常用语法）"""
    lines = text.split("\n")
    html_parts = []
    i = 0
    in_code_block = False
    code_buffer = []

    while i < len(lines):
        line = lines[i]

        # 代码块 ```...```
        if line.strip().startswith("```"):
            if in_code_block:
                lang = code_buffer[0] if code_buffer else ""
                code_content = "\n".join(code_buffer[1:]) if lang else "\n".join(code_buffer)
                html_parts.append(f'<pre><code>{h(code_content)}</code></pre>\n')
                code_buffer = []
                in_code_block = False
            else:
                in_code_block = True
                code_buffer = [line.strip()[3:]]  # 语言标记
            i += 1
            continue

        if in_code_block:
            code_buffer.append(line)
            i += 1
            continue

        # 空行
        if not line.strip():
            html_parts.append("\n")
            i += 1
            continue

        # 标题 ## ...
        m = re.match(r'^(#{1,6})\s+(.+)$', line)
        if m:
            level = len(m.group(1))
            html_parts.append(f'<h{level}>{inline_md(m.group(2))}</h{level}>\n')
            i += 1
            continue

        # 无序列表 - 或 *
        if re.match(r'^[\s]*[-*]\s+', line):
            parts = []
            while i < len(lines) and re.match(r'^[\s]*[-*]\s+', lines[i]):
                content = re.sub(r'^[\s]*[-*]\s+', '', lines[i])
                parts.append(f'<li>{inline_md(content)}</li>')
                i += 1
            html_parts.append('<ul>\n' + '\n'.join(parts) + '\n</ul>\n')
            continue

        # 有序列表 1. 2.
        if re.match(r'^\s*\d+\.\s+', line):
            parts = []
            while i < len(lines) and re.match(r'^\s*\d+\.\s+', lines[i]):
                content = re.sub(r'^\s*\d+\.\s+', '', lines[i])
                parts.append(f'<li>{inline_md(content)}</li>')
                i += 1
            html_parts.append('<ol>\n' + '\n'.join(parts) + '\n</ol>\n')
            continue

        # 引用 >
        if line.startswith('>'):
            quote_lines = []
            while i < len(lines) and lines[i].startswith('>'):
                quote_lines.append(inline_md(lines[i][1:].strip()))
                i += 1
            html_parts.append(f'<blockquote><p>{" ".join(quote_lines)}</p></blockquote>\n')
            continue

        # 普通段落（合并连续行）
        para = []
        while i < len(lines) and lines[i].strip() and not lines[i].startswith('#') and not lines[i].startswith('```') and not lines[i].startswith('>') and not re.match(r'^[\s]*[-*]\s+', lines[i]) and not re.match(r'^\s*\d+\.\s+', lines[i]):
            para.append(lines[i].strip())
            i += 1
        if para:
            html_parts.append(f'<p>{inline_md(" ".join(para))}</p>\n')
            continue

        i += 1

    return ''.join(html_parts)


def inline_md(text):
    """处理行内 Markdown：粗体、斜体、行内代码、链接"""
    # 行内代码 `code`
    text = re.sub(r'`([^`]+)`', r'<code>\1</code>', text)
    # 链接 [text](url)
    text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2" target="_blank">\1</a>', text)
    # 粗体 **text**
    text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
    # 斜体 *text*
    text = re.sub(r'(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)', r'<em>\1</em>', text)
    # HTML 转义（已用 code 标签保护的除外）
    return text


# ── Front Matter 解析 ─────────────────────────────────

def parse_front_matter(text):
    """解析 YAML 风格的 front matter"""
    m = re.match(r'^---\s*\n(.*?)\n---\s*\n', text, re.DOTALL)
    if not m:
        return {}, text

    fm_text = m.group(1)
    body = text[m.end():]

    fm = {}
    for line in fm_text.split('\n'):
        line = line.strip()
        if not line:
            continue
        kv = re.match(r'^(\w+):\s*(.+)$', line)
        if kv:
            key = kv.group(1)
            val = kv.group(2).strip()
            # 解析列表 [a, b, c]
            if val.startswith('[') and val.endswith(']'):
                val = [v.strip().strip('"\'') for v in val[1:-1].split(',') if v.strip()]
            # 去除引号
            elif val.startswith('"') and val.endswith('"'):
                val = val[1:-1]
            elif val.startswith("'") and val.endswith("'"):
                val = val[1:-1]
            fm[key] = val

    return fm, body


# ── 内容 ID 生成 ──────────────────────────────────────

def slugify(text):
    """将标题转为文件 ID（保留中文字符）"""
    s = text.strip().lower()
    result = []
    for ch in s:
        if 'a' <= ch <= 'z' or '0' <= ch <= '9' or ch == '-':
            result.append(ch)
        elif ch in '._ ':
            result.append('-')
        elif '一' <= ch <= '鿿':
            result.append(ch)
    slug = ''.join(result)
    slug = re.sub(r'-+', '-', slug)
    return slug.strip('-') or 'untitled'


# ── HTML 详情页模板 ────────────────────────────────────

def render_blog_html(post):
    """生成博客详情页 HTML"""
    return f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{h(post['title'])} — Oceanfish</title>
  <link rel="stylesheet" href="../css/style.css">
  <style>
    .post-page {{ max-width: 720px; margin: 80px auto 40px; padding: 0 20px; }}
    .post-header {{ margin-bottom: 32px; }}
    .post-header h1 {{ font-size: 28px; font-weight: 600; color: var(--color-text); margin-bottom: 8px; }}
    .post-meta {{ font-size: 13px; color: var(--color-text-secondary); }}
    .post-content {{ font-size: 16px; line-height: 1.9; color: var(--color-text); }}
    .post-content p {{ margin-bottom: 20px; }}
    .post-content h2 {{ font-size: 22px; margin: 32px 0 12px; color: var(--color-text); }}
    .post-content h3 {{ font-size: 18px; margin: 24px 0 8px; color: var(--color-text); }}
    .post-content ul, .post-content ol {{ margin-bottom: 20px; padding-left: 24px; }}
    .post-content li {{ margin-bottom: 6px; }}
    .post-content pre {{ background: #f5f5f5; border-radius: 8px; padding: 16px; overflow-x: auto; margin-bottom: 20px; font-size: 14px; }}
    .post-content code {{ font-family: 'SFMono-Regular', Consolas, monospace; font-size: 14px; background: #f0f0f0; padding: 2px 6px; border-radius: 4px; }}
    .post-content pre code {{ background: none; padding: 0; }}
    .post-content blockquote {{ border-left: 3px solid var(--color-primary-light); padding-left: 16px; color: var(--color-text-secondary); margin-bottom: 20px; }}
    .post-content a {{ color: var(--color-accent); text-decoration: underline; }}
    .post-back {{ display: inline-block; margin-top: 40px; color: var(--color-accent); transition: color var(--transition-base); }}
    .post-back:hover {{ color: var(--color-primary); }}
  </style>
</head>
<body>
  <article class="post-page">
    <header class="post-header">
      <h1>{h(post['title'])}</h1>
      <div class="post-meta">{h(post.get('date', ''))}</div>
    </header>
    <div class="post-content">
{post['body']}
    </div>
    <a class="post-back link-underline" href="../index.html">← 返回首页</a>
  </article>
</body>
</html>"""


def render_project_html(project):
    """生成项目详情页 HTML"""
    link_html = ""
    if project.get('link'):
        link_html = f'\n      <a class="project-link" href="{h(project["link"])}" target="_blank">查看源码 →</a>'

    return f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{h(project['name'])} — Oceanfish</title>
  <link rel="stylesheet" href="../css/style.css">
  <style>
    .project-page {{ max-width: 720px; margin: 80px auto 40px; padding: 0 20px; }}
    .project-header {{ margin-bottom: 32px; }}
    .project-header h1 {{ font-size: 28px; font-weight: 600; color: var(--color-text); margin-bottom: 8px; }}
    .project-content {{ font-size: 16px; line-height: 1.9; color: var(--color-text); }}
    .project-content p {{ margin-bottom: 20px; }}
    .project-content h2 {{ font-size: 22px; margin: 32px 0 12px; color: var(--color-text); }}
    .project-content ul {{ margin-bottom: 20px; padding-left: 24px; }}
    .project-content li {{ margin-bottom: 6px; }}
    .project-content pre {{ background: #f5f5f5; border-radius: 8px; padding: 16px; overflow-x: auto; margin-bottom: 20px; font-size: 14px; }}
    .project-content code {{ font-family: 'SFMono-Regular', Consolas, monospace; font-size: 14px; background: #f0f0f0; padding: 2px 6px; border-radius: 4px; }}
    .project-content pre code {{ background: none; padding: 0; }}
    .project-content a {{ color: var(--color-accent); text-decoration: underline; }}
    .project-link {{ display: inline-block; margin-top: 16px; padding: 10px 24px; background: var(--color-primary-pale); border-radius: 8px; color: var(--color-accent); transition: background var(--transition-base); }}
    .project-link:hover {{ background: var(--color-primary-light); }}
    .project-back {{ display: inline-block; margin-top: 32px; color: var(--color-accent); transition: color var(--transition-base); }}
    .project-back:hover {{ color: var(--color-primary); }}
  </style>
</head>
<body>
  <article class="project-page">
    <header class="project-header">
      <h1>{h(project['name'])}</h1>
    </header>
    <div class="project-content">
{project['body']}
      {link_html}
    </div>
    <a class="project-back link-underline" href="../index.html">← 返回首页</a>
  </article>
</body>
</html>"""


# ── JSON 更新 ─────────────────────────────────────────

def load_json(path):
    if path.exists():
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []


def save_json(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write('\n')


# ── 主流程 ────────────────────────────────────────────

def main():
    if len(sys.argv) < 2:
        print("用法: python scripts/add-content.py <markdown文件>")
        print("示例: python scripts/add-content.py 我的新文章.md")
        sys.exit(1)

    md_path = Path(sys.argv[1])
    if not md_path.exists():
        print(f"❌ 文件不存在: {md_path}")
        sys.exit(1)

    # 读取 Markdown
    text = md_path.read_text(encoding='utf-8')
    fm, body = parse_front_matter(text)

    # 校验必要字段
    if 'title' not in fm:
        print("❌ Front matter 缺少 title 字段")
        sys.exit(1)

    content_type = fm.get('type', 'blog')
    if content_type not in ('blog', 'project'):
        print(f"❌ type 必须是 blog 或 project，当前: {content_type}")
        sys.exit(1)

    title = fm['title']
    content_id = fm.get('id') or slugify(title)

    # 补充默认值
    if 'date' not in fm:
        fm['date'] = str(date.today())
    if 'tags' not in fm:
        fm['tags'] = []

    # 转换 Markdown 到 HTML
    body_html = md_to_html(body.strip())

    if content_type == 'blog':
        # 更新 JSON
        posts = load_json(BLOG_JSON)
        # 去重
        posts = [p for p in posts if p.get('id') != content_id]
        posts.append({
            "id": content_id,
            "title": title,
            "summary": fm.get('summary', body.strip()[:100] + '…'),
            "date": fm['date'],
            "tags": fm['tags'],
        })
        # 按日期倒序排列
        posts.sort(key=lambda x: x.get('date', ''), reverse=True)
        save_json(BLOG_JSON, posts)

        # 生成 HTML
        html = render_blog_html({
            'title': title,
            'date': fm['date'],
            'body': body_html,
        })
        out_path = BLOG_DIR / f"{content_id}.html"
        out_path.write_text(html, encoding='utf-8')
        print(f"✅ 博客文章已添加: {title}")
        print(f"   JSON: {BLOG_JSON.relative_to(REPO_ROOT)}")
        print(f"   HTML: {out_path.relative_to(REPO_ROOT)}")

    else:  # project
        projects = load_json(PROJECTS_JSON)
        projects = [p for p in projects if p.get('id') != content_id]
        projects.append({
            "id": content_id,
            "name": title,
            "summary": fm.get('summary', body.strip()[:100] + '…'),
            "link": fm.get('link', ''),
        })
        save_json(PROJECTS_JSON, projects)

        html = render_project_html({
            'name': title,
            'body': body_html,
            'link': fm.get('link', ''),
        })
        out_path = PROJECTS_DIR / f"{content_id}.html"
        out_path.write_text(html, encoding='utf-8')
        print(f"✅ 项目已添加: {title}")
        print(f"   JSON: {PROJECTS_JSON.relative_to(REPO_ROOT)}")
        print(f"   HTML: {out_path.relative_to(REPO_ROOT)}")

    print(f"\n刷新首页后即可看到新内容！")
    print(f"本地预览: cd {REPO_ROOT} && python -m http.server 8000")


if __name__ == '__main__':
    main()
