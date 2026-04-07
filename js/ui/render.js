function initials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');
}

/**
 * Render an array of post objects as cards into #postsGrid.
 * @param {Array} posts
 * @param {Map<number,object>} usersMap  userId → user object
 * @param {Set<number>} deletedIds       IDs deleted locally
 */
export function renderPostCards(posts, usersMap = new Map(), deletedIds = new Set()) {
  const grid = document.getElementById('postsGrid');
  grid.innerHTML = '';

  const visible = posts.filter(p => !deletedIds.has(p.id));

  if (visible.length === 0) {
    grid.innerHTML = '<p class="no-results">No se encontraron publicaciones.</p>';
    return;
  }

  visible.forEach((post, idx) => {
    const user = usersMap.get(post.userId) || {};
    const authorName = user.firstName ? `${user.firstName} ${user.lastName}` : `Usuario ${post.userId}`;
    const tags = (post.tags || []).map(t => `<span class="tag">${t}</span>`).join('');
    const excerpt = post.body.length > 160 ? post.body.slice(0, 160) + '…' : post.body;
    const likes   = post.reactions?.likes   ?? post.reactions ?? 0;
    const dislikes = post.reactions?.dislikes ?? 0;

    const card = document.createElement('article');
    card.className = 'post-card';
    card.style.animationDelay = `${idx * 50}ms`;
    card.dataset.postId = post.id;
    card.innerHTML = `
      <div class="post-card-meta">
        <div class="post-author-chip">
          <div class="post-avatar">${initials(authorName)}</div>
          <span>${authorName}</span>
        </div>
        <div class="post-reactions">👍 ${likes}</div>
      </div>
      <h2>${post.title}</h2>
      <p class="post-excerpt">${excerpt}</p>
      <div class="post-tags">${tags}</div>
      <div class="post-card-footer">
        <a href="pages/detail.html?id=${post.id}" class="btn-read-more">Leer más →</a>
        <button class="btn-danger btn-delete" data-id="${post.id}">Eliminar</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

/**
 * Render pagination buttons.
 * @param {number} currentPage  1-based
 * @param {number} totalPages
 * @param {Function} onPageChange  callback(newPage)
 */
export function renderPagination(currentPage, totalPages, onPageChange) {
  const nav = document.getElementById('pagination');
  nav.innerHTML = '';

  if (totalPages <= 1) return;

  const makeBtn = (label, page, disabled = false, active = false) => {
    const btn = document.createElement('button');
    btn.className = 'page-btn' + (active ? ' active' : '');
    btn.textContent = label;
    btn.disabled = disabled;
    btn.addEventListener('click', () => onPageChange(page));
    return btn;
  };

  nav.appendChild(makeBtn('←', currentPage - 1, currentPage === 1));

  // Show window of pages around current
  const range = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || (p >= currentPage - 2 && p <= currentPage + 2)) {
      range.push(p);
    }
  }

  let last = 0;
  range.forEach(p => {
    if (last && p - last > 1) {
      const dots = document.createElement('span');
      dots.textContent = '…';
      dots.style.cssText = 'padding:0 .25rem;color:var(--muted);';
      nav.appendChild(dots);
    }
    nav.appendChild(makeBtn(p, p, false, p === currentPage));
    last = p;
  });

  nav.appendChild(makeBtn('→', currentPage + 1, currentPage === totalPages));
}
