/* ============================================================
   CAMPUSLINK — Recruiter Pipeline Page (Real Data)
   Kanban-style pipeline from real application data with
   stage-change actions.
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
    main.innerHTML = `<div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Loading pipeline...</div></div></div>`;

    const result = await API.get('/applications');
    _apps = Array.isArray(result?.data) ? result.data : (Array.isArray(result) ? result : []);

    _renderPipeline();
  }

  function _renderPipeline() {
    const main = document.getElementById('main');
    const total = _apps.length;
    const conversionRate = total > 0 ? Math.round(_apps.filter(a => a.status === 'offered').length / total * 100) : 0;

    main.innerHTML = `
      <div class="page-header">
        <div class="page-header-content">
          <div class="page-eyebrow">Recruitment Pipeline</div>
          <h1 class="page-title">Application Pipeline</h1>
          <p class="page-subtitle">Track candidates through your recruitment funnel — click actions to advance or reject.</p>
        </div>
      </div>
      <div class="flex gap-3 mb-6 flex-wrap">
        <div class="badge badge-default">📊 ${total} Total Applications</div>
        <div class="badge badge-success">🎯 ${conversionRate}% Conversion</div>
      </div>
      <div class="grid pipeline-grid">
        ${STAGES.filter(s => s.key !== 'rejected').map(stage => {
          const stageApps = _apps.filter(a => a.status === stage.key);
          return `
            <article class="card animate-fade-in-up" style="border-top:3px solid ${stage.color}">
              <div class="flex justify-between items-center mb-4">
                <div class="text-xs text-muted uppercase font-bold">${stage.icon} ${stage.label}</div>
                <span class="badge badge-default">${stageApps.length}</span>
              </div>
              <div class="stack" style="gap:var(--space-2)">
                ${stageApps.length > 0 ? stageApps.map(a => _candidateCard(a, stage.key)).join('') : '<div class="text-sm text-muted" style="text-align:center;padding:16px">No candidates</div>'}
              </div>
            </article>
          `;
        }).join('')}
      </div>
      ${_apps.filter(a => a.status === 'rejected').length > 0 ? `
        <div class="mt-6">
          <h3 class="text-muted mb-4">❌ Rejected (${_apps.filter(a => a.status === 'rejected').length})</h3>
          <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:var(--space-3)">
            ${_apps.filter(a => a.status === 'rejected').map(a => `
              <div class="card" style="opacity:0.6;border-left:3px solid var(--danger)">
                <div class="font-bold text-sm">${a.student_name || 'Student'}</div>
                <div class="text-xs text-muted">${a.job_title || a.job || 'Position'}</div>
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
    const round = a.round || a.current_round || '—';

    return `
      <div class="card" style="padding:var(--space-3);background:var(--bg-secondary)">
        <div class="flex items-center gap-3 mb-2">
          <div class="avatar avatar-sm avatar-blue">${initials}</div>
          <div style="flex:1;min-width:0">
            <div class="font-bold text-sm" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${name}</div>
            <div class="text-xs text-muted">${a.job_title || a.job || 'Position'}</div>
          </div>
        </div>
        <div class="text-xs text-muted mb-2">📋 ${round}${a.cgpa ? ` · CGPA ${a.cgpa}` : ''}</div>
        <div class="flex gap-2">
          ${nextStage ? `<button class="btn btn-sm btn-primary" style="flex:1;font-size:11px" onclick="RecruiterPipeline.advance('${a.id}','${nextStage.key}','${nextStage.round}')">→ ${nextStage.label}</button>` : ''}
          ${currentStage !== 'offered' ? `<button class="btn btn-sm" style="font-size:11px;color:var(--danger)" onclick="RecruiterPipeline.advance('${a.id}','rejected','Rejected')">✕</button>` : ''}
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
        Toast.success(`Candidate moved to ${newStatus}`);
        // Update local state
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

  return { render, advance };
})();
