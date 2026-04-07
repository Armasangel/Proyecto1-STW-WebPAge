/**
 * Show or hide the loading spinner.
 * @param {boolean} visible
 * @param {string} [id='loadingIndicator']
 */
export function setLoading(visible, id = 'loadingIndicator') {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle('hidden', !visible);
}

/**
 * Show an error message.
 * @param {string} message
 * @param {string} [id='errorMsg']
 */
export function showError(message, id = 'errorMsg') {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
  el.classList.remove('hidden');
}

/**
 * Hide the error box.
 */
export function hideError(id = 'errorMsg') {
  const el = document.getElementById(id);
  if (el) el.classList.add('hidden');
}

/**
 * Show a toast notification.
 * @param {string} message
 * @param {'success'|'error'|''} type
 * @param {number} duration  ms before auto-hide
 */
export function showToast(message, type = '', duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast ${type}`;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.add('hidden');
  }, duration);
}
