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

  const getBase = () => {
    const root = (window.__API_URL__ || localStorage.getItem('CAMPUSLINK_API_URL') || '').replace(/\/+$/, '');
    return `${root}/api/v1/auth`;
  };

  async function login(email, password) {
    try {
      const res = await fetch(`${getBase()}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const contentType = res.headers.get('content-type') || '';

      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        Store.setMany({
          user: data.user,
          token: data.token,
          role: data.user.role,
        });
        return { success: true };
      }

      if (contentType.includes('application/json')) {
        const err = await res.json().catch(() => ({}));
        return { success: false, error: err.error?.message || 'Invalid credentials' };
      }

      // Static host returned HTML (404/405 on Vercel without backend proxy)
      console.warn('[Auth] Non-JSON API response. Entering local preview mode.');
      if (typeof Toast !== 'undefined') Toast.info('Backend on Render: Entering demo mode');
      return loginOffline(email, password);
    } catch (e) {
      console.warn('[Auth] Backend API unreachable. Entering local demo simulation mode.');
      if (typeof Toast !== 'undefined') Toast.show('API offline: Entering local demo mode', 'info');
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
      isOfflineDemo: true,
    });
    return { success: true };
  }

  async function register(data) {
    try {
      const res = await fetch(`${getBase()}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const contentType = res.headers.get('content-type') || '';

      if (res.ok && contentType.includes('application/json')) {
        const result = await res.json();
        Store.setMany({
          user: result.user,
          token: result.token,
          role: result.user.role || 'student',
        });
        return { success: true, user: result.user, requiresVerification: result.requiresVerification };
      }

      if (contentType.includes('application/json')) {
        const err = await res.json().catch(() => ({}));
        return { success: false, error: err.error?.message || 'Registration failed' };
      }

      // Non-JSON response (e.g. 404 or 405 on static Vercel host without backend proxy)
      console.warn('[Auth] Backend returned non-JSON (' + res.status + '). Creating preview student account.');
      const newUser = {
        id: 'u-' + Date.now(),
        name: data.name,
        email: data.email,
        role: 'student',
        email_verified: false,
      };
      Store.setMany({
        user: newUser,
        token: 'demo-jwt-' + Date.now(),
        role: 'student',
        isOfflineDemo: true,
      });
      return { success: true, user: newUser, requiresVerification: true };
    } catch (e) {
      console.warn('[Auth] Backend API unreachable. Creating simulated local student account.');
      if (typeof Toast !== 'undefined') Toast.show('API offline: Account created in demo mode', 'info');
      // Architecture Freeze Rule 4: Strictly lock role to student, preventing client-side escalation
      const newUser = {
        id: 'u-' + Date.now(),
        name: data.name,
        email: data.email,
        role: 'student',
        email_verified: false,
      };
      Store.setMany({
        user: newUser,
        token: 'demo-jwt-' + Date.now(),
        role: 'student',
        isOfflineDemo: true,
      });
      return { success: true, user: newUser, requiresVerification: true };
    }
  }

  async function forgotPassword(email) {
    try {
      const res = await fetch(`${getBase()}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      return data;
    } catch (e) {
      return {
        success: true,
        message: 'Password reset email simulated. Please check your inbox and spam folder.'
      };
    }
  }

  async function resetPassword(token, newPassword) {
    try {
      const res = await fetch(`${getBase()}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error?.message || 'Failed to reset password' };
      }
      return data;
    } catch (e) {
      return { success: false, error: 'Network error connecting to reset service' };
    }
  }

  async function verifyEmail(token) {
    try {
      const res = await fetch(`${getBase()}/verify-email?token=${encodeURIComponent(token)}`);
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error?.message || 'Verification failed' };
      }
      // Update store user verified status if logged in
      const currentUser = Store.get('user');
      if (currentUser) {
        currentUser.email_verified = true;
        Store.set('user', currentUser);
      }
      return data;
    } catch (e) {
      return { success: false, error: 'Network error connecting to verification service' };
    }
  }

  async function resendVerification(email) {
    try {
      const res = await fetch(`${getBase()}/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      return data;
    } catch (e) {
      return { success: true, message: 'Verification link resent. Please check your spam folder.' };
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

  return { login, register, logout, isLoggedIn, getUser, quickLogin, forgotPassword, resetPassword, verifyEmail, resendVerification };
})();
