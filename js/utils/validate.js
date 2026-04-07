
export function validatePostForm({ title, body, tags, userId }) {
  const errors = {};

  // Title
  if (!title || title.trim().length === 0) {
    errors.title = 'El título es obligatorio.';
  } else if (title.trim().length < 5) {
    errors.title = 'El título debe tener al menos 5 caracteres.';
  }

  // Body
  if (!body || body.trim().length === 0) {
    errors.body = 'El contenido es obligatorio.';
  } else if (body.trim().length < 20) {
    errors.body = 'El contenido debe tener al menos 20 caracteres.';
  }

  // Tags
  if (!tags || tags.trim().length === 0) {
    errors.tags = 'Agrega al menos una etiqueta.';
  }

  // UserId
  const uid = Number(userId);
  if (!userId || isNaN(uid) || uid < 1) {
    errors.userId = 'Ingresa un ID de usuario válido (número mayor a 0).';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Apply visual error state to a field group.
 * @param {string} fieldId  e.g. 'fieldTitle'
 * @param {string} errorId  e.g. 'errorTitle'
 * @param {string} message  error text or '' to clear
 */
export function setFieldError(fieldId, errorId, message) {
  const field = document.getElementById(fieldId);
  const span  = document.getElementById(errorId);
  if (!field || !span) return;
  span.textContent = message;
  field.classList.toggle('has-error', !!message);
}

/**
 * Clear all field errors.
 */
export function clearAllErrors(fields) {
  fields.forEach(([fId, eId]) => setFieldError(fId, eId, ''));
}
