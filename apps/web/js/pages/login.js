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

            <div class="auth-link mt-6">
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
          Router.navigate(Store.getRole() + '/dashboard');
        } else {
          Toast.error(result.error);
          btn.textContent = 'Sign In →';
          btn.disabled = false;
        }
      });
    }
  }

  async function quickLogin(role) {
    const result = await Auth.quickLogin(role);
    if (result.success) {
      Toast.success(`Signed in as ${role}`);
      Router.navigate(role + '/dashboard');
    }
  }

  return { render, quickLogin };
})();
