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
