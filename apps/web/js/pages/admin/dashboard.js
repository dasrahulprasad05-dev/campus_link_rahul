/* ============================================================
   CAMPUSLINK — Admin Dashboard (Placement Command Center)
   All data from real API.
   ============================================================ */
const AdminDashboard = (() => {
  async function render() {
    const main = document.getElementById('main');
    main.innerHTML = `<div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Loading dashboard...</div></div></div>`;

    const d = await API.getDashboard('admin');
    const kpis = d?.kpis || [];
    const students = d?.students || [];
    const drives = d?.drives || [];

    // Fetch at-risk students
    const allStudents = await API.get('/students');
    const studentList = Array.isArray(allStudents?.data) ? allStudents.data : (Array.isArray(allStudents) ? allStudents : []);
    const atRiskStudents = studentList.filter(s => (s.readiness || 0) < 60).slice(0, 4);

    // Build readiness distribution from real data
    const distBuckets = [
      { value: studentList.filter(s => (s.readiness || 0) >= 80).length, label: '80+' },
      { value: studentList.filter(s => (s.readiness || 0) >= 60 && (s.readiness || 0) < 80).length, label: '60-79' },
      { value: studentList.filter(s => (s.readiness || 0) >= 40 && (s.readiness || 0) < 60).length, label: '40-59' },
      { value: studentList.filter(s => (s.readiness || 0) < 40).length, label: '<40' },
    ];

    main.innerHTML = `
      <div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Placement Command Center</div><h1 class="page-title">Placement Overview</h1><p class="page-subtitle">Monitor readiness, interventions, and recruitment outcomes across your institution.</p></div><div class="page-actions"><button class="btn" onclick="Router.navigate('admin/analytics')">📈 Full Analytics</button><button class="btn btn-primary" onclick="Router.navigate('admin/drives')">+ Create Drive</button></div></div>
      ${KPICard.render(kpis)}
      <div class="grid grid-main">
        <div class="stack">
          <article class="card animate-fade-in-up">
            <div class="card-header"><h2 class="card-title">Upcoming Drives</h2><button class="btn btn-sm" onclick="Router.navigate('admin/scheduler')">Open Scheduler</button></div>
            ${drives.length > 0 ? DataTable.render(
              [
                { key: 'company', label: 'Company', type: 'avatar', subKey: 'venue' },
                { key: 'role', label: 'Role' },
                { key: 'date', label: 'Date', format: v => v ? new Date(v).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD' },
                { key: 'status', label: 'Status', type: 'status' },
              ],
              drives
            ) : '<p style="color:var(--text-muted);padding:var(--space-4)">No drives scheduled.</p>'}
          </article>
        </div>
        <aside class="stack">
          <article class="card animate-fade-in-up" style="animation-delay:80ms">
            <div class="card-header"><h2 class="card-title">⚡ Intervention Queue</h2><span class="badge badge-danger badge-dot">Advisory</span></div>
            ${atRiskStudents.length > 0 ? atRiskStudents.map(r => `
              <div class="list-item">
                <div class="list-item-content">
                  <div class="list-item-title">${r.name}</div>
                  <div class="list-item-sub">${r.branch || ''} · ${r.year || ''}</div>
                  <div class="text-xs text-muted mt-2">Readiness: ${r.readiness}/100 — ${r.readiness < 40 ? 'Critical' : 'Needs support'}</div>
                </div>
                <div class="text-center">
                  ${ScoreRing.mini(r.readiness)}
                  <div class="text-xs text-muted mt-2">${r.readiness}/100</div>
                </div>
              </div>
            `).join('') : '<p style="color:var(--text-muted);padding:var(--space-4)">No at-risk students.</p>'}
            <button class="btn btn-sm mt-4" style="width:100%" onclick="Router.navigate('admin/interventions')">View All →</button>
          </article>
          <article class="card animate-fade-in-up" style="animation-delay:160ms">
            <div class="card-header"><h2 class="card-title">Readiness Distribution</h2></div>
            ${Chart.barChart(distBuckets, { height: 140, color: 'green' })}
            <p class="text-xs text-muted mt-4 text-center">Distribution of readiness scores across ${studentList.length} students</p>
          </article>
        </aside>
      </div>
    `;
  }
  return { render };
})();
