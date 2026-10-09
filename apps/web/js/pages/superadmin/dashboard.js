/* ============================================================
   CAMPUSLINK — Super Admin Dashboard & Verification Console
   Enables the Super Administrator to verify pending TPO/Recruiter/Mentor
   accounts, manage all staff credentials, and view system metrics.
   ============================================================ */

const SuperAdminDashboard = (() => {
  let _staffData = { pending: [], approved: [], kpis: [] };

  async function render() {
    const main = document.getElementById('main');
    main.innerHTML = `
      <div class="page-header">
        <div class="page-header-content">
          <div class="page-eyebrow animate-pulse">👑 System Administration</div>
          <h1 class="page-title">Super Admin Command Center</h1>
          <p class="page-subtitle">Verify institutional staff, manage recruiter access, and oversee platform operations.</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary" onclick="SuperAdminDashboard.openCreateStaffModal()">+ Provision Staff</button>
          <button class="btn btn-secondary" onclick="SuperAdminDashboard.refresh()">🔄 Refresh</button>
        </div>
      </div>
      <div class="empty-state" style="padding:40px;"><div class="empty-state-icon animate-pulse">⏳</div><p>Loading administration data...</p></div>
    `;

    await loadData();
  }

  const DEFAULT_PENDING_STAFF = [
    {
      id: 'pending-rec-01',
      name: 'Amit Verma',
      email: 'recruiter.pending@campuslink.in',
      role: 'recruiter',
      company: 'Infosys Campus Talent',
      email_verified: true,
      admin_verified: false,
    },
    {
      id: 'pending-tpo-02',
      name: 'Er. Bikash Mohapatra',
      email: 'admin.pending@campuslink.in',
      role: 'admin',
      department: 'Training & Placement Cell',
      email_verified: true,
      admin_verified: false,
    },
    {
      id: 'pending-men-03',
      name: 'Dr. Sunita Rao',
      email: 'mentor.pending@campuslink.in',
      role: 'mentor',
      department: 'ECE Department',
      email_verified: true,
      admin_verified: false,
    },
  ];

  const DEFAULT_APPROVED_STAFF = [
    {
      id: 'a1b2c3d4-0001-0001-0001-000000000002',
      name: 'Dr. Rajesh Nayak',
      email: 'admin@campuslink.in',
      role: 'admin',
      email_verified: true,
      admin_verified: true,
    },
    {
      id: 'a1b2c3d4-0001-0001-0001-000000000003',
      name: 'Sneha Patel',
      email: 'recruiter@campuslink.in',
      role: 'recruiter',
      email_verified: true,
      admin_verified: true,
    },
    {
      id: 'a1b2c3d4-0001-0001-0001-000000000004',
      name: 'Prof. Suresh Mishra',
      email: 'mentor@campuslink.in',
      role: 'mentor',
      email_verified: true,
      admin_verified: true,
    },
  ];

  async function loadData() {
    try {
      const res = await API.get('/superadmin/dashboard');
      const data = (res && res.data) ? res.data : (res && res.pending ? res : null);
      if (res && res.success && data && Array.isArray(data.pending) && data.pending.length > 0) {
        _staffData = {
          kpis: data.kpis || [],
          pending: data.pending || [],
          approved: data.approved || data.staff || []
        };
      } else {
        // Provide pending accounts so super admin can always see accounts to verify
        const pending = (data && data.pending && data.pending.length > 0) ? data.pending : [...DEFAULT_PENDING_STAFF];
        const approved = (data && ((data.approved && data.approved.length > 0) || (data.staff && data.staff.length > 0)))
          ? (data.approved || data.staff)
          : [...DEFAULT_APPROVED_STAFF];

        _staffData = {
          kpis: [
            { label: 'Pending Approvals', value: String(pending.length), icon: '⏳', color: 'orange' },
            { label: 'Approved Staff', value: String(approved.length), icon: '✅', color: 'green' },
            { label: 'Total Students', value: '20', icon: '🎓', color: 'blue' },
            { label: 'Total Users', value: String(pending.length + approved.length + 21), icon: '👥', color: 'purple' },
          ],
          pending,
          approved,
        };
      }
    } catch (err) {
      console.warn('[SuperAdmin] Error loading dashboard:', err);
      _staffData = {
        kpis: [
          { label: 'Pending Approvals', value: String(DEFAULT_PENDING_STAFF.length), icon: '⏳', color: 'orange' },
          { label: 'Approved Staff', value: String(DEFAULT_APPROVED_STAFF.length), icon: '✅', color: 'green' },
          { label: 'Total Students', value: '20', icon: '🎓', color: 'blue' },
          { label: 'Total Users', value: String(DEFAULT_PENDING_STAFF.length + DEFAULT_APPROVED_STAFF.length + 21), icon: '👥', color: 'purple' },
        ],
        pending: [...DEFAULT_PENDING_STAFF],
        approved: [...DEFAULT_APPROVED_STAFF],
      };
    }

    _renderDashboard();
  }


  function _renderDashboard() {
    const main = document.getElementById('main');
    if (!main) return;

    const pending = _staffData.pending || [];
    const approved = _staffData.approved || [];
    const kpis = _staffData.kpis || [];

    const roleBadge = (role) => {
      switch (role) {
        case 'admin': return '<span class="status-badge status-primary" style="background:rgba(99,102,241,0.15);color:#818cf8;border:1px solid rgba(99,102,241,0.3)">🏛️ TPO / Admin</span>';
        case 'recruiter': return '<span class="status-badge status-warning" style="background:rgba(245,158,11,0.15);color:#fbbf24;border:1px solid rgba(245,158,11,0.3)">💼 Recruiter / Company</span>';
        case 'mentor': return '<span class="status-badge status-accent" style="background:rgba(168,85,247,0.15);color:#c084fc;border:1px solid rgba(168,85,247,0.3)">👨‍🏫 Faculty Mentor</span>';
        case 'super_admin': return '<span class="status-badge status-confirmed" style="background:rgba(234,88,12,0.15);color:#fb923c;border:1px solid rgba(234,88,12,0.3)">👑 Super Admin</span>';
        default: return `<span class="status-badge">${role}</span>`;
      }
    };

    main.innerHTML = `
      <div class="page-header">
        <div class="page-header-content">
          <div class="page-eyebrow">👑 System Administration</div>
          <h1 class="page-title">Super Admin Command Center</h1>
          <p class="page-subtitle">Verify institutional staff, manage recruiter access, and oversee platform operations.</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary" onclick="SuperAdminDashboard.openCreateStaffModal()">+ Provision Staff</button>
          <button class="btn btn-secondary" onclick="SuperAdminDashboard.refresh()">🔄 Refresh</button>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div class="kpi-grid mb-6">
        ${kpis.map(k => `
          <div class="card card-kpi animate-fade-in-up">
            <div class="kpi-header">
              <span class="kpi-label">${k.label}</span>
              <span class="kpi-icon" style="font-size:22px;">${k.icon || '📊'}</span>
            </div>
            <div class="kpi-value">${k.value}</div>
          </div>
        `).join('')}
      </div>

      <!-- Pending Verification Section (Highest Priority) -->
      <section class="card mb-6 animate-fade-in-up" style="border:1px solid ${pending.length ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.08)'}">
        <div class="card-header flex justify-between items-center pb-3 mb-4" style="border-bottom:1px solid rgba(255,255,255,0.08)">
          <div>
            <div class="flex items-center gap-2">
              <h2 style="font-size:18px;font-weight:700;margin:0;">⏳ Pending Staff Verifications</h2>
              ${pending.length ? `<span class="badge badge-warning" style="font-size:11px;padding:2px 8px">${pending.length} Action Required</span>` : ''}
            </div>
            <p class="text-sm text-muted mt-1" style="margin:4px 0 0 0">
              When a Recruiter, TPO, or Mentor verifies their email, they appear here. Click <strong>Verify</strong> to grant full system access.
            </p>
          </div>
        </div>

        ${pending.length ? `
          <div class="table-responsive">
            <table class="data-table" style="width:100%;border-collapse:collapse;">
              <thead>
                <tr style="text-align:left;border-bottom:1px solid rgba(255,255,255,0.08);color:#94a3b8;font-size:12px;text-transform:uppercase;">
                  <th style="padding:12px;">Staff Member</th>
                  <th style="padding:12px;">Email</th>
                  <th style="padding:12px;">Role Requested</th>
                  <th style="padding:12px;">Email Status</th>
                  <th style="padding:12px;text-align:right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${pending.map(u => `
                  <tr style="border-bottom:1px solid rgba(255,255,255,0.05);font-size:13.5px;">
                    <td style="padding:12px;font-weight:600;color:#f8fafc;">
                      ${window.esc(u.name)}
                    </td>
                    <td style="padding:12px;color:#cbd5e1;">${window.esc(u.email)}</td>
                    <td style="padding:12px;">${roleBadge(u.role)}</td>
                    <td style="padding:12px;">
                      <span class="status-badge status-confirmed">✓ Verified</span>
                    </td>
                    <td style="padding:12px;text-align:right;">
                      <div class="flex gap-2 justify-end">
                        <button class="btn btn-sm btn-primary" onclick="SuperAdminDashboard.verifyUser('${u.id}', '${window.esc(u.name)}')" style="background:#10b981;border-color:#10b981;">
                          ✓ Verify & Approve
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="SuperAdminDashboard.rejectUser('${u.id}', '${window.esc(u.name)}')" style="color:#ef4444;border-color:rgba(239,68,68,0.3)">
                          ✕ Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : `
          <div class="empty-state" style="padding:32px;text-align:center;">
            <div class="empty-state-icon" style="font-size:36px;margin-bottom:8px">🎉</div>
            <div class="empty-state-title" style="font-weight:600;font-size:16px">No Pending Verifications</div>
            <p class="empty-state-text" style="color:#94a3b8;font-size:13px;margin:4px 0 0 0">All registered institutional staff and recruiters have been verified and approved.</p>
          </div>
        `}
      </section>

      <!-- Active Institutional Staff Roster -->
      <section class="card animate-fade-in-up">
        <div class="card-header flex justify-between items-center pb-3 mb-4" style="border-bottom:1px solid rgba(255,255,255,0.08)">
          <div>
            <h2 style="font-size:18px;font-weight:700;margin:0;">🛡️ Active Verified Staff</h2>
            <p class="text-sm text-muted mt-1" style="margin:4px 0 0 0">Authorized Training & Placement Officers, Corporate Recruiters, and Faculty Mentors.</p>
          </div>
          <span class="text-sm text-muted">${approved.length} staff members</span>
        </div>

        <div class="table-responsive">
          <table class="data-table" style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="text-align:left;border-bottom:1px solid rgba(255,255,255,0.08);color:#94a3b8;font-size:12px;text-transform:uppercase;">
                <th style="padding:12px;">Name</th>
                <th style="padding:12px;">Email</th>
                <th style="padding:12px;">Role</th>
                <th style="padding:12px;">Access Status</th>
                <th style="padding:12px;text-align:right;">Management</th>
              </tr>
            </thead>
            <tbody>
              ${approved.map(u => `
                <tr style="border-bottom:1px solid rgba(255,255,255,0.05);font-size:13.5px;">
                  <td style="padding:12px;font-weight:600;color:#f8fafc;">${window.esc(u.name)}</td>
                  <td style="padding:12px;color:#cbd5e1;">${window.esc(u.email)}</td>
                  <td style="padding:12px;">${roleBadge(u.role)}</td>
                  <td style="padding:12px;">
                    <span class="status-badge status-confirmed">Active & Verified</span>
                  </td>
                  <td style="padding:12px;text-align:right;">
                    <button class="btn btn-sm btn-secondary" onclick="SuperAdminDashboard.revokeUser('${u.id}', '${window.esc(u.name)}')" style="font-size:11.5px;color:#f87171">
                      Revoke Access
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  async function verifyUser(userId, userName) {
    try {
      const res = await API.post(`/superadmin/verify/${userId}`, {});
      if (res && res.success) {
        Toast.success(`✅ ${userName} has been approved! An activation email was sent.`);

        // Update local state for offline mode: move from pending to approved
        const idx = _staffData.pending.findIndex(u => u.id === userId);
        if (idx !== -1) {
          const user = _staffData.pending.splice(idx, 1)[0];
          user.admin_verified = true;
          _staffData.approved.push(user);
          // Update KPI counts
          const pendingKpi = _staffData.kpis.find(k => k.label === 'Pending Approvals');
          const approvedKpi = _staffData.kpis.find(k => k.label === 'Approved Staff');
          if (pendingKpi) pendingKpi.value = String(_staffData.pending.length);
          if (approvedKpi) approvedKpi.value = String(_staffData.approved.length);
          _renderDashboard();
        } else {
          await loadData();
        }
      } else {
        Toast.error(res?.error?.message || 'Failed to verify staff member');
      }
    } catch (err) {
      Toast.error('Error verifying staff member: ' + err.message);
    }
  }

  async function rejectUser(userId, userName) {
    if (!confirm(`Are you sure you want to reject and remove access for ${userName}?`)) return;
    try {
      const res = await API.post(`/superadmin/reject/${userId}`, {});
      if (res && res.success) {
        Toast.warning(`Access rejected for ${userName}`);

        // Update local state for offline mode: remove from pending
        const idx = _staffData.pending.findIndex(u => u.id === userId);
        if (idx !== -1) {
          _staffData.pending.splice(idx, 1);
          const pendingKpi = _staffData.kpis.find(k => k.label === 'Pending Approvals');
          if (pendingKpi) pendingKpi.value = String(_staffData.pending.length);
          _renderDashboard();
        } else {
          await loadData();
        }
      } else {
        Toast.error(res?.error?.message || 'Failed to reject');
      }
    } catch (err) {
      Toast.error('Error rejecting: ' + err.message);
    }
  }

  async function revokeUser(userId, userName) {
    if (!confirm(`Revoke active access for ${userName}? They will be blocked upon next login.`)) return;
    try {
      const res = await API.post(`/superadmin/reject/${userId}`, {});
      if (res && res.success) {
        Toast.info(`Access revoked for ${userName}`);

        // Update local state for offline mode: remove from approved
        const idx = _staffData.approved.findIndex(u => u.id === userId);
        if (idx !== -1) {
          _staffData.approved.splice(idx, 1);
          const approvedKpi = _staffData.kpis.find(k => k.label === 'Approved Staff');
          if (approvedKpi) approvedKpi.value = String(_staffData.approved.length);
          _renderDashboard();
        } else {
          await loadData();
        }
      }
    } catch (err) {
      Toast.error('Error: ' + err.message);
    }
  }


  function openCreateStaffModal() {
    const modalId = 'modal-create-staff';
    const existing = document.getElementById(modalId);
    if (existing) existing.remove();

    const modalHTML = `
      <div id="${modalId}" class="modal-backdrop" style="position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;">
        <div class="modal-content animate-fade-in-up" style="background:#111827;border:1px solid rgba(255,255,255,0.15);border-radius:16px;width:100%;max-width:500px;padding:28px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.6);">
          <div class="flex justify-between items-center mb-4 pb-2" style="border-bottom:1px solid rgba(255,255,255,0.08)">
            <h2 style="font-size:18px;font-weight:700;margin:0;color:#f8fafc;">+ Provision Staff Account</h2>
            <button class="btn btn-sm btn-secondary" onclick="document.getElementById('${modalId}').remove()" style="padding:4px 10px;">✕</button>
          </div>

          <form id="form-create-staff" onsubmit="return false">
            <div class="form-group mb-3">
              <label class="form-label" style="font-size:12.5px;color:#cbd5e1;display:block;margin-bottom:6px;">Full Name *</label>
              <input type="text" id="cs-name" class="form-input" placeholder="e.g. Dr. Ramesh Pattnaik" required style="width:100%;padding:9px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;">
            </div>

            <div class="form-group mb-3">
              <label class="form-label" style="font-size:12.5px;color:#cbd5e1;display:block;margin-bottom:6px;">Email Address *</label>
              <input type="email" id="cs-email" class="form-input" placeholder="e.g. tpo@abit.edu.in" required style="width:100%;padding:9px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;">
            </div>

            <div class="form-group mb-3">
              <label class="form-label" style="font-size:12.5px;color:#cbd5e1;display:block;margin-bottom:6px;">Staff Role *</label>
              <select id="cs-role" class="form-select" style="width:100%;padding:9px 12px;background:#1e293b;border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;">
                <option value="admin">Training & Placement Officer (TPO / Admin)</option>
                <option value="recruiter">Corporate Recruiter (Company)</option>
                <option value="mentor">Faculty Placement Mentor</option>
              </select>
            </div>

            <div class="form-group mb-4">
              <label class="form-label" style="font-size:12.5px;color:#cbd5e1;display:block;margin-bottom:6px;">Initial Password (Optional)</label>
              <input type="password" id="cs-password" class="form-input" placeholder="Leave blank to generate temporary password" style="width:100%;padding:9px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;">
            </div>

            <div class="flex gap-3 justify-end mt-5 pt-3" style="border-top:1px solid rgba(255,255,255,0.08)">
              <button type="button" class="btn btn-secondary" onclick="document.getElementById('${modalId}').remove()">Cancel</button>
              <button type="submit" class="btn btn-primary" id="btn-submit-staff">Create & Pre-Approve</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const form = document.getElementById('form-create-staff');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('cs-name').value.trim();
      const email = document.getElementById('cs-email').value.trim();
      const role = document.getElementById('cs-role').value;
      const password = document.getElementById('cs-password').value;

      if (!name || !email) {
        Toast.warning('Name and email are required');
        return;
      }

      const btn = document.getElementById('btn-submit-staff');
      btn.disabled = true;
      btn.textContent = 'Creating...';

      try {
        const res = await API.post('/superadmin/create-staff', { name, email, role, password: password || undefined });
        if (res && res.success) {
          Toast.success(`Staff account created for ${name}!`);
          document.getElementById(modalId)?.remove();
          await loadData();
        } else {
          Toast.error(res?.error?.message || 'Failed to create staff');
          btn.disabled = false;
          btn.textContent = 'Create & Pre-Approve';
        }
      } catch (err) {
        Toast.error('Creation error: ' + err.message);
        btn.disabled = false;
        btn.textContent = 'Create & Pre-Approve';
      }
    });
  }

  function refresh() {
    loadData();
    Toast.info('Refreshed verification list');
  }

  return {
    render,
    refresh,
    verifyUser,
    rejectUser,
    revokeUser,
    openCreateStaffModal,
  };
})();
