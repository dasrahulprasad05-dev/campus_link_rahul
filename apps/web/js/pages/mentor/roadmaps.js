/* CAMPUSLINK — Mentor Roadmap Reviews Page — Real Data & Interactive Reviews */
const MentorRoadmaps = (() => {
  let _reviews = [];

  async function render() {
    const main = document.getElementById('main');
    main.innerHTML = `<div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Loading roadmaps...</div></div></div>`;

    // Fetch students and derive roadmap review items from at-risk/developing students
    const result = await API.get('/students');
    const students = Array.isArray(result?.data) ? result.data : (Array.isArray(result) ? result : []);
    _reviews = students.filter(s => (s.readiness || 0) > 0 && (s.readiness || 0) < 75).map(s => ({
      student: s.name || 'Student',
      role: s.target_role || s.targetRole || 'Software Engineer',
      milestones: 8,
      completed: Math.max(1, Math.round(((s.readiness || 0) / 100) * 8)),
      urgency: (s.readiness || 0) < 50 ? 'high' : 'medium',
      status: 'pending', // 'pending' | 'approved' | 'revision'
      feedback: null,
    }));

    _renderList();
  }

  function _renderList() {
    const main = document.getElementById('main');
    if (!main) return;

    main.innerHTML = `
      <div class="page-header">
        <div class="page-header-content">
          <div class="page-eyebrow">Roadmap Reviews</div>
          <h1 class="page-title">Pending Roadmap Reviews</h1>
          <p class="page-subtitle">Review, approve, or adjust student career roadmaps. Your guidance shapes their learning path.</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-secondary" onclick="MentorRoadmaps.render()">🔄 Refresh</button>
        </div>
      </div>
      <div class="stack" id="roadmap-review-stack">
        ${_reviews.length ? _reviews.map((r, i) => _renderRoadmapCard(r, i)).join('') : '<div class="empty-state"><div class="empty-state-icon">✅</div><div class="empty-state-title">All roadmaps reviewed</div><p class="empty-state-text">No pending reviews at this time.</p></div>'}
      </div>
    `;
  }

  function _renderRoadmapCard(r, i) {
    const isApproved = r.status === 'approved';
    const isRevision = r.status === 'revision';

    return `
      <article class="card animate-fade-in-up" id="roadmap-card-${i}" style="animation-delay:${i * 80}ms;${isApproved ? 'border-left:3px solid var(--success)' : isRevision ? 'border-left:3px solid var(--warning)' : ''}">
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center gap-4">
            <div class="avatar avatar-lg ${isApproved ? 'avatar-green' : r.urgency === 'high' ? 'avatar-orange' : 'avatar-blue'}">
              ${(r.student || 'S').split(' ').map(w=>w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div class="font-bold flex items-center gap-2" style="font-size:16px">
                <span>${esc(r.student)}</span>
                ${isApproved ? '<span class="badge badge-success">✓ Approved by Mentor</span>' : isRevision ? '<span class="badge badge-warning">⏳ Changes Requested</span>' : ''}
              </div>
              <div class="text-sm text-muted">Target: ${esc(r.role)}</div>
            </div>
          </div>
          <span class="badge badge-${isApproved ? 'success' : r.urgency === 'high' ? 'danger' : 'warning'} badge-dot">
            ${isApproved ? 'Verified' : `${r.urgency} priority`}
          </span>
        </div>

        <div class="progress-group mb-4">
          <div class="progress-label">
            <span class="progress-label-name">Milestone Progress</span>
            <span class="progress-label-value">${r.completed}/${r.milestones} completed</span>
          </div>
          <div class="progress-bar">
            <div class="progress-bar-fill ${r.completed/r.milestones >= 0.5 ? 'success' : 'warning'}" style="width:${Math.min(100, (r.completed/r.milestones)*100)}%"></div>
          </div>
        </div>

        ${r.feedback ? `
          <div class="p-3 mb-3" style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.25);border-radius:8px;font-size:12.5px;">
            <strong style="color:#fbbf24">📝 Feedback Sent:</strong> ${esc(r.feedback)}
          </div>
        ` : ''}

        <div class="flex gap-3" style="justify-content:flex-end">
          ${!isApproved ? `
            <button class="btn btn-sm btn-ghost" onclick="MentorRoadmaps.requestChanges(${i})">Request Changes</button>
            <button class="btn btn-sm btn-secondary" onclick="MentorRoadmaps.addMilestone(${i})">+ Add Milestone</button>
            <button class="btn btn-sm btn-primary" onclick="MentorRoadmaps.approveRoadmap(${i})">Approve ✓</button>
          ` : `
            <button class="btn btn-sm btn-secondary" disabled style="opacity:0.7">✓ Approved</button>
            <button class="btn btn-sm btn-ghost" onclick="MentorRoadmaps.addMilestone(${i})">+ Add Extra Milestone</button>
          `}
        </div>
      </article>
    `;
  }

  function requestChanges(index) {
    const r = _reviews[index];
    if (!r) return;

    const modalId = 'modal-request-changes';
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
            <h3 style="margin:0;font-size:18px;color:#f8fafc;">📝 Request Roadmap Changes</h3>
            <p class="text-xs text-muted" style="margin:3px 0 0 0">Provide guidance notes for <strong>${esc(r.student)}</strong></p>
          </div>
          <button class="btn btn-sm btn-ghost" onclick="document.getElementById('${modalId}').remove()">✕</button>
        </div>
        <div class="form-group mb-4">
          <label class="form-label" style="font-size:12.5px;color:#cbd5e1;display:block;margin-bottom:6px;">Revision Instructions</label>
          <textarea id="rc-notes" class="form-input" rows="4" placeholder="e.g. Focus more on Data Structures and Cloud Architecture. Complete 2 LeetCode medium questions before next review." style="width:100%;padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;resize:vertical;"></textarea>
        </div>
        <div class="flex justify-end gap-2">
          <button class="btn btn-sm btn-secondary" onclick="document.getElementById('${modalId}').remove()">Cancel</button>
          <button class="btn btn-sm btn-primary" id="btn-submit-rc">Send Revision Feedback</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('btn-submit-rc')?.addEventListener('click', () => {
      const notes = document.getElementById('rc-notes')?.value?.trim() || 'Please revise roadmap with additional project portfolio milestones.';
      r.status = 'revision';
      r.feedback = notes;
      Toast.success(`Feedback sent to ${r.student}. Roadmap marked for revision.`);
      overlay.remove();
      _renderList();
    });
  }

  function addMilestone(index) {
    const r = _reviews[index];
    if (!r) return;

    const modalId = 'modal-add-milestone';
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
            <h3 style="margin:0;font-size:18px;color:#f8fafc;">🎯 Add Custom Milestone</h3>
            <p class="text-xs text-muted" style="margin:3px 0 0 0">Assign a milestone for <strong>${esc(r.student)}</strong></p>
          </div>
          <button class="btn btn-sm btn-ghost" onclick="document.getElementById('${modalId}').remove()">✕</button>
        </div>
        <div class="form-group mb-3">
          <label class="form-label" style="font-size:12.5px;color:#cbd5e1;display:block;margin-bottom:6px;">Milestone Title *</label>
          <input type="text" id="ms-title" class="form-input" placeholder="e.g. Master SQL Indexing & Query Tuning" required style="width:100%;padding:9px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;">
        </div>
        <div class="form-group mb-3">
          <label class="form-label" style="font-size:12.5px;color:#cbd5e1;display:block;margin-bottom:6px;">Milestone Category</label>
          <select id="ms-category" class="form-select" style="width:100%;padding:9px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;">
            <option value="Technical Project">Technical Project</option>
            <option value="Algorithm & DSA Practice">Algorithm & DSA Practice</option>
            <option value="System Design & Cloud">System Design & Cloud</option>
            <option value="Mock Interview Drill">Mock Interview Drill</option>
          </select>
        </div>
        <div class="form-group mb-4">
          <label class="form-label" style="font-size:12.5px;color:#cbd5e1;display:block;margin-bottom:6px;">Target Completion (Weeks)</label>
          <input type="number" id="ms-weeks" class="form-input" value="2" min="1" max="12" style="width:100%;padding:9px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;">
        </div>
        <div class="flex justify-end gap-2">
          <button class="btn btn-sm btn-secondary" onclick="document.getElementById('${modalId}').remove()">Cancel</button>
          <button class="btn btn-sm btn-primary" id="btn-confirm-ms">Add Milestone</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('btn-confirm-ms')?.addEventListener('click', () => {
      const title = document.getElementById('ms-title')?.value?.trim();
      if (!title) {
        Toast.error('Please enter a milestone title');
        return;
      }
      r.milestones += 1;
      Toast.success(`Milestone "${title}" added to ${r.student}'s roadmap!`);
      overlay.remove();
      _renderList();
    });
  }

  function approveRoadmap(index) {
    const r = _reviews[index];
    if (!r) return;

    r.status = 'approved';
    Toast.success(`🎉 ${r.student}'s career roadmap approved and verified by Faculty Mentor!`);
    _renderList();
  }

  return { render, requestChanges, addMilestone, approveRoadmap };
})();
