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
