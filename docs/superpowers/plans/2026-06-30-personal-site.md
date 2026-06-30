# Oceanfish 个人站点 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 搭建日系简约风格的纯前端个人 GitHub Pages 站点，含粒子首屏、内容区、彩蛋和预留接口

**Architecture:** 纯静态 HTML/CSS/JS，零构建工具依赖。每个独立功能一个 JS 文件，通过 `main.js` 按优先级协调加载。博客/项目数据使用 JSON 文件驱动，首页渲染时异步请求。

**Tech Stack:** HTML5 / CSS3 (Flexbox, Grid, backdrop-filter, Canvas API) / Vanilla JS (IntersectionObserver, Page Visibility API)

## 全局约束

- 零外部依赖，不使用 npm 包、CDN 库或构建工具
- 所有路径使用相对路径，兼容 GitHub Pages 部署
- 日系简约配色：主背景 `#fef9f5` → `#fce8e0`，樱花粉 `#f2a6a6`，主文字 `#2d2d2d`
- 首屏关键 CSS 内联到 `<head>`，JS 使用 `defer` 或动态加载
- 文件编码 UTF-8（无 BOM），换行符保持项目原有风格
- 每个 JS 文件不依赖其他 JS 文件的全局变量（通过 `main.js` 确定加载顺序）

---

## 文件结构

```
/
├── index.html                     # 首页：首屏(hero) + 内容区(content) + 页脚(footer)
├── css/
│   ├── style.css                  # 全局：reset、CSS 变量、排版、页脚、全局交互
│   ├── hero.css                   # 首屏：全屏布局、毛玻璃卡片、Scroll 提示
│   └── masonry.css                # 内容区：瀑布流卡片、项目网格
├── js/
│   ├── main.js                    # 入口：模块加载调度、IntersectionObserver 懒加载
│   ├── particles.js               # Canvas 樱花粒子引擎
│   ├── masonry.js                 # 内容区渲染：读取 JSON → 生成卡片
│   ├── easter-egg.js              # 彩蛋系统：控制台 + 页面交互
│   ├── live2d-bridge.js           # Live2D 预留接口桩
│   └── games.js                   # 小游戏预留接口桩
├── blog/
│   ├── posts.json                 # 博文元数据 [{id, title, summary, date, tags}]
│   └── hello-world.html           # 示例博文详情页
├── projects/
│   ├── projects.json              # 项目元数据 [{id, name, summary, link}]
│   └── sample-project.html        # 示例项目详情页
└── assets/
    └── images/                    # 图片资源目录（当前为空）
```

---

### Task 1: 项目脚手架 + 全局样式（style.css）

**Files:**
- Create: `css/style.css`
- Modify: `index.html`（替换现有内容）

**Interfaces:**
- Consumes: 无
- Produces: CSS 变量供 `hero.css`、`masonry.css` 使用

- [ ] **Step 1: 创建全局样式表**

```css
/* css/style.css — 全局样式 */

/* === Reset === */
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans SC", sans-serif;
  background: linear-gradient(135deg, #fef9f5 0%, #fce8e0 100%);
  color: #2d2d2d;
  line-height: 1.8;
  min-height: 100vh;
  overflow-x: hidden;
}

a {
  color: inherit;
  text-decoration: none;
}

/* === CSS Variables === */
:root {
  --color-primary: #f2a6a6;
  --color-primary-light: #f2d5d5;
  --color-primary-pale: #fff5f5;
  --color-accent: #e8738a;
  --color-text: #2d2d2d;
  --color-text-secondary: #888888;
  --color-card-bg: rgba(255, 255, 255, 0.6);
  --color-bg-start: #fef9f5;
  --color-bg-end: #fce8e0;
  --shadow-card: 0 4px 20px rgba(0, 0, 0, 0.06);
  --shadow-card-hover: 0 8px 30px rgba(0, 0, 0, 0.12);
  --radius-card: 16px;
  --transition-base: 0.3s ease;
}

/* === Global Interactions === */
.card-hover {
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}
.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card-hover);
}

.click-feedback {
  transition: transform 0.15s ease;
}
.click-feedback:active {
  transform: scale(0.97);
}

.link-underline {
  background: linear-gradient(to right, var(--color-primary), var(--color-primary));
  background-repeat: no-repeat;
  background-size: 0% 2px;
  background-position: left bottom;
  transition: background-size var(--transition-base);
  padding-bottom: 2px;
}
.link-underline:hover {
  background-size: 100% 2px;
}

/* === Footer === */
.site-footer {
  text-align: center;
  padding: 40px 20px;
  color: var(--color-text-secondary);
  font-size: 14px;
}
.site-footer .social-link {
  margin: 0 8px;
  color: var(--color-text-secondary);
  transition: color var(--transition-base);
}
.site-footer .social-link:hover {
  color: var(--color-accent);
}
.site-footer .games-link {
  display: inline-block;
  margin-top: 8px;
  cursor: pointer;
  transition: color var(--transition-base);
}
.site-footer .games-link:hover {
  color: var(--color-accent);
}
```

- [ ] **Step 2: 替换 index.html 为基础骨架**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Oceanfish</title>
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="css/hero.css">
</head>
<body>
  <!-- hero section -->
  <section id="hero"></section>

  <!-- content section -->
  <section id="content"></section>

  <!-- footer -->
  <footer class="site-footer">
    <p>❮ Oceanfish © 2026 ❯</p>
    <div>
      <a class="social-link link-underline" href="https://github.com/oceanfish" target="_blank">GitHub</a>
    </div>
    <span class="games-link" id="gamesLink">🎮 Games</span>
  </footer>

  <script src="js/main.js" defer></script>
