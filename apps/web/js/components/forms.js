/* ============================================================
   CAMPUSLINK — Forms Component
   Form builder with validation and error states.
   ============================================================ */

const Forms = (() => {
  function input(options) {
    const { id, label, type = 'text', placeholder = '', value = '', required = false, hint = '', error = '' } = options;
    const isPassword = type === 'password';
    return `
      <div class="form-group">
        ${label ? `<label class="form-label" for="${id}">${label}${required ? ' <span class="text-danger">*</span>' : ''}</label>` : ''}
        <div style="${isPassword ? 'position:relative; display:flex; align-items:center; width:100%;' : ''}">
          <input class="form-input ${error ? 'error' : ''}"
                 type="${type}" id="${id}" name="${id}"
                 placeholder="${placeholder}" value="${value}"
                 ${required ? 'required' : ''}
                 ${isPassword ? 'style="padding-right: 44px; width:100%;"' : ''}>
          ${isPassword ? `
            <button type="button" class="password-toggle-btn"
                    onclick="Forms.togglePasswordVisibility('${id}', this)"
                    style="position:absolute; right:12px; background:none; border:none; color:var(--text-muted, #94a3b8); cursor:pointer; font-size:18px; padding:4px; display:flex; align-items:center; justify-content:center; user-select:none; z-index:2;"
                    title="Show password"
                    aria-label="Toggle password visibility">
              👁️
            </button>
          ` : ''}
        </div>
        ${hint ? `<div class="form-hint">${hint}</div>` : ''}
        ${error ? `<div class="form-error">${error}</div>` : ''}
      </div>
    `;
  }

  function textarea(options) {
    const { id, label, placeholder = '', value = '', rows = 5, required = false, hint = '' } = options;
    return `
      <div class="form-group">
        ${label ? `<label class="form-label" for="${id}">${label}${required ? ' <span class="text-danger">*</span>' : ''}</label>` : ''}
        <textarea class="form-textarea" id="${id}" name="${id}"
                  placeholder="${placeholder}" rows="${rows}"
                  ${required ? 'required' : ''}>${value}</textarea>
        ${hint ? `<div class="form-hint">${hint}</div>` : ''}
      </div>
    `;
  }

  function select(options) {
    const { id, label, choices = [], value = '', required = false } = options;
    return `
      <div class="form-group">
        ${label ? `<label class="form-label" for="${id}">${label}</label>` : ''}
        <select class="form-select" id="${id}" name="${id}" ${required ? 'required' : ''}>
          ${choices.map(c => `<option value="${c.value}" ${c.value === value ? 'selected' : ''}>${c.label}</option>`).join('')}
        </select>
      </div>
    `;
  }

  function validate(formId) {
    const form = document.getElementById(formId);
    if (!form) return { valid: false, data: {} };

    const inputs = form.querySelectorAll('input, textarea, select');
    const data = {};
    let valid = true;

    inputs.forEach(el => {
      data[el.name || el.id] = el.value;
      if (el.required && !el.value.trim()) {
        el.classList.add('error');
        valid = false;
      } else {
        el.classList.remove('error');
      }
    });

    return { valid, data };
  }

  function togglePasswordVisibility(inputId, btn) {
    const inputEl = document.getElementById(inputId);
    if (!inputEl) return;
    if (inputEl.type === 'password') {
      inputEl.type = 'text';
      btn.textContent = '🙈';
      btn.title = 'Hide password';
      btn.setAttribute('aria-label', 'Hide password');
    } else {
      inputEl.type = 'password';
      btn.textContent = '👁️';
      btn.title = 'Show password';
      btn.setAttribute('aria-label', 'Show password');
    }
  }

  return { input, textarea, select, validate, togglePasswordVisibility };
})();
