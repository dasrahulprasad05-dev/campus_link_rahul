/* ============================================================
   CAMPUSLINK — Login Page
   ============================================================ */

const LoginPage = (() => {
  function render() {
    const app = document.getElementById('app');
    app.className = '';
    app.innerHTML = `
      <div class="auth-layout">
        <div class="auth-showcase">
          <div class="auth-showcase-content">
            <a class="sidebar-brand" style="margin-bottom:var(--space-10)" onclick="Router.navigate('landing')">
              <span class="sidebar-brand-icon">CL</span>
              <span class="sidebar-brand-text">CAMPUSLINK</span>
            </a>
            <h1>Welcome back to <span class="gradient-text">CAMPUSLINK</span></h1>
            <p>AI-powered placement intelligence for your campus-to-corporate journey.</p>
            <div class="auth-features">
              <div class="auth-feature">
                <div class="auth-feature-icon">📊</div>
                <span>Explainable readiness scoring</span>
              </div>
              <div class="auth-feature">
                <div class="auth-feature-icon">🎯</div>
                <span>AI-driven candidate matching</span>
              </div>
              <div class="auth-feature">
                <div class="auth-feature-icon">🎤</div>
                <span>Mock interview practice with feedback</span>
              </div>
              <div class="auth-feature">
                <div class="auth-feature-icon">🔒</div>
                <span>Privacy-first — AI supports, never decides</span>
              </div>
            </div>
          </div>
        </div>

        <div class="auth-form-container">
          <div class="auth-card">
            <h2>Sign in</h2>
            <p class="text-sm text-muted mb-4">Enter your credentials to access your portal.</p>

            <form id="login-form" onsubmit="return false">
              ${Forms.input({ id: 'login-email', label: 'Email Address', type: 'email', placeholder: 'Enter your registered email', required: true })}
              ${Forms.input({ id: 'login-password', label: 'Password', type: 'password', placeholder: '••••••••', required: true })}

              <div class="flex justify-between items-center mb-4">
                <label class="form-check">
                  <input type="checkbox" checked> Remember me
                </label>
                <a class="text-sm text-accent" style="cursor:pointer;" onclick="EmailAuthPages.showForgotPasswordModal()">Forgot password?</a>
              </div>

              <button type="submit" class="btn btn-primary btn-lg" style="width:100%" id="login-submit">
                Sign In →
              </button>
            </form>

            <div class="auth-link mt-5">
              Don't have an account? <a onclick="Router.navigate('register')">Create one</a>
            </div>
          </div>
        </div>
      </div>
    `;

    _attachEvents();
  }

  function _attachEvents() {
    const form = document.getElementById('login-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
          Toast.warning('Please fill in all fields');
          return;
        }

        const btn = document.getElementById('login-submit');
        btn.textContent = 'Signing in...';
        btn.disabled = true;

        const result = await Auth.login(email, password);

        if (result.success) {
          Toast.success('Welcome back!');
          const role = Store.getRole();
          const user = Store.getUser();
          if (role === 'super_admin') {
            // Super admin always goes directly to super admin dashboard
            Router.navigate('superadmin/dashboard');
          } else if (['admin', 'recruiter', 'mentor'].includes(role) && user && user.admin_verified === false) {
            Router.navigate('pending-verification');
          } else {
            Router.navigate(role + '/dashboard');
          }
        } else {
          Toast.error(result.error);
          btn.textContent = 'Sign In →';
          btn.disabled = false;

          // If admin verification is pending for staff
          if (result.code === 'ADMIN_VERIFICATION_PENDING' || (result.error && result.error.toLowerCase().includes('pending approval'))) {
            const existing = document.getElementById('login-unverified-prompt');
            if (existing) existing.remove();

            const form = document.getElementById('login-form');
            if (form) {
              form.insertAdjacentHTML('beforebegin', `
                <div id="login-unverified-prompt" class="notice mb-4 animate-fade-in-up" style="background:rgba(245, 158, 11, 0.12);border:1px solid rgba(245, 158, 11, 0.35);border-radius:var(--radius-md);padding:14px;font-size:13px;color:#fef08a">
                  <strong>⏳ Admin Verification Not Completed:</strong><br>
                  Your email is verified, but your account is pending approval from the System Administrator.<br>
                  <button type="button" class="btn btn-sm btn-secondary mt-2" style="font-size:12px;padding:6px 12px" onclick="Router.navigate('pending-verification')">
                    🔍 View Status Screen
                  </button>
                </div>
              `);
            }
          }
          // If email is not verified, show prominent activation prompt
          else if (result.code === 'EMAIL_NOT_VERIFIED' || (result.error && result.error.toLowerCase().includes('not verified'))) {
            const existing = document.getElementById('login-unverified-prompt');
            if (existing) existing.remove();

            const form = document.getElementById('login-form');
            if (form) {
              form.insertAdjacentHTML('beforebegin', `
                <div id="login-unverified-prompt" class="notice mb-4 animate-fade-in-up" style="background:rgba(234, 179, 8, 0.12);border:1px solid rgba(234, 179, 8, 0.35);border-radius:var(--radius-md);padding:14px;font-size:13px;color:#fef08a">
                  <strong>⚠️ Account Not Activated:</strong><br>
                  You must verify your email address before signing in. Please check your inbox and <strong>Spam / Junk folder</strong>.<br>
                  <button type="button" class="btn btn-sm btn-secondary mt-2" style="font-size:12px;padding:6px 12px" onclick="EmailAuthPages.resendVerification('${email}')">
                    📧 Resend Activation Link
                  </button>
                </div>
              `);
            }
          }
        }
      });
    }
  }

  function autoFill(role) {
    const creds = (typeof Auth !== 'undefined' && Auth.getPreseededCredentials) ? Auth.getPreseededCredentials() : {
      super_admin: { email: 'superadmin@campuslink.in',    password: 'CampusSuper@2026', label: 'Super Admin' },
    };
    const cred = creds[role];
    if (!cred) return;

    const emailEl = document.getElementById('login-email');
    const passEl = document.getElementById('login-password');
    if (emailEl && passEl) {
      emailEl.value = cred.email;
      passEl.value = cred.password;
      emailEl.dispatchEvent(new Event('input', { bubbles: true }));
      emailEl.dispatchEvent(new Event('change', { bubbles: true }));
      passEl.dispatchEvent(new Event('input', { bubbles: true }));
      passEl.dispatchEvent(new Event('change', { bubbles: true }));

      // Visual pulse highlight on the inputs
      emailEl.style.transition = 'all 0.3s ease';
      passEl.style.transition = 'all 0.3s ease';
      emailEl.style.borderColor = 'var(--primary, #6366f1)';
      emailEl.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.35)';
      passEl.style.borderColor = 'var(--primary, #6366f1)';
      passEl.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.35)';
      setTimeout(() => {
        emailEl.style.borderColor = '';
        emailEl.style.boxShadow = '';
        passEl.style.borderColor = '';
        passEl.style.boxShadow = '';
      }, 1200);

      if (typeof Toast !== 'undefined') {
        Toast.info(`✨ Auto-filled ${cred.label || role} credentials (${cred.email})! Click 'Sign In →' to enter.`);
      }
    }
  }

  function clearFields() {
    const emailEl = document.getElementById('login-email');
    const passEl = document.getElementById('login-password');
    if (emailEl) {
      emailEl.value = '';
      emailEl.dispatchEvent(new Event('input', { bubbles: true }));
      emailEl.dispatchEvent(new Event('change', { bubbles: true }));
    }
    if (passEl) {
      passEl.value = '';
      passEl.dispatchEvent(new Event('input', { bubbles: true }));
      passEl.dispatchEvent(new Event('change', { bubbles: true }));
    }
    if (typeof Toast !== 'undefined') {
      Toast.show('Form fields cleared', 'info');
    }
  }

  async function quickLogin(role) {
    const demoBtns = document.querySelectorAll('.demo-login-section button');
    demoBtns.forEach(b => { b.disabled = true; b.style.opacity = '0.6'; });
    const submitBtn = document.getElementById('login-submit');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = `Signing in as ${role}...`; }

    try {
      const result = await Auth.quickLogin(role);
      if (result.success) {
        Toast.success(`Signed in as ${role}`);
        if (role === 'super_admin') {
          Router.navigate('superadmin/dashboard');
        } else {
          Router.navigate(role + '/dashboard');
        }
      } else {
        Toast.error(result.error || 'Login failed. Please try again.');
        demoBtns.forEach(b => { b.disabled = false; b.style.opacity = '1'; });
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Sign In →'; }
      }
    } catch (err) {
      Toast.error('Login error: ' + (err.message || 'Please check network'));
      demoBtns.forEach(b => { b.disabled = false; b.style.opacity = '1'; });
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Sign In →'; }
    }
  }

  return { render, quickLogin, autoFill, clearFields };
})();

