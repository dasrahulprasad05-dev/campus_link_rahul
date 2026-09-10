/* ============================================================
   CAMPUSLINK — Email Verification & Password Reset Pages & Modals
   ============================================================ */

const EmailAuthPages = (() => {

  /**
   * 1. First-Time Signup Verification Prompt Modal
   * Strictly shown ONCE on first registration.
   * Stored in localStorage so user is NEVER asked a second time.
   */
  function showFirstTimeSignupModal({ user, role, onDismiss }) {
    const modalId = 'first-time-verify-modal';
    const existing = document.getElementById(modalId);
    if (existing) existing.remove();

    const email = user.email || 'your email';
    const name = user.name || 'there';

    const modalHtml = `
      <div class="modal-backdrop open" id="${modalId}" role="dialog" aria-modal="true">
        <div class="modal-dialog" style="max-width: 580px; border: 1px solid rgba(99, 102, 241, 0.3); box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
          <div class="modal-header" style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(59, 130, 246, 0.05));">
            <div style="display:flex; align-items:center; gap:12px;">
              <div style="width:40px; height:40px; border-radius:10px; background:rgba(99, 102, 241, 0.2); display:flex; align-items:center; justify-content:center; font-size:20px;">
                ✉️
              </div>
              <div>
                <h2 class="modal-title" style="margin:0; font-size:1.25rem;">Verify Your Account</h2>
                <div style="font-size:0.8rem; color:var(--text-muted);">First-time account security notice</div>
              </div>
            </div>
            <button class="modal-close" id="first-time-modal-close" aria-label="Close">✕</button>
          </div>

          <div class="modal-body" style="padding: 24px;">
            <p style="font-size: 1.05rem; margin-top: 0;">
              Welcome aboard, <strong>${name}</strong>! We've sent a verification link to:
            </p>

            <div style="padding: 12px 16px; background: rgba(255,255,255,0.04); border-radius: 8px; font-weight: 600; color: var(--accent-primary); word-break: break-all; margin-bottom: 20px; display:flex; align-items:center; gap:8px;">
              <span>📬</span> <span>${email}</span>
            </div>

            <!-- SPAM WARNING CARD -->
            <div style="background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 10px; padding: 16px; margin-bottom: 20px;">
              <div style="display:flex; align-items:flex-start; gap:10px;">
                <span style="font-size:22px; line-height:1;">⚠️</span>
                <div>
                  <div style="font-weight: 700; color: #fbbf24; margin-bottom: 4px; font-size:0.95rem;">
                    Check your Spam / Junk Folder!
                  </div>
                  <div style="font-size: 0.85rem; color: #fef08a; line-height: 1.5;">
                    Verification emails can sometimes be filtered by Gmail, Outlook, or university webmail into your <strong>Spam or Junk folder</strong>.
                    <ul style="margin: 8px 0 0 16px; padding: 0;">
                      <li>Look for an email from <strong>CAMPUSLINK</strong>.</li>
                      <li>Click <strong>"Report Not Spam"</strong> or move it to Primary so you never miss placement drives and interview calls.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0;">
              💡 <em>You can continue exploring the portal right away. We won't show you this reminder again!</em>
            </p>
          </div>

          <div class="modal-footer" style="display:flex; justify-content:space-between; align-items:center; padding:16px 24px; background:rgba(0,0,0,0.15);">
            <button class="btn btn-secondary btn-sm" id="btn-resend-verify" style="font-size:0.85rem;">
              🔄 Resend Email
            </button>
            <button class="btn btn-primary" id="btn-dismiss-first-time" style="padding:10px 22px;">
              Got it, Continue →
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const closeBtn = document.getElementById('first-time-modal-close');
    const dismissBtn = document.getElementById('btn-dismiss-first-time');
    const resendBtn = document.getElementById('btn-resend-verify');

    const finish = () => {
      const el = document.getElementById(modalId);
      if (el) el.remove();
      if (typeof onDismiss === 'function') onDismiss();
    };

    if (closeBtn) closeBtn.addEventListener('click', finish);
    if (dismissBtn) dismissBtn.addEventListener('click', finish);

    if (resendBtn) {
      resendBtn.addEventListener('click', async () => {
        resendBtn.textContent = 'Sending...';
        resendBtn.disabled = true;
        const res = await Auth.resendVerification(email);
        Toast.info(res.message || 'Verification email resent! Please check your spam folder.');
        resendBtn.textContent = 'Email Sent ✓';
      });
    }
  }

  /**
   * 2. Forgot Password Modal (triggered from Login Page)
   */
  function showForgotPasswordModal() {
    const modalId = 'forgot-password-modal';
    const existing = document.getElementById(modalId);
    if (existing) existing.remove();

    const modalHtml = `
      <div class="modal-backdrop open" id="${modalId}" role="dialog" aria-modal="true">
        <div class="modal-dialog" style="max-width: 500px;">
          <div class="modal-header">
            <h2 class="modal-title" style="margin:0;">Reset Your Password</h2>
            <button class="modal-close" onclick="document.getElementById('${modalId}').remove()" aria-label="Close">✕</button>
          </div>
          <div class="modal-body" style="padding: 24px;">
            <p class="text-sm text-muted mb-4">
              Enter the email address registered with your account and we'll send you a password reset link.
            </p>
            <form id="forgot-password-form" onsubmit="return false">
              <div class="form-group mb-4">
                <label class="form-label" for="fp-email">Registered Email Address</label>
                <input type="email" id="fp-email" class="form-input" placeholder="e.g. student@university.edu" required>
              </div>
              <div style="background: rgba(245, 158, 11, 0.1); border-left: 3px solid #f59e0b; padding: 10px 12px; border-radius: 4px; font-size: 0.8rem; color: #fde68a; margin-bottom: 16px;">
                ⚠️ <strong>Note:</strong> Be sure to check your <strong>Spam or Junk folder</strong> for the reset link!
              </div>
              <button type="submit" class="btn btn-primary" style="width:100%;" id="fp-submit">
                Send Reset Link →
              </button>
            </form>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const form = document.getElementById('forgot-password-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('fp-email').value.trim();
        if (!email) return;

        const btn = document.getElementById('fp-submit');
        btn.textContent = 'Sending link...';
        btn.disabled = true;

        const res = await Auth.forgotPassword(email);
        Toast.success(res.message || 'Password reset link sent! Check your inbox and spam folder.');

        const el = document.getElementById(modalId);
        if (el) el.remove();
      });
    }
  }

  /**
   * 3. Verify Email Landing Page (#verify-email?token=...)
   */
  const VerifyEmailPage = {
    async render() {
      const app = document.getElementById('app');
      app.className = '';
      const params = Router.getParams();
      const token = params.token;
      const email = params.email || '';

      app.innerHTML = `
        <div class="auth-layout" style="min-height:100vh; display:flex; align-items:center; justify-content:center;">
          <div class="auth-card" style="max-width:540px; text-align:center; padding:40px 30px;" id="verify-box">
            <div style="font-size:48px; margin-bottom:16px;" class="animate-pulse">⏳</div>
            <h2>Verifying your email...</h2>
            <p class="text-sm text-muted">Please hold on while we validate your token.</p>
          </div>
        </div>
      `;

      if (!token) {
        document.getElementById('verify-box').innerHTML = `
          <div style="font-size:48px; margin-bottom:16px;">❌</div>
          <h2>Missing Verification Token</h2>
          <p class="text-sm text-muted mb-6">This verification link is incomplete or broken.</p>
          <button class="btn btn-primary" onclick="Router.navigate('login')">Return to Login</button>
        `;
        return;
      }

      const result = await Auth.verifyEmail(token);

      if (result.success) {
        document.getElementById('verify-box').innerHTML = `
          <div style="font-size:52px; margin-bottom:16px;">🎉</div>
          <h2 style="color:var(--accent-success, #10b981);">Email Verified Successfully!</h2>
          <p style="color:var(--text-secondary); line-height:1.6; margin-bottom:20px;">
            Your account is now fully active. We have sent a <strong>Welcome Email</strong> to your inbox with next steps for your placement journey.
          </p>
          <div style="background:rgba(16, 185, 129, 0.1); border:1px solid rgba(16, 185, 129, 0.3); border-radius:8px; padding:12px; font-size:0.85rem; color:#a7f3d0; margin-bottom:24px;">
            ✓ Access 10 AI features: Mock Interviews, Vector Resume Matching & Readiness Scoring.
          </div>
          <button class="btn btn-primary btn-lg" style="width:100%" onclick="Router.navigate('${Store.isAuthenticated() ? Store.getRole() + '/dashboard' : 'login'}')">
            ${Store.isAuthenticated() ? 'Continue to Dashboard →' : 'Sign In to Your Account →'}
          </button>
        `;
      } else {
        document.getElementById('verify-box').innerHTML = `
          <div style="font-size:48px; margin-bottom:16px;">⚠️</div>
          <h2 style="color:#f87171;">Verification Failed</h2>
          <p class="text-sm text-muted mb-6">${result.error || 'This link has expired or has already been used.'}</p>
          <div style="display:flex; gap:12px; justify-content:center;">
            <button class="btn btn-secondary" onclick="Router.navigate('login')">Go to Login</button>
            <button class="btn btn-primary" onclick="EmailAuthPages.showForgotPasswordModal()">Forgot Password</button>
          </div>
        `;
      }
    }
  };

  /**
   * 4. Reset Password Landing Page (#reset-password?token=...)
   */
  const ResetPasswordPage = {
    render() {
      const app = document.getElementById('app');
      app.className = '';
      const params = Router.getParams();
      const token = params.token;
      const email = params.email || '';

      if (!token) {
        app.innerHTML = `
          <div class="auth-layout" style="min-height:100vh; display:flex; align-items:center; justify-content:center;">
            <div class="auth-card" style="max-width:500px; text-align:center; padding:40px;">
              <div style="font-size:48px; margin-bottom:16px;">❌</div>
              <h2>Invalid Reset Link</h2>
              <p class="text-sm text-muted mb-6">No password reset token was provided.</p>
              <button class="btn btn-primary" onclick="Router.navigate('login')">Return to Login</button>
            </div>
          </div>
        `;
        return;
      }

      app.innerHTML = `
        <div class="auth-layout" style="min-height:100vh; display:flex; align-items:center; justify-content:center;">
          <div class="auth-card" style="max-width:500px; width:100%; padding:36px;">
            <div style="text-align:center; margin-bottom:24px;">
              <div style="font-size:40px; margin-bottom:10px;">🔒</div>
              <h2>Set New Password</h2>
              <p class="text-sm text-muted">${email ? `For account: <strong>${email}</strong>` : 'Enter your new account password below'}</p>
            </div>

            <form id="reset-password-form" onsubmit="return false">
              <div class="form-group mb-4">
                <label class="form-label" for="new-password">New Password</label>
                <input type="password" id="new-password" class="form-input" placeholder="Min 8 characters" required>
              </div>

              <div class="form-group mb-6">
                <label class="form-label" for="confirm-password">Confirm New Password</label>
                <input type="password" id="confirm-password" class="form-input" placeholder="••••••••" required>
              </div>

              <button type="submit" class="btn btn-primary btn-lg" style="width:100%;" id="btn-save-new-pwd">
                Update Password →
              </button>
            </form>
          </div>
        </div>
      `;

      const form = document.getElementById('reset-password-form');
      if (form) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const newPassword = document.getElementById('new-password').value;
          const confirmPassword = document.getElementById('confirm-password').value;

          if (!newPassword || newPassword.length < 6) {
            Toast.error('Password must be at least 6 characters');
            return;
          }

          if (newPassword !== confirmPassword) {
            Toast.error('Passwords do not match');
            return;
          }

          const btn = document.getElementById('btn-save-new-pwd');
          btn.textContent = 'Updating...';
          btn.disabled = true;

          const res = await Auth.resetPassword(token, newPassword);

          if (res.success) {
            Toast.success('Password reset successfully! You can now log in.');
            Router.navigate('login');
          } else {
            Toast.error(res.error || 'Failed to reset password. Link may have expired.');
            btn.textContent = 'Update Password →';
            btn.disabled = false;
          }
        });
      }
    }
  };

  return {
    showFirstTimeSignupModal,
    showForgotPasswordModal,
    VerifyEmailPage,
    ResetPasswordPage,
  };
})();
