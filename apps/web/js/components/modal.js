/* ============================================================
   CAMPUSLINK — Modal Component
   Reusable modal dialog with backdrop blur.
   ============================================================ */

const Modal = (() => {
  let _currentId = null;

  function open(id) {
    const el = document.getElementById(id);
    if (el) {
      el.classList.add('open');
      _currentId = id;
      document.body.style.overflow = 'hidden';
    }
  }

  function close(id) {
    const targetId = id || _currentId;
    const el = document.getElementById(targetId);
    if (el) {
      el.classList.remove('open');
      _currentId = null;
      document.body.style.overflow = '';
    }
  }

  function create(options) {
    const { id, title, content, footer, size } = options;
    const width = size === 'lg' ? '780px' : size === 'sm' ? '400px' : '640px';

    return `
      <div class="modal-backdrop" id="${id}" role="dialog" aria-modal="true" aria-labelledby="${id}-title">
        <div class="modal-dialog" style="max-width:${width}">
          <div class="modal-header">
            <h2 class="modal-title" id="${id}-title">${title}</h2>
            <button class="modal-close" onclick="Modal.close('${id}')" aria-label="Close">✕</button>
          </div>
          <div class="modal-body" id="${id}-body">
            ${content || ''}
          </div>
          ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
        </div>
      </div>
    `;
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && _currentId) close();
  });

  // Close on backdrop click
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) close();
  });

  return { open, close, create };
})();
