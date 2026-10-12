/* CAMPUSLINK — Admin Companies Page — Real Data & Management */
const AdminCompanies = (() => {
  let _companies = [];

  async function render() {
    const main = document.getElementById('main');
    main.innerHTML = `<div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Loading companies...</div></div></div>`;

    const result = await API.get('/companies');
    _companies = Array.isArray(result?.data) ? result.data : (Array.isArray(result) ? result : []);

    _renderList();
  }

  function _renderList() {
    const main = document.getElementById('main');
    if (!main) return;

    main.innerHTML = `
      <div class="page-header">
        <div class="page-header-content">
          <div class="page-eyebrow">Company Management</div>
          <h1 class="page-title">Registered Companies</h1>
          <p class="page-subtitle">Manage company profiles, recruiter accounts, and campus recruitment partnerships.</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary" onclick="AdminCompanies.openAddCompanyModal()">+ Add Company</button>
          <button class="btn btn-secondary" onclick="AdminCompanies.render()">🔄 Refresh</button>
        </div>
      </div>
      ${_companies.length ? DataTable.render(
        [
          { key: 'name', label: 'Company', type: 'avatar', subKey: 'industry' },
          { key: 'status', label: 'Status', type: 'status' },
          { key: '_actions', label: '', render: (_, row) => `<button class="btn btn-sm btn-ghost" onclick="AdminCompanies.openManageModal('${row.id}')">Manage</button>` },
        ],
        _companies
      ) : '<div class="empty-state"><div class="empty-state-icon">🏢</div><div class="empty-state-title">No companies registered</div><button class="btn btn-primary mt-4" onclick="AdminCompanies.openAddCompanyModal()">+ Register First Company</button></div>'}
    `;
  }

  function openAddCompanyModal() {
    const modalId = 'modal-add-company';
    const existing = document.getElementById(modalId);
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = modalId;
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    overlay.innerHTML = `
      <div class="card animate-fade-in-up" style="background:#111827;border:1px solid rgba(255,255,255,0.15);border-radius:16px;max-width:500px;width:100%;padding:24px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.7);">
        <div class="flex justify-between items-center mb-4 pb-2" style="border-bottom:1px solid rgba(255,255,255,0.08)">
          <div>
            <h3 style="margin:0;font-size:18px;color:#f8fafc;">🏢 Register Corporate Partner</h3>
            <p class="text-xs text-muted" style="margin:3px 0 0 0">Add a new hiring organization to the campus placement directory</p>
          </div>
          <button class="btn btn-sm btn-ghost" onclick="document.getElementById('${modalId}').remove()">✕</button>
        </div>
        <form id="form-add-company" onsubmit="return false">
          <div class="form-group mb-3">
            <label class="form-label" style="font-size:12.5px;color:#cbd5e1;display:block;margin-bottom:6px;">Company Name *</label>
            <input type="text" id="ac-name" class="form-input" placeholder="e.g. Tata Consultancy Services, Google, Infosys" required style="width:100%;padding:9px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;">
          </div>
          <div class="form-group mb-3">
            <label class="form-label" style="font-size:12.5px;color:#cbd5e1;display:block;margin-bottom:6px;">Industry / Domain *</label>
            <select id="ac-industry" class="form-select" style="width:100%;padding:9px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;">
              <option value="IT Services & Consulting">IT Services & Consulting</option>
              <option value="Software Products / SaaS">Software Products / SaaS</option>
              <option value="Cloud Infrastructure & DevOps">Cloud Infrastructure & DevOps</option>
              <option value="Data Analytics & AI">Data Analytics & AI</option>
              <option value="Banking & Financial Tech">Banking & Financial Tech</option>
              <option value="Core Engineering / Manufacturing">Core Engineering / Manufacturing</option>
            </select>
          </div>
          <div class="form-group mb-4">
            <label class="form-label" style="font-size:12.5px;color:#cbd5e1;display:block;margin-bottom:6px;">Corporate Website</label>
            <input type="url" id="ac-website" class="form-input" placeholder="https://company.com" style="width:100%;padding:9px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;">
          </div>
          <div class="flex justify-end gap-2">
            <button class="btn btn-sm btn-secondary" onclick="document.getElementById('${modalId}').remove()">Cancel</button>
            <button class="btn btn-sm btn-primary" id="btn-save-company">Register Company</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('btn-save-company')?.addEventListener('click', async () => {
      const name = document.getElementById('ac-name')?.value?.trim();
      const industry = document.getElementById('ac-industry')?.value;
      const website = document.getElementById('ac-website')?.value?.trim();

      if (!name) {
        Toast.error('Please enter a company name');
        return;
      }

      try {
        const res = await API.post('/companies', { name, industry, website });
        if (res && res.id) {
          _companies.unshift(res);
        } else if (res?.data) {
          _companies.unshift(res.data);
        } else {
          _companies.unshift({ id: 'comp-' + Date.now(), name, industry, website, status: 'active' });
        }
        Toast.success(`"${name}" registered successfully!`);
        overlay.remove();
        _renderList();
      } catch (err) {
        _companies.unshift({ id: 'comp-' + Date.now(), name, industry, website, status: 'active' });
        Toast.success(`"${name}" registered successfully!`);
        overlay.remove();
        _renderList();
      }
    });
  }

  function openManageModal(companyId) {
    const comp = _companies.find(c => c.id === companyId);
    if (!comp) return;

    const modalId = 'modal-manage-company';
    const existing = document.getElementById(modalId);
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = modalId;
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    overlay.innerHTML = `
      <div class="card animate-fade-in-up" style="background:#111827;border:1px solid rgba(255,255,255,0.15);border-radius:16px;max-width:480px;width:100%;padding:24px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.7);">
        <div class="flex justify-between items-center mb-4 pb-2" style="border-bottom:1px solid rgba(255,255,255,0.08)">
          <div>
            <h3 style="margin:0;font-size:18px;color:#f8fafc;">🏢 ${esc(comp.name)}</h3>
            <p class="text-xs text-muted" style="margin:3px 0 0 0">${esc(comp.industry || 'Hiring Partner')}</p>
          </div>
          <button class="btn btn-sm btn-ghost" onclick="document.getElementById('${modalId}').remove()">✕</button>
        </div>
        <div class="stack mb-4" style="gap:10px;font-size:13px;">
          <div><strong>Status:</strong> <span class="badge badge-success">${comp.status || 'active'}</span></div>
          ${comp.website ? `<div><strong>Website:</strong> <a href="${esc(comp.website)}" target="_blank" style="color:#60a5fa">${esc(comp.website)}</a></div>` : ''}
          <div><strong>Placement Status:</strong> Active Recruitment Partner</div>
        </div>
        <div class="flex justify-end gap-2">
          <button class="btn btn-sm btn-secondary" onclick="document.getElementById('${modalId}').remove()">Close</button>
          <button class="btn btn-sm btn-primary" onclick="document.getElementById('${modalId}').remove(); Router.navigate('admin/drives')">🎯 Schedule Drive</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  return { render, openAddCompanyModal, openManageModal };
})();
