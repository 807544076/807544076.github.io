/* js/main.js — 页面入口与模块调度 */

(function() {
  'use strict';

  console.log('[main] JS loaded, initializing...');

  // 页面加载完成后初始化所有模块（各自独立，一个失败不影响其他）
  function initAll() {
    console.log('[main] initAll called');
    try { initHero(); } catch(e) { console.error('[main] hero failed:', e); }
    try { initContent(); } catch(e) { console.error('[main] content failed:', e); }
    try { initEasterEggs(); } catch(e) { console.error('[main] easter-eggs failed:', e); }
    document.body.classList.add('js-ready');
  }

  // 初始化首屏粒子
  function initHero() {
    console.log('[main] initHero: ParticleEngine exists:', !!ParticleEngine);
    const canvas = document.getElementById('particleCanvas');
    console.log('[main] canvas element:', canvas);
    if (canvas && ParticleEngine) {
      ParticleEngine.init(canvas);
      console.log('[main] ParticleEngine.init() done, starting in 200ms');
      setTimeout(() => {
        console.log('[main] starting particles');
        ParticleEngine.start();
      }, 200);
    }

    // Scroll 提示点击
    const scrollHint = document.getElementById('scrollHint');
    if (scrollHint) {
      scrollHint.textContent = '▼ Scroll ▼'; // visible sign JS is working
      scrollHint.addEventListener('click', () => {
        document.getElementById('content')?.scrollIntoView({ behavior: 'smooth' });
        scrollHint.classList.add('hidden');
      });

      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          scrollHint.classList.add('hidden');
          observer.disconnect();
        }
      }, { threshold: 0.1 });
      const content = document.getElementById('content');
      if (content) observer.observe(content);
    }
  }

  // 初始化内容区
  function initContent() {
    if (ContentArea) {
      console.log('[main] rendering content area');
      ContentArea.render().then(() => {
        console.log('[main] content rendered');
      }).catch(e => {
        console.error('[main] content render error:', e);
      });
    } else {
      console.warn('[main] ContentArea not found');
    }
  }

  // 初始化彩蛋
  function initEasterEggs() {
    if (EasterEggs) {
      console.log('[main] initializing easter eggs');
      EasterEggs.init();
    } else {
      console.warn('[main] EasterEggs not found');
    }
  }

  // 页面不可见时暂停粒子
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (ParticleEngine) ParticleEngine.stop();
    } else {
      if (ParticleEngine) ParticleEngine.start();
    }
  });

  // DOM 就绪后立即初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