</body>
</html>
```

- [ ] **Step 3: 在浏览器中打开确认**

Run: 在浏览器打开项目目录中的 `index.html`
Expected: 白底渐变页面，页脚显示版权信息

- [ ] **Step 4: 提交**

```bash
git add css/style.css index.html
git commit -m "feat: add project scaffold and global styles"
```

---

### Task 2: 首屏 HTML + 样式（hero.css）

**Files:**
- Modify: `index.html`（填充 hero 内容）
- Create: `css/hero.css`

**Interfaces:**
- Consumes: CSS 变量 `--color-card-bg`, `--shadow-card`
- Produces: `#hero` 容器供 `particles.js` 绘制 Canvas

- [ ] **Step 1: 在 index.html 中填充 hero section**

替换 `<!-- hero section -->` 占位为:

```html
<section id="hero">
  <canvas id="particleCanvas"></canvas>
  <div class="hero-overlay"></div>
  <div class="hero-card" id="heroCard">
    <div class="hero-avatar">
      <div class="avatar-placeholder">🐟</div>
    </div>
    <h1 class="hero-name">Oceanfish</h1>
    <p class="hero-bio">一只在海里写代码的鱼</p>
  </div>
  <div class="scroll-hint" id="scrollHint">
    <span>Scroll</span>
    <div class="scroll-arrow">▼</div>
  </div>
</section>
```

- [ ] **Step 2: 创建 hero.css**

```css
/* css/hero.css — 首屏样式 */

#hero {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

#particleCanvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

/* 毛玻璃卡片 */
.hero-card {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 48px 64px;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  transition: transform var(--transition-base), box-shadow var(--transition-base);
  max-width: 420px;
  width: 90%;
}

.hero-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card-hover);
}

/* 头像占位 */
.hero-avatar {
  margin-bottom: 20px;
}

.avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--color-primary-pale);
  border: 2px solid var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  margin: 0 auto;
  transition: transform var(--transition-base);
}

.hero-card:hover .avatar-placeholder {
  transform: scale(1.05);
}

.hero-name {
  font-size: 28px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 8px;
  letter-spacing: 2px;
}

.hero-bio {
  font-size: 15px;
  color: var(--color-text-secondary);
  letter-spacing: 1px;
}

/* Scroll 提示 */
.scroll-hint {
  position: absolute;
  bottom: 40px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: var(--color-text-secondary);
  font-size: 13px;
  cursor: pointer;
  animation: scrollBounce 2s ease-in-out infinite;
  transition: opacity var(--transition-base);
}

.scroll-hint.hidden {
  opacity: 0;
  pointer-events: none;
}

.scroll-arrow {
  font-size: 12px;
  animation: scrollArrow 2s ease-in-out infinite;
}

@keyframes scrollBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(8px); }
}

@keyframes scrollArrow {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}

/* backdrop-filter 降级 */
@supports not (backdrop-filter: blur(20px)) {
  .hero-card {
    background: rgba(255, 255, 255, 0.9);
  }
}
```

- [ ] **Step 3: 在浏览器中查看效果**

Run: 刷新浏览器
Expected: 首屏 100vh 高度，居中显示毛玻璃卡片，底部有跳动 Scroll 提示

- [ ] **Step 4: 提交**

```bash
git add css/hero.css index.html
git commit -m "feat: add hero section with glassmorphism card"
```

---

### Task 3: Canvas 樱花粒子引擎（particles.js）

**Files:**
- Create: `js/particles.js`

**Interfaces:**
- Exports: `ParticleEngine` 全局对象
  - `ParticleEngine.init(canvasEl)` — 初始化引擎
  - `ParticleEngine.start()` — 开始动画循环
  - `ParticleEngine.stop()` — 停止动画循环
  - `ParticleEngine.setBloom(active)` — 彩蛋 A 触发时调用，active=true 粒子×3, 10秒后恢复
  - `ParticleEngine.setMidnight(active)` — 彩蛋 B 触发时调用，切换颜色主题

- [ ] **Step 1: 创建 particles.js**

