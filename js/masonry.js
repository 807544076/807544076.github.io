/* js/masonry.js — 内容区渲染 */

const ContentArea = (() => {
  function esc(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

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
        <div class="masonry-item" onclick="location.href='blog/${esc(post.id)}.html'">
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

  async function renderProjects() {
    const grid = document.getElementById('projectGrid');
    if (!grid) return;

    try {
      const res = await fetch('projects/projects.json');
      const projects = await res.json();
      grid.innerHTML = projects.map(p => `
        <div class="project-item" onclick="location.href='projects/${esc(p.id)}.html'">
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

  return { render };
})();
