/* ============================================================
   CAMPUSLINK — Student Dashboard
   Main command center with KPIs, readiness, jobs, skill gaps,
   and readiness trend. All data from real API.
   ============================================================ */

const StudentDashboard = (() => {
  async function render() {
    const user = Store.get('user');
    const name = user?.name?.split(' ')[0] || 'Student';

    const main = document.getElementById('main');
    main.innerHTML = `<div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Loading...</div></div></div>`;

    // Fetch real dashboard data
    const data = await API.getDashboard('student');
    const kpis = data?.kpis || [];
    const readinessData = data?.readiness || { score: 0 };
    const applications = data?.applications || [];
    const jobs = data?.jobs || [];

    // Fetch readiness factors from the dedicated endpoint
    let factors = [];
    let recommendations = [];
    let targetRole = 'Software Engineer';
    try {
      const readiness = await API.get(`/students/me/readiness`);
      factors = readiness?.factors || [];
      recommendations = readiness?.recommendations || [];
      targetRole = readiness?.targetRole || targetRole;
    } catch (e) { /* silent */ }

    // Derive trend from readiness score (we'll show the current score as a single-point gauge)
    const score = readinessData?.score || 0;

    main.innerHTML = `
      <!-- Hero -->
      <div class="page-header">
        <div class="page-header-content">
          <div class="page-eyebrow">Student Command Center</div>
          <h1 class="page-title">Good ${_getGreeting()}, ${name}.</h1>
          <p class="page-subtitle">Your next placement milestone is within reach. Here's your progress at a glance.</p>
        </div>
        <div class="page-actions">
          <button class="btn" onclick="Router.navigate('student/interview')">🎤 Practice Interview</button>
          <button class="btn btn-primary" onclick="Router.navigate('student/resume')">📄 Analyze Resume</button>
        </div>
      </div>

      <!-- KPIs -->
      ${KPICard.render(kpis)}

      <!-- Main Grid -->
      <div class="grid grid-main">
        <div class="stack">
          <!-- Readiness Card -->
          <article class="card animate-fade-in-up">
            <div class="card-header">
              <h2 class="card-title">Placement Readiness</h2>
              <span class="badge badge-accent">Target: ${targetRole}</span>
            </div>
            <div class="readiness-grid">
              ${ScoreRing.render(score)}
              <div>
                ${factors.length > 0 ? factors.map(f => `
                  <div class="progress-group">
                    <div class="progress-label">
                      <span class="progress-label-name">${f.label}</span>
                      <span class="progress-label-value">${f.value}%</span>
                    </div>
                    <div class="progress-bar">
                      <div class="progress-bar-fill" style="width:${f.value}%"></div>
                    </div>
                  </div>
                `).join('') : '<p style="color:var(--text-muted)">Complete your profile to see readiness factors.</p>'}
                ${recommendations.length > 0 ? `
                  <div class="insight-card warning mt-4">
                    <strong>💡 Highest-impact action</strong>
                    ${recommendations[0]?.action || 'Complete your profile for personalized recommendations.'}
                  </div>
                ` : ''}
              </div>
            </div>
          </article>

          <!-- Recommended Jobs -->
          <article class="card animate-fade-in-up" style="animation-delay:100ms">
            <div class="card-header">
              <h2 class="card-title">Recommended Opportunities</h2>
              <button class="btn btn-sm" onclick="Router.navigate('student/jobs')">View All</button>
            </div>
            ${jobs.length > 0 ? jobs.slice(0, 3).map(j => `
              <div class="job-card">
                <div class="job-card-top">
                  <div>
                    <div class="job-card-title">${j.title}</div>
                    <div class="job-card-company">${j.company}</div>
                  </div>
                  ${j.match ? `<span class="match-badge">${j.match}% match</span>` : ''}
                </div>
                <div class="job-card-meta">
                  <span>📍 ${j.location || 'Remote'}</span>
                  <span>💼 ${j.type || 'Full-time'}</span>
                  <span>⏰ ${j.deadline ? new Date(j.deadline).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Open'}</span>
                </div>
                <div class="flex gap-2">
                  ${SkillBadge.render(j.skills || [])}
                </div>
              </div>
            `).join('') : '<p style="color:var(--text-muted);padding:var(--space-4)">No jobs available right now.</p>'}
          </article>
        </div>

        <!-- Right Sidebar -->
        <aside class="stack">
          <!-- Skill Gaps / Recommendations -->
          <article class="card animate-fade-in-up" style="animation-delay:150ms">
            <div class="card-header">
              <h2 class="card-title">Priority Skill Gaps</h2>
              <span class="badge badge-warning">Target: ${targetRole}</span>
            </div>
            ${recommendations.length > 0 ? recommendations.map(s => `
              <div class="list-item">
                <div class="list-item-content">
                  <div class="list-item-title">${s.area}</div>
                  <div class="list-item-sub">${s.action}</div>
                </div>
                <span class="skill-tag ${s.priority}">${s.priority}</span>
              </div>
            `).join('') : '<p style="color:var(--text-muted);padding:var(--space-4)">Complete your profile to see skill recommendations.</p>'}
            <button class="btn btn-sm mt-4" style="width:100%" onclick="Router.navigate('student/skill-gap')">
              Run Full Analysis →
            </button>
          </article>

          <!-- Recent Applications -->
          <article class="card animate-fade-in-up" style="animation-delay:200ms">
            <div class="card-header">
              <h2 class="card-title">Recent Applications</h2>
              <button class="btn btn-sm" onclick="Router.navigate('student/applications')">View All</button>
            </div>
            ${applications.length > 0 ? applications.map(a => `
              <div class="list-item">
                <div class="list-item-content">
                  <div class="list-item-title">${a.job || 'Job'}</div>
                  <div class="list-item-sub">${a.company || ''} · ${a.round || a.status}</div>
                </div>
                <span class="badge badge-${a.status === 'offered' ? 'success' : a.status === 'interview' ? 'accent' : a.status === 'rejected' ? 'error' : 'default'}">${a.status}</span>
              </div>
            `).join('') : '<p style="color:var(--text-muted);padding:var(--space-4)">No applications yet.</p>'}
          </article>

          <!-- Quick Actions -->
          <article class="card card-accent animate-fade-in-up" style="animation-delay:250ms">
            <h3 class="card-title mb-4">Quick Actions</h3>
            <div class="stack" style="gap:var(--space-2)">
              <button class="btn btn-sm" style="width:100%;justify-content:flex-start" onclick="Router.navigate('student/profile')">👤 Complete Profile</button>
              <button class="btn btn-sm" style="width:100%;justify-content:flex-start" onclick="Router.navigate('student/resume')">📄 Upload Resume</button>
              <button class="btn btn-sm" style="width:100%;justify-content:flex-start" onclick="Router.navigate('student/roadmap')">🗺️ View Roadmap</button>
              <button class="btn btn-sm" style="width:100%;justify-content:flex-start" onclick="Router.navigate('student/applications')">📝 Track Applications</button>
            </div>
          </article>
        </aside>
      </div>
    `;
  }

  function _getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
  }

  return { render };
})();
