import { createPost } from './api/posts.js';
import { showToast } from './ui/feedback.js';
import { validatePostForm, setFieldError, clearAllErrors } from './utils/validate.js';
import { initNavMenu } from './utils/helpers.js';

initNavMenu();

const FIELD_MAP = [
  ['fieldTitle', 'errorTitle'],
  ['fieldBody',  'errorBody'],
  ['fieldTags',  'errorTags'],
  ['fieldUser',  'errorUser'],
];

const titleInput  = document.getElementById('postTitle');
const bodyInput   = document.getElementById('postBody');
const tagsInput   = document.getElementById('postTags');
const userIdInput = document.getElementById('postUserId');
const charCount   = document.getElementById('charTitle');
const submitBtn   = document.getElementById('submitPost');
const resetBtn    = document.getElementById('resetForm');

// Character counter for title
titleInput.addEventListener('input', () => {
  const len = titleInput.value.length;
  charCount.textContent = `${len} / 120`;
  if (len > 100) charCount.style.color = 'var(--accent)';
  else charCount.style.color = 'var(--muted)';
});

// Submit
submitBtn.addEventListener('click', async () => {
  clearAllErrors(FIELD_MAP);

  const formData = {
    title:  titleInput.value,
    body:   bodyInput.value,
    tags:   tagsInput.value,
    userId: userIdInput.value,
  };

  const { valid, errors } = validatePostForm(formData);

  if (!valid) {
    if (errors.title)  setFieldError('fieldTitle', 'errorTitle', errors.title);
    if (errors.body)   setFieldError('fieldBody',  'errorBody',  errors.body);
    if (errors.tags)   setFieldError('fieldTags',  'errorTags',  errors.tags);
    if (errors.userId) setFieldError('fieldUser',  'errorUser',  errors.userId);
    showToast('Por favor corrige los errores antes de publicar.', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Publicando...';

  try {
    const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
    const result = await createPost({
      title:  formData.title.trim(),
      body:   formData.body.trim(),
      tags:   tagsArray,
      userId: formData.userId,
    });

    showToast(`✓ Publicación creada con ID #${result.id}`, 'success', 4000);
    resetAll();

  } catch (err) {
    showToast(err.message || 'Error al publicar. Intenta de nuevo.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Publicar';
  }
});

// Reset
resetBtn.addEventListener('click', () => {
  clearAllErrors(FIELD_MAP);
  resetAll();
  showToast('Formulario limpiado.', '');
});

function resetAll() {
  titleInput.value  = '';
  bodyInput.value   = '';
  tagsInput.value   = '';
  userIdInput.value = '';
  charCount.textContent = '0 / 120';
  charCount.style.color = 'var(--muted)';
  clearAllErrors(FIELD_MAP);
}
