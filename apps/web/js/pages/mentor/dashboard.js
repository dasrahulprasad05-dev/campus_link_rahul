/* CAMPUSLINK — Mentor Dashboard — Real Data */
const MentorDashboard = (() => {
  async function render() {
    const main = document.getElementById('main');
    main.innerHTML = `<div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Loading...</div></div></div>`;

    const d = await API.getDashboard('mentor');
    const kpis = d?.kpis || [];
    const students = d?.students || [];

    main.innerHTML = `
      <div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Mentor Workspace</div><h1 class="page-title">Student Progress</h1><p class="page-subtitle">Focus attention where guidance can improve placement outcomes.</p></div><div class="page-actions"><button class="btn btn-primary" onclick="Toast.info('Feedback form coming soon')">+ Add Feedback</button></div></div>
      ${KPICard.render(kpis)}
      <div class="grid grid-main">
        <article class="card animate-fade-in-up">
          <div class="card-header"><h2 class="card-title">Assigned Students</h2><span class="badge badge-accent">${students.length} assigned</span></div>
          ${students.length ? students.map((s, i) => `
            <div class="list-item" style="animation-delay:${i * 60}ms">
              <div class="flex items-center gap-4" style="flex:1">
                <div class="avatar avatar-blue">${(s.name || '?').split(' ').map(w=>w[0]).join('')}</div>
                <div class="list-item-content">
                  <div class="list-item-title">${s.name}</div>
                  <div class="list-item-sub">Target: ${s.target_role || 'Software Engineer'}</div>
                </div>
              </div>
              <div class="text-center" style="min-width:80px">
                ${ScoreRing.mini(s.readiness || 0)}
                <div class="text-xs mt-2 ${s.status === 'at-risk' ? 'text-danger' : 'text-success'}">
                  ${s.status === 'at-risk' ? '↓ At Risk' : '↑ On Track'}
                </div>
              </div>
              <button class="btn btn-sm" onclick="Toast.info('Viewing ${s.name} details')">View</button>
            </div>
          `).join('') : '<p style="color:var(--text-muted);padding:var(--space-4)">No students assigned.</p>'}
        </article>
        <aside class="stack">
          <article class="card card-accent animate-fade-in-up" style="animation-delay:160ms">
            <h3 class="card-title mb-4">💡 Guidance Tip</h3>
            <div class="insight-card accent"><strong>Prioritize students with interviews in the next 14 days.</strong> Focus on mock interview practice and confidence building for immediate impact.</div>
          </article>
        </aside>
      </div>
    `;
  }
  return { render };
})();
