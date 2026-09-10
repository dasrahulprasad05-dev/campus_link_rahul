/* ============================================================
   CAMPUSLINK — Applications Tracking Page
   ============================================================ */
const StudentApplications = (() => {
  async function render() {
    const apps = API.DEMO.student.applications;
    document.getElementById('main').innerHTML = `
      <div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Application Tracking</div><h1 class="page-title">My Applications</h1><p class="page-subtitle">Track every step from application to offer — your placement journey in one place.</p></div></div>
      <div class="tabs" id="app-tabs">
        <button class="tab active" data-filter="all">All (${apps.length})</button>
        <button class="tab" data-filter="interview">Interview (${apps.filter(a=>a.status==='interview').length})</button>
        <button class="tab" data-filter="offered">Offered (${apps.filter(a=>a.status==='offered').length})</button>
        <button class="tab" data-filter="applied">Applied (${apps.filter(a=>a.status==='applied').length})</button>
      </div>
      <div id="app-list">
        ${_renderApps(apps)}
      </div>
    `;
    document.querySelectorAll('#app-tabs .tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('#app-tabs .tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const filter = tab.dataset.filter;
        const filtered = filter === 'all' ? apps : apps.filter(a => a.status === filter);
        document.getElementById('app-list').innerHTML = _renderApps(filtered);
      });
    });
  }

  function _renderApps(apps) {
    if (!apps.length) return '<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-title">No applications</div></div>';
    return `
      <div class="table-container">
        <table class="data-table">
          <thead><tr><th>Position</th><th>Company</th><th>Status</th><th>Current Round</th><th>Applied</th><th></th></tr></thead>
          <tbody>
            ${apps.map(a => `
              <tr>
                <td class="font-bold">${a.job}</td>
                <td>${a.company}</td>
                <td><span class="status-badge status-${a.status}">${a.status}</span></td>
                <td class="text-sm text-muted">${a.round}</td>
                <td class="text-sm text-muted">${a.appliedDate}</td>
                <td><button class="btn btn-sm btn-ghost" onclick="Toast.info('Detailed view coming soon')">View</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  return { render };
})();
