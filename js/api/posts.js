const BASE = 'https://dummyjson.com';

/**
 * GET /posts?limit=&skip=
 * Returns { posts, total, skip, limit }
 */
export async function fetchPosts(limit = 10, skip = 0) {
  const res = await fetch(`${BASE}/posts?limit=${limit}&skip=${skip}`);
  if (!res.ok) throw new Error(`Error al obtener publicaciones (${res.status})`);
  return res.json();
}

/**
 * GET /posts/{id}
 */
export async function fetchPostById(id) {
  const res = await fetch(`${BASE}/posts/${id}`);
  if (!res.ok) throw new Error(`Publicación no encontrada (${res.status})`);
  return res.json();
}

/**
 * GET /posts/search?q=
 */
export async function searchPosts(query) {
  const res = await fetch(`${BASE}/posts/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error(`Error en búsqueda (${res.status})`);
  return res.json();
}

/**
 * GET /posts/tag/{tag}
 */
export async function fetchPostsByTag(tag) {
  const res = await fetch(`${BASE}/posts/tag/${encodeURIComponent(tag)}`);
  if (!res.ok) throw new Error(`Error al filtrar por etiqueta (${res.status})`);
  return res.json();
}

/**
 * GET /posts/user/{userId}
 */
export async function fetchPostsByUser(userId) {
  const res = await fetch(`${BASE}/posts/user/${userId}`);
  if (!res.ok) throw new Error(`Error al filtrar por usuario (${res.status})`);
  return res.json();
}

/**
 * GET /posts/{id}/comments
 */
export async function fetchComments(postId) {
  const res = await fetch(`${BASE}/posts/${postId}/comments`);
  if (!res.ok) throw new Error(`Error al cargar comentarios (${res.status})`);
  return res.json();
}

/**
 * POST /posts/add
 */
export async function createPost({ title, body, tags, userId }) {
  const res = await fetch(`${BASE}/posts/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, body, tags, userId: Number(userId) }),
  });
  if (!res.ok) throw new Error(`Error al crear publicación (${res.status})`);
  return res.json();
}

/**
 * GET /tags  (all available tags)
 */
export async function fetchTags() {
  const res = await fetch(`${BASE}/posts/tags`);
  if (!res.ok) throw new Error(`Error al obtener etiquetas (${res.status})`);
  return res.json();
}

/**
 * GET /users?limit=all  — used for author filter
 */
export async function fetchUsers(limit = 100) {
  const res = await fetch(`${BASE}/users?limit=${limit}`);
  if (!res.ok) throw new Error(`Error al obtener usuarios (${res.status})`);
  return res.json();
}

/**
 * GET /users/{id}
 */
export async function fetchUserById(id) {
  const res = await fetch(`${BASE}/users/${id}`);
  if (!res.ok) throw new Error(`Usuario no encontrado (${res.status})`);
  return res.json();
}
