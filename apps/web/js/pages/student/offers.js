/* ============================================================
   CAMPUSLINK — Student Offers Page
   View, accept/decline offers and manage document checklist.
   ============================================================ */
const StudentOffers = (() => {
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

    main.innerHTML = `
      <div class="page-header">
        <div class="page-header-content">
          <div class="page-eyebrow">Offer Management</div>
          <h1 class="page-title">My Offers</h1>
          <p class="page-subtitle">Review your placement offers, accept or decline, and complete your document checklist.</p>
        </div>
      </div>
      ${_offers.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">📭</div>
          <div class="empty-state-title">No offers yet</div>
          <p class="empty-state-text">Keep applying and performing well in interviews — offers will appear here.</p>
          <button class="btn btn-primary" onclick="Router.navigate('student/jobs')">Browse Jobs</button>
        </div>
      ` : `
        <div class="flex gap-3 mb-6 flex-wrap">
          <div class="badge badge-warning">⏳ ${pending.length} Pending</div>
          <div class="badge badge-success">✅ ${accepted.length} Accepted</div>
          ${declined.length > 0 ? `<div class="badge badge-default">❌ ${declined.length} Declined</div>` : ''}
        </div>
        <div class="stack">
          ${_offers.map((o, i) => _offerCard(o, i)).join('')}
        </div>
      `}
    `;
  }

  function _offerCard(o, index) {
    const deadlineDate = o.acceptance_deadline ? new Date(o.acceptance_deadline) : null;
    const isExpired = deadlineDate && deadlineDate < new Date();
    const daysLeft = deadlineDate ? Math.ceil((deadlineDate - new Date()) / 86400000) : null;
    const joiningDate = o.joining_date ? new Date(o.joining_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

    let statusColor, statusIcon;
    switch (o.status) {
      case 'accepted': statusColor = 'var(--success)'; statusIcon = '✅'; break;
      case 'declined': statusColor = 'var(--danger)'; statusIcon = '❌'; break;
      case 'expired': statusColor = 'var(--text-muted)'; statusIcon = '⏰'; break;
      default: statusColor = 'var(--warning)'; statusIcon = '⏳';
    }

    return `
      <article class="card animate-fade-in-up" style="animation-delay:${index * 80}ms;border-left:4px solid ${statusColor}">
        <div class="flex justify-between items-center mb-3">
          <div>
            <div class="font-bold" style="font-size:18px">${o.role || o.job_title || 'Position'}</div>
            <div class="text-sm text-muted">${o.company_name || 'Company'}</div>
          </div>
          <div class="text-center">
            <div class="font-bold" style="font-size:24px;color:var(--success)">₹${parseFloat(o.ctc_lpa || 0).toFixed(2)}L</div>
            <div class="text-xs text-muted">CTC per annum</div>
          </div>
        </div>
        <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:var(--space-3);margin-bottom:var(--space-4)">
          <div><div class="text-xs text-muted">Status</div><div class="font-bold" style="color:${statusColor}">${statusIcon} ${o.status.charAt(0).toUpperCase() + o.status.slice(1)}</div></div>
          <div><div class="text-xs text-muted">Offer Date</div><div class="font-bold">${o.offer_date ? new Date(o.offer_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : '—'}</div></div>
          <div><div class="text-xs text-muted">Deadline</div><div class="font-bold" style="${isExpired ? 'color:var(--danger)' : daysLeft !== null && daysLeft <= 3 ? 'color:var(--warning)' : ''}">${deadlineDate ? deadlineDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : '—'}${daysLeft !== null && !isExpired ? ` (${daysLeft}d)` : isExpired ? ' (Expired)' : ''}</div></div>
          <div><div class="text-xs text-muted">Joining Date</div><div class="font-bold">${joiningDate}</div></div>
        </div>
        ${o.status === 'pending' && !isExpired ? `
          <div class="divider"></div>
          <div class="flex gap-3 justify-end">
            <button class="btn btn-sm" style="color:var(--danger)" onclick="StudentOffers.declineOffer('${o.id}')">Decline</button>
            <button class="btn btn-sm btn-primary" onclick="StudentOffers.acceptOffer('${o.id}')">✅ Accept Offer</button>
          </div>
        ` : ''}
        ${o.status === 'accepted' ? `
          <div class="divider"></div>
          <div class="mb-3"><div class="font-bold text-sm mb-2">📋 Document Checklist</div><div class="text-xs text-muted mb-3">Submit all required documents before your joining date.</div></div>
          <div id="offer-docs-${o.id}">
            <button class="btn btn-sm" onclick="StudentOffers.loadDocuments('${o.id}')">Load Documents</button>
          </div>
        ` : ''}
      </article>
    `;
  }

  async function acceptOffer(offerId) {
    if (!confirm('Are you sure you want to accept this offer? This action may affect other pending offers.')) return;
    try {
      const result = await API.request(`/offers/${offerId}/accept`, { method: 'PATCH' });
      if (result?.success !== false) {
        Toast.success('Offer accepted! 🎉');
        const offer = _offers.find(o => o.id === offerId);
        if (offer) offer.status = 'accepted';
        _renderPage();
      } else {
        Toast.error(result?.error?.message || 'Failed to accept offer');
      }
    } catch (err) {
      Toast.error('Failed: ' + (err.message || 'Unknown error'));
    }
  }

  async function declineOffer(offerId) {
    if (!confirm('Are you sure you want to decline this offer?')) return;
    try {
      const result = await API.request(`/offers/${offerId}/decline`, { method: 'PATCH' });
      if (result?.success !== false) {
        Toast.info('Offer declined');
        const offer = _offers.find(o => o.id === offerId);
        if (offer) offer.status = 'declined';
        _renderPage();
      } else {
        Toast.error(result?.error?.message || 'Failed to decline offer');
      }
    } catch (err) {
      Toast.error('Failed: ' + (err.message || 'Unknown error'));
    }
  }

  async function loadDocuments(offerId) {
    const container = document.getElementById(`offer-docs-${offerId}`);
    if (!container) return;
    container.innerHTML = '<div class="text-sm text-muted">Loading documents...</div>';

    try {
      const result = await API.get(`/offers/${offerId}`);
      const docs = result?.data?.documents || result?.documents || [];

      if (docs.length === 0) {
        container.innerHTML = '<div class="text-sm text-muted">No documents required.</div>';
        return;
      }

      const statusIcon = { pending: '⏳', submitted: '📤', verified: '✅', rejected: '❌' };
      const statusColor = { pending: 'var(--warning)', submitted: 'var(--accent)', verified: 'var(--success)', rejected: 'var(--danger)' };

      container.innerHTML = `
        <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:var(--space-2)">
          ${docs.map(d => `
            <div class="card" style="padding:var(--space-3);border-left:3px solid ${statusColor[d.status] || 'var(--border)'}">
              <div class="flex justify-between items-center">
                <div class="font-bold text-sm">${d.document_type}</div>
                <span class="text-sm">${statusIcon[d.status] || '⏳'}</span>
              </div>
              <div class="text-xs text-muted mt-1">${d.status.charAt(0).toUpperCase() + d.status.slice(1)}</div>
              ${d.status === 'pending' ? `<button class="btn btn-sm mt-2" style="width:100%;font-size:11px" onclick="StudentOffers.submitDocument('${offerId}','${d.id}')">📤 Submit</button>` : ''}
              ${d.deadline ? `<div class="text-xs text-muted mt-1">Due: ${new Date(d.deadline).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</div>` : ''}
            </div>
          `).join('')}
        </div>
        <div class="mt-3 text-sm text-muted">
          ${docs.filter(d => d.status === 'verified').length}/${docs.length} verified
          <div class="progress-bar mt-1"><div class="progress-bar-fill" style="width:${docs.length > 0 ? (docs.filter(d => d.status === 'verified').length / docs.length * 100) : 0}%"></div></div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = '<div class="text-sm" style="color:var(--danger)">Failed to load documents.</div>';
    }
  }

  async function submitDocument(offerId, docId) {
    try {
      const result = await API.request(`/offers/${offerId}/documents/${docId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'submitted' }),
      });
      if (result?.success !== false) {
        Toast.success('Document submitted!');
        loadDocuments(offerId);
      } else {
        Toast.error('Failed to submit document');
      }
    } catch (err) {
      Toast.error('Submit failed');
    }
  }

  return { render, acceptOffer, declineOffer, loadDocuments, submitDocument };
})();