```javascript
/* js/particles.js — 樱花粒子引擎 */

const ParticleEngine = (() => {
  let canvas, ctx;
  let particles = [];
  let animationId = null;
  let isRunning = false;
  let mouseX = -1000, mouseY = -1000;
  let bloomMultiplier = 1;
  let isMidnight = false;

  // 配置
  const CONFIG = {
    baseCount: 60,
    bloomCount: 180,
    gravity: 0.03,
    windBase: 0.3,
    windVariation: 0.15,
    sizeMin: 6,
    sizeMax: 14,
    rotationSpeed: 0.01,
    swayAmplitude: 0.5,
    swayFrequency: 0.02,
    mouseRadius: 120,
    mouseForce: 2,
  };

  // 樱花花瓣颜色（日间）
  const DAY_COLORS = [
    { fill: '#f2a6a6', stroke: '#e8738a' },
    { fill: '#f2d5d5', stroke: '#e8a0a0' },
    { fill: '#fff5f5', stroke: '#f2d5d5' },
    { fill: '#fce4e4', stroke: '#f2b5b5' },
    { fill: '#ffcdd2', stroke: '#ef9a9a' },
  ];

  // 月光银白颜色（午夜）
  const NIGHT_COLORS = [
    { fill: '#e8eaf6', stroke: '#c5cae9' },
    { fill: '#f3e5f5', stroke: '#ce93d8' },
    { fill: '#e0f2f1', stroke: '#80cbc4' },
    { fill: '#e8eaf6', stroke: '#9fa8da' },
    { fill: '#fce4ec', stroke: '#f48fb1' },
  ];

  function getColors() {
    return isMidnight ? NIGHT_COLORS : DAY_COLORS;
  }

  // 花瓣粒子
  class Petal {
    constructor() {
      this.reset();
    }

    reset() {
      const colors = getColors();
      const color = colors[Math.floor(Math.random() * colors.length)];
      this.x = Math.random() * canvas.width;
      this.y = -20 - Math.random() * 100;
      this.size = CONFIG.sizeMin + Math.random() * (CONFIG.sizeMax - CONFIG.sizeMin);
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * CONFIG.rotationSpeed * 2;
      this.swayOffset = Math.random() * Math.PI * 2;
      this.swaySpeed = CONFIG.swayFrequency * (0.5 + Math.random());
      this.opacity = 0.6 + Math.random() * 0.4;
      this.fillColor = color.fill;
      this.strokeColor = color.stroke;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = CONFIG.gravity * (0.5 + Math.random());
    }

    update() {
      const wind = CONFIG.windBase + Math.sin(Date.now() * 0.001) * CONFIG.windVariation;
      this.vx += (wind - this.vx) * 0.01;
      this.vy += CONFIG.gravity;

      // 鼠标避让
      const dx = this.x - mouseX;
      const dy = this.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < CONFIG.mouseRadius) {
        const force = (CONFIG.mouseRadius - dist) / CONFIG.mouseRadius * CONFIG.mouseForce;
        this.vx += (dx / dist) * force * 0.1;
        this.vy += (dy / dist) * force * 0.1;
      }

      // 摇摆
      this.vx += Math.sin(Date.now() * this.swaySpeed + this.swayOffset) * CONFIG.swayAmplitude * 0.01;

      this.x += this.vx;
      this.y += this.vy;
      this.rotation += this.rotationSpeed;

      // 超出边界重置
      if (this.y > canvas.height + 20 || this.x < -40 || this.x > canvas.width + 40) {
        this.reset();
        this.y = -20 - Math.random() * 50;
        this.x = Math.random() * canvas.width;
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = this.opacity;

      // 绘制花瓣（5个椭圆弧组成花瓣形状）
      ctx.beginPath();
      const s = this.size;
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(s * 0.5, -s * 0.4, s * 0.8, -s * 0.1, s * 0.5, s * 0.3);
      ctx.bezierCurveTo(s * 0.2, s * 0.5, -s * 0.2, s * 0.5, -s * 0.5, s * 0.3);
      ctx.bezierCurveTo(-s * 0.8, -s * 0.1, -s * 0.5, -s * 0.4, 0, 0);

      ctx.fillStyle = this.fillColor;
      ctx.fill();
      ctx.strokeStyle = this.strokeColor;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      ctx.restore();
    }
  }

  function init(canvasEl) {
    canvas = canvasEl;
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);

    // 鼠标追踪
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    });
    canvas.addEventListener('mouseleave', () => {
      mouseX = -1000;
      mouseY = -1000;
    });

    // 移动端触摸
    canvas.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      mouseX = touch.clientX - rect.left;
      mouseY = touch.clientY - rect.top;
    }, { passive: true });
    canvas.addEventListener('touchend', () => {
      mouseX = -1000;
      mouseY = -1000;
    });

    // 初始化粒子池
    const count = Math.floor(CONFIG.baseCount * bloomMultiplier);
    particles = [];
    for (let i = 0; i < count; i++) {
      const p = new Petal();
      // 分散初始位置
      p.y = Math.random() * canvas.height;
      p.x = Math.random() * canvas.width;
      particles.push(p);
    }
  }

  function resize() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function animate() {
    if (!isRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of particles) {
      p.update();
      p.draw(ctx);
    }

    animationId = requestAnimationFrame(animate);
  }

  function start() {
    if (isRunning) return;
    isRunning = true;
    animate();
  }

  function stop() {
    isRunning = false;
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  // 彩蛋 A：樱花绽放
  function setBloom(active) {
    if (active) {
      bloomMultiplier = 3;
      const targetCount = Math.floor(CONFIG.baseCount * 3);
      while (particles.length < targetCount) {
        const p = new Petal();
        p.y = Math.random() * canvas.height;
        particles.push(p);
      }
      // 10 秒后恢复
      setTimeout(() => {
        setBloom(false);
      }, 10000);
    } else {
      bloomMultiplier = 1;
      const targetCount = CONFIG.baseCount;
      while (particles.length > targetCount) {
        particles.pop();
      }
    }
  }

  // 彩蛋 B：午夜模式
  function setMidnight(active) {
    isMidnight = active;
    // 重置所有花瓣颜色
    for (const p of particles) {
      const colors = getColors();
      const color = colors[Math.floor(Math.random() * colors.length)];
      p.fillColor = color.fill;
      p.strokeColor = color.stroke;
    }
  }

  return { init, start, stop, setBloom, setMidnight };
})();
```

- [ ] **Step 2: 创建局部测试页面验证粒子效果**

创建一个临时测试 HTML 文件（仅用于验证，不提交），在该页面引用 `particles.js` 并调用 `ParticleEngine.init()` / `start()`，确认在浏览器中可以看到樱花粒子飘落

```bash
# 验证方式：手动创建测试页，确认 Canvas 渲染正常后删除
```

- [ ] **Step 3: 提交**

