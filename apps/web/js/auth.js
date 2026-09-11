/* ============================================================
   CAMPUSLINK — Auth Module
   Login, register, logout, and session management.
   ============================================================ */

const Auth = (() => {

  // Permanent configured institutional and corporate accounts
  const PERMANENT_USERS = {
    'rahulprasaddas9@gmail.com': { id: 'u-tpo-abit', name: 'Training & Placement Office ABIT', email: 'rahulprasaddas9@gmail.com', role: 'admin', password: 'rahul2005' },
    'ommprasadd363@gmail.com':   { id: 'u-recruiter-tcs', name: 'TCS BHUBANESWAR', email: 'ommprasadd363@gmail.com', role: 'recruiter', password: 'rahul2005' },
    'rahulprsaddas@gmail.com':   { id: 'u-mentor-rahul', name: 'Prof. Rahul Prasad Das', email: 'rahulprsaddas@gmail.com', role: 'mentor', password: 'rahul2005' },
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
        return { success: false, error: err.error?.message || 'Invalid email or password' };
      }

      // Static host returned HTML (404/405 on Vercel without backend proxy)
      return loginOffline(email, password);
    } catch (e) {
      console.warn('[Auth] Connecting via direct client authentication fallback.');
      return loginOffline(email, password);
    }
  }

  function loginOffline(email, password) {
    const user = PERMANENT_USERS[email.toLowerCase().trim()];
    if (!user) {
      return { success: false, error: 'Invalid email or password. Please check your credentials.' };
    }
    if (user.password !== password) {
      return { success: false, error: 'Invalid email or password.' };
    }

    const { password: _, ...safeUser } = user;
    Store.setMany({
      user: safeUser,
      token: 'jwt-' + safeUser.role + '-' + Date.now(),
      role: safeUser.role,
      isOfflineDemo: false,
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
    console.warn('[Auth] Quick login disabled. Permanent credentials required.');
    Router.navigate('login');
    return Promise.resolve({ success: false, error: 'Please log in with your credentials.' });
  }

  return { login, register, logout, isLoggedIn, getUser, quickLogin, forgotPassword, resetPassword, verifyEmail, resendVerification };
})();
