/* js/masonry.js — 内容区渲染 + 伸缩弹窗 */

const ContentArea = (() => {
  function esc(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  async function render() {
    await Promise.all([renderBlog(), renderProjects()]);
  }

  /* === 博客卡片渲染 === */
  async function renderBlog() {
    const grid = document.getElementById('blogGrid');
    if (!grid) return;

    try {
      const res = await fetch('blog/posts.json');
      const posts = await res.json();
      grid.innerHTML = posts.map(post => `
        <div class="masonry-item" onclick="ContentArea.openModal('blog','${esc(post.id)}')">
          <span class="card-tag">📝 Blog</span>
          <h3 class="card-title">${esc(post.title)}</h3>
          <p class="card-summary">${esc(post.summary)}</p>
          <div class="card-date">${esc(post.date)}</div>
        </div>
      `).join('');
    } catch (err) {
      grid.innerHTML = '<p style="color: #888">暂无博客内容</p>';
    }
  }

  /* === 项目卡片渲染 === */
  async function renderProjects() {
    const grid = document.getElementById('projectGrid');
    if (!grid) return;

    try {
      const res = await fetch('projects/projects.json');
      const projects = await res.json();
      grid.innerHTML = projects.map(p => `
        <div class="project-item" onclick="ContentArea.openModal('project','${esc(p.id)}')">
          <span class="card-tag">💻 Project</span>
          <h3 class="project-name">${esc(p.name)}</h3>
          <p class="project-summary">${esc(p.summary)}</p>
          ${p.link ? `<a class="project-link" href="${esc(p.link)}" target="_blank" onclick="event.stopPropagation()">GitHub →</a>` : ''}
        </div>
      `).join('');
    } catch (err) {
      grid.innerHTML = '<p style="color: #888">暂无项目内容</p>';
    }
  }

  /* === 伸缩弹窗系统 === */

  const modal = document.getElementById('contentModal');
  const backdrop = modal?.querySelector('.modal-backdrop');
  const closeBtn = document.getElementById('modalClose');
  const modalTitle = document.getElementById('modalTitle');
  const modalMeta = document.getElementById('modalMeta');
  const modalContent = document.getElementById('modalContent');

  // 关闭弹窗
  function closeModal() {
    if (!modal) return;
    modal.classList.remove('active');
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  // ESC 键关闭
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // 点击遮罩关闭
  backdrop?.addEventListener('click', closeModal);
  closeBtn?.addEventListener('click', closeModal);

  // 打开弹窗
  async function openModal(type, id) {
    if (!modal) return;

    // 显示弹窗
    modal.style.display = 'flex';
    // 触发动画：先 display 后加 active
    requestAnimationFrame(() => {
      modal.classList.add('active');
    });
    document.body.style.overflow = 'hidden'; // 禁止背景滚动

    // 设置标题（先显示再加载内容）
    modalTitle.textContent = '加载中…';
    modalMeta.textContent = '';
    modalContent.innerHTML = '<p style="color:#aaa;text-align:center;padding:40px;">加载中…</p>';

    // 获取 avatar 信息
    const avatarEl = modal.querySelector('.modal-avatar');
    if (avatarEl) avatarEl.textContent = type === 'blog' ? '📝' : '💻';

    // 加载内容
    try {
      const htmlPath = type === 'blog' ? `blog/${id}.html` : `projects/${id}.html`;
      const detailRes = await fetch(htmlPath);
      const html = await detailRes.text();

      // 用 DOMParser 安全解析 HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      if (type === 'blog') {
        // 博客：标题 + 日期 + 正文
        const titleEl = doc.querySelector('.post-header h1');
        const metaEl = doc.querySelector('.post-meta');
        const contentEl = doc.querySelector('.post-content');

        modalTitle.textContent = titleEl?.textContent || id;
        modalMeta.textContent = metaEl?.textContent || '';

        // 构建标签
        // 从 JSON 中读取 tags
        try {
          const postsRes = await fetch('blog/posts.json');
          const posts = await postsRes.json();
          const post = posts.find(p => p.id === id);
          if (post?.tags?.length) {
            const tagsHtml = post.tags.map(t => `<span class="modal-tag">${esc(t)}</span>`).join('');
            modalMeta.innerHTML += (modalMeta.textContent ? ' · ' : '') + `<div class="modal-tags">${tagsHtml}</div>`;
          }
        } catch(e) {}

        modalContent.innerHTML = contentEl?.innerHTML || '<p>暂无内容</p>';

      } else {
        // 项目：名称 + 链接 + 正文
        const nameEl = doc.querySelector('.project-header h1');
        const linkEl = doc.querySelector('.project-link');
        const contentEl = doc.querySelector('.project-content');

        modalTitle.textContent = nameEl?.textContent || id;

        if (linkEl) {
          modalMeta.innerHTML = `<a class="modal-project-link" href="${esc(linkEl.getAttribute('href') || '')}" target="_blank">查看源码 →</a>`;
        }

        const contentHtml = contentEl?.innerHTML || '<p>暂无内容</p>';
        // 去掉末尾的返回链接和 GitHub 链接（它们已在 modal 中）
        modalContent.innerHTML = contentHtml;
      }
    } catch (err) {
      console.error('[modal] load error:', err);
      modalTitle.textContent = '加载失败';
      modalContent.innerHTML = '<p style="color:#e8738a;text-align:center;padding:40px;">内容加载失败，请稍后重试</p>';
    }
  }

  return { render, openModal, closeModal };
})();
