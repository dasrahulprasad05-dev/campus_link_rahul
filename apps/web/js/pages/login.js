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
            <p class="text-sm text-muted mb-6">Enter your credentials to access your portal.</p>

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
                <span class="text-xs font-semibold text-muted uppercase tracking-wider" style="letter-spacing:0.05em">⚡ Quick Demo Login (Judges)</span>
                <span class="badge badge-accent text-xs" style="padding:2px 8px;font-size:11px">Pre-Seeded</span>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
                <button type="button" class="btn btn-sm btn-secondary" style="font-size:12px;padding:7px 10px;justify-content:center" onclick="LoginPage.quickLogin('student')">
                  🎓 Student Demo
                </button>
                <button type="button" class="btn btn-sm btn-secondary" style="font-size:12px;padding:7px 10px;justify-content:center" onclick="LoginPage.quickLogin('admin')">
                  🏛️ Admin Demo
                </button>
                <button type="button" class="btn btn-sm btn-secondary" style="font-size:12px;padding:7px 10px;justify-content:center" onclick="LoginPage.quickLogin('recruiter')">
                  💼 Recruiter Demo
                </button>
                <button type="button" class="btn btn-sm btn-secondary" style="font-size:12px;padding:7px 10px;justify-content:center" onclick="LoginPage.quickLogin('mentor')">
                  👨‍🏫 Mentor Demo
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
          Toast.warning('Please fill in all fields');
          return;
        }

        const btn = document.getElementById('login-submit');
        btn.textContent = 'Signing in...';
        btn.disabled = true;

        // Friendly notice if Render cloud server is waking from cold start
        const slowNotice = setTimeout(() => {
          Toast.info('Connecting to cloud backend... Free-tier server may take ~15s to wake up.');
        }, 2500);

        const result = await Auth.login(email, password);
        clearTimeout(slowNotice);

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

  async function quickLogin(role) {
    const demoBtns = document.querySelectorAll('.demo-login-section button');
    demoBtns.forEach(b => { b.disabled = true; b.style.opacity = '0.6'; });
    const submitBtn = document.getElementById('login-submit');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = `Signing in as ${role}...`; }

    const slowNotice = setTimeout(() => {
      Toast.info('Connecting to cloud backend... Waking up server container, please wait.');
    }, 2500);

    try {
      const result = await Auth.quickLogin(role);
      clearTimeout(slowNotice);
      if (result.success) {
        Toast.success(`Signed in as ${role}`);
        Router.navigate(role + '/dashboard');
      } else {
        Toast.error(result.error || 'Login failed. Please try again.');
        demoBtns.forEach(b => { b.disabled = false; b.style.opacity = '1'; });
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Sign In →'; }
      }
    } catch (err) {
      clearTimeout(slowNotice);
      Toast.error('Login error: ' + (err.message || 'Please check network'));
      demoBtns.forEach(b => { b.disabled = false; b.style.opacity = '1'; });
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Sign In →'; }
    }
  }

  return { render, quickLogin };
})();
