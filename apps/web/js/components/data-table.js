/* ============================================================
   CAMPUSLINK — Data Table Component
   Reusable sortable data table with hover effects.
   ============================================================ */

const DataTable = (() => {
  function render(columns, rows, options = {}) {
    if (!rows || !rows.length) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon">📭</div>
          <div class="empty-state-title">${options.emptyTitle || 'No data found'}</div>
          <p class="empty-state-text">${options.emptyText || 'There are no records to display.'}</p>
        </div>
      `;
    }

    return `
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              ${columns.map(col => `<th>${col.label}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map(row => `
              <tr>
                ${columns.map(col => `<td>${_renderCell(col, row)}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function _renderCell(col, row) {
    const value = row[col.key];

    if (col.render) return col.render(value, row);

    if (col.type === 'status') {
      const statusClass = (value || '').toLowerCase().replace(/[\s_]/g, '-');
      return `<span class="status-badge status-${statusClass}">${value}</span>`;
    }

    if (col.type === 'badge') {
      return `<span class="badge badge-${col.badgeColor || 'accent'}">${value}</span>`;
    }

    if (col.type === 'avatar') {
      const initials = (value || '??').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      return `
        <div class="flex items-center gap-3">
          <div class="avatar avatar-sm avatar-blue">${initials}</div>
          <div>
            <div class="table-cell-main">${value}</div>
            ${row[col.subKey] ? `<div class="table-cell-sub">${row[col.subKey]}</div>` : ''}
          </div>
        </div>
      `;
    }

    if (col.type === 'actions') {
      return col.actions.map(a =>
        `<button class="btn btn-sm ${a.class || ''}" onclick="${a.onclick}">${a.label}</button>`
      ).join(' ');
    }

    return value !== undefined && value !== null ? String(value) : '—';
  }

  return { render };
})();
