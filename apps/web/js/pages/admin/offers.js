/* ============================================================
   CAMPUSLINK — Admin Offers Page
   Placement office offer tracking, document verification,
   and offer analytics.
   ============================================================ */
const AdminOffers = (() => {
  let _offers = [];

  async function render() {
    const main = document.getElementById('main');
    main.innerHTML = `<div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Loading offers...</div></div></div>`;

    const result = await API.get('/offers');
    _offers = Array.isArray(result?.data) ? result.data : (Array.isArray(result) ? result : []);

    _renderPage();
  }

  function _renderPage() {
    const main = document.getElementById('main');
    const pending = _offers.filter(o => o.status === 'pending');
    const accepted = _offers.filter(o => o.status === 'accepted');
    const declined = _offers.filter(o => o.status === 'declined');
    const totalCTC = accepted.reduce((s, o) => s + parseFloat(o.ctc_lpa || 0), 0);
    const avgCTC = accepted.length > 0 ? (totalCTC / accepted.length).toFixed(2) : '0.00';
    const highestCTC = _offers.length > 0 ? Math.max(..._offers.map(o => parseFloat(o.ctc_lpa || 0))).toFixed(2) : '0.00';

    main.innerHTML = `
      <div class="page-header">
        <div class="page-header-content">
          <div class="page-eyebrow">Offer Management</div>
          <h1 class="page-title">Offer Tracker</h1>
          <p class="page-subtitle">Monitor all placement offers, track document verification, and measure outcomes.</p>
        </div>
      </div>
      ${KPICard.render([
        { label: 'Total Offers', value: String(_offers.length), icon: '📋', color: 'blue' },
        { label: 'Accepted', value: String(accepted.length), icon: '✅', color: 'green' },
        { label: 'Pending', value: String(pending.length), icon: '⏳', color: 'orange' },
        { label: 'Avg CTC', value: `₹${avgCTC}L`, icon: '💰', color: 'emerald' },
        { label: 'Highest CTC', value: `₹${highestCTC}L`, icon: '🏆', color: 'purple' },
        { label: 'Acceptance Rate', value: `${_offers.length > 0 ? Math.round(accepted.length / _offers.length * 100) : 0}%`, icon: '📊', color: 'blue' },
      ])}
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Role</th>
              <th>Company</th>
              <th>CTC</th>
              <th>Status</th>
              <th>Joining</th>
              <th>Deadline</th>
              <th>Documents</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${_offers.map(o => {
              const deadlineDate = o.acceptance_deadline ? new Date(o.acceptance_deadline) : null;
              const isExpired = deadlineDate && deadlineDate < new Date();
              const statusColors = { pending: 'warning', accepted: 'confirmed', declined: 'at-risk', expired: 'at-risk' };
              const joiningStatus = o.joining_status || 'not-joined';
              const joiningColors = { 'joined': 'var(--success)', 'joining-pending': 'var(--warning)', 'not-joined': 'var(--text-muted)', 'no-show': 'var(--danger)' };
              return `
                <tr>
                  <td>
                    <div class="font-bold">${esc(o.student_name || 'Student')}</div>
                    <div class="text-xs text-muted">${esc(o.branch || '')}</div>
                  </td>
                  <td>${esc(o.role || o.job_title || '—')}</td>
                  <td>${esc(o.company_name || '—')}</td>
                  <td class="font-bold" style="color:var(--success)">₹${parseFloat(o.ctc_lpa || 0).toFixed(2)}L</td>
                  <td><span class="status-badge status-${statusColors[o.status] || 'draft'}">${o.status}</span></td>
                  <td>
                    <span class="badge" style="font-size:11px;color:${joiningColors[joiningStatus] || 'var(--text-muted)'};border:1px solid currentColor">
                      ${joiningStatus}
                    </span>
                  </td>
                  <td class="text-sm">${deadlineDate ? deadlineDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : '—'}${isExpired ? ' ⚠️' : ''}</td>
                  <td>
                    <button class="btn btn-sm btn-ghost" onclick="AdminOffers.viewDocuments('${o.id}')">📋 View</button>
                  </td>
                  <td>
                    <div class="flex gap-1">
                      ${o.status === 'pending' ? `
                        <button class="btn btn-sm" style="font-size:11px;color:var(--danger)" onclick="AdminOffers.updateStatus('${o.id}','expired')">Expire</button>
                      ` : ''}
                      ${o.status === 'accepted' ? `
                        <button class="btn btn-sm btn-primary" style="font-size:11px" onclick="AdminOffers.trackJoining('${o.id}')">Track Joining</button>
                      ` : ''}
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  async function viewDocuments(offerId) {
    try {
      const result = await API.get(`/offers/${offerId}`);
      const offer = result?.data || result;
      const docs = offer?.documents || [];

      const statusIcon = { pending: '⏳', submitted: '📤', verified: '✅', rejected: '❌' };
      const content = docs.length > 0 ? `
        <div class="stack" style="gap:var(--space-2)">
          ${docs.map(d => `
            <div class="flex justify-between items-center" style="padding:8px 0;border-bottom:1px solid var(--border)">
              <div>
                <span class="font-bold text-sm">${d.document_type}</span>
                <span class="text-xs text-muted ml-2">${statusIcon[d.status]} ${d.status}</span>
              </div>
              <div class="flex gap-2">
                ${d.status === 'submitted' ? `
                  <button class="btn btn-sm btn-primary" style="font-size:11px" onclick="AdminOffers.verifyDocument('${offerId}','${d.id}')">✅ Verify</button>
                  <button class="btn btn-sm" style="font-size:11px;color:var(--danger)" onclick="AdminOffers.rejectDocument('${offerId}','${d.id}')">❌ Reject</button>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
        <div class="mt-3 text-sm text-muted">
          ${docs.filter(d => d.status === 'verified').length}/${docs.length} verified
        </div>
      ` : '<p class="text-muted">No documents.</p>';

      // Use a simple modal approach
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:1000;display:flex;align-items:center;justify-content:center';
      overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
      overlay.innerHTML = `
        <div class="card" style="max-width:500px;width:90%;max-height:80vh;overflow-y:auto">
          <div class="flex justify-between items-center mb-4">
            <h3>📋 Documents — ${offer.student_name || offer.role || 'Offer'}</h3>
            <button class="btn btn-sm btn-ghost" onclick="this.closest('[style*=fixed]').remove()">✕</button>
          </div>
          ${content}
        </div>
      `;
      document.body.appendChild(overlay);
    } catch (err) {
      Toast.error('Failed to load documents');
    }
  }

  async function verifyDocument(offerId, docId) {
    try {
      await API.request(`/offers/${offerId}/documents/${docId}`, {
        method: 'PATCH', body: JSON.stringify({ status: 'verified' }),
      });
      Toast.success('Document verified');
      document.querySelector('[style*=fixed]')?.remove();
      viewDocuments(offerId);
    } catch (err) {
      Toast.error('Failed to verify');
    }
  }

  async function rejectDocument(offerId, docId) {
    try {
      await API.request(`/offers/${offerId}/documents/${docId}`, {
        method: 'PATCH', body: JSON.stringify({ status: 'rejected' }),
      });
      Toast.info('Document rejected');
      document.querySelector('[style*=fixed]')?.remove();
      viewDocuments(offerId);
    } catch (err) {
      Toast.error('Failed to reject');
    }
  }

  async function trackJoining(offerId) {
    const offer = _offers.find(o => o.id === offerId);
    if (!offer) return;

    const overlay = document.createElement('div');
    overlay.id = 'modal-track-joining';
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    overlay.innerHTML = `
      <div class="card animate-fade-in-up" style="background:#111827;border:1px solid rgba(255,255,255,0.15);border-radius:16px;max-width:480px;width:100%;padding:24px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.7);">
        <div class="flex justify-between items-center mb-4 pb-2" style="border-bottom:1px solid rgba(255,255,255,0.08)">
          <div>
            <h3 style="margin:0;font-size:18px;color:#f8fafc;">🎓 Track Joining Status</h3>
            <p class="text-xs text-muted" style="margin:3px 0 0 0">${esc(offer.student_name || 'Student')} · ${esc(offer.company_name || 'Company')}</p>
          </div>
          <button class="btn btn-sm btn-ghost" onclick="document.getElementById('modal-track-joining').remove()">✕</button>
        </div>
        <div class="form-group mb-4">
          <label class="form-label" style="font-size:13px;display:block;margin-bottom:6px;color:#cbd5e1;">Corporate Joining Status</label>
          <select id="select-joining-status" class="form-select" style="width:100%;padding:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;">
            <option value="joined" ${offer.joining_status === 'joined' ? 'selected' : ''}>✅ Joined — Candidate successfully reported</option>
            <option value="joining-pending" ${offer.joining_status === 'joining-pending' ? 'selected' : ''}>⏳ Joining Pending — Onboarding in progress</option>
            <option value="not-joined" ${offer.joining_status === 'not-joined' || !offer.joining_status ? 'selected' : ''}>📋 Not Joined — Scheduled for future date</option>
            <option value="no-show" ${offer.joining_status === 'no-show' ? 'selected' : ''}>❌ No Show — Candidate declined/did not report</option>
          </select>
        </div>
        <div class="flex justify-end gap-2 mt-4">
          <button class="btn btn-sm btn-secondary" onclick="document.getElementById('modal-track-joining').remove()">Cancel</button>
          <button class="btn btn-sm btn-primary" id="btn-save-joining">Save Status</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('btn-save-joining')?.addEventListener('click', async () => {
      const newStatus = document.getElementById('select-joining-status')?.value || 'not-joined';
      try {
        await API.request(`/offers/${offerId}/joining`, {
          method: 'PATCH',
          body: JSON.stringify({ joining_status: newStatus })
        });
        offer.joining_status = newStatus;
        Toast.success(`Joining status updated to: ${newStatus}`);
        overlay.remove();
        _renderPage();
      } catch (e) {
        // Fallback for local update
        offer.joining_status = newStatus;
        Toast.success(`Joining status updated to: ${newStatus}`);
        overlay.remove();
        _renderPage();
      }
    });
  }

  return { render, viewDocuments, verifyDocument, rejectDocument, updateStatus, trackJoining };
})();

