/* ===== js/home.js — home page controller ===== */

import { fetchPosts, fetchPostsByTag, fetchPostsByUser, searchPosts, fetchTags, fetchUsers } from './api/posts.js';
import { setLoading, showError, hideError, showToast } from './ui/feedback.js';
import { renderPostCards, renderPagination } from './ui/render.js';
import { debounce, initNavMenu, saveSession, loadSession } from './utils/helpers.js';

/* ── Constants ── */
const PAGE_SIZE = 9;

/* ── State ── */
let allPosts    = [];
let totalPosts  = 0;
let currentPage = 1;
let usersMap    = new Map();
let deletedIds  = new Set(loadSession('deletedIds') || []);
let activeSearch = '';
let activeTag    = '';
let activeUser   = '';
let activeSort   = 'default';

/* ── DOM refs ── */
const searchInput  = document.getElementById('searchInput');
const tagFilter    = document.getElementById('tagFilter');
const userFilter   = document.getElementById('userFilter');
const sortFilter   = document.getElementById('sortFilter');
const clearBtn     = document.getElementById('clearFilters');

/* ── Init ── */
initNavMenu();
bootstrap();

async function bootstrap() {
  try {
    await Promise.all([loadTags(), loadUsers()]);
    await loadPage(1);
  } catch (err) {
    setLoading(false);
    showError('No se pudo conectar con la API. Intenta de nuevo más tarde.');
  }
}

/* ── Load tags into select ── */
async function loadTags() {
  try {
    const tags = await fetchTags();
    // tags is an array of tag objects with .slug and .name, or plain strings
    tags.forEach(t => {
      const opt = document.createElement('option');
      const value = t.slug ?? t;
      const label = t.name ?? t;
      opt.value = value;
      opt.textContent = label;
      tagFilter.appendChild(opt);
    });
  } catch (_) { /* non-critical */ }
}

/* ── Load users into select ── */
async function loadUsers() {
  try {
    const data = await fetchUsers(30);
    data.users.forEach(u => {
      usersMap.set(u.id, u);
      const opt = document.createElement('option');
      opt.value = u.id;
      opt.textContent = `${u.firstName} ${u.lastName}`;
      userFilter.appendChild(opt);
    });
  } catch (_) { /* non-critical */ }
}

/* ── Load / render a page ── */
async function loadPage(page) {
  currentPage = page;
  setLoading(true);
  hideError();

  try {
    let posts = [];
    let total = 0;

    const skip = (page - 1) * PAGE_SIZE;

    if (activeSearch) {
      const data = await searchPosts(activeSearch);
      posts = data.posts;
      total = data.total;
    } else if (activeTag) {
      const data = await fetchPostsByTag(activeTag);
      posts = data.posts;
      total = data.total;
    } else if (activeUser) {
      const data = await fetchPostsByUser(activeUser);
      posts = data.posts;
      total = data.total;
    } else {
      const data = await fetchPosts(PAGE_SIZE, skip);
      posts = data.posts;
      total = data.total;
    }

    // Client-side sort
    if (activeSort === 'az') {
      posts = [...posts].sort((a, b) => a.title.localeCompare(b.title));
    } else if (activeSort === 'za') {
      posts = [...posts].sort((a, b) => b.title.localeCompare(a.title));
    } else if (activeSort === 'most-liked') {
      posts = [...posts].sort((a, b) => {
        const la = a.reactions?.likes ?? a.reactions ?? 0;
        const lb = b.reactions?.likes ?? b.reactions ?? 0;
        return lb - la;
      });
    }

    allPosts   = posts;
    totalPosts = total;

    setLoading(false);

    // For filtered results we paginate client-side
    const isFiltered = activeSearch || activeTag || activeUser;
    if (isFiltered) {
      const slicedPosts = posts.slice(skip, skip + PAGE_SIZE);
      renderPostCards(slicedPosts, usersMap, deletedIds);
      const totalPages = Math.ceil(posts.length / PAGE_SIZE);
      renderPagination(currentPage, totalPages, loadPage);
    } else {
      renderPostCards(posts, usersMap, deletedIds);
      const totalPages = Math.ceil(total / PAGE_SIZE);
      renderPagination(currentPage, totalPages, loadPage);
    }

    // Bind delete buttons
    bindDeleteButtons();

  } catch (err) {
    setLoading(false);
    showError(err.message || 'Error inesperado al cargar publicaciones.');
  }
}

/* ── Delete (visual simulation) ── */
function bindDeleteButtons() {
  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      deletedIds.add(id);
      saveSession('deletedIds', [...deletedIds]);

      // Animate out
      const card = btn.closest('.post-card');
      if (card) {
        card.style.transition = 'opacity .3s, transform .3s';
        card.style.opacity = '0';
        card.style.transform = 'scale(.95)';
        setTimeout(() => {
          card.remove();
          showToast('Publicación eliminada', 'success');
          // If grid is now empty, show message
          if (!document.querySelector('.post-card')) {
            document.getElementById('postsGrid').innerHTML =
              '<p class="no-results">No hay más publicaciones en esta página.</p>';
          }
        }, 300);
      }
    });
  });
}

/* ── Filters & search ── */
const debouncedSearch = debounce(async (val) => {
  activeSearch = val.trim();
  activeTag    = '';
  activeUser   = '';
  tagFilter.value  = '';
  userFilter.value = '';
  await loadPage(1);
}, 400);

searchInput.addEventListener('input', e => debouncedSearch(e.target.value));

tagFilter.addEventListener('change', async () => {
  activeTag    = tagFilter.value;
  activeSearch = '';
  activeUser   = '';
  searchInput.value  = '';
  userFilter.value   = '';
  await loadPage(1);
});

userFilter.addEventListener('change', async () => {
  activeUser   = userFilter.value;
  activeSearch = '';
  activeTag    = '';
  searchInput.value = '';
  tagFilter.value   = '';
  await loadPage(1);
});

sortFilter.addEventListener('change', async () => {
  activeSort = sortFilter.value;
  await loadPage(currentPage);
});

clearBtn.addEventListener('click', async () => {
  activeSearch = '';
  activeTag    = '';
  activeUser   = '';
  activeSort   = 'default';
  searchInput.value  = '';
  tagFilter.value    = '';
  userFilter.value   = '';
  sortFilter.value   = 'default';
  await loadPage(1);
});
