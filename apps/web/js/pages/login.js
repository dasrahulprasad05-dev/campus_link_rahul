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

            <!-- ⚡ 1-Click Auto-Fill Demo Credentials (Temporary) -->
            <div class="autofill-section mb-5" style="background:linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.08));border:1px solid rgba(99,102,241,0.25);border-radius:var(--radius-md);padding:12px 14px;">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <span style="font-size:14px">⚡</span>
                  <span class="text-xs font-semibold uppercase tracking-wider" style="color:var(--primary, #6366f1);letter-spacing:0.04em">Auto-Fill Credentials</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="badge badge-accent text-xs" style="padding:2px 7px;font-size:10px;font-weight:600">Auto-Write</span>
                  <a class="text-xs text-muted" style="cursor:pointer;font-size:11px;text-decoration:underline" onclick="LoginPage.clearFields()">Clear</a>
                </div>
              </div>
              <p class="text-xs text-muted mb-2" style="margin:0 0 8px 0;line-height:1.4">Click any role to automatically write the preseeded email & password into the input fields:</p>
              <div style="display:grid;grid-template-columns:repeat(2, 1fr);gap:6px">
                <button type="button" class="btn btn-sm" id="btn-fill-student" onclick="LoginPage.autoFill('student')" style="font-size:11.5px;padding:6px 10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.14);justify-content:center;color:var(--text-color, #fff)">
                  🎓 Fill Student
                </button>
                <button type="button" class="btn btn-sm" id="btn-fill-recruiter" onclick="LoginPage.autoFill('recruiter')" style="font-size:11.5px;padding:6px 10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.14);justify-content:center;color:var(--text-color, #fff)">
                  💼 Fill Recruiter
                </button>
                <button type="button" class="btn btn-sm" id="btn-fill-admin" onclick="LoginPage.autoFill('admin')" style="font-size:11.5px;padding:6px 10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.14);justify-content:center;color:var(--text-color, #fff)">
                  🏛️ Fill Admin
                </button>
                <button type="button" class="btn btn-sm" id="btn-fill-mentor" onclick="LoginPage.autoFill('mentor')" style="font-size:11.5px;padding:6px 10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.14);justify-content:center;color:var(--text-color, #fff)">
                  👨‍🏫 Fill Mentor
                </button>
              </div>
            </div>

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

            <div class="demo-login-section mt-5 pt-4" style="border-top:1px solid var(--border-color, rgba(255,255,255,0.08))">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-semibold text-muted uppercase tracking-wider" style="letter-spacing:0.05em">⚡ Direct 1-Click Login (Bypass Form)</span>
                <span class="badge badge-accent text-xs" style="padding:2px 8px;font-size:11px">Instant</span>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
                <button type="button" class="btn btn-sm btn-secondary" style="font-size:12px;padding:7px 10px;justify-content:center" onclick="LoginPage.quickLogin('student')">
                  🎓 Student Instant
                </button>
                <button type="button" class="btn btn-sm btn-secondary" style="font-size:12px;padding:7px 10px;justify-content:center" onclick="LoginPage.quickLogin('admin')">
                  🏛️ Admin Instant
                </button>
                <button type="button" class="btn btn-sm btn-secondary" style="font-size:12px;padding:7px 10px;justify-content:center" onclick="LoginPage.quickLogin('recruiter')">
                  💼 Recruiter Instant
                </button>
                <button type="button" class="btn btn-sm btn-secondary" style="font-size:12px;padding:7px 10px;justify-content:center" onclick="LoginPage.quickLogin('mentor')">
                  👨‍🏫 Mentor Instant
                </button>
              </div>
            </div>

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
          Toast.warning('Please fill in all fields or click an Auto-Fill button above');
          return;
        }

        const btn = document.getElementById('login-submit');
        btn.textContent = 'Signing in...';
        btn.disabled = true;

        const result = await Auth.login(email, password);

        if (result.success) {
          Toast.success('Welcome back!');
          Router.navigate(Store.getRole() + '/dashboard');
        } else {
          Toast.error(result.error);
          btn.textContent = 'Sign In →';
          btn.disabled = false;

          // If email is not verified, show prominent activation prompt
          if (result.code === 'EMAIL_NOT_VERIFIED' || (result.error && result.error.toLowerCase().includes('not verified'))) {
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
      student:   { email: 'ananya.sharma@campuslink.in', password: 'demo123', label: 'Student' },
      recruiter: { email: 'recruiter@campuslink.in',     password: 'demo123', label: 'Recruiter' },
      admin:     { email: 'admin@campuslink.in',         password: 'demo123', label: 'Admin' },
      mentor:    { email: 'mentor@campuslink.in',        password: 'demo123', label: 'Mentor' },
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
        Router.navigate(role + '/dashboard');
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
