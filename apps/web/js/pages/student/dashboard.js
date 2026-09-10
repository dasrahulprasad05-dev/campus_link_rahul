/* ============================================================
   CAMPUSLINK — Student Dashboard
   Main command center with KPIs, readiness, jobs, skill gaps,
   and readiness trend.
   ============================================================ */

const StudentDashboard = (() => {
  async function render() {
    const data = API.DEMO.student;
    const user = Store.get('user');
    const name = user?.name?.split(' ')[0] || 'Student';

    const main = document.getElementById('main');
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
      ${KPICard.render(data.kpis)}

      <!-- Main Grid -->
      <div class="grid grid-main">
        <div class="stack">
          <!-- Readiness Card -->
          <article class="card animate-fade-in-up">
            <div class="card-header">
              <h2 class="card-title">Placement Readiness</h2>
              <span class="badge badge-accent">+6 this month</span>
            </div>
            <div class="readiness-grid">
              ${ScoreRing.render(data.readiness.score)}
              <div>
                ${data.readiness.factors.map(f => `
                  <div class="progress-group">
                    <div class="progress-label">
                      <span class="progress-label-name">${f.label}</span>
                      <span class="progress-label-value">${f.value}%</span>
                    </div>
                    <div class="progress-bar">
                      <div class="progress-bar-fill" style="width:${f.value}%"></div>
                    </div>
                  </div>
                `).join('')}
                <div class="insight-card warning mt-4">
                  <strong>💡 Highest-impact action</strong>
                  Complete one SQL assessment and add measurable outcomes to your project descriptions.
                </div>
              </div>
            </div>
          </article>

          <!-- Recommended Jobs -->
          <article class="card animate-fade-in-up" style="animation-delay:100ms">
            <div class="card-header">
              <h2 class="card-title">Recommended Opportunities</h2>
              <button class="btn btn-sm" onclick="Router.navigate('student/jobs')">View All</button>
            </div>
            ${data.jobs.slice(0, 3).map(j => `
              <div class="job-card">
                <div class="job-card-top">
                  <div>
                    <div class="job-card-title">${j.title}</div>
                    <div class="job-card-company">${j.company}</div>
                  </div>
                  <span class="match-badge">${j.match}% match</span>
                </div>
                <div class="job-card-meta">
                  <span>📍 ${j.location}</span>
                  <span>💼 ${j.type}</span>
                  <span>⏰ ${j.deadline}</span>
                </div>
                <div class="flex gap-2">
                  ${SkillBadge.render(j.skills)}
                </div>
              </div>
            `).join('')}
          </article>
        </div>

        <!-- Right Sidebar -->
        <aside class="stack">
          <!-- Skill Gaps -->
          <article class="card animate-fade-in-up" style="animation-delay:150ms">
            <div class="card-header">
              <h2 class="card-title">Priority Skill Gaps</h2>
              <span class="badge badge-warning">Target: ${data.profile.targetRole}</span>
            </div>
            ${data.skills.map(s => `
              <div class="list-item">
                <div class="list-item-content">
                  <div class="list-item-title">${s.name}</div>
                  <div class="list-item-sub">${s.action}</div>
                </div>
                <span class="skill-tag ${s.priority}">${s.priority}</span>
              </div>
            `).join('')}
            <button class="btn btn-sm mt-4" style="width:100%" onclick="Router.navigate('student/skill-gap')">
              Run Full Analysis →
            </button>
          </article>

          <!-- Readiness Trend -->
          <article class="card animate-fade-in-up" style="animation-delay:200ms">
            <div class="card-header">
              <h2 class="card-title">Readiness Trend</h2>
              <span class="kpi-delta positive">↑ Improving</span>
            </div>
            ${Chart.trendChart(data.trend, data.trendLabels)}
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
