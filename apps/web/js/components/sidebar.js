/* ============================================================
   CAMPUSLINK — Sidebar Component
   Role-aware navigation sidebar with section labels.
   ============================================================ */

const Sidebar = (() => {
  const NAV_CONFIG = {
    student: [
      { section: 'Overview', items: [
        { id: 'student/dashboard', icon: '⌂', label: 'Dashboard' },
        { id: 'student/profile', icon: '👤', label: 'My Profile' },
      ]},
      { section: 'Readiness', items: [
        { id: 'student/readiness', icon: '📊', label: 'Readiness Score' },
        { id: 'student/skill-gap', icon: '🔍', label: 'Skill-Gap Analyzer' },
        { id: 'student/roadmap', icon: '🗺️', label: 'Career Roadmap' },
      ]},
      { section: 'Opportunities', items: [
        { id: 'student/jobs', icon: '💼', label: 'Job Discovery' },
        { id: 'student/applications', icon: '📝', label: 'Applications', badge: '4' },
        { id: 'student/resume', icon: '📄', label: 'Resume Analyzer' },
      ]},
      { section: 'Preparation', items: [
        { id: 'student/interview', icon: '🎤', label: 'Mock Interview' },
        { id: 'student/policy-qa', icon: '📋', label: 'Policy Q&A', badge: 'AI' },
      ]},
    ],
    admin: [
      { section: 'Command Center', items: [
        { id: 'admin/dashboard', icon: '⌂', label: 'Dashboard' },
        { id: 'admin/analytics', icon: '📈', label: 'Analytics' },
      ]},
      { section: 'Management', items: [
        { id: 'admin/students', icon: '👥', label: 'Students' },
        { id: 'admin/companies', icon: '🏢', label: 'Companies' },
        { id: 'admin/drives', icon: '🎯', label: 'Placement Drives' },
        { id: 'admin/scheduler', icon: '📅', label: 'Scheduler' },
      ]},
      { section: 'Insights', items: [
        { id: 'admin/interventions', icon: '⚡', label: 'Interventions', badge: '3' },
      ]},
    ],
    recruiter: [
      { section: 'Workspace', items: [
        { id: 'recruiter/dashboard', icon: '⌂', label: 'Dashboard' },
      ]},
      { section: 'Recruitment', items: [
        { id: 'recruiter/jobs', icon: '💼', label: 'My Jobs' },
        { id: 'recruiter/matches', icon: '🎯', label: 'AI Matching' },
        { id: 'recruiter/pipeline', icon: '📊', label: 'Pipeline' },
      ]},
    ],
    mentor: [
      { section: 'Overview', items: [
        { id: 'mentor/dashboard', icon: '⌂', label: 'Dashboard' },
      ]},
      { section: 'Guidance', items: [
        { id: 'mentor/students', icon: '👥', label: 'My Students' },
        { id: 'mentor/roadmaps', icon: '🗺️', label: 'Roadmap Reviews', badge: '3' },
      ]},
    ],
  };

  function render() {
    const role = Store.getRole();
    const sections = NAV_CONFIG[role] || NAV_CONFIG.student;
    const currentRoute = Router.current() || '';

    const sectionsHTML = sections.map(section => `
      <div class="sidebar-section">
        <div class="sidebar-section-label">${section.section}</div>
        <nav class="sidebar-nav">
          ${section.items.map(item => `
            <button class="nav-item ${currentRoute === item.id ? 'active' : ''}"
                    data-route="${item.id}"
                    onclick="Router.navigate('${item.id}')"
                    aria-label="${item.label}">
              <span class="nav-item-icon">${item.icon}</span>
              <span class="nav-item-label">${item.label}</span>
              ${item.badge ? `<span class="nav-item-badge">${item.badge}</span>` : ''}
            </button>
          `).join('')}
        </nav>
      </div>
    `).join('');

    return `
      <aside class="sidebar" id="sidebar" data-role="${role}">
        <a class="sidebar-brand" onclick="Router.navigate('${role}/dashboard')">
          <span class="sidebar-brand-icon">CL</span>
          <span class="sidebar-brand-text">CAMPUSLINK</span>
        </a>
        ${sectionsHTML}
        <div class="sidebar-footer">
          <div class="sidebar-privacy">
            <strong>🔒 Privacy First</strong>
            AI insights support — never replace — human decisions.
          </div>
        </div>
      </aside>
    `;
  }

  // Attach event listeners after render
  function attachEvents() {
    document.querySelectorAll('.nav-item[data-route]').forEach(btn => {
      btn.addEventListener('click', () => {
        Router.navigate(btn.dataset.route);
        // Close mobile sidebar
        document.getElementById('sidebar')?.classList.remove('open');
      });
    });
  }

  return { render, attachEvents };
})();
