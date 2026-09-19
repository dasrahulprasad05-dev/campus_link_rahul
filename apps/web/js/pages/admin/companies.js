/* CAMPUSLINK — Admin Companies Page — Real Data */
const AdminCompanies = (() => {
  async function render() {
    const main = document.getElementById('main');
    main.innerHTML = `<div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Loading companies...</div></div></div>`;

    const result = await API.get('/companies');
    const companies = Array.isArray(result?.data) ? result.data : (Array.isArray(result) ? result : []);

    main.innerHTML = `
      <div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Company Management</div><h1 class="page-title">Registered Companies</h1><p class="page-subtitle">Manage company profiles, recruiter accounts, and job listings.</p></div><div class="page-actions"><button class="btn btn-primary" onclick="Toast.info('Add company form coming soon')">+ Add Company</button></div></div>
      ${companies.length ? DataTable.render(
        [
          { key: 'name', label: 'Company', type: 'avatar', subKey: 'industry' },
          { key: 'status', label: 'Status', type: 'status' },
          { key: '_actions', label: '', render: (_, row) => `<button class="btn btn-sm btn-ghost" onclick="Toast.info('View ${row.name}')">Manage</button>` },
        ],
        companies
      ) : '<div class="empty-state"><div class="empty-state-icon">🏢</div><div class="empty-state-title">No companies registered</div></div>'}
    `;
  }
  return { render };
})();
