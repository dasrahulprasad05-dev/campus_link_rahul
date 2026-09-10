/* ============================================================
   CAMPUSLINK — Landing Page
   Public-facing hero, features, stats, and CTA.
   ============================================================ */

const LandingPage = (() => {
  function render() {
    const app = document.getElementById('app');
    app.className = '';
    app.innerHTML = `
      <div class="landing-layout">
        <nav class="landing-nav">
          <a class="sidebar-brand" style="margin:0">
            <span class="sidebar-brand-icon">CL</span>
            <span class="sidebar-brand-text">CAMPUSLINK</span>
          </a>
          <div class="flex items-center gap-3">
            <button class="btn btn-ghost" onclick="Router.navigate('login')">Login</button>
            <button class="btn btn-primary" onclick="Router.navigate('register')">Get Started</button>
          </div>
        </nav>

        <!-- Hero -->
        <section class="landing-section landing-hero">
          <div class="landing-hero-badge">
            🚀 The Enterprise AI Placement Intelligence Platform
          </div>
          <h1>
            Your <span class="gradient-text">AI-Powered</span> Campus Placement Engine
          </h1>
          <p>
            Unify placement operations, measure student readiness, match candidates to opportunities,
            and transform your campus recruitment with explainable AI intelligence.
          </p>
          <div class="landing-hero-actions">
            <button class="btn btn-primary btn-lg" onclick="Router.navigate('register')">
              Start for Free →
            </button>
            <button class="btn btn-lg" onclick="Router.navigate('login')">
              Watch Demo
            </button>
          </div>

          <div class="landing-stats">
            <div class="landing-stat">
              <div class="landing-stat-value gradient-text">842+</div>
              <div class="landing-stat-label">Students Tracked</div>
            </div>
            <div class="landing-stat">
              <div class="landing-stat-value gradient-text">78%</div>
              <div class="landing-stat-label">Avg. Readiness</div>
            </div>
            <div class="landing-stat">
              <div class="landing-stat-value gradient-text">126</div>
              <div class="landing-stat-label">Offers This Cycle</div>
            </div>
            <div class="landing-stat">
              <div class="landing-stat-value gradient-text">14</div>
              <div class="landing-stat-label">Active Drives</div>
            </div>
          </div>
        </section>

        <!-- Features -->
        <section class="landing-section">
          <div class="text-center mb-6">
            <div class="page-eyebrow">The Locked 10 Features</div>
            <h2 style="font-size:28px;margin-top:var(--space-3)">Everything Your Placement Cell Needs</h2>
            <p style="max-width:520px;margin:var(--space-3) auto 0">
              From readiness scoring to AI mock interviews — a complete ecosystem for students, admins, recruiters, and mentors.
            </p>
          </div>

          <div class="features-grid stagger-children">
            ${_features().map(f => `
              <div class="feature-card animate-fade-in-up">
                <div class="feature-icon kpi-icon ${f.color}">${f.icon}</div>
                <h3>${f.title}</h3>
                <p>${f.desc}</p>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- Roles -->
        <section class="landing-section">
          <div class="text-center mb-6">
            <div class="page-eyebrow">Four Portals, One Platform</div>
            <h2 style="font-size:28px;margin-top:var(--space-3)">Built for Every Stakeholder</h2>
          </div>
          <div class="grid grid-2" style="max-width:900px;margin:0 auto">
            ${_roles().map(r => `
              <div class="card card-interactive" style="cursor:pointer" onclick="Auth.quickLogin('${r.role}').then(()=>Router.navigate('${r.role}/dashboard'))">
                <div class="flex items-center gap-3 mb-4">
                  <div class="kpi-icon ${r.color}" style="font-size:22px">${r.icon}</div>
                  <h3>${r.title}</h3>
                </div>
                <p class="text-sm">${r.desc}</p>
                <div class="mt-4">
                  <span class="badge badge-accent">Try ${r.title} Portal →</span>
                </div>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- CTA -->
        <section class="landing-section text-center" style="padding-bottom:80px">
          <h2 style="font-size:32px;margin-bottom:var(--space-4)">
            Ready to <span class="gradient-text">Transform</span> Your Placements?
          </h2>
          <p style="max-width:480px;margin:0 auto var(--space-6)">
            Join the AI-powered placement revolution. Set up your campus in minutes.
          </p>
          <button class="btn btn-primary btn-lg" onclick="Router.navigate('register')">
            Get Started Now →
          </button>
        </section>

        <!-- Footer -->
        <footer style="border-top:1px solid var(--border-subtle);padding:var(--space-6) var(--space-8);text-align:center">
          <p class="text-sm text-muted">
            © 2026 CAMPUSLINK Technologies Inc. · Next-Gen Placement Intelligence Platform · Privacy-First AI
          </p>
        </footer>
      </div>
    `;
  }

  function _features() {
    return [
      { icon: '📊', title: 'Readiness Score', desc: 'A composite, explainable placement-readiness score from skills, projects, academics, and activity.', color: 'blue' },
      { icon: '🔍', title: 'Skill-Gap Analyzer', desc: 'Compare your skills against any target role. Get a prioritized learning plan for missing competencies.', color: 'green' },
      { icon: '📄', title: 'Resume ↔ JD Matcher', desc: 'AI-powered comparison of your resume against job descriptions with actionable improvement tips.', color: 'orange' },
      { icon: '🎯', title: 'AI Candidate Matching', desc: 'Transparent, explainable ranking of candidates for recruiters — not a black box.', color: 'blue' },
      { icon: '🎤', title: 'Mock Interviews', desc: 'Practice role-specific interviews with AI-generated questions, scoring, and STAR feedback.', color: 'green' },
      { icon: '📅', title: 'Smart Scheduler', desc: 'Conflict-free placement drive scheduling with venue, time, and participant checks.', color: 'orange' },
      { icon: '⚡', title: 'At-Risk Detection', desc: 'Advisory signals for students who may need additional support — transparent and reviewable.', color: 'red' },
      { icon: '🗺️', title: 'Career Roadmaps', desc: 'Milestone-based learning plans aligned to target roles. Mentors can review and adjust.', color: 'blue' },
      { icon: '📈', title: 'Command Center', desc: 'Real-time analytics dashboard for placement cells — funnel, trends, and intervention insights.', color: 'green' },
    ];
  }

  function _roles() {
    return [
      { role: 'student', icon: '👩‍🎓', title: 'Student', desc: 'Track readiness, discover jobs, practice interviews, and manage your placement journey.', color: 'blue' },
      { role: 'admin', icon: '🏛️', title: 'Admin / TPO', desc: 'Manage students, drives, companies, and monitor placement outcomes with AI insights.', color: 'green' },
      { role: 'recruiter', icon: '🏢', title: 'Recruiter', desc: 'Post jobs, discover matched candidates, and manage your recruitment pipeline.', color: 'orange' },
      { role: 'mentor', icon: '👨‍🏫', title: 'Mentor', desc: 'Monitor assigned students, review roadmaps, and provide targeted career guidance.', color: 'red' },
    ];
  }

  return { render };
})();
