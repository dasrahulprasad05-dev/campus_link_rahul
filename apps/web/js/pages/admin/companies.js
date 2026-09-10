/* CAMPUSLINK — Admin Companies Page */
const AdminCompanies = (() => {
  async function render() {
    document.getElementById('main').innerHTML = `
      <div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Company Management</div><h1 class="page-title">Registered Companies</h1><p class="page-subtitle">Manage company profiles, recruiter accounts, and job listings.</p></div><div class="page-actions"><button class="btn btn-primary" onclick="Toast.info('Add company form coming soon')">+ Add Company</button></div></div>
      ${DataTable.render(
        [
          { key: 'name', label: 'Company', type: 'avatar', subKey: 'industry' },
          { key: 'jobs', label: 'Active Jobs' },
          { key: 'hires', label: 'Total Hires' },
          { key: 'status', label: 'Status', type: 'status' },
          { key: '_actions', label: '', render: (_, row) => `<button class="btn btn-sm btn-ghost" onclick="Toast.info('View ${row.name}')">Manage</button>` },
        ],
        API.DEMO.admin.companies
      )}
    `;
  }
  return { render };
})();
