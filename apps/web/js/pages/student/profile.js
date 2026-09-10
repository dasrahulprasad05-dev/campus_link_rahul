/* ============================================================
   CAMPUSLINK — Student Profile Page
   ============================================================ */
const StudentProfile = (() => {
  async function render() {
    const p = API.DEMO.student.profile;
    const main = document.getElementById('main');
    main.innerHTML = `
      <div class="page-header">
        <div class="page-header-content">
          <div class="page-eyebrow">My Profile</div>
          <h1 class="page-title">${p.name}</h1>
          <p class="page-subtitle">${p.branch} · Batch ${p.year} · ${p.regNo}</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary" onclick="Toast.info('Edit mode coming soon')">✏️ Edit Profile</button>
        </div>
      </div>
      <div class="grid grid-main">
        <div class="stack">
          <article class="card animate-fade-in-up">
            <div class="card-header"><h2 class="card-title">Academic Details</h2><span class="badge badge-success">CGPA ${p.cgpa}</span></div>
            <div class="grid grid-2 gap-4">
              <div><div class="text-xs text-muted">Registration No.</div><div class="font-bold">${p.regNo}</div></div>
              <div><div class="text-xs text-muted">Branch</div><div class="font-bold">${p.branch}</div></div>
              <div><div class="text-xs text-muted">Graduation Year</div><div class="font-bold">${p.year}</div></div>
              <div><div class="text-xs text-muted">Target Role</div><div class="font-bold">${p.targetRole}</div></div>
              <div><div class="text-xs text-muted">Email</div><div class="font-bold">${p.email}</div></div>
              <div><div class="text-xs text-muted">Phone</div><div class="font-bold">${p.phone}</div></div>
            </div>
          </article>
          <article class="card animate-fade-in-up" style="animation-delay:80ms">
            <div class="card-header"><h2 class="card-title">Skills</h2><span class="badge badge-accent">${p.skills.length} skills</span></div>
            ${SkillBadge.render(p.skills)}
          </article>
          <article class="card animate-fade-in-up" style="animation-delay:160ms">
            <div class="card-header"><h2 class="card-title">Projects</h2></div>
            ${p.projects.map(proj => `
              <div class="list-item">
                <div class="list-item-content">
                  <div class="list-item-title">${proj.name}</div>
                  <div class="list-item-sub">${proj.tech}</div>
                  <p class="text-sm text-muted mt-2">${proj.desc}</p>
                </div>
              </div>
            `).join('')}
          </article>
        </div>
        <aside class="stack">
          <article class="card card-accent animate-fade-in-up" style="animation-delay:100ms">
            <h3 class="card-title mb-4">Profile Completion</h3>
            ${ScoreRing.render(91, { size: 120, label: 'complete' })}
            <div class="insight-card accent mt-4"><strong>Almost there!</strong> Add a LinkedIn URL and one more certification to reach 100%.</div>
          </article>
          <article class="card animate-fade-in-up" style="animation-delay:180ms">
            <div class="card-header"><h2 class="card-title">Certifications</h2></div>
            ${p.certifications.map(c => `<div class="list-item"><div class="list-item-content"><div class="list-item-title">🏅 ${c}</div></div></div>`).join('')}
          </article>
          <article class="card animate-fade-in-up" style="animation-delay:220ms">
            <div class="card-header"><h2 class="card-title">Links</h2></div>
            <div class="list-item"><div class="list-item-content"><div class="list-item-sub">LinkedIn</div><div class="list-item-title text-accent">${p.linkedin}</div></div></div>
            <div class="list-item"><div class="list-item-content"><div class="list-item-sub">GitHub</div><div class="list-item-title text-accent">${p.github}</div></div></div>
          </article>
        </aside>
      </div>
    `;
  }
  return { render };
})();
