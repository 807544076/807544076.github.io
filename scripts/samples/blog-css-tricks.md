---
title: CSS 毛玻璃效果详解
date: 2026-06-22
tags: [技术, CSS]
type: blog
summary: 本站首屏的毛玻璃卡片就是用这个技术实现的，整理一下相关知识。
---

毛玻璃效果（Glassmorphism）是近几年比较流行的设计风格。

## 核心 CSS 属性

```css
.glass {
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}
```

## 原理

`backdrop-filter` 可以对元素**背后**的内容应用滤镜效果。`blur(20px)` 让背后的内容变得模糊，模拟透过磨砂玻璃看东西的效果。

## 兼容性

`backdrop-filter` 在主流浏览器中都已支持，但 Firefox 需要版本 103+。可以用 `@supports` 做降级：

```css
@supports not (backdrop-filter: blur(20px)) {
  .glass {
    background: rgba(255, 255, 255, 0.9);
  }
}
```

## 移动端注意

毛玻璃在低端移动设备上可能性能不佳。建议在移动端简化或降级效果。
