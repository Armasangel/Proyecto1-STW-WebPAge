/* ===== js/detail.js — post detail page controller ===== */

import { fetchPostById, fetchComments, fetchUserById } from './api/posts.js';
import { setLoading, showError, hideError, showToast } from './ui/feedback.js';
import { getParam, initNavMenu, loadSession } from './utils/helpers.js';

initNavMenu();

const deletedIds = new Set(loadSession('deletedIds') || []);
const postId     = getParam('id');

if (!postId || isNaN(Number(postId))) {
  setLoading(false);
  showError('ID de publicación inválido.');
} else {
  loadDetail(Number(postId));
}

async function loadDetail(id) {
  setLoading(true);
  hideError();

  try {
    const [post, commentsData] = await Promise.all([
      fetchPostById(id),
      fetchComments(id),
    ]);

    let authorName = `Usuario ${post.userId}`;
    let authorHandle = '';
    try {
      const user = await fetchUserById(post.userId);
      authorName   = `${user.firstName} ${user.lastName}`;
      authorHandle = `@${user.username}`;
    } catch (_) {}

    setLoading(false);
    renderDetail(post, authorName, authorHandle, commentsData.comments || []);

  } catch (err) {
    setLoading(false);
    showError(err.message || 'No se pudo cargar la publicación.');
  }
}

function initials(name) {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');
}

function renderDetail(post, authorName, authorHandle, comments) {
  const container = document.getElementById('detailContainer');
  const isDeleted = deletedIds.has(post.id);
  const tags  = (post.tags || []).map(t => `<span class="tag">${t}</span>`).join('');
  const likes = post.reactions?.likes    ?? post.reactions ?? 0;
  const dislikes = post.reactions?.dislikes ?? 0;
  const views = post.views ?? '—';

  container.innerHTML = `
    <a href="../index.html" class="detail-back">← Volver al inicio</a>

    <header class="detail-header">
      <div class="detail-tags">${tags}</div>
      <h1 class="detail-title" id="detailTitle">${post.title}</h1>
      <div class="detail-meta">
        <div class="detail-author-chip">
          <div class="detail-avatar">${initials(authorName)}</div>
          <div>
            <div>${authorName}</div>
            ${authorHandle ? `<div style="font-size:.72rem;color:var(--muted)">${authorHandle}</div>` : ''}
          </div>
        </div>
        <span>·</span>
        <span>ID de publicación: #${post.id}</span>
      </div>
      <div class="detail-stats">
        <span class="detail-stat">👍 ${likes} me gusta</span>
        <span class="detail-stat">👎 ${dislikes} no me gusta</span>
        <span class="detail-stat">👁 ${views} vistas</span>
      </div>
    </header>

    <hr class="detail-divider" />

    ${isDeleted ? '<p style="color:var(--accent);font-style:italic;margin-bottom:1rem;">⚠ Esta publicación ha sido eliminada localmente.</p>' : ''}
    <p class="detail-body" id="detailBody">${post.body}</p>

    <div class="detail-actions">
      <button class="btn-primary" id="btnEdit">✏ Editar publicación</button>
      <button class="btn-danger"  id="btnDelete">🗑 Eliminar publicación</button>
      <a href="../index.html" class="btn-outline">← Volver</a>
    </div>

    <section class="comments-section">
      <h3>Comentarios (${comments.length})</h3>
      ${renderComments(comments)}
    </section>
  `;

  container.classList.remove('hidden');

  // ── Edit (inline) ──
  document.getElementById('btnEdit').addEventListener('click', () => {
    const titleEl = document.getElementById('detailTitle');
    const bodyEl  = document.getElementById('detailBody');
    const btn     = document.getElementById('btnEdit');

    if (btn.dataset.editing) {
      // Save
      const newTitle = document.getElementById('editTitleInput')?.value.trim();
      const newBody  = document.getElementById('editBodyInput')?.value.trim();
      if (!newTitle || newTitle.length < 5) { showToast('El título debe tener al menos 5 caracteres.', 'error'); return; }
      if (!newBody  || newBody.length  < 20) { showToast('El contenido debe tener al menos 20 caracteres.', 'error'); return; }
      titleEl.innerHTML = newTitle;
      bodyEl.innerHTML  = newBody;
      btn.textContent   = '✏ Editar publicación';
      delete btn.dataset.editing;
      showToast('Publicación actualizada localmente ✓', 'success');
    } else {
      // Enter edit mode
      const currentTitle = titleEl.textContent;
      const currentBody  = bodyEl.textContent;
      titleEl.innerHTML = `<input id="editTitleInput" type="text" value="${currentTitle.replace(/"/g, '&quot;')}" style="width:100%;font-family:var(--ff-display);font-size:inherit;font-weight:700;border:2px solid var(--accent);border-radius:4px;padding:.25rem .5rem;background:var(--paper);color:var(--ink);" />`;
      bodyEl.innerHTML  = `<textarea id="editBodyInput" rows="8" style="width:100%;font-family:var(--ff-body);font-size:1rem;border:2px solid var(--accent);border-radius:4px;padding:.5rem .75rem;background:var(--paper);color:var(--ink);resize:vertical;">${currentBody}</textarea>`;
      btn.textContent   = '💾 Guardar cambios';
      btn.dataset.editing = true;
    }
  });

  // ── Delete ──
  document.getElementById('btnDelete').addEventListener('click', () => {
    const ids = new Set(loadSession('deletedIds') || []);
    ids.add(post.id);
    try { sessionStorage.setItem('deletedIds', JSON.stringify([...ids])); } catch (_) {}
    showToast('Publicación eliminada. Redirigiendo...', 'success');
    setTimeout(() => { window.location.href = '../index.html'; }, 1800);
  });
}

function renderComments(comments) {
  if (!comments.length) return '<p style="color:var(--muted);font-size:.875rem;">No hay comentarios aún.</p>';
  return comments.map(c => `
    <div class="comment-card">
      <div class="comment-header">
        <div class="detail-avatar" style="width:28px;height:28px;font-size:.7rem;">${(c.user?.username?.[0] || c.email?.[0] || '?').toUpperCase()}</div>
        <div>
          <div class="comment-author">${c.user?.username || c.name || 'Anónimo'}</div>
          <div class="comment-email">${c.user ? '' : (c.email || '')}</div>
        </div>
      </div>
      <p class="comment-body">${c.body}</p>
    </div>
  `).join('');
}
