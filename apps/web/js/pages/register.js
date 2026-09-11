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
          const app = document.getElementById('app');
          app.innerHTML = `
            <div class="auth-layout" style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:var(--space-4)">
              <div class="card p-8 text-center animate-fade-in-up" style="max-width:540px;width:100%;border:1px solid var(--border-color);background:var(--bg-card);border-radius:var(--radius-lg);box-shadow:var(--shadow-xl)">
                <div style="font-size:56px;margin-bottom:16px">✉️</div>
                <h1 class="font-bold mb-2" style="font-size:1.5rem">Check Your Email to Activate</h1>
                <p class="text-sm text-muted mb-4" style="line-height:1.6">
                  We have sent an activation link to <strong style="color:var(--text-primary)">${email}</strong>.<br>
                  You must click the link in your email before you can sign in to CAMPUSLINK.
                </p>

                <div class="notice mb-6" style="background:rgba(234, 179, 8, 0.1);border:1px solid rgba(234, 179, 8, 0.3);border-radius:var(--radius-md);padding:14px;font-size:13px;color:#fef08a;text-align:left">
                  <strong>⚠️ Important Note:</strong><br>
                  • Please check your <strong>Spam / Junk folder</strong> if the email does not appear in your inbox within 1 minute.<br>
                  • Official Sender: <code>rahulprasadcoding01@gmail.com</code> (CAMPUSLINK Portal).
                </div>

                <div class="flex gap-3 justify-center" style="flex-wrap:wrap">
                  <button class="btn btn-primary btn-lg" onclick="Router.navigate('login')">
                    Go to Sign In →
                  </button>
                  <button class="btn btn-secondary btn-lg" onclick="EmailAuthPages.resendVerification('${email}')">
                    Resend Verification Email
                  </button>
                </div>
              </div>
            </div>
          `;
          return;
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
