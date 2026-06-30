/* js/main.js — 页面入口与模块调度 */

(function() {
  'use strict';

  // 页面加载完成后初始化所有模块
  function initAll() {
    initHero();
    initContent();
    initEasterEggs();
  }

  // 初始化首屏粒子
  function initHero() {
    const canvas = document.getElementById('particleCanvas');
    if (canvas && window.ParticleEngine) {
      ParticleEngine.init(canvas);
      setTimeout(() => ParticleEngine.start(), 200);
    }

    // Scroll 提示点击
    const scrollHint = document.getElementById('scrollHint');
    const content = document.getElementById('content');
    if (scrollHint && content) {
      scrollHint.addEventListener('click', () => {
        content.scrollIntoView({ behavior: 'smooth' });
        scrollHint.classList.add('hidden');
      });

      // 滚动到内容区时自动隐藏提示
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          scrollHint.classList.add('hidden');
          observer.disconnect();
        }
      }, { threshold: 0.1 });
      observer.observe(content);
    }
  }

  // 初始化内容区
  function initContent() {
    const content = document.getElementById('content');
    if (!content) return;

    // 直接渲染，无需等待滚动
    if (window.ContentArea) {
      ContentArea.render();
    }
  }

  // 初始化彩蛋
  function initEasterEggs() {
    if (window.EasterEggs) {
      EasterEggs.init();
    }
  }

  // 页面不可见时暂停粒子
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (window.ParticleEngine) ParticleEngine.stop();
    } else {
      if (window.ParticleEngine) ParticleEngine.start();
    }
  });

  // DOM 就绪后立即初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
