/* ============================================================
   CAMPUSLINK — Forms Component
   Form builder with validation and error states.
   ============================================================ */

const Forms = (() => {
  function input(options) {
    const { id, label, type = 'text', placeholder = '', value = '', required = false, hint = '', error = '' } = options;
    return `
      <div class="form-group">
        ${label ? `<label class="form-label" for="${id}">${label}${required ? ' <span class="text-danger">*</span>' : ''}</label>` : ''}
        <input class="form-input ${error ? 'error' : ''}"
               type="${type}" id="${id}" name="${id}"
               placeholder="${placeholder}" value="${value}"
               ${required ? 'required' : ''}>
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

  return { input, textarea, select, validate };
})();
