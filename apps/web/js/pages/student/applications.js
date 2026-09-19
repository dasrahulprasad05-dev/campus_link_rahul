/* ============================================================
   CAMPUSLINK — Applications Tracking Page (Real Data)
   ============================================================ */
const StudentApplications = (() => {
  let _allApps = [];

  async function render() {
    const main = document.getElementById('main');
    main.innerHTML = `<div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Loading applications...</div></div></div>`;

    const result = await API.get('/students/me/applications');
    _allApps = Array.isArray(result?.data) ? result.data : (Array.isArray(result) ? result : []);

    main.innerHTML = `
      <div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Application Tracking</div><h1 class="page-title">My Applications</h1><p class="page-subtitle">Track every step from application to offer — your placement journey in one place.</p></div></div>
      <div class="tabs" id="app-tabs">
        <button class="tab active" data-filter="all">All (${_allApps.length})</button>
        <button class="tab" data-filter="interview">Interview (${_allApps.filter(a=>a.status==='interview').length})</button>
        <button class="tab" data-filter="offered">Offered (${_allApps.filter(a=>a.status==='offered').length})</button>
        <button class="tab" data-filter="applied">Applied (${_allApps.filter(a=>a.status==='applied').length})</button>
      </div>
      <div id="app-list">
        ${_renderApps(_allApps)}
      </div>
    `;
    document.querySelectorAll('#app-tabs .tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('#app-tabs .tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const filter = tab.dataset.filter;
        const filtered = filter === 'all' ? _allApps : _allApps.filter(a => a.status === filter);
        document.getElementById('app-list').innerHTML = _renderApps(filtered);
      });
    });
  }

  function _renderApps(apps) {
    if (!apps.length) return '<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-title">No applications</div><p class="empty-state-text">Start applying to jobs to track your progress here.</p></div>';
    return `
      <div class="table-container">
        <table class="data-table">
          <thead><tr><th>Position</th><th>Company</th><th>Status</th><th>Current Round</th><th>Applied</th><th></th></tr></thead>
          <tbody>
            ${apps.map(a => `
              <tr>
                <td class="font-bold">${a.job || a.job_title || 'Position'}</td>
                <td>${a.company || a.company_name || ''}</td>
                <td><span class="status-badge status-${a.status}">${a.status}</span></td>
                <td class="text-sm text-muted">${a.round || a.current_round || '—'}</td>
                <td class="text-sm text-muted">${a.appliedDate || (a.applied_at ? new Date(a.applied_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '—')}</td>
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
