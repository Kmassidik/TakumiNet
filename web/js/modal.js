/* ---------------- in-page modal (replaces confirm/prompt) ---------------- */
function openModal({ message, input = null, okText = 'OK', cancelText = 'Cancel' }) {
  return new Promise((resolve) => {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true">
        <p class="modal-message"></p>
        ${input === null ? '' : '<input class="modal-input" type="text" autocomplete="off">'}
        <div class="modal-buttons">
          <button type="button" class="modal-cancel"></button>
          <button type="button" class="modal-ok"></button>
        </div>
      </div>`;
    backdrop.querySelector('.modal-message').textContent = message;
    backdrop.querySelector('.modal-ok').textContent = okText;
    backdrop.querySelector('.modal-cancel').textContent = cancelText;
    const field = backdrop.querySelector('.modal-input');
    if (field) field.value = input;

    const finish = (accepted) => {
      document.removeEventListener('keydown', onKey, true);
      backdrop.remove();
      resolve(accepted ? (field ? field.value : true) : (field ? null : false));
    };
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); finish(false); }
      if (e.key === 'Enter') { e.preventDefault(); finish(true); }
    };
    backdrop.querySelector('.modal-ok').onclick = () => finish(true);
    backdrop.querySelector('.modal-cancel').onclick = () => finish(false);
    backdrop.onclick = (e) => { if (e.target === backdrop) finish(false); };
    document.addEventListener('keydown', onKey, true);
    document.body.appendChild(backdrop);
    (field || backdrop.querySelector('.modal-ok')).focus();
    if (field) field.select();
  });
}

const askConfirm = (message, okText = 'OK') => openModal({ message, okText });
const askText = (message, value = '') => openModal({ message, input: value });
