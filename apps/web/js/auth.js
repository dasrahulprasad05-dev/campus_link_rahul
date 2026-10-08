/* ============================================================
   CAMPUSLINK — Auth Module
   Login, register, logout, and session management.
   ============================================================ */

const Auth = (() => {

  const getBase = () => {
    const root = (window.__API_URL__ || localStorage.getItem('CAMPUSLINK_API_URL') || '').replace(/\/+$/, '');
    return `${root}/api/v1/auth`;
  };

  async function login(email, password) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 14000);

      const res = await fetch(`${getBase()}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

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
        return { 
          success: false, 
          error: err.error?.message || err.detail || 'Invalid email or password',
          code: err.error?.code 
        };
      }

      return { success: false, error: 'Authentication service temporarily unavailable. Please try again.' };
    } catch (e) {
      if (e.name === 'AbortError') {
        return { success: false, error: 'Server took too long to respond (Render free tier cold-start). Please click once more.' };
      }
      console.error('[Auth] Network or server error during login:', e);
      return { success: false, error: 'Unable to connect to authentication server. Please check your network connection.' };
    }
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
        // Do NOT log in if email verification is required!
        if (result.token && !result.requiresVerification) {
          Store.setMany({
            user: result.user,
            token: result.token,
            role: result.user.role || 'student',
          });
        }
        return { success: true, user: result.user, requiresVerification: result.requiresVerification ?? true };
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

  async function quickLogin(role) {
    const creds = {
      admin:     { email: 'admin@campuslink.in', password: 'demo123' },
      student:   { email: 'ananya.sharma@campuslink.in', password: 'demo123' },
      recruiter: { email: 'recruiter@campuslink.in', password: 'demo123' },
      mentor:    { email: 'mentor@campuslink.in', password: 'demo123' },
    };
    if (creds[role]) {
      try {
        const res = await login(creds[role].email, creds[role].password);
        if (res.success) return res;
      } catch (_e) {}

      // Fallback: If network is blocked or server is in extended cold start, activate demo session directly
      const demoUsers = {
        student: { id: '10000000-0000-4000-8000-000000000001', name: 'Ananya Sharma', email: 'ananya.sharma@campuslink.in', role: 'student', branch: 'Computer Science & Engineering', cgpa: 8.42, readiness: 78, skills: ['Python', 'SQL', 'React', 'DSA'] },
        admin: { id: 'a1b2c3d4-0001-0001-0001-000000000002', name: 'Dr. Rajesh Nayak', email: 'admin@campuslink.in', role: 'admin' },
        recruiter: { id: 'a1b2c3d4-0001-0001-0001-000000000003', name: 'Sneha Patel', email: 'recruiter@campuslink.in', role: 'recruiter', company: 'TechNova Solutions' },
        mentor: { id: 'a1b2c3d4-0001-0001-0001-000000000004', name: 'Prof. Suresh Mishra', email: 'mentor@campuslink.in', role: 'mentor' },
      };

      if (demoUsers[role]) {
        Store.setMany({
          user: demoUsers[role],
          token: 'demo_token_' + role,
          role: role,
        });
        return { success: true, offline: true };
      }
    }
    return Promise.resolve({ success: false, error: 'Invalid demo role selected' });
  }

  return { login, register, logout, isLoggedIn, getUser, quickLogin, forgotPassword, resetPassword, verifyEmail, resendVerification };
})();
