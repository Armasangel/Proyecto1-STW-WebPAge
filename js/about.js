import { fetchPosts, fetchUsers } from './api/posts.js';
import { initNavMenu } from './utils/helpers.js';

initNavMenu();
loadStats();

async function loadStats() {
  try {
    // Two GET requests: posts and users
    const [postsData, usersData] = await Promise.all([
      fetchPosts(0, 0),   // limit=0 to get totals only (DummyJSON returns total)
      fetchUsers(100),
    ]);

    // For tags and reactions we need the actual posts
    const allData = await fetchPosts(250, 0);
    const posts   = allData.posts || [];

    const uniqueTags = new Set(posts.flatMap(p => p.tags || []));
    const totalLikes = posts.reduce((sum, p) => {
      const l = p.reactions?.likes ?? p.reactions ?? 0;
      return sum + l;
    }, 0);

    animateNumber('statPosts', postsData.total || posts.length);
    animateNumber('statUsers', usersData.total || 100);
    animateNumber('statTags',  uniqueTags.size);
    animateNumber('statLikes', totalLikes);

  } catch (_) {
    ['statPosts', 'statUsers', 'statTags', 'statLikes'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '?';
    });
  }
}

function animateNumber(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let current = 0;
  const step  = Math.ceil(target / 60);
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current.toLocaleString();
    if (current >= target) clearInterval(timer);
  }, 20);
}
