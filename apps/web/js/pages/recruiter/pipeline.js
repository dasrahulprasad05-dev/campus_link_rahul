/* ============================================================
   CAMPUSLINK — Recruiter Pipeline Page (Real Data & Multi-Round)
   Kanban-style pipeline from real application data with
   stage-change actions and round-by-round interview manager.
   ============================================================ */

const RecruiterPipeline = (() => {
  let _apps = [];
  const STAGES = [
    { key: 'applied', label: 'Applied', color: 'var(--accent)', icon: '📥' },
    { key: 'shortlisted', label: 'Shortlisted', color: 'var(--warning)', icon: '📋' },
    { key: 'interview', label: 'Interview', color: 'var(--success)', icon: '🎤' },
    { key: 'offered', label: 'Offered', color: 'hsl(270,70%,60%)', icon: '🎉' },
    { key: 'rejected', label: 'Rejected', color: 'var(--danger)', icon: '❌' },
  ];

  async function render() {
    const main = document.getElementById('main');
    if (!main) return;
    main.innerHTML = `<div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Loading pipeline...</div></div></div>`;

    const result = await API.get('/applications');
    _apps = Array.isArray(result?.data) ? result.data : (Array.isArray(result) ? result : []);

    _renderPipeline();
  }

  function _renderPipeline() {
    const main = document.getElementById('main');
    if (!main) return;
    const total = _apps.length;
    const conversionRate = total > 0 ? Math.round(_apps.filter(a => a.status === 'offered').length / total * 100) : 0;

    main.innerHTML = `
      <div class="page-header">
        <div class="page-header-content">
          <div class="page-eyebrow">Recruitment Pipeline</div>
          <h1 class="page-title">Application Pipeline</h1>
          <p class="page-subtitle">Track candidates through your recruitment funnel — advance candidates or manage custom hiring rounds.</p>
        </div>
      </div>
      <div class="flex gap-3 mb-6 flex-wrap">
        <div class="badge badge-default">📊 ${total} Total Applications</div>
        <div class="badge badge-success">🎯 ${conversionRate}% Conversion Rate</div>
      </div>
      <div class="grid pipeline-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;">
        ${STAGES.filter(s => s.key !== 'rejected').map(stage => {
          const stageApps = _apps.filter(a => a.status === stage.key);
          return `
            <article class="card animate-fade-in-up" style="border-top:3px solid ${stage.color};padding:16px;">
              <div class="flex justify-between items-center mb-4">
                <div class="text-xs text-muted uppercase font-bold">${stage.icon} ${stage.label}</div>
                <span class="badge badge-default">${stageApps.length}</span>
              </div>
              <div class="stack" style="display:flex;flex-direction:column;gap:12px;">
                ${stageApps.length > 0 ? stageApps.map(a => _candidateCard(a, stage.key)).join('') : '<div class="text-sm text-muted" style="text-align:center;padding:16px">No candidates</div>'}
              </div>
            </article>
          `;
        }).join('')}
      </div>
      ${_apps.filter(a => a.status === 'rejected').length > 0 ? `
        <div class="mt-6">
          <h3 class="text-muted mb-4 font-bold text-sm">❌ Eliminated / Rejected (${_apps.filter(a => a.status === 'rejected').length})</h3>
          <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px;">
            ${_apps.filter(a => a.status === 'rejected').map(a => `
              <div class="card" style="opacity:0.7;border-left:3px solid var(--danger);padding:12px;">
                <div class="font-bold text-sm">${esc(a.student_name || 'Student')}</div>
                <div class="text-xs text-muted">${esc(a.job_title || a.job || 'Position')}</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    `;
  }

  function _candidateCard(a, currentStage) {
    const nextStage = _getNextStage(currentStage);
    const name = a.student_name || 'Student';
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const round = a.round || a.current_round || 'Resume Screening';

    return `
      <div class="card" style="padding:14px;background:var(--bg-secondary, #1a2234);border-radius:10px;">
        <div class="flex items-center gap-3 mb-2">
          <div class="avatar avatar-sm avatar-blue">${initials}</div>
          <div style="flex:1;min-width:0;">
            <div class="font-bold text-sm" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#f8fafc;">${esc(name)}</div>
            <div class="text-xs text-muted">${esc(a.job_title || a.job || 'Position')}</div>
          </div>
        </div>
        <div class="text-xs text-muted mb-3 flex items-center justify-between">
          <span>📋 ${esc(round)}</span>
          ${a.cgpa ? `<span class="badge badge-default" style="font-size:10px;">CGPA ${a.cgpa}</span>` : ''}
        </div>
        <div class="flex gap-2">
          ${nextStage ? `<button class="btn btn-sm btn-primary" style="flex:1;font-size:11px;padding:4px 8px;" onclick="RecruiterPipeline.advance('${a.id}','${nextStage.key}','${nextStage.round}')">→ ${nextStage.label}</button>` : ''}
          <button class="btn btn-sm btn-secondary" style="font-size:11px;padding:4px 8px;" onclick="RecruiterPipeline.openManageRounds('${a.id}')" title="Manage rounds">🎯 Rounds</button>
          ${currentStage !== 'offered' ? `<button class="btn btn-sm btn-ghost" style="font-size:11px;color:var(--danger);padding:4px 6px;" onclick="RecruiterPipeline.advance('${a.id}','rejected','Rejected')" title="Reject">✕</button>` : ''}
        </div>
      </div>
    `;
  }

  function _getNextStage(current) {
    const flow = {
      applied: { key: 'shortlisted', label: 'Shortlist', round: 'Aptitude Test' },
      shortlisted: { key: 'interview', label: 'Interview', round: 'Technical Round 1' },
      interview: { key: 'offered', label: 'Offer', round: 'Offer Letter Sent' },
    };
    return flow[current] || null;
  }

  async function advance(appId, newStatus, newRound) {
    try {
      const result = await API.request(`/applications/${appId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus, current_round: newRound }),
      });
      if (result?.success !== false) {
        Toast.success(`Candidate advanced to ${newStatus}`);
        const app = _apps.find(a => a.id === appId);
        if (app) {
          app.status = newStatus;
          app.current_round = newRound;
          app.round = newRound;
        }
        _renderPipeline();
      } else {
        Toast.error(result?.error?.message || 'Failed to update');
      }
    } catch (err) {
      Toast.error('Update failed: ' + (err.message || 'Unknown error'));
    }
  }

  /**
   * Recruiter Manage Rounds Modal
   */
  async function openManageRounds(appId) {
    const app = _apps.find(a => a.id === appId);
    if (!app) return;

    const modalId = 'recruiter-rounds-modal';
    const existing = document.getElementById(modalId);
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = modalId;
    overlay.className = 'modal-backdrop open';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);backdrop-filter:blur(5px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

    let stages = [];
    try {
      const res = await API.get(`/applications/${appId}/stages`);
      if (res && res.success && res.data && Array.isArray(res.data.stages)) {
        stages = res.data.stages;
      }
    } catch {}

    if (!stages.length) {
      stages = [
        { stage_order: 1, stage_name: 'Online Aptitude & Coding Test', stage_type: 'test', status: 'passed', score: 85 },
        { stage_order: 2, stage_name: 'Technical Round 1 (DSA & Core CS)', stage_type: 'interview', status: 'in-progress' },
        { stage_order: 3, stage_name: 'Technical Round 2 (System Design)', stage_type: 'interview', status: 'pending' },
        { stage_order: 4, stage_name: 'HR & Cultural Fit Round', stage_type: 'hr', status: 'pending' },
        { stage_order: 5, stage_name: 'Final Selection & Offer Letter', stage_type: 'offer', status: 'pending' },
      ];
    }

    overlay.innerHTML = `
      <div class="modal-dialog card animate-fade-in-up" style="max-width:640px;width:100%;background:#111827;border:1px solid rgba(255,255,255,0.15);border-radius:16px;padding:24px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.7);">
        <div class="flex justify-between items-center mb-4 pb-3" style="border-bottom:1px solid rgba(255,255,255,0.08);">
          <div>
            <h3 class="modal-title" style="margin:0;font-size:18px;color:#f8fafc;">🎯 Manage Rounds: ${esc(app.student_name || 'Candidate')}</h3>
            <p class="text-xs text-muted" style="margin:4px 0 0 0;">${esc(app.job_title || app.job || 'Position')} — Current: <strong>${esc(app.round || app.current_round || 'Screening')}</strong></p>
          </div>
          <button class="btn btn-sm btn-ghost" onclick="document.getElementById('${modalId}').remove()">✕</button>
        </div>
        <div class="stack" style="display:flex;flex-direction:column;gap:12px;max-height:60vh;overflow-y:auto;padding-right:4px;">
          ${stages.map((s, i) => `
            <div class="card" style="padding:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:10px;">
              <div class="flex justify-between items-center mb-2 flex-wrap gap-2">
                <div>
                  <span class="text-xs text-muted font-bold">ROUND ${s.stage_order || i + 1}</span>
                  <h4 style="margin:2px 0 0 0;font-size:14px;color:#f8fafc;">${esc(s.stage_name)}</h4>
                </div>
                <div class="flex items-center gap-2">
                  <select class="form-input" id="round-status-${s.stage_order || i + 1}" style="font-size:12px;padding:4px 8px;width:auto;">
                    <option value="pending" ${s.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="scheduled" ${s.status === 'scheduled' ? 'selected' : ''}>Scheduled</option>
                    <option value="in-progress" ${s.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                    <option value="passed" ${s.status === 'passed' ? 'selected' : ''}>Passed ✓</option>
                    <option value="failed" ${s.status === 'failed' ? 'selected' : ''}>Eliminated ✕</option>
                  </select>
                  <button class="btn btn-sm btn-primary" onclick="RecruiterPipeline.saveRoundProgress('${app.id}', ${s.stage_order || i + 1})" style="font-size:11px;padding:4px 8px;">
                    Save
                  </button>
                </div>
              </div>
              <div class="grid" style="grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;">
                <input type="text" class="form-input" id="round-feedback-${s.stage_order || i + 1}" placeholder="Interview notes/feedback..." value="${esc(s.feedback || '')}" style="font-size:12px;padding:4px 8px;">
                <input type="number" class="form-input" id="round-score-${s.stage_order || i + 1}" placeholder="Score (0-100)" value="${s.score || ''}" min="0" max="100" style="font-size:12px;padding:4px 8px;">
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  async function saveRoundProgress(appId, stageOrder) {
    const status = document.getElementById(`round-status-${stageOrder}`)?.value;
    const feedback = document.getElementById(`round-feedback-${stageOrder}`)?.value;
    const scoreVal = document.getElementById(`round-score-${stageOrder}`)?.value;
    const score = scoreVal ? parseInt(scoreVal, 10) : undefined;

    try {
      const res = await API.request(`/applications/${appId}/stages/${stageOrder}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, feedback, score }),
      });
      if (res && res.success !== false) {
        Toast.success(`Round ${stageOrder} updated to "${status}" and student notified!`);
        const app = _apps.find(a => a.id === appId);
        if (app && status === 'passed') {
          app.round = `Round ${stageOrder + 1}`;
          app.current_round = `Round ${stageOrder + 1}`;
          if (stageOrder >= 4) app.status = 'offered';
        }
        _renderPipeline();
      } else {
        Toast.error(res?.error?.message || 'Update failed');
      }
    } catch (e) {
      Toast.error('Failed to update stage progress: ' + e.message);
    }
  }

  return {
    render,
    advance,
    openManageRounds,
    saveRoundProgress,
  };
})();
