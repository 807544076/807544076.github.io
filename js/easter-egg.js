/* js/easter-egg.js — 彩蛋系统 */

const EasterEggs = (() => {
  let clickCount = 0;
  let clickTimer = null;
  let secretOverlay = null;
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
        if (ParticleEngine) {
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
      if (ParticleEngine) {
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
    if (secretOverlay) return; // already showing
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
    secretOverlay = overlay;

    // 触发入场动画
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      box.style.transform = 'scale(1)';
    });

    const close = () => {
      overlay.style.opacity = '0';
      box.style.transform = 'scale(0.9)';
      setTimeout(() => { overlay.remove(); secretOverlay = null; }, 500);
    };
    setTimeout(close, 5000);
    overlay.addEventListener('click', close);
  }

  return { init, triggerSecret };
})();
