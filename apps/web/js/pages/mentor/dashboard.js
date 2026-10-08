/* CAMPUSLINK — Mentor Dashboard — Real Data & Closed-Loop Intelligence */
const MentorDashboard = (() => {
  async function render() {
    const main = document.getElementById('main');
    main.innerHTML = `<div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Loading mentor command center...</div></div></div>`;

    const d = await API.getDashboard('mentor');
    const kpis = d?.kpis || [];
    const students = d?.students || [];

    // Fetch active interventions
    let interventions = [];
    try {
      const intRes = await API.get('/students/all/interventions');
      interventions = Array.isArray(intRes?.data) ? intRes.data : (Array.isArray(intRes) ? intRes : []);
    } catch (_e) {}

    const pendingInterventions = interventions.filter(i => i.status !== 'completed');

    main.innerHTML = `
      <div class="page-header">
        <div class="page-header-content">
          <div class="page-eyebrow">Faculty Mentor Command Center</div>
          <h1 class="page-title">Placement Progress & Guidance</h1>
          <p class="page-subtitle">Track assigned students, trigger proactive interventions, and review roadmap milestones.</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary" onclick="Router.navigate('mentor/students')">⚡ View Intervention Engine</button>
        </div>
      </div>

      ${KPICard.render(kpis)}

      <!-- Active AI Interventions Banner -->
      <article class="card mb-6 animate-fade-in-up" style="border:1px solid rgba(244,63,94,0.3);background:linear-gradient(135deg,rgba(244,63,94,0.08) 0%,rgba(17,24,39,0.7) 100%)">
        <div class="card-header" style="display:flex;justify-content:space-between;align-items:center">
          <div class="flex items-center gap-3">
            <span style="font-size:22px">⚡</span>
            <div>
              <h2 class="card-title" style="margin:0">Active AI Interventions Queue</h2>
              <p class="text-xs text-muted mb-0">${pendingInterventions.length} priority guidance actions pending faculty follow-up</p>
            </div>
          </div>
          <button class="btn btn-sm btn-ghost" onclick="Router.navigate('mentor/students')">Manage All (${interventions.length}) →</button>
        </div>
        <div class="stack mt-3" style="gap:10px">
          ${pendingInterventions.length ? pendingInterventions.slice(0, 3).map(item => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:rgba(255,255,255,0.03);border-radius:8px;border:1px solid rgba(255,255,255,0.06)">
              <div>
                <div class="font-bold text-sm">${esc(item.title)}</div>
                <div class="text-xs text-muted mt-1">${item.notes ? esc(item.notes) : 'High-impact recovery milestone'}</div>
              </div>
              <div class="flex items-center gap-3">
                <span class="badge ${item.status === 'in-progress' ? 'badge-accent' : 'badge-warning'}">
                  ${item.status === 'in-progress' ? '⏳ In Progress' : '● Pending'}
                </span>
                <button class="btn btn-sm" onclick="Router.navigate('mentor/students')">Take Action →</button>
              </div>
            </div>
          `).join('') : '<div class="text-sm text-muted p-2">All student interventions are currently resolved or on track.</div>'}
        </div>
      </article>

      <div class="grid grid-main">
        <article class="card animate-fade-in-up">
          <div class="card-header"><h2 class="card-title">Assigned Students</h2><span class="badge badge-accent">${students.length} assigned</span></div>
          ${students.length ? students.map((s, i) => `
            <div class="list-item" style="animation-delay:${i * 60}ms">
              <div class="flex items-center gap-4" style="flex:1">
                <div class="avatar ${s.status === 'at-risk' ? 'avatar-orange' : 'avatar-blue'}">${(s.name || '?').split(' ').map(w=>w[0]).join('')}</div>
                <div class="list-item-content">
                  <div class="list-item-title">${esc(s.name)}</div>
                  <div class="list-item-sub">Target: ${esc(s.target_role || 'Software Engineer')}</div>
                </div>
              </div>
              <div class="text-center" style="min-width:80px">
                ${ScoreRing.mini(s.readiness || 0)}
                <div class="text-xs mt-2 ${s.status === 'at-risk' ? 'text-danger' : 'text-success'}">
                  ${s.status === 'at-risk' ? '↓ At Risk' : '↑ On Track'}
                </div>
              </div>
              <button class="btn btn-sm" onclick="Router.navigate('mentor/students')">Review</button>
            </div>
          `).join('') : '<p style="color:var(--text-muted);padding:var(--space-4)">No students assigned.</p>'}
        </article>

        <aside class="stack">
          <article class="card card-accent animate-fade-in-up" style="animation-delay:160ms">
            <h3 class="card-title mb-4">💡 Guidance Playbook</h3>
            <div class="insight-card accent">
              <strong>Prioritize students with upcoming corporate drives:</strong>
              Assign targeted SQL & System Design mock drills to convert shortlists into verified offers.
            </div>
          </article>
        </aside>
      </div>
    `;
  }
  return { render };
})();
