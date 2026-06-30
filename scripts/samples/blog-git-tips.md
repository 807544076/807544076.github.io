---
title: Git 日常使用小技巧
date: 2026-06-28
tags: [技术]
type: blog
summary: 记录一些平时常用的 Git 操作技巧，方便查阅。
---

日常开发中 Git 是离不开的工具，记录一些常用但容易忘的操作。

## 交互式 rebase

合并多个提交：

```bash
git rebase -i HEAD~3
```

把 `pick` 改成 `squash` 即可合并。

## 快速修复上一次提交

```bash
git commit --amend --no-edit
```

## 查看某个文件的修改历史

```bash
git log -p -- filename
```

## 暂存部分改动

```bash
git add -p
```

可以只暂存文件中的部分改动，而不是整个文件。

## 撤销已推送的提交

```bash
git revert HEAD
```

安全的方式，不会重写历史。
