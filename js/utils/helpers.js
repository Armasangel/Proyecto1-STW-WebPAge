/**
 * Debounce a function call.
 * @param {Function} fn
 * @param {number} delay  ms
 */
export function debounce(fn, delay = 350) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Get a URL query parameter by name.
 * @param {string} name
 */
export function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

/**
 * Persist data to sessionStorage.
 */
export function saveSession(key, value) {
  try { sessionStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
}

/**
 * Load data from sessionStorage.
 */
export function loadSession(key) {
  try { return JSON.parse(sessionStorage.getItem(key)); } catch (_) { return null; }
}

/**
 * Initialize the hamburger menu toggle.
 */
export function initNavMenu() {
  const btn = document.getElementById('hamburger');
  const links = document.querySelector('.nav-links');
  if (btn && links) {
    btn.addEventListener('click', () => links.classList.toggle('open'));
  }
}
