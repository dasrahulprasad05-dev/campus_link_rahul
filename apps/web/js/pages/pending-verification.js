/* ============================================================
   CAMPUSLINK — Pending Verification Page
   Screen shown when a staff account (TPO/Admin, Recruiter, Mentor)
   has verified their email, but is awaiting approval from the
   System Administrator (Super Admin).
   ============================================================ */

const PendingVerificationPage = (() => {
  async function render() {
    const app = document.getElementById('app');
    app.className = '';

    const user = (typeof Store !== 'undefined' && Store.getUser()) || {};
    const roleLabels = {
      admin: 'Training & Placement Officer (TPO)',
      recruiter: 'Corporate Recruiter / Company',
      mentor: 'Faculty Mentor',
      super_admin: 'Super Admin',
      student: 'Student',
    };

    const roleName = roleLabels[user.role] || user.role || 'Staff Member';

    app.innerHTML = `
      <div class="auth-layout" style="justify-content:center;align-items:center;min-height:100vh;background:var(--bg-main, #0b0f19);padding:24px;">
        <div style="max-width:540px;width:100%;background:var(--card-bg, #111827);border:1px solid rgba(245, 158, 11, 0.3);border-radius:16px;padding:36px;box-shadow:0 20px 40px -15px rgba(0,0,0,0.5);text-align:center;" class="animate-fade-in-up">
          
          <div style="width:72px;height:72px;margin:0 auto 20px auto;border-radius:50%;background:rgba(245, 158, 11, 0.12);display:flex;align-items:center;justify-content:center;font-size:36px;border:2px solid rgba(245, 158, 11, 0.35);">
            ⏳
          </div>

          <div style="display:inline-block;padding:4px 12px;border-radius:20px;background:rgba(245, 158, 11, 0.15);color:#fbbf24;font-size:12px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:12px;">
            Verification Pending
          </div>

          <h1 style="font-size:24px;font-weight:700;color:#ffffff;margin:0 0 10px 0;line-height:1.3;">
            Admin Verification Not Completed
          </h1>

          <p style="color:var(--text-secondary, #94a3b8);font-size:14px;line-height:1.6;margin:0 0 24px 0;">
            Your email has been verified, but institutional staff accounts require manual review and verification by the System Administrator before access is unlocked.
          </p>

          <div style="background:rgba(255, 255, 255, 0.03);border:1px solid rgba(255, 255, 255, 0.08);border-radius:12px;padding:16px;margin-bottom:24px;text-align:left;">
            <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:13px;">
              <span style="color:#94a3b8;">Full Name</span>
              <span style="color:#f1f5f9;font-weight:600;">${window.esc ? window.esc(user.name || 'User') : (user.name || 'User')}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:13px;">
              <span style="color:#94a3b8;">Email Address</span>
              <span style="color:#f1f5f9;font-weight:600;">${window.esc ? window.esc(user.email || '—') : (user.email || '—')}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:13px;">
              <span style="color:#94a3b8;">Requested Role</span>
              <span style="color:#60a5fa;font-weight:600;">${roleName}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;">
              <span style="color:#94a3b8;">Admin Approval</span>
              <span style="color:#fbbf24;font-weight:600;">⏳ Awaiting Approval</span>
            </div>
          </div>

          <div style="display:flex;gap:12px;justify-content:center;">
            <button class="btn btn-primary" id="btn-check-verification" onclick="PendingVerificationPage.checkStatus()" style="flex:1;justify-content:center;">
              🔄 Check Status / Refresh
            </button>
            <button class="btn btn-secondary" onclick="Auth.logout()" style="justify-content:center;">
              Sign Out
            </button>
          </div>

          <p style="margin:20px 0 0 0;font-size:12px;color:#64748b;">
            Once verified by the administrator, you will receive an email confirmation and can access all placement modules.
          </p>
        </div>
      </div>
    `;
  }

  async function checkStatus() {
    const btn = document.getElementById('btn-check-verification');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Checking...';
    }

    try {
      const user = Store.getUser();
      if (!user) {
        Router.navigate('login');
        return;
      }

      // Check current user status via API
      const res = await API.get('/auth/me');
      if (res && res.success && res.data) {
        const updated = res.data;
        Store.set('user', updated);
        if (updated.admin_verified) {
          Toast.success('🎉 Your account has been approved by the Administrator!');
          Router.navigate(updated.role + '/dashboard');
          return;
        }
      }
      Toast.info('Account is still awaiting verification by the Super Administrator.');
    } catch (err) {
      Toast.info('Verification still pending. Please check again later.');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = '🔄 Check Status / Refresh';
      }
    }
  }

  return { render, checkStatus };
})();
