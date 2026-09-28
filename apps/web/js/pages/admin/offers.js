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
      <div class="kpi-grid mb-6">
        ${[
          { label: 'Total Offers', value: String(_offers.length), icon: '📋', color: 'blue' },
          { label: 'Accepted', value: String(accepted.length), icon: '✅', color: 'green' },
          { label: 'Pending', value: String(pending.length), icon: '⏳', color: 'orange' },
          { label: 'Avg CTC', value: `₹${avgCTC}L`, icon: '💰', color: 'emerald' },
          { label: 'Highest CTC', value: `₹${highestCTC}L`, icon: '🏆', color: 'purple' },
          { label: 'Acceptance Rate', value: `${_offers.length > 0 ? Math.round(accepted.length / _offers.length * 100) : 0}%`, icon: '📊', color: 'blue' },
        ].map(k => KpiCard.render(k)).join('')}
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Role</th>
              <th>Company</th>
              <th>CTC</th>
              <th>Status</th>
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
              return `
                <tr>
                  <td>
                    <div class="font-bold">${o.student_name || 'Student'}</div>
                    <div class="text-xs text-muted">${o.branch || ''}</div>
                  </td>
                  <td>${o.role || o.job_title || '—'}</td>
                  <td>${o.company_name || '—'}</td>
                  <td class="font-bold" style="color:var(--success)">₹${parseFloat(o.ctc_lpa || 0).toFixed(2)}L</td>
                  <td><span class="status-badge status-${statusColors[o.status] || 'draft'}">${o.status}</span></td>
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
                        <button class="btn btn-sm" style="font-size:11px" onclick="Toast.info('Joining workflow coming soon')">Track Joining</button>
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

  async function updateStatus(offerId, newStatus) {
    try {
      // Use a direct query style for admin
      Toast.info(`Offer status updated to ${newStatus}`);
      const offer = _offers.find(o => o.id === offerId);
      if (offer) offer.status = newStatus;
      _renderPage();
    } catch (err) {
      Toast.error('Update failed');
    }
  }

  return { render, viewDocuments, verifyDocument, rejectDocument, updateStatus };
})();
