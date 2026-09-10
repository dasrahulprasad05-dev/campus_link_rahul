/* ============================================================
   CAMPUSLINK — Register Page
   ============================================================ */

const RegisterPage = (() => {
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
            <h1>Join <span class="gradient-text">CAMPUSLINK</span></h1>
            <p>Create your account and start your placement journey with AI-powered intelligence at your side.</p>
            <div class="auth-features">
              <div class="auth-feature">
                <div class="auth-feature-icon">1</div>
                <span>Create account & select your role</span>
              </div>
              <div class="auth-feature">
                <div class="auth-feature-icon">2</div>
                <span>Complete your profile & add skills</span>
              </div>
              <div class="auth-feature">
                <div class="auth-feature-icon">3</div>
                <span>Upload resume & set target role</span>
              </div>
              <div class="auth-feature">
                <div class="auth-feature-icon">4</div>
                <span>Get your baseline readiness score</span>
              </div>
            </div>
          </div>
        </div>

        <div class="auth-form-container">
          <div class="auth-card">
            <h2>Create your account</h2>
            <p class="text-sm text-muted mb-6">Fill in your details to get started.</p>

            <form id="register-form" onsubmit="return false">
              ${Forms.input({ id: 'reg-name', label: 'Full Name', placeholder: 'e.g. Ananya Sharma', required: true })}
              ${Forms.input({ id: 'reg-email', label: 'Email', type: 'email', placeholder: 'your.name@university.edu', required: true })}
              <div class="form-row">
                ${Forms.input({ id: 'reg-password', label: 'Password', type: 'password', placeholder: 'Min 8 characters', required: true })}
                ${Forms.input({ id: 'reg-confirm', label: 'Confirm Password', type: 'password', placeholder: '••••••••', required: true })}
              </div>
              ${Forms.select({
                id: 'reg-role', label: 'I am a',
                choices: [
                  { value: 'student', label: '👩‍🎓 Student' },
                  { value: 'admin', label: '🏛️ Placement Cell Admin / TPO' },
                  { value: 'recruiter', label: '🏢 Recruiter' },
                  { value: 'mentor', label: '👨‍🏫 Mentor / Faculty' },
                ],
                required: true,
              })}

              <label class="form-check mb-4">
                <input type="checkbox" required>
                I agree to the Terms of Service and Privacy Policy
              </label>

              <button type="submit" class="btn btn-primary btn-lg" style="width:100%" id="reg-submit">
                Create Account →
              </button>
            </form>

            <div class="auth-link">
              Already have an account? <a onclick="Router.navigate('login')">Sign in</a>
            </div>
          </div>
        </div>
      </div>
    `;

    _attachEvents();
  }

  function _attachEvents() {
    const form = document.getElementById('register-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;
        const confirm = document.getElementById('reg-confirm').value;
        const role = document.getElementById('reg-role').value;

        if (!name || !email || !password) {
          Toast.warning('Please fill in all required fields');
          return;
        }

        if (password !== confirm) {
          Toast.error('Passwords do not match');
          return;
        }

        if (password.length < 6) {
          Toast.error('Password must be at least 6 characters');
          return;
        }

        const btn = document.getElementById('reg-submit');
        btn.textContent = 'Creating account...';
        btn.disabled = true;

        const result = await Auth.register({ name, email, password, role });

        if (result.success) {
          const userObj = result.user || { name, email };
          const userId = userObj.id || email;
          const dismissalKey = 'campuslink_verification_notified_' + userId;
          const alreadyNotified = localStorage.getItem(dismissalKey);

          if (!alreadyNotified) {
            // First time signup: prompt to verify email & check spam folder
            EmailAuthPages.showFirstTimeSignupModal({
              user: userObj,
              role,
              onDismiss: () => {
                // Save flag: Never ask a second time
                localStorage.setItem(dismissalKey, 'true');
                Toast.success('Welcome to CAMPUSLINK 🎉');
                Router.navigate(role + '/dashboard');
              }
            });
          } else {
            // Already prompted before: don't ask a second time
            Toast.success('Welcome back to CAMPUSLINK 🎉');
            Router.navigate(role + '/dashboard');
          }
        } else {
          Toast.error(result.error);
          btn.textContent = 'Create Account →';
          btn.disabled = false;
        }
      });
    }
  }

  return { render };
})();
