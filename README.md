# Oceanfish's Site

日系简约风格的个人站点。樱花粒子首屏、毛玻璃卡片、瀑布流博客、隐藏彩蛋。

## 本地预览

```bash
# 方式一：Python（无需安装额外工具）
python -m http.server 8000
# 浏览器打开 http://localhost:8000

# 方式二：VS Code Live Server 插件
# 右键 index.html → Open with Live Server
```

> ⚠️ **注意：** Canvas 粒子效果需要本地 HTTP 服务器才能正常运行。
> 直接双击打开 `index.html`（`file://` 协议）会导致粒子无法渲染。

## 添加内容

使用 `scripts/add-content.py` 工具，从 Markdown 文件自动生成页面：

```bash
# 博客文章
python scripts/add-content.py path/to/article.md

# 项目
python scripts/add-content.py path/to/project.md
```

### Markdown 文件格式

```markdown
---
title: 文章标题
date: 2026-07-01
tags: [技术, 生活]
type: blog       # blog 或 project
id: my-post      # 可选，不指定则从标题自动生成
link: https://... # 仅 project 类型需要
---

正文内容，支持标准 Markdown 语法。
```

支持的 Markdown 语法：
- 标题 `##` `###`
- 粗体 `**text**`、斜体 `*text*`
- 链接 `[text](url)`
- 列表（有序/无序）
- 代码块 ` ``` `
- 行内代码 `` `code` ``
- 引用 `>`

### 直接手动添加

1. 编辑 `blog/posts.json` 或 `projects/projects.json` 添加一条记录
2. 创建对应的 HTML 详情页（参考已有的文件复制修改）

## 项目结构

```
├── index.html              # 首页
├── css/
│   ├── style.css           # 全局样式、CSS变量、午夜模式
│   ├── hero.css            # 首屏样式（粒子、毛玻璃卡片）
│   └── masonry.css         # 内容区样式（瀑布流、项目网格）
├── js/
│   ├── main.js             # 入口调度
│   ├── particles.js        # 樱花粒子引擎
│   ├── masonry.js          # 内容区渲染
│   ├── easter-egg.js       # 彩蛋系统
│   ├── live2d-bridge.js    # Live2D 预留接口
│   └── games.js            # 小游戏预留接口
├── blog/                   # 博客文章
│   ├── posts.json
│   └── *.html
├── projects/               # 项目页
│   ├── projects.json
│   └── *.html
├── pic/                    # 背景图片
├── scripts/
│   ├── add-content.py      # 内容添加工具
│   └── samples/            # 示例 Markdown 文件
└── assets/images/          # 图片资源
```
