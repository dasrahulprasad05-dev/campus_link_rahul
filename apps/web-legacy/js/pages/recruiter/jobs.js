/* CAMPUSLINK — Recruiter Jobs Page — Real Data & Job Posting */
const RecruiterJobs = (() => {
  let _jobs = [];

  async function render() {
    const main = document.getElementById('main');
    main.innerHTML = `<div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Loading jobs...</div></div></div>`;

    const result = await API.get('/jobs');
    const allJobs = Array.isArray(result?.data) ? result.data : (Array.isArray(result) ? result : []);

    // Also fetch applications to show pipeline counts
    const appResult = await API.get('/applications');
    const apps = Array.isArray(appResult?.data) ? appResult.data : (Array.isArray(appResult) ? appResult : []);

    _jobs = allJobs.map(j => {
      const jobApps = apps.filter(a => a.job_id === j.id);
      return {
        ...j,
        applications: jobApps.length,
        shortlisted: jobApps.filter(a => a.status === 'shortlisted' || a.status === 'interview' || a.status === 'offered').length,
        interviewed: jobApps.filter(a => a.status === 'interview' || a.status === 'offered').length,
      };
    });

    _renderList();
  }

  function _renderList() {
    const main = document.getElementById('main');
    if (!main) return;

    main.innerHTML = `
      <div class="page-header">
        <div class="page-header-content">
          <div class="page-eyebrow">Corporate Recruiter Portal</div>
          <h1 class="page-title">Job Postings & Pipelines</h1>
          <p class="page-subtitle">Publish new campus openings, filter candidate pools, and manage hiring stages.</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary" onclick="RecruiterJobs.openPostJobModal()">+ Post New Job</button>
          <button class="btn btn-secondary" onclick="RecruiterJobs.render()">🔄 Refresh</button>
        </div>
      </div>

      <div class="stack">
        ${_jobs.length ? _jobs.map((j, i) => `
          <article class="card card-interactive animate-fade-in-up" style="animation-delay:${i * 60}ms">
            <div class="flex justify-between items-center mb-4">
              <div>
                <h3 style="margin:0;font-size:17px;font-weight:700;">${window.esc(j.title)}</h3>
                <p class="text-xs text-muted" style="margin:3px 0 0 0;">
                  🏢 ${window.esc(j.company || j.company_name || 'TechNova Solutions')} · 📍 ${window.esc(j.location || 'Bhubaneswar')} · 🏷️ ${window.esc(j.type || 'Full-time')}
                </p>
              </div>
              <span class="status-badge status-${j.status === 'active' ? 'confirmed' : 'draft'}">${j.status || 'active'}</span>
            </div>

            <div class="job-metrics-grid">
              <div><div class="text-xs text-muted">Applications</div><div class="font-bold" style="font-size:16px;">${j.applications}</div></div>
              <div><div class="text-xs text-muted">Shortlisted</div><div class="font-bold" style="font-size:16px;color:#60a5fa;">${j.shortlisted}</div></div>
              <div><div class="text-xs text-muted">Interviewed</div><div class="font-bold" style="font-size:16px;color:#a855f7;">${j.interviewed}</div></div>
              <div><div class="text-xs text-muted">Conversion</div><div class="font-bold" style="font-size:16px;color:#10b981;">${j.applications > 0 ? Math.round(j.shortlisted/j.applications*100) : 0}%</div></div>
            </div>

            <div class="progress-group mt-4">
              <div class="progress-label">
                <span class="progress-label-name">Hiring Conversion</span>
                <span class="progress-label-value">${j.interviewed}/${j.applications || 0}</span>
              </div>
              <div class="progress-bar">
                <div class="progress-bar-fill" style="width:${j.applications > 0 ? Math.min(100, Math.round(j.interviewed/j.applications*100)) : 0}%"></div>
              </div>
            </div>

            <div class="flex gap-2 justify-between items-center mt-4 pt-3" style="border-top:1px solid rgba(255,255,255,0.06);font-size:12px;">
              <span class="text-muted">Skills: ${(Array.isArray(j.skills_required) ? j.skills_required : (Array.isArray(j.skills) ? j.skills : [])).slice(0, 4).join(', ') || 'General Engineering'}</span>
              <button class="btn btn-sm btn-secondary" onclick="Router.navigate('recruiter/matches')">🎯 View Matches</button>
            </div>
          </article>
        `).join('') : `
          <div class="empty-state" style="padding:48px;text-align:center;">
            <div class="empty-state-icon" style="font-size:48px;margin-bottom:12px">💼</div>
            <div class="empty-state-title" style="font-size:18px;font-weight:700">No active job postings</div>
            <p class="empty-state-text" style="color:#94a3b8;margin-bottom:20px">Create your first campus recruitment opening to receive student applications.</p>
            <button class="btn btn-primary" onclick="RecruiterJobs.openPostJobModal()">+ Post New Job Opening</button>
          </div>
        `}
      </div>
    `;
  }

  function openPostJobModal() {
    const modalId = 'modal-post-job';
    const existing = document.getElementById(modalId);
    if (existing) existing.remove();

    const user = (typeof Store !== 'undefined' && Store.getUser()) || {};
    const defaultCompany = user.company || 'TechNova Solutions';
    const defaultDeadline = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

    const modalHTML = `
      <div id="${modalId}" class="modal-backdrop" style="position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;">
        <div class="modal-content animate-fade-in-up" style="background:#111827;border:1px solid rgba(255,255,255,0.15);border-radius:16px;width:100%;max-width:600px;padding:28px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.6);max-height:90vh;overflow-y:auto;">
          
          <div class="flex justify-between items-center mb-4 pb-2" style="border-bottom:1px solid rgba(255,255,255,0.08)">
            <div>
              <h2 style="font-size:18px;font-weight:700;margin:0;color:#f8fafc;">💼 Post New Job Opening</h2>
              <p class="text-xs text-muted" style="margin:3px 0 0 0">Publish opening for matching students to apply</p>
            </div>
            <button class="btn btn-sm btn-secondary" onclick="document.getElementById('${modalId}').remove()" style="padding:4px 10px;">✕</button>
          </div>

          <form id="form-post-job" onsubmit="return false">
            <div class="form-group mb-3">
              <label class="form-label" style="font-size:12.5px;color:#cbd5e1;display:block;margin-bottom:6px;">Job Title / Position *</label>
              <input type="text" id="pj-title" class="form-input" placeholder="e.g. Graduate Software Engineer, Data Engineer" required style="width:100%;padding:9px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;">
            </div>

            <div class="grid grid-2 gap-3 mb-3" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div class="form-group">
                <label class="form-label" style="font-size:12.5px;color:#cbd5e1;display:block;margin-bottom:6px;">Hiring Company *</label>
                <input type="text" id="pj-company" class="form-input" value="${defaultCompany}" required style="width:100%;padding:9px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;">
              </div>
              <div class="form-group">
                <label class="form-label" style="font-size:12.5px;color:#cbd5e1;display:block;margin-bottom:6px;">Job Type *</label>
                <select id="pj-type" class="form-select" style="width:100%;padding:9px 12px;background:#1e293b;border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;">
                  <option value="Full-time">Full-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
            </div>

            <div class="grid grid-2 gap-3 mb-3" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div class="form-group">
                <label class="form-label" style="font-size:12.5px;color:#cbd5e1;display:block;margin-bottom:6px;">Location</label>
                <input type="text" id="pj-location" class="form-input" value="Bhubaneswar / Hybrid" placeholder="e.g. Bengaluru, Hybrid, Remote" style="width:100%;padding:9px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;">
              </div>
              <div class="form-group">
                <label class="form-label" style="font-size:12.5px;color:#cbd5e1;display:block;margin-bottom:6px;">Application Deadline</label>
                <input type="date" id="pj-deadline" class="form-input" value="${defaultDeadline}" style="width:100%;padding:9px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;">
              </div>
            </div>

            <div class="form-group mb-3">
              <label class="form-label" style="font-size:12.5px;color:#cbd5e1;display:block;margin-bottom:6px;">Minimum CGPA Requirement</label>
              <input type="number" id="pj-cgpa" step="0.1" min="0" max="10" value="7.0" class="form-input" style="width:100%;padding:9px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;">
            </div>

            <div class="form-group mb-3">
              <label class="form-label" style="font-size:12.5px;color:#cbd5e1;display:block;margin-bottom:6px;">Required Skills (Comma separated) *</label>
              <input type="text" id="pj-skills" class="form-input" value="Python, SQL, DSA, Git, Problem Solving" placeholder="e.g. Python, React, SQL, Java" required style="width:100%;padding:9px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;">
            </div>

            <div class="form-group mb-4">
              <label class="form-label" style="font-size:12.5px;color:#cbd5e1;display:block;margin-bottom:6px;">Role Description / Responsibilities</label>
              <textarea id="pj-description" class="form-textarea" rows="3" placeholder="Key responsibilities and qualifications required..." style="width:100%;padding:9px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;">Join our core engineering squad building high-throughput services and AI solutions for enterprise clients.</textarea>
            </div>

            <div class="flex gap-3 justify-end mt-5 pt-3" style="border-top:1px solid rgba(255,255,255,0.08)">
              <button type="button" class="btn btn-secondary" onclick="document.getElementById('${modalId}').remove()">Cancel</button>
              <button type="submit" class="btn btn-primary" id="btn-submit-job">Publish Opening →</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const form = document.getElementById('form-post-job');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('pj-title').value.trim();
      const company = document.getElementById('pj-company').value.trim();
      const type = document.getElementById('pj-type').value;
      const location = document.getElementById('pj-location').value.trim();
      const deadline = document.getElementById('pj-deadline').value;
      const min_cgpa = parseFloat(document.getElementById('pj-cgpa').value) || 0;
      const skillsInput = document.getElementById('pj-skills').value.trim();
      const description = document.getElementById('pj-description').value.trim();
      const skills = skillsInput ? skillsInput.split(',').map(s => s.trim()) : [];

      if (!title) {
        Toast.warning('Job title is required');
        return;
      }

      const submitBtn = document.getElementById('btn-submit-job');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Publishing...';

      try {
        const payload = {
          title,
          company: company || defaultCompany,
          type,
          location: location || 'Bhubaneswar',
          deadline: deadline || null,
          min_cgpa,
          skills,
          description,
          status: 'active',
        };

        const res = await API.post('/jobs', payload);
        if (res && res.success) {
          Toast.success(`🎉 Job posting "${title}" published successfully!`);
          document.getElementById(modalId)?.remove();
          await RecruiterJobs.render();
        } else {
          Toast.error(res?.error?.message || 'Failed to post job');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Publish Opening →';
        }
      } catch (err) {
        Toast.error('Job posting error: ' + err.message);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Publish Opening →';
      }
    });
  }

  return { render, openPostJobModal };
})();
