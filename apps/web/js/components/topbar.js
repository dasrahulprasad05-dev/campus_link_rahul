/* ============================================================
   CAMPUSLINK — Topbar Component
   Top navigation with search, notifications, role switcher,
   and avatar.
   ============================================================ */

const Topbar = (() => {
  function render() {
    const user = Store.get('user');
    const role = Store.getRole();
    const initials = Store.getUserInitials();
    const breadcrumb = _getBreadcrumb();

    const roleLabels = {
      admin: '🏛️ TPO / Admin',
      recruiter: '🏢 Recruiter',
      mentor: '👨‍🏫 Mentor',
      student: '👩‍🎓 Student',
    };
    const roleBadge = roleLabels[role] || (role ? role.toUpperCase() : 'Student');

    return `
      <header class="topbar">
        <div class="topbar-left">
          <button class="topbar-mobile-toggle" id="mobile-toggle" aria-label="Toggle menu">☰</button>
          <div class="topbar-breadcrumb">
            CAMPUSLINK <span>/ ${breadcrumb}</span>
          </div>
        </div>
        <div class="topbar-right">
          <div class="topbar-search">
            <span class="topbar-search-icon">🔍</span>
            <input type="text" placeholder="Search anything..." aria-label="Search" id="global-search">
          </div>
          <button class="topbar-notification" aria-label="Notifications" id="notif-btn">
            🔔
            <span class="topbar-notification-dot"></span>
          </button>
          <span class="badge badge-accent topbar-role-badge" title="Authenticated Portal: ${roleBadge}" style="font-size:12px;padding:4px 10px;font-weight:600">
            ${roleBadge}
          </span>
          <div class="topbar-avatar" id="avatar-btn" title="Logged in as ${user?.name || 'User'} (${role}) — Click to Logout">${initials}</div>
          <button class="btn btn-sm btn-ghost" onclick="Auth.logout()" title="Logout of CAMPUSLINK" style="font-size:12px;padding:var(--space-1) var(--space-2)">
            🚪 Logout
          </button>
        </div>
      </header>
    `;
  }

  function _getBreadcrumb() {
    const route = Router.current() || '';
    const parts = route.split('/');
    if (parts.length >= 2) {
      return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' / ');
    }
    return 'Dashboard';
  }

  function attachEvents() {
    // Mobile toggle
    const toggle = document.getElementById('mobile-toggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        document.getElementById('sidebar')?.classList.toggle('open');
      });
    }

    // Avatar — logout dropdown (simplified)
    const avatar = document.getElementById('avatar-btn');
    if (avatar) {
      avatar.addEventListener('click', () => {
        if (confirm('Logout from CAMPUSLINK?')) {
          Auth.logout();
        }
      });
    }
  }

  return { render, attachEvents };
})();
