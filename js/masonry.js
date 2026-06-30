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

  // 显示弹窗骨架
  function showModalSkeleton() {
    if (!modal) return;
    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('active'));
    document.body.style.overflow = 'hidden';
    modalTitle.textContent = '加载中…';
    modalMeta.textContent = '';
    modalContent.innerHTML = '<p style="color:#aaa;text-align:center;padding:40px;">加载中…</p>';
  }

  // 关闭弹窗
  function closeModal() {
    if (!modal) return;
    modal.classList.remove('active');
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
  backdrop?.addEventListener('click', closeModal);
  closeBtn?.addEventListener('click', closeModal);

  /* === 简历弹窗（点击毛玻璃卡片触发） === */
  async function openResume() {
    if (!modal) return;
    showModalSkeleton();

    const avatarEl = modal.querySelector('.modal-avatar');
    if (avatarEl) avatarEl.textContent = '🐟';

    try {
      const res = await fetch('pages/resume.html');
      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const contentEl = doc.querySelector('.resume-content');

      modalTitle.textContent = 'Oceanfish';
      modalMeta.innerHTML = '一只在海里写代码的鱼';
      modalContent.innerHTML = contentEl?.innerHTML || '<p>暂无内容</p>';
    } catch (err) {
      console.error('[resume] load error:', err);
      modalTitle.textContent = 'Oceanfish';
      modalContent.innerHTML = '<p style="color:#e8738a;text-align:center;padding:40px;">简历加载失败</p>';
    }
  }

  /* === 博客/项目弹窗 === */
  async function openModal(type, id) {
    if (!modal) return;
    showModalSkeleton();

    const avatarEl = modal.querySelector('.modal-avatar');
    if (avatarEl) avatarEl.textContent = type === 'blog' ? '📝' : '💻';

    try {
      const htmlPath = type === 'blog' ? `blog/${id}.html` : `projects/${id}.html`;
      const detailRes = await fetch(htmlPath);
      const html = await detailRes.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      if (type === 'blog') {
        // 博客：左栏显示信息，右栏显示预览 + 跳转按钮
        const titleEl = doc.querySelector('.post-header h1');
        const metaEl = doc.querySelector('.post-meta');
        const contentEl = doc.querySelector('.post-content');

        modalTitle.textContent = titleEl?.textContent || id;
        modalMeta.textContent = metaEl?.textContent || '';

        // 从 JSON 获取 tags 和 summary
        let summary = '', tags = [];
        try {
          const postsRes = await fetch('blog/posts.json');
          const posts = await postsRes.json();
          const post = posts.find(p => p.id === id);
          if (post) {
            summary = post.summary || '';
            tags = post.tags || [];
          }
        } catch(e) {}

        if (tags.length) {
          const tagsHtml = tags.map(t => `<span class="modal-tag">${esc(t)}</span>`).join('');
          modalMeta.innerHTML += '<br><div class="modal-tags" style="margin-top:8px">' + tagsHtml + '</div>';
        }

        // 右栏：摘要 + 正文前 300 字预览 + 跳转按钮
        let previewHtml = summary ? `<p style="color:var(--color-text-secondary);margin-bottom:16px;font-size:14px;">${esc(summary)}</p>` : '';
        previewHtml += '<hr style="border:none;border-top:1px solid #eee;margin:0 0 16px;">';

        if (contentEl) {
          // 取正文前两段作为预览
          const paragraphs = contentEl.querySelectorAll('p');
          let previewCount = 0;
          for (const p of paragraphs) {
            if (previewCount >= 3) break;
            const text = p.textContent.trim();
            if (text.length > 20) {
              previewHtml += `<p>${text.slice(0, 200)}${text.length > 200 ? '…' : ''}</p>`;
              previewCount++;
            }
          }
        }

        // 跳转按钮
        previewHtml += `
          <div style="text-align:right;margin-top:24px;">
            <a href="blog/${esc(id)}.html" class="modal-full-link" onclick="ContentArea.closeModal()">
              📖 阅读全文 →
            </a>
          </div>
        `;

        modalContent.innerHTML = previewHtml;

      } else {
        // 项目弹窗
        const nameEl = doc.querySelector('.project-header h1');
        const linkEl = doc.querySelector('.project-link');
        const contentEl = doc.querySelector('.project-content');

        modalTitle.textContent = nameEl?.textContent || id;

        if (linkEl) {
          modalMeta.innerHTML = `<a class="modal-project-link" href="${esc(linkEl.getAttribute('href') || '')}" target="_blank">查看源码 →</a>`;
        }

        // 去掉内容中的返回链接
        let contentHtml = contentEl?.innerHTML || '<p>暂无内容</p>';
        contentHtml = contentHtml.replace(/<a[^>]*class="[^"]*back[^"]*"[^>]*>.*?<\/a>/gi, '');
        contentHtml += `
          <div style="text-align:right;margin-top:24px;">
            <a href="projects/${esc(id)}.html" class="modal-full-link" onclick="ContentArea.closeModal()">
              📖 查看详情 →
            </a>
          </div>
        `;
        modalContent.innerHTML = contentHtml;
      }
    } catch (err) {
      console.error('[modal] load error:', err);
      modalTitle.textContent = '加载失败';
      modalContent.innerHTML = '<p style="color:#e8738a;text-align:center;padding:40px;">内容加载失败</p>';
    }
  }

  return { render, openModal, closeModal, openResume };
})();