```bash
git add js/particles.js
git commit -m "feat: add sakura particle engine"
```

---

### Task 4: 主 JS 入口（main.js）

**Files:**
- Create: `js/main.js`
- Modify: `index.html`（加载 particles.js）

**Interfaces:**
- Consumes: `ParticleEngine`（来自 particles.js）、`EasterEggs`（来自 easter-egg.js，后续任务）
- Produces: 页面加载顺序和模块初始化调度

- [ ] **Step 1: 创建 main.js**

```javascript
/* js/main.js — 页面入口与模块调度 */

(function() {
  'use strict';

  let modulesLoaded = 0;
  const totalModules = 2; // particles, easter-egg (masonry 按需加载)

  // 延迟加载脚本
  function loadScript(src, callback) {
    const script = document.createElement('script');
    script.src = src;
    script.onload = callback;
    script.onerror = () => console.error(`Failed to load: ${src}`);
    document.body.appendChild(script);
  }

  // 所有模块准备就绪
  function onReady() {
    modulesLoaded++;
    if (modulesLoaded >= totalModules) {
      initHero();
      initEasterEggs();
      initContentLazy();
    }
  }

  // 初始化首屏
  function initHero() {
    const canvas = document.getElementById('particleCanvas');
    if (canvas && window.ParticleEngine) {
      ParticleEngine.init(canvas);

      // 页面加载后 200ms 启动粒子（确保首屏渲染完成）
      setTimeout(() => {
        ParticleEngine.start();
      }, 200);
    }

    // Scroll 提示点击
    const scrollHint = document.getElementById('scrollHint');
    if (scrollHint) {
      scrollHint.addEventListener('click', () => {
        document.getElementById('content')?.scrollIntoView({ behavior: 'smooth' });
        scrollHint.classList.add('hidden');
      });

      // 用户主动滚动到底部区域时隐藏提示
      const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            scrollHint.classList.add('hidden');
            observer.disconnect();
          }
        }
      }, { threshold: 0.1 });
      const content = document.getElementById('content');
      if (content) observer.observe(content);
    }
  }

  // 初始化彩蛋
  function initEasterEggs() {
    if (window.EasterEggs) {
      EasterEggs.init();
    }
  }

  // 惰性加载内容区和 masonry.js
  function initContentLazy() {
    const content = document.getElementById('content');
    if (!content) return;

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          loadScript('js/masonry.js', () => {
            loadCSS('css/masonry.css');
            if (window.ContentArea) {
              ContentArea.render();
            }
          });
          observer.disconnect();
        }
      }
    }, { threshold: 0.05 });

    observer.observe(content);
  }

  // 动态加载 CSS
  function loadCSS(href) {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  // 页面完全加载后加载次要模块
  window.addEventListener('load', () => {
    // 3 秒后加载彩蛋模块
    setTimeout(() => {
      loadScript('js/easter-egg.js', onReady);
    }, 3000);

    // 预留接口即时加载（无副作用）
    loadScript('js/live2d-bridge.js');
    loadScript('js/games.js');

    // particles.js 需要提前加载（在 main.js 之前），算作已就绪
    onReady();
  });

  // 页面不可见时暂停粒子
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (window.ParticleEngine) ParticleEngine.stop();
    } else {
      if (window.ParticleEngine) ParticleEngine.start();
    }
  });
})();
```

- [ ] **Step 2: 更新 index.html 加载顺序**

在 `</body>` 前依次加载:

```html
<script src="js/particles.js"></script>
<script src="js/main.js" defer></script>
```

注意：`particles.js` 不能使用 `defer`（它必须在 `main.js` 之前执行），`main.js` 使用 `defer` 确保在 DOM 解析后执行。

- [ ] **Step 3: 浏览器验证**

Run: 刷新浏览器
Expected:
- 首屏出现 Canvas 樱花粒子飘落
- Scroll 提示可点击，点击后页面滚动到内容区
- 切换浏览器标签页再切回，粒子暂停/恢复

- [ ] **Step 4: 提交**

```bash
git add js/main.js index.html
git commit -m "feat: add main entry with loading orchestration"
```

---

### Task 5: 内容区（masonry.css + masonry.js + 数据文件）

**Files:**
- Create: `css/masonry.css`
- Create: `js/masonry.js`
- Create: `blog/posts.json`
- Create: `projects/projects.json`
- Modify: `index.html`（填充 content section）

**Interfaces:**
- Exports: `ContentArea` 全局对象
  - `ContentArea.render()` — 渲染博客区和项目区
- Consumes: `blog/posts.json`, `projects/projects.json`

- [ ] **Step 1: 在 index.html 中填充 content section**

替换 `<!-- content section -->` 占位为:

```html
<section id="content">
  <!-- 博客区 -->
  <div class="content-section">
    <h2 class="section-title">📝 博客</h2>
    <div class="masonry-grid" id="blogGrid"></div>
  </div>

  <hr class="section-divider">

  <!-- 项目区 -->
  <div class="content-section">
    <h2 class="section-title">💻 项目</h2>
    <div class="project-grid" id="projectGrid"></div>
  </div>
</section>
```

- [ ] **Step 2: 创建 masonry.css**

