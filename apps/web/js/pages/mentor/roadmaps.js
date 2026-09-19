/* CAMPUSLINK — Mentor Roadmap Reviews Page — Real Data */
const MentorRoadmaps = (() => {
  async function render() {
    const main = document.getElementById('main');
    main.innerHTML = `<div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Loading roadmaps...</div></div></div>`;

    // Fetch students and derive roadmap review items from at-risk/developing students
    const result = await API.get('/students');
    const students = Array.isArray(result?.data) ? result.data : (Array.isArray(result) ? result : []);
    const reviews = students.filter(s => (s.readiness || 0) > 0 && (s.readiness || 0) < 75).map(s => ({
      student: s.name || 'Student',
      role: s.target_role || s.targetRole || 'Software Engineer',
      milestones: 8,
      completed: Math.max(1, Math.round(((s.readiness || 0) / 100) * 8)),
      urgency: (s.readiness || 0) < 50 ? 'high' : 'medium',
    }));

    main.innerHTML = `
      <div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Roadmap Reviews</div><h1 class="page-title">Pending Roadmap Reviews</h1><p class="page-subtitle">Review, approve, or adjust student career roadmaps. Your guidance shapes their learning path.</p></div></div>
      <div class="stack">
        ${reviews.length ? reviews.map((r, i) => `
          <article class="card animate-fade-in-up" style="animation-delay:${i * 80}ms">
            <div class="flex justify-between items-center mb-4">
              <div class="flex items-center gap-4">
                <div class="avatar avatar-lg ${r.urgency === 'high' ? 'avatar-orange' : 'avatar-blue'}">${r.student.split(' ').map(w=>w[0]).join('')}</div>
                <div>
                  <div class="font-bold" style="font-size:16px">${r.student}</div>
                  <div class="text-sm text-muted">Target: ${r.role}</div>
                </div>
              </div>
              <span class="badge badge-${r.urgency === 'high' ? 'danger' : 'warning'} badge-dot">${r.urgency} priority</span>
            </div>
            <div class="progress-group mb-4">
              <div class="progress-label"><span class="progress-label-name">Milestone Progress</span><span class="progress-label-value">${r.completed}/${r.milestones}</span></div>
              <div class="progress-bar"><div class="progress-bar-fill ${r.completed/r.milestones >= 0.5 ? 'success' : 'warning'}" style="width:${(r.completed/r.milestones)*100}%"></div></div>
            </div>
            <div class="flex gap-3" style="justify-content:flex-end">
              <button class="btn btn-sm btn-ghost" onclick="Toast.info('Sending back ${r.student} roadmap for revision')">Request Changes</button>
              <button class="btn btn-sm" onclick="Toast.info('Adding milestone for ${r.student}')">Add Milestone</button>
              <button class="btn btn-sm btn-primary" onclick="Toast.success('${r.student} roadmap approved!')">Approve ✓</button>
            </div>
          </article>
        `).join('') : '<div class="empty-state"><div class="empty-state-icon">✅</div><div class="empty-state-title">All roadmaps reviewed</div><p class="empty-state-text">No pending reviews at this time.</p></div>'}
      </div>
    `;
  }
  return { render };
})();
