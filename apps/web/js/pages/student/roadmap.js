/* ============================================================
   CAMPUSLINK — Career Roadmap Page
   ============================================================ */
const StudentRoadmap = (() => {
  async function render() {
    const milestones = API.DEMO.student.roadmap;
    const completed = milestones.filter(m => m.status === 'completed').length;
    const pct = Math.round((completed / milestones.length) * 100);

    document.getElementById('main').innerHTML = `
      <div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Career Roadmap</div><h1 class="page-title">Your Learning Journey</h1><p class="page-subtitle">A milestone-based learning plan aligned to your target role and skill gaps. Your mentor can review and adjust.</p></div></div>
      <div class="grid grid-main">
        <div class="stack">
          <article class="card animate-fade-in-up">
            <div class="card-header"><h2 class="card-title">Roadmap Progress</h2><span class="badge badge-accent">${completed}/${milestones.length} completed</span></div>
            <div class="progress-group mb-6"><div class="progress-label"><span class="progress-label-name">Overall Progress</span><span class="progress-label-value">${pct}%</span></div><div class="progress-bar"><div class="progress-bar-fill" style="width:${pct}%"></div></div></div>
            <div class="schedule-timeline">
              ${milestones.map((m, i) => `
                <div class="schedule-event animate-fade-in-up" style="animation-delay:${i * 80}ms;border-left-color:${m.status === 'completed' ? 'var(--success)' : m.status === 'in-progress' ? 'var(--accent)' : 'var(--border-default)'}">
                  <div class="flex justify-between items-center mb-2">
                    <div class="flex items-center gap-3">
                      <div class="milestone-number ${m.status === 'completed' ? 'completed' : ''}">${m.status === 'completed' ? '✓' : i + 1}</div>
                      <div class="font-bold">${m.title}</div>
                    </div>
                    <span class="status-badge status-${m.status === 'completed' ? 'accepted' : m.status === 'in-progress' ? 'interview' : 'draft'}">${m.status}</span>
                  </div>
                  <p class="text-sm text-muted">${m.desc}</p>
                  <div class="text-xs text-muted mt-2">📅 Due: ${m.due}</div>
                </div>
              `).join('')}
            </div>
          </article>
        </div>
        <aside class="stack">
          <article class="card card-accent animate-fade-in-up" style="animation-delay:80ms">
            <h3 class="card-title mb-4">🎯 Target Role</h3>
            <div class="font-bold" style="font-size:18px;margin-bottom:var(--space-3)">${API.DEMO.student.profile.targetRole}</div>
            <p class="text-sm text-muted">This roadmap is generated based on your target role and current skill gaps. Completing all milestones will significantly improve your readiness score.</p>
          </article>
          <article class="card animate-fade-in-up" style="animation-delay:150ms">
            <div class="card-header"><h2 class="card-title">Mentor Review</h2></div>
            <div class="insight-card accent"><strong>Pending review</strong> Your mentor can approve, adjust, or add milestones to this roadmap.</div>
            <button class="btn btn-sm mt-4" style="width:100%" onclick="Toast.info('Request sent to your mentor')">Request Review</button>
          </article>
        </aside>
      </div>
    `;
  }
  return { render };
})();