```css
/* css/masonry.css — 内容区样式 */

#content {
  padding: 60px 20px 40px;
  max-width: 1100px;
  margin: 0 auto;
  min-height: 100vh;
}

.content-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 22px;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 24px;
  letter-spacing: 1px;
  padding-left: 4px;
  border-left: 3px solid var(--color-primary);
  padding-left: 12px;
}

.section-divider {
  border: none;
  height: 1px;
  background: linear-gradient(to right, transparent, var(--color-primary-light), transparent);
  margin: 40px 0;
}

/* === 博客瀑布流 === */
.masonry-grid {
  column-count: 3;
  column-gap: 20px;
}

.masonry-item {
  break-inside: avoid;
  margin-bottom: 20px;
  background: white;
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  cursor: pointer;
  transition: transform var(--transition-base), box-shadow var(--transition-base);
  padding: 20px;
}

.masonry-item:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card-hover);
}

.masonry-item:active {
  transform: scale(0.97);
}

.masonry-item .card-tag {
  display: inline-block;
  font-size: 11px;
  padding: 2px 10px;
  border-radius: 20px;
  background: var(--color-primary-pale);
  color: var(--color-accent);
  margin-bottom: 8px;
  letter-spacing: 0.5px;
}

.masonry-item .card-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 6px;
  line-height: 1.4;
}

.masonry-item .card-summary {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: 10px;
}

.masonry-item .card-date {
  font-size: 12px;
  color: #aaa;
}

/* 项目网格 */
.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.project-item {
  background: white;
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  cursor: pointer;
  transition: transform var(--transition-base), box-shadow var(--transition-base);
  padding: 24px;
}

.project-item:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card-hover);
}

.project-item:active {
  transform: scale(0.97);
}

.project-item .card-tag {
  display: inline-block;
  font-size: 11px;
  padding: 2px 10px;
  border-radius: 20px;
  background: #e8f5e9;
  color: #4caf50;
  margin-bottom: 8px;
}

.project-item .project-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 6px;
}

.project-item .project-summary {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: 12px;
}

.project-item .project-link {
  font-size: 13px;
  color: var(--color-accent);
  transition: color var(--transition-base);
}

.project-item .project-link:hover {
  color: var(--color-primary);
}

/* === 移动端适配 === */
@media (max-width: 768px) {
  .masonry-grid {
    column-count: 2;
  }
  .project-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .masonry-grid {
    column-count: 1;
  }
  #content {
    padding: 30px 16px 20px;
  }
}
```

- [ ] **Step 3: 创建 masonry.js**

```javascript
/* js/masonry.js — 内容区渲染 */

const ContentArea = (() => {
  async function render() {
    await Promise.all([renderBlog(), renderProjects()]);
  }

  async function renderBlog() {
    const grid = document.getElementById('blogGrid');
    if (!grid) return;

    try {
      const res = await fetch('blog/posts.json');
      const posts = await res.json();
      grid.innerHTML = posts.map(post => `
        <div class="masonry-item" onclick="location.href='blog/${post.id}.html'">
          <span class="card-tag">📝 Blog</span>
          <h3 class="card-title">${post.title}</h3>
          <p class="card-summary">${post.summary}</p>
          <div class="card-date">${post.date}</div>
        </div>
      `).join('');
    } catch (err) {
      grid.innerHTML = '<p style="color: #888">暂无博客内容</p>';
    }
  }

  async function renderProjects() {
    const grid = document.getElementById('projectGrid');
    if (!grid) return;

    try {
      const res = await fetch('projects/projects.json');
      const projects = await res.json();
      grid.innerHTML = projects.map(p => `
        <div class="project-item" onclick="location.href='projects/${p.id}.html'">
          <span class="card-tag">💻 Project</span>
          <h3 class="project-name">${p.name}</h3>
          <p class="project-summary">${p.summary}</p>
          ${p.link ? `<a class="project-link" href="${p.link}" target="_blank" onclick="event.stopPropagation()">GitHub →</a>` : ''}
        </div>
      `).join('');
    } catch (err) {
      grid.innerHTML = '<p style="color: #888">暂无项目内容</p>';
    }
  }

  return { render };
})();
```

- [ ] **Step 4: 创建示例数据文件**

`blog/posts.json`:
```json
[
  {
    "id": "hello-world",
    "title": "你好，世界",
    "summary": "这是我的第一篇博客。建站过程记录和一些想说的话。这里是占位内容，后续会替换为正式文章。",
    "date": "2026-06-30",
    "tags": ["杂谈"]
  }
]
```

`projects/projects.json`:
```json
[
  {
    "id": "sample-project",
    "name": "807544076.github.io",
    "summary": "我的个人站点——就是你正在看的这个。日系简约设计、樱花粒子背景、隐藏彩蛋。",
    "link": "https://github.com/807544076/807544076.github.io"
  }
]
```

- [ ] **Step 5: 浏览器验证**

Run: 刷新浏览器，滚动到内容区
Expected: 内容区自动渲染出博客卡片和项目卡片，点击卡片分别跳转

- [ ] **Step 6: 提交**

```bash
git add css/masonry.css js/masonry.js blog/posts.json projects/projects.json index.html
git commit -m "feat: add content area with masonry layout and sample data"
```

---

### Task 6: 彩蛋系统（easter-egg.js）

**Files:**
- Create: `js/easter-egg.js`

**Interfaces:**
- Exports: `EasterEggs` 全局对象
  - `EasterEggs.init()` — 注册所有彩蛋监听
  - `EasterEggs.triggerSecret(msg)` — 彩蛋 C：显示隐藏留言浮层
- Consumes: `ParticleEngine.setBloom()`, `ParticleEngine.setMidnight()`

- [ ] **Step 1: 创建 easter-egg.js**

