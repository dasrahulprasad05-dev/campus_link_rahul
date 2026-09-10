/* CAMPUSLINK — Mentor Dashboard */
const MentorDashboard = (() => {
  async function render() {
    const d = API.DEMO.mentor;
    document.getElementById('main').innerHTML = `
      <div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Mentor Workspace</div><h1 class="page-title">Student Progress</h1><p class="page-subtitle">Focus attention where guidance can improve placement outcomes.</p></div><div class="page-actions"><button class="btn btn-primary" onclick="Toast.info('Feedback form coming soon')">+ Add Feedback</button></div></div>
      ${KPICard.render(d.kpis)}
      <div class="grid grid-main">
        <article class="card animate-fade-in-up">
          <div class="card-header"><h2 class="card-title">Assigned Students</h2><span class="badge badge-accent">${d.students.length} active</span></div>
          ${d.students.map((s, i) => `
            <div class="list-item" style="animation-delay:${i * 60}ms">
              <div class="flex items-center gap-4" style="flex:1">
                <div class="avatar avatar-blue">${s.name.split(' ').map(w=>w[0]).join('')}</div>
                <div class="list-item-content">
                  <div class="list-item-title">${s.name}</div>
                  <div class="list-item-sub">${s.next}</div>
                  <div class="text-xs text-muted mt-2">Last active: ${s.lastActive}</div>
                </div>
              </div>
              <div class="text-center" style="min-width:80px">
                ${ScoreRing.mini(s.score)}
                <div class="text-xs mt-2 ${s.trend === 'up' ? 'text-success' : s.trend === 'down' ? 'text-danger' : 'text-muted'}">
                  ${s.trend === 'up' ? '↑ Up' : s.trend === 'down' ? '↓ Down' : '— Stable'}
                </div>
              </div>
              <button class="btn btn-sm" onclick="Toast.info('Viewing ${s.name} details')">View</button>
            </div>
          `).join('')}
        </article>
        <aside class="stack">
          <article class="card animate-fade-in-up" style="animation-delay:80ms">
            <div class="card-header"><h2 class="card-title">Roadmap Reviews</h2><span class="badge badge-danger badge-dot">${d.roadmapReviews.length} pending</span></div>
            ${d.roadmapReviews.map(r => `
              <div class="list-item">
                <div class="list-item-content">
                  <div class="list-item-title">${r.student}</div>
                  <div class="list-item-sub">Target: ${r.role} · ${r.completed}/${r.milestones} milestones</div>
                </div>
                <span class="badge badge-${r.urgency === 'high' ? 'danger' : 'warning'}">${r.urgency}</span>
              </div>
            `).join('')}
            <button class="btn btn-sm mt-4" style="width:100%" onclick="Router.navigate('mentor/roadmaps')">Review All →</button>
          </article>
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
