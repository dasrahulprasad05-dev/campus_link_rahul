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
          <select class="role-selector" id="role-selector" aria-label="Switch role view">
            <option value="student" ${role === 'student' ? 'selected' : ''}>👩‍🎓 Student</option>
            <option value="admin" ${role === 'admin' ? 'selected' : ''}>🏛️ Admin / TPO</option>
            <option value="recruiter" ${role === 'recruiter' ? 'selected' : ''}>🏢 Recruiter</option>
            <option value="mentor" ${role === 'mentor' ? 'selected' : ''}>👨‍🏫 Mentor</option>
          </select>
          <div class="topbar-avatar" id="avatar-btn" title="${user?.name || 'User'}">${initials}</div>
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
    // Role switcher
    const selector = document.getElementById('role-selector');
    if (selector) {
      selector.addEventListener('change', async (e) => {
        const newRole = e.target.value;
        const res = await Auth.quickLogin(newRole);
        if (res.success) {
          Toast.show(`Switched to ${newRole.toUpperCase()} view`, 'info');
          Router.navigate(newRole + '/dashboard', true);
        } else {
          Toast.show('Unable to switch role: ' + (res.error || 'Authentication error'), 'error');
        }
      });
    }

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