```javascript
/* js/easter-egg.js — 彩蛋系统 */

const EasterEggs = (() => {
  let clickCount = 0;
  let clickTimer = null;
  let secretMessage = '🐟 这里有一条来自 Oceanfish 的秘密消息。';

  function init() {
    consoleEgg();
    clickEgg();
    midnightEgg();
    registerSecretCommand();
  }

  /* === 彩蛋 1: 控制台输出 === */
  function consoleEgg() {
    const art = `
%c                                               %c
%c   ____                      __ _    _     _   %c
%c  / __ \\                    / _| |  | |   | |  %c
%c | |  | | ___  ___  ___    | |_| |__| |__ | |_ %c
%c | |  | |/ _ \\ / __|/ _ \\  |  _|  __| '_ \\| __|%c
%c | |__| | (_) |\\__ \\  __/  | | | |  | | | | |_ %c
%c  \\____/ \\___/|___/\\___|  |_| |_|  |_| |_|\\__|%c
%c                                               %c
    `;

    const styles = [
      'color: #f2a6a6; font-size: 12px;',
      '',
      'color: #e8738a; font-size: 13px; font-weight: bold;',
      '',
      'color: #f2a6a6; font-size: 13px;',
      '',
      'color: #e8738a; font-size: 13px;',
      '',
      'color: #f2a6a6; font-size: 13px;',
      '',
      'color: #e8738a; font-size: 13px;',
      '',
      'color: #f2a6a6; font-size: 13px;',
      '',
      'color: #888; font-size: 11px;',
    ];

    console.log(art, ...styles);
    console.log('%c👋 嘿，你找到隐藏入口了！\n%c提示：试试在页面空白处快速点击几次？\n%c或者，也许深夜再来看看？', 'color: #e8738a; font-size: 14px;', 'color: #888; font-size: 12px;', 'color: #888; font-size: 12px;');
  }

  /* === 彩蛋 2: 樱花绽放（连续点击）=== */
  function clickEgg() {
    document.addEventListener('click', (e) => {
      // 忽略卡片和链接点击
      if (e.target.closest('.hero-card') || e.target.closest('a') || e.target.closest('.masonry-item') || e.target.closest('.project-item')) {
        return;
      }

      clickCount++;
      clearTimeout(clickTimer);

      if (clickCount >= 5) {
        clickCount = 0;
        if (window.ParticleEngine) {
          ParticleEngine.setBloom(true);
        }
        return;
      }

      // 5 秒内未达成重置计数
      clickTimer = setTimeout(() => {
        clickCount = 0;
      }, 5000);
    });
  }

  /* === 彩蛋 3: 午夜模式 === */
  function midnightEgg() {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 1) {
      document.body.classList.add('midnight-mode');
      if (window.ParticleEngine) {
        ParticleEngine.setMidnight(true);
      }
    }
  }

  /* === 彩蛋 4: 隐藏留言 === */
  function registerSecretCommand() {
    window.oceanfish = {
      secret: function(msg) {
        triggerSecret(msg);
      }
    };
  }

  function triggerSecret(msg) {
    if (msg) secretMessage = msg;

    // 创建浮层
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.5s ease;
    `;

    const box = document.createElement('div');
    box.style.cssText = `
      background: white;
      border-radius: 16px;
      padding: 40px 48px;
      max-width: 420px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
      transform: scale(0.9);
      transition: transform 0.4s ease;
      color: #2d2d2d;
      font-size: 16px;
      line-height: 1.8;
    `;
    box.textContent = secretMessage;

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    // 触发入场动画
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      box.style.transform = 'scale(1)';
    });

    // 5 秒后淡出
    setTimeout(() => {
      overlay.style.opacity = '0';
      box.style.transform = 'scale(0.9)';
      setTimeout(() => overlay.remove(), 500);
    }, 5000);

    // 点击可提前关闭
    overlay.addEventListener('click', () => {
      overlay.style.opacity = '0';
      box.style.transform = 'scale(0.9)';
      setTimeout(() => overlay.remove(), 500);
    });
  }

  return { init, triggerSecret };
})();
```

- [ ] **Step 2: 创建午夜模式附加样式**

在 `style.css` 末尾追加午夜模式样式:

```css
/* 午夜模式 */
body.midnight-mode {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: #e0e0e0;
}

