/* ============================================================
   CAMPUSLINK — Admin Dashboard (Placement Command Center)
   ============================================================ */
const AdminDashboard = (() => {
  async function render() {
    const d = API.DEMO.admin;
    document.getElementById('main').innerHTML = `
      <div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Placement Command Center</div><h1 class="page-title">Placement Overview</h1><p class="page-subtitle">Monitor readiness, interventions, and recruitment outcomes across your institution.</p></div><div class="page-actions"><button class="btn" onclick="Router.navigate('admin/analytics')">📈 Full Analytics</button><button class="btn btn-primary" onclick="Router.navigate('admin/drives')">+ Create Drive</button></div></div>
      ${KPICard.render(d.kpis)}
      <div class="grid grid-main">
        <div class="stack">
          <article class="card animate-fade-in-up">
            <div class="card-header"><h2 class="card-title">Application Funnel</h2><span class="badge badge-accent">2026 Batch</span></div>
            ${Chart.funnelChart(d.funnel)}
          </article>
          <article class="card animate-fade-in-up" style="animation-delay:100ms">
            <div class="card-header"><h2 class="card-title">Upcoming Drives</h2><button class="btn btn-sm" onclick="Router.navigate('admin/scheduler')">Open Scheduler</button></div>
            ${DataTable.render(
              [
                { key: 'company', label: 'Company', type: 'avatar', subKey: 'venue' },
                { key: 'role', label: 'Role' },
                { key: 'date', label: 'Date' },
                { key: 'eligible', label: 'Eligible' },
                { key: 'applied', label: 'Applied' },
                { key: 'status', label: 'Status', type: 'status' },
              ],
              d.drives
            )}
          </article>
        </div>
        <aside class="stack">
          <article class="card animate-fade-in-up" style="animation-delay:80ms">
            <div class="card-header"><h2 class="card-title">⚡ Intervention Queue</h2><span class="badge badge-danger badge-dot">Advisory</span></div>
            ${d.risk.map(r => `
              <div class="list-item">
                <div class="list-item-content">
                  <div class="list-item-title">${r.name}</div>
                  <div class="list-item-sub">${r.branch}</div>
                  <div class="text-xs text-muted mt-2">${r.reason}</div>
                </div>
                <div class="text-center">
                  ${ScoreRing.mini(r.score)}
                  <div class="text-xs text-muted mt-2">${r.score}/100</div>
                </div>
              </div>
            `).join('')}
            <button class="btn btn-sm mt-4" style="width:100%" onclick="Router.navigate('admin/interventions')">View All →</button>
          </article>
          <article class="card animate-fade-in-up" style="animation-delay:160ms">
            <div class="card-header"><h2 class="card-title">Readiness Distribution</h2></div>
            ${Chart.barChart([
              { value: 42, label: '90+' },
              { value: 128, label: '70-89' },
              { value: 286, label: '50-69' },
              { value: 248, label: '30-49' },
              { value: 138, label: '<30' },
            ], { height: 140, color: 'green' })}
            <p class="text-xs text-muted mt-4 text-center">Distribution of readiness scores across 842 eligible students</p>
          </article>
        </aside>
      </div>
    `;
  }
  return { render };
})();
