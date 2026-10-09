/* CAMPUSLINK — Admin Placement Drives Management */
const AdminDrives = (() => {
  let _drives = [];

  async function render() {
    const main = document.getElementById('main');
    main.innerHTML = `<div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Loading drives...</div></div></div>`;

    const result = await API.get('/drives');
    _drives = Array.isArray(result?.data) ? result.data : (Array.isArray(result) ? result : []);

    _renderList();
  }

  function _renderList() {
    const main = document.getElementById('main');
    if (!main) return;

    main.innerHTML = `
      <div class="page-header">
        <div class="page-header-content">
          <div class="page-eyebrow">Institutional Placement Drives</div>
          <h1 class="page-title">Drive Management</h1>
          <p class="page-subtitle">Schedule, configure, and monitor campus recruitment drives for your students.</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary" onclick="AdminDrives.openCreateDriveModal()">+ Schedule New Drive</button>
          <button class="btn btn-secondary" onclick="AdminDrives.render()">🔄 Refresh</button>
        </div>
      </div>

      <div class="stack">
        ${_drives.length ? _drives.map((d, i) => `
          <article class="card card-interactive animate-fade-in-up" style="animation-delay:${i * 50}ms">
            <div class="flex justify-between items-center">
              <div>
                <div class="flex items-center gap-3 mb-2">
                  <h3 style="margin:0;font-size:17px;">${window.esc(d.company_name || d.company || 'Hiring Partner')}</h3>
                  <span class="status-badge status-${d.status === 'scheduled' ? 'warning' : (d.status === 'in-progress' ? 'confirmed' : 'primary')}">${d.status || 'scheduled'}</span>
                </div>
                <p class="text-sm text-muted" style="margin:2px 0 0 0;">
                  <strong>${window.esc(d.role || 'Campus Hire')}</strong> · 📍 ${window.esc(d.venue || 'Auditorium Hall A')}
                </p>
              </div>
              <div class="text-right">
                <div class="font-bold" style="color:#60a5fa;font-size:15px;">
                  📅 ${d.drive_date ? new Date(d.drive_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
                </div>
                <div class="text-sm text-muted" style="margin-top:2px;">
                  Min CGPA: <strong>${d.min_cgpa || 0}</strong> · ${(Array.isArray(d.branches) ? d.branches : []).join(', ') || 'All Branches'}
                </div>
              </div>
            </div>
            <div class="flex gap-3 mt-4 pt-3" style="border-top:1px solid rgba(255,255,255,0.06);">
              <span class="text-xs text-muted" style="display:flex;align-items:center;">Drive ID: ${d.id.slice(0, 8)}...</span>
              <div style="margin-left:auto;display:flex;gap:8px;">
                <button class="btn btn-sm btn-secondary" onclick="Toast.info('Drive details for ${window.esc(d.company_name || d.company)} sent to student notifications')">📢 Broadcast Alert</button>
              </div>
            </div>
          </article>
        `).join('') : `
          <div class="empty-state" style="padding:48px;text-align:center;">
            <div class="empty-state-icon" style="font-size:48px;margin-bottom:12px">🎯</div>
            <div class="empty-state-title" style="font-size:18px;font-weight:700">No drives scheduled yet</div>
            <p class="empty-state-text" style="color:#94a3b8;margin-bottom:20px;">Click the button below to schedule the first placement drive for your campus.</p>
            <button class="btn btn-primary" onclick="AdminDrives.openCreateDriveModal()">+ Schedule New Drive</button>
          </div>
        `}
      </div>
    `;
  }

  function openCreateDriveModal() {
    const modalId = 'modal-create-drive';
    const existing = document.getElementById(modalId);
    if (existing) existing.remove();

    // Default drive date = 14 days from now
    const defaultDate = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];

    const modalHTML = `
      <div id="${modalId}" class="modal-backdrop" style="position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;">
        <div class="modal-content animate-fade-in-up" style="background:#111827;border:1px solid rgba(255,255,255,0.15);border-radius:16px;width:100%;max-width:560px;padding:28px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.6);max-height:90vh;overflow-y:auto;">
          
          <div class="flex justify-between items-center mb-4 pb-2" style="border-bottom:1px solid rgba(255,255,255,0.08)">
            <div>
              <h2 style="font-size:18px;font-weight:700;margin:0;color:#f8fafc;">🎯 Schedule Campus Placement Drive</h2>
              <p class="text-xs text-muted" style="margin:3px 0 0 0">Configure recruitment drive parameters for student eligibility</p>
            </div>
            <button class="btn btn-sm btn-secondary" onclick="document.getElementById('${modalId}').remove()" style="padding:4px 10px;">✕</button>
          </div>

          <form id="form-create-drive" onsubmit="return false">
            <div class="form-group mb-3">
              <label class="form-label" style="font-size:12.5px;color:#cbd5e1;display:block;margin-bottom:6px;">Company / Recruiter Name *</label>
              <input type="text" id="cd-company" class="form-input" placeholder="e.g. Tata Consultancy Services, Microsoft, Cognizant" required style="width:100%;padding:9px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;">
            </div>

            <div class="form-group mb-3">
              <label class="form-label" style="font-size:12.5px;color:#cbd5e1;display:block;margin-bottom:6px;">Target Job Role *</label>
              <input type="text" id="cd-role" class="form-input" placeholder="e.g. Associate Software Engineer, Cloud Analyst" required style="width:100%;padding:9px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;">
            </div>

            <div class="grid grid-2 gap-3 mb-3" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div class="form-group">
                <label class="form-label" style="font-size:12.5px;color:#cbd5e1;display:block;margin-bottom:6px;">Drive Date *</label>
                <input type="date" id="cd-date" class="form-input" value="${defaultDate}" required style="width:100%;padding:9px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;">
              </div>
              <div class="form-group">
                <label class="form-label" style="font-size:12.5px;color:#cbd5e1;display:block;margin-bottom:6px;">Venue / Mode *</label>
                <input type="text" id="cd-venue" class="form-input" value="Main Auditorium Hall A" placeholder="e.g. Auditorium Hall A, Virtual" required style="width:100%;padding:9px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;">
              </div>
            </div>

            <div class="form-group mb-3">
              <label class="form-label" style="font-size:12.5px;color:#cbd5e1;display:block;margin-bottom:6px;">Minimum CGPA Cutoff</label>
              <input type="number" id="cd-cgpa" step="0.1" min="0" max="10" value="7.0" class="form-input" style="width:100%;padding:9px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;">
            </div>

            <div class="form-group mb-4">
              <label class="form-label" style="font-size:12.5px;color:#cbd5e1;display:block;margin-bottom:6px;">Eligible Engineering Branches (Comma separated)</label>
              <input type="text" id="cd-branches" class="form-input" value="Computer Science & Engineering, Information Technology, Electronics & Telecom" style="width:100%;padding:9px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;">
              <span class="text-xs text-muted" style="display:block;margin-top:4px;">Students from these branches meeting CGPA cutoff will be permitted to apply.</span>
            </div>

            <div class="flex gap-3 justify-end mt-5 pt-3" style="border-top:1px solid rgba(255,255,255,0.08)">
              <button type="button" class="btn btn-secondary" onclick="document.getElementById('${modalId}').remove()">Cancel</button>
              <button type="submit" class="btn btn-primary" id="btn-submit-drive">Schedule Drive →</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const form = document.getElementById('form-create-drive');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const company = document.getElementById('cd-company').value.trim();
      const role = document.getElementById('cd-role').value.trim();
      const date = document.getElementById('cd-date').value;
      const venue = document.getElementById('cd-venue').value.trim();
      const min_cgpa = parseFloat(document.getElementById('cd-cgpa').value) || 0;
      const branchesInput = document.getElementById('cd-branches').value.trim();
      const branches = branchesInput ? branchesInput.split(',').map(b => b.trim()) : [];

      if (!company || !role) {
        Toast.warning('Company name and role are required');
        return;
      }

      const submitBtn = document.getElementById('btn-submit-drive');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Scheduling...';

      try {
        const payload = {
          company,
          role,
          drive_date: date ? new Date(date).toISOString() : new Date().toISOString(),
          venue: venue || 'Main Auditorium',
          min_cgpa,
          branches,
          status: 'scheduled',
        };

        const res = await API.post('/drives', payload);
        if (res && res.success) {
          Toast.success(`🎉 Placement Drive for ${company} scheduled successfully!`);
          document.getElementById(modalId)?.remove();
          await AdminDrives.render();
        } else {
          Toast.error(res?.error?.message || 'Failed to create placement drive');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Schedule Drive →';
        }
      } catch (err) {
        Toast.error('Drive scheduling error: ' + err.message);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Schedule Drive →';
      }
    });
  }

  return { render, openCreateDriveModal };
})();
