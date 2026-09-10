/* ============================================================
   CAMPUSLINK — Auth Module
   Login, register, logout, and session management.
   ============================================================ */

const Auth = (() => {

  // Demo users for offline mode
  const DEMO_USERS = {
    'student@campuslink.in': { id: 'u-1', name: 'Ananya Sharma', email: 'student@campuslink.in', role: 'student', password: 'demo123' },
    'admin@campuslink.in':   { id: 'u-2', name: 'Dr. Rajesh Nayak', email: 'admin@campuslink.in', role: 'admin', password: 'demo123' },
    'recruiter@campuslink.in': { id: 'u-3', name: 'Sneha Patel', email: 'recruiter@campuslink.in', role: 'recruiter', password: 'demo123' },
    'mentor@campuslink.in':  { id: 'u-4', name: 'Prof. Suresh Mishra', email: 'mentor@campuslink.in', role: 'mentor', password: 'demo123' },
  };

  async function login(email, password) {
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        Store.setMany({
          user: data.user,
          token: data.token,
          role: data.user.role,
        });
        return { success: true };
      }

      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error?.message || 'Invalid credentials' };
    } catch (e) {
      // Offline: check demo users
      return loginOffline(email, password);
    }
  }

  function loginOffline(email, password) {
    const user = DEMO_USERS[email.toLowerCase()];
    if (!user) {
      return { success: false, error: 'No account found with this email. Try: student@campuslink.in' };
    }
    if (user.password !== password) {
      return { success: false, error: 'Incorrect password. Try: demo123' };
    }

    const { password: _, ...safeUser } = user;
    Store.setMany({
      user: safeUser,
      token: 'demo-jwt-' + Date.now(),
      role: safeUser.role,
    });
    return { success: true };
  }

  async function register(data) {
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const result = await res.json();
        Store.setMany({
          user: result.user,
          token: result.token,
          role: result.user.role || 'student',
        });
        return { success: true };
      }

      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error?.message || 'Registration failed' };
    } catch (e) {
      // Offline: create demo user
      const newUser = {
        id: 'u-' + Date.now(),
        name: data.name,
        email: data.email,
        role: data.role || 'student',
      };
      Store.setMany({
        user: newUser,
        token: 'demo-jwt-' + Date.now(),
        role: newUser.role,
      });
      return { success: true };
    }
  }

  function logout() {
    Store.reset();
    Router.navigate('login');
    Toast.show('Logged out successfully', 'info');
  }

  function isLoggedIn() {
    return Store.isAuthenticated();
  }

  function getUser() {
    return Store.get('user');
  }

  function quickLogin(role) {
    const emails = { student: 'student@campuslink.in', admin: 'admin@campuslink.in', recruiter: 'recruiter@campuslink.in', mentor: 'mentor@campuslink.in' };
    return login(emails[role] || emails.student, 'demo123');
  }

  return { login, register, logout, isLoggedIn, getUser, quickLogin };
})();