body.midnight-mode .hero-card {
  background: rgba(30, 30, 60, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 4px 30px rgba(100, 100, 200, 0.1);
}

body.midnight-mode .hero-name {
  color: #e8eaf6;
}

body.midnight-mode .hero-bio {
  color: #9fa8da;
}

body.midnight-mode .scroll-hint {
  color: #9fa8da;
}

body.midnight-mode .masonry-item,
body.midnight-mode .project-item {
  background: rgba(40, 40, 70, 0.8);
  color: #e0e0e0;
  box-shadow: 0 4px 20px rgba(100, 100, 200, 0.08);
}

body.midnight-mode .masonry-item .card-title,
body.midnight-mode .project-item .project-name {
  color: #e8eaf6;
}

body.midnight-mode .masonry-item .card-summary,
body.midnight-mode .project-item .project-summary {
  color: #9fa8da;
}

body.midnight-mode .section-title {
  color: #e8eaf6;
  border-left-color: #7c4dff;
}

body.midnight-mode .site-footer {
  color: #9fa8da;
}
```

- [ ] **Step 3: 浏览器验证**

Run: 刷新浏览器
Expected:
- 打开 DevTools Console，出现彩色 ASCII Art + 线索文字
- 在页面空白处快速点击 5 次，樱花粒子数量暴增 3 倍，10 秒后恢复
- 在 Console 输入 `oceanfish.secret()`，弹出浮层显示隐藏消息
- 午夜模式：手动将系统时间调至 0:00~1:00 后刷新，页面变为深色调

- [ ] **Step 4: 提交**

```bash
git add js/easter-egg.js css/style.css
git commit -m "feat: add easter egg system (console, sakura burst, midnight, secret)"
```

---

### Task 7: 预留接口（live2d-bridge.js + games.js）

**Files:**
- Create: `js/live2d-bridge.js`
- Create: `js/games.js`
- Modify: `index.html`（页脚增加 games 入口交互）

**Interfaces:**
- Exports: `window.Live2D` — Live2D 预留对象
- Exports: `window.Games` — 小游戏预留对象

- [ ] **Step 1: 创建 live2d-bridge.js**

```javascript
/* js/live2d-bridge.js — Live2D 预留接口 */
/* 后期对接 Cubism SDK 时在以下方法中填入实现 */

window.Live2D = {
  _ready: false,

  /** 初始化看板娘（后期加载模型并定位右下角） */
  init() {
    // TODO: 加载 Cubism SDK，创建模型实例
    console.log('[Live2D] 预留接口 — 等待实现');
  },

  /** 响应页面事件（滚动、点击、区块切换） */
  react(event, data) {
    // TODO: 根据事件类型触发对应动作
    // event: 'scroll' | 'click-hero' | 'section-change' | 'egg-triggered'
  },

  /** 显示看板娘 */
  show() {},

  /** 隐藏看板娘 */
  hide() {},

  /** 切换模型 */
  setModel(path) {},
};
```

- [ ] **Step 2: 创建 games.js**

```javascript
/* js/games.js — 小游戏预留入口框架 */

window.Games = {
  list: [],

  /** 注册一个新游戏 */
  register(game) {
    this.list.push(game);
    // game: { id, name, icon, init, render }
  },

  /** 启动指定游戏 */
  launch(id) {
    const game = this.list.find(g => g.id === id);
    if (game) {
      game.init();
    } else {
      this.showComingSoon();
    }
  },

  showComingSoon() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0,0,0,0.3);
      display: flex; align-items: center; justify-content: center;
      z-index: 9999; opacity: 0;
      transition: opacity 0.4s ease;
    `;

    const box = document.createElement('div');
    box.style.cssText = `
      background: white; border-radius: 16px;
      padding: 48px; text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
      transform: scale(0.9);
      transition: transform 0.4s ease;
    `;
    box.innerHTML = '<div style="font-size: 48px; margin-bottom: 12px;">🎮</div><p style="font-size: 18px; color: #888;">正在建设中…</p><p style="font-size: 13px; color: #aaa; margin-top: 8px;">敬请期待</p>';

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      box.style.transform = 'scale(1)';
    });

    overlay.addEventListener('click', () => {
      overlay.style.opacity = '0';
      box.style.transform = 'scale(0.9)';
      setTimeout(() => overlay.remove(), 400);
    });
  },
};
```

- [ ] **Step 3: 在 index.html 中添加 games 入口交互**

在页脚的 "🎮 Games" 元素上添加点击事件处理:

```html
<span class="games-link" id="gamesLink" onclick="if(window.Games) Games.launch()">🎮 Games</span>
```

- [ ] **Step 4: 浏览器验证**

Run: 刷新浏览器，在 Console 输入 `Live2D` 和 `Games` 确认对象存在；点击页脚 "🎮 Games" 弹出 "Coming Soon" 浮层

- [ ] **Step 5: 提交**

```bash
git add js/live2d-bridge.js js/games.js index.html
git commit -m "feat: add placeholder interfaces for Live2D and games"
```

---

### Task 8: 示例详情页

**Files:**
- Create: `blog/hello-world.html`
- Create: `projects/sample-project.html`

- [ ] **Step 1: 创建示例博文详情页**

`blog/hello-world.html`:
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>你好，世界 — Oceanfish</title>
  <link rel="stylesheet" href="../css/style.css">
  <style>
    .post-page {
      max-width: 720px;
      margin: 80px auto 40px;
      padding: 0 20px;
    }
    .post-header {
      margin-bottom: 32px;
    }
    .post-header h1 {
      font-size: 28px;
      font-weight: 600;
      color: var(--color-text);
      margin-bottom: 8px;
    }
    .post-meta {
      font-size: 13px;
      color: var(--color-text-secondary);
    }
    .post-content {
      font-size: 16px;
      line-height: 1.9;
      color: var(--color-text);
    }
    .post-content p {
      margin-bottom: 20px;
    }
    .post-back {
      display: inline-block;
      margin-top: 40px;
      color: var(--color-accent);
      transition: color var(--transition-base);
    }
    .post-back:hover {
      color: var(--color-primary);
    }
  </style>
</head>
<body>
  <article class="post-page">
    <header class="post-header">
      <h1>你好，世界</h1>
      <div class="post-meta">2026-06-30</div>
    </header>
    <div class="post-content">
      <p>这是我的个人站点第一篇文章。</p>
      <p>站点使用纯 HTML/CSS/JS 构建，零依赖部署在 GitHub Pages 上。从设计到实现，从樱花粒子到隐藏彩蛋，每行代码都是亲手写的。</p>
      <p>这里后续会记录一些技术笔记、项目复盘和日常随笔。感谢来访。</p>
    </div>
    <a class="post-back link-underline" href="../index.html">← 返回首页</a>
  </article>
</body>
</html>
```

- [ ] **Step 2: 创建示例项目详情页**

`projects/sample-project.html`:
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>807544076.github.io — Oceanfish</title>
  <link rel="stylesheet" href="../css/style.css">
  <style>
    .project-page {
      max-width: 720px;
      margin: 80px auto 40px;
      padding: 0 20px;
    }
    .project-header {
      margin-bottom: 32px;
    }
    .project-header h1 {
      font-size: 28px;
      font-weight: 600;
      color: var(--color-text);
      margin-bottom: 8px;
    }
    .project-content {
      font-size: 16px;
      line-height: 1.9;
      color: var(--color-text);
    }
    .project-content p {
      margin-bottom: 20px;
    }
    .project-link {
      display: inline-block;
      margin-top: 16px;
      padding: 10px 24px;
      background: var(--color-primary-pale);
      border-radius: 8px;
      color: var(--color-accent);
      transition: background var(--transition-base);
    }
    .project-link:hover {
      background: var(--color-primary-light);
    }
    .project-back {
      display: inline-block;
      margin-top: 32px;
      color: var(--color-accent);
      transition: color var(--transition-base);
    }
    .project-back:hover {
      color: var(--color-primary);
    }
  </style>
</head>
<body>
  <article class="project-page">
    <header class="project-header">
      <h1>807544076.github.io</h1>
    </header>
    <div class="project-content">
      <p>这是 Oceanfish 的个人站点，也是你正在浏览的这个网站。</p>
      <p>日系简约设计风格，全屏樱花粒子背景，毛玻璃个人卡片，瀑布流博客区，还有暗藏在页面各处的彩蛋。站点预留了 Live2D 看板娘和小游戏的扩展接口。</p>
      <p>纯前端实现，零外部依赖，部署在 GitHub Pages。</p>
      <a class="project-link" href="https://github.com/807544076/807544076.github.io" target="_blank">查看源码 →</a>
    </div>
    <a class="project-back link-underline" href="../index.html">← 返回首页</a>
  </article>
</body>
</html>
```

- [ ] **Step 3: 浏览器验证**

Run: 刷新首页，点击博客卡片跳转到详情页，确认返回链接正常

- [ ] **Step 4: 提交**

```bash
git add blog/hello-world.html projects/sample-project.html
git commit -m "feat: add sample blog and project pages"
```

---

### Task 9: 最终整合与查漏补缺

**Files:**
- Modify: 所有已创建文件（视需要调整）

- [ ] **Step 1: 全面验收检查清单**

在浏览器中逐项验证:

- [ ] 首屏：Canvas 樱花粒子正常飘落
- [ ] 首屏：毛玻璃卡片居中显示、hover 上浮
- [ ] 首屏：Scroll 提示跳动、点击后平滑滚动到内容区
- [ ] 首屏：切换标签页粒子暂停/恢复
- [ ] 内容区：滚动到内容区时瀑布流延迟加载渲染
- [ ] 内容区：博客卡片正确显示标题、摘要、日期
- [ ] 内容区：项目卡片正确显示名称、描述、GitHub 链接
- [ ] 内容区：点击博客卡片跳转到详情页
- [ ] 内容区：点击项目卡片跳转到项目页
- [ ] 彩蛋：Console 输出 ASCII Art
- [ ] 彩蛋：页面空白处快速点击 5 次触发樱花暴增
- [ ] 彩蛋：输入 `oceanfish.secret()` 弹出隐藏留言
- [ ] 预留：`Games.launch()` 弹出 "Coming Soon" 浮层
- [ ] 预留：`Live2D` 对象存在于全局
- [ ] 页脚：版权、GitHub 链接、Games 入口正常
- [ ] 移动端：视口缩小后布局自适应（单列瀑布流）
- [ ] 午夜模式：调整系统时间至凌晨后刷新，页面切换为深色（可选验证）

- [ ] **Step 2: 修复发现的问题**

在此步骤中修复 Step 1 检查中发现的任何问题（样式偏移、交互不响应、加载失败等）

- [ ] **Step 3: 最终提交**

```bash
git add -A
git commit -m "chore: final integration and polish"
```

---

## 自检清单

**1. Spec 覆盖：** 每个设计需求是否能指向一个或多个实施任务？

| 设计需求 | 对应任务 |
|---------|---------|
| 首屏粒子背景 + 毛玻璃卡片 | Task 2, Task 3 |
| 内容区瀑布流（博客）+ 网格（项目） | Task 5 |
| 控制台 ASCII Art 彩蛋 | Task 6 |
| 页面交互彩蛋（樱花暴增、午夜模式、隐藏留言） | Task 6 |
| Live2D 预留接口 | Task 7 |
| 小游戏预留入口 | Task 7 |
| 首屏优先加载、次要延迟加载 | Task 4 |
| 移动端适配 | Task 5 (masonry.css 含 media query) |
| 配色方案（日系简约 + 午夜深色） | Task 1, Task 6 |
| 全局交互规范 | Task 1 (CSS class) |
| 示例博客 + 项目详情页 | Task 8 |

**2. 占位符扫描：** 无 TBD/TODO/摸棱两可的占位符（代码中 `TODO` 注释在预留接口中是有意为之的占位，不属于遗漏）

**3. 类型一致性：** 所有接口名称一致：
- `ParticleEngine.init()` / `.start()` / `.stop()` / `.setBloom()` / `.setMidnight()`
- `ContentArea.render()`
- `EasterEggs.init()` / `.triggerSecret()`
- `Live2D.init()` / `.react()` / `.show()` / `.hide()` / `.setModel()`
- `Games.register()` / `.launch()` / `.showComingSoon()`
