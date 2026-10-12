/* ============================================================
   CAMPUSLINK — Toast Notification Component
   ============================================================ */

const Toast = (() => {
  function show(message, type = 'info', options = {}) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const { title, duration = 4000 } = options;
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const id = 'toast-' + Date.now();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.id = id;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <div class="toast-content">
        ${title ? `<div class="toast-title">${title}</div>` : ''}
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" onclick="Toast.dismiss('${id}')">✕</button>
    `;

    container.appendChild(toast);

    // Auto dismiss
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration);
    }
  }

  function dismiss(id) {
    const toast = document.getElementById(id);
    if (!toast) return;
    toast.classList.add('exiting');
    setTimeout(() => toast.remove(), 200);
  }

  function success(msg, opts) { show(msg, 'success', opts); }
  function error(msg, opts) { show(msg, 'error', opts); }
  function warning(msg, opts) { show(msg, 'warning', opts); }
  function info(msg, opts) { show(msg, 'info', opts); }

  return { show, dismiss, success, error, warning, info };
})();
