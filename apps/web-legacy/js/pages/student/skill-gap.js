/* ============================================================
   CAMPUSLINK — Skill-Gap Analyzer Page
   Interactive Skill Gap Engine powered by the student's live profile,
   instant resume text parsing, and dynamic skill editing.
   ============================================================ */
const StudentSkillGap = (() => {
  let editSkillsList = [];

  function getSkills() {
    const profile = Store.getProfile();
    return (profile && Array.isArray(profile.skills)) ? profile.skills : [];
  }

  async function render() {
    const profile = Store.getProfile();
    const skills = getSkills();
    const targetRole = profile.targetRole || 'Data Analyst';

    const main = document.getElementById('main');
    if (!main) return;

    main.innerHTML = `
      <div class="page-header">
        <div class="page-header-content">
          <div class="page-eyebrow">AI Skill-Gap Analyzer</div>
          <h1 class="page-title">Identify Your Missing Skills</h1>
          <p class="page-subtitle">Compare your actual profile skills against placement requirements. Paste your resume or edit skills anytime.</p>
        </div>
      </div>

      <div class="grid grid-main">
        <div class="stack">
          <!-- Role selector & run card -->
          <article class="card animate-fade-in-up">
            <div class="card-header">
              <h2 class="card-title">Select Target Placement Role</h2>
            </div>
            ${Forms.select({ id: 'gap-role', label: 'Target Role', choices: [
              { value: 'Data Analyst', label: '📊 Data Analyst' },
              { value: 'Software Engineer', label: '💻 Software Engineer (SDE)' },
              { value: 'Web Developer', label: '🌐 Full-Stack Web Developer' },
              { value: 'Frontend Developer', label: '🎨 Frontend Developer' },
              { value: 'Backend Developer', label: '⚙️ Backend Developer' },
              { value: 'ML Engineer', label: '🤖 ML / AI Engineer' },
              { value: 'Agentic AI Engineer', label: '🧠 Agentic AI Engineer' },
              { value: 'DevOps Engineer', label: '☁️ Cloud & DevOps Engineer' },
              { value: 'Data Engineer', label: '🔧 Data Engineer' },
              { value: 'Business Analyst', label: '📈 Business Analyst' },
              { value: 'Database Administrator', label: '🗄️ Database Administrator' },
              { value: 'Cybersecurity Analyst', label: '🔐 Cybersecurity Analyst' },
              { value: 'Mobile App Developer', label: '📱 Mobile App Developer' },
              { value: 'Cloud Architect', label: '🏗️ Cloud Architect' },
              { value: 'Product Manager', label: '🎯 Product Manager' },
            ]})}
            <div class="flex gap-2 mt-4">
              <button class="btn btn-primary flex-1" id="run-gap-btn" onclick="StudentSkillGap.analyze()">
                🔍 Analyze Skill Gap
              </button>
              <button class="btn btn-secondary" onclick="StudentSkillGap.openResumeModal()">
                📄 Paste Resume
              </button>
            </div>
          </article>

          ${skills.length === 0 ? `
            <div class="notice animate-fade-in-up" style="background:rgba(59, 130, 246, 0.08); border:1px solid rgba(59, 130, 246, 0.25); border-radius:var(--radius-lg); padding:20px;">
              <h3 style="font-size:16px; margin-bottom:6px; color:var(--text-primary);">🚀 Add Your Skills First</h3>
              <p class="text-sm text-muted" style="margin:0 0 12px 0;">To get a personalized skill-gap analysis, paste your resume or manually add your technical skills. Without your skills, the analyzer cannot identify what you already know vs. what's missing.</p>
              <div class="flex gap-2">
                <button class="btn btn-primary btn-sm" onclick="StudentSkillGap.openResumeModal()">📄 Paste Resume</button>
                <button class="btn btn-secondary btn-sm" onclick="StudentSkillGap.openEditSkillsModal()">✏️ Add Skills Manually</button>
              </div>
            </div>
          ` : ''}

          <!-- Gap Results Container -->
          <div id="gap-results"></div>
        </div>

        <aside class="stack">
          <!-- Live User Skills Card -->
          <article class="card card-accent animate-fade-in-up" style="animation-delay:80ms">
            <div class="flex justify-between items-center mb-3">
              <h3 class="card-title" style="margin:0">Your Current Skills</h3>
              <span class="badge badge-accent" id="profile-skills-count">${skills.length}</span>
            </div>

            <div id="skill-gap-badges" class="flex flex-wrap gap-2 mb-4">
              ${skills.length > 0
                ? skills.map(s => `<span class="badge badge-primary" style="font-size:12px;padding:4px 8px">${s}</span>`).join('')
                : '<p class="text-sm text-muted" style="margin:0;">No skills added yet. Paste your resume or edit your profile to add skills.</p>'
              }
            </div>

            <div class="flex gap-2">
              <button class="btn btn-sm btn-secondary flex-1" onclick="StudentSkillGap.openResumeModal()">
                📄 Extract from Resume
              </button>
              <button class="btn btn-sm btn-ghost flex-1" onclick="StudentSkillGap.openEditSkillsModal()">
                ✏️ Edit Skills
              </button>
            </div>

            <p class="text-xs text-muted mt-3">
              Extracted from your profile. Update your skills or paste a resume to re-calculate your gaps.
            </p>
          </article>

          <!-- How It Works Card -->
          <article class="card animate-fade-in-up" style="animation-delay:150ms">
            <div class="card-header"><h2 class="card-title">How It Works</h2></div>
            <div class="stack" style="gap:var(--space-3)">
              <div class="flex items-center gap-3">
                <div class="milestone-number">1</div>
                <div>
                  <div class="text-sm font-bold">1. Load / Extract Skills</div>
                  <div class="text-xs text-muted">Paste your resume text or edit your profile skills</div>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="milestone-number">2</div>
                <div>
                  <div class="text-sm font-bold">2. NLP Comparison</div>
                  <div class="text-xs text-muted">Cosine semantic similarity against 12+ company rubrics</div>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="milestone-number">3</div>
                <div>
                  <div class="text-sm font-bold">3. Prioritized Action Plan</div>
                  <div class="text-xs text-muted">Target High-priority gaps first with curated courses</div>
                </div>
              </div>
            </div>
          </article>
        </aside>
      </div>

      <!-- Modals Container -->
      <div id="skill-gap-modals-container"></div>
    `;

    // Pre-select role matching profile if found
    const select = document.getElementById('gap-role');
    if (select && targetRole) {
      select.value = targetRole;
    }

    // Auto-run analysis on load only if student has skills
    if (skills.length > 0) {
      setTimeout(() => StudentSkillGap.analyze(), 200);
    }
  }

  async function analyze() {
    const role = document.getElementById('gap-role')?.value || 'Data Analyst';
    const skills = getSkills();
    const btn = document.getElementById('run-gap-btn');
    if (btn) { btn.textContent = '⏳ Analyzing...'; btn.disabled = true; }

    let result = null;
    try {
      result = await API.post('/analyze/skill-gap', { targetRole: role, skills });
    } catch (e) {
      console.warn('[SkillGap] Analysis error:', e);
    }

    if (btn) { btn.textContent = '🔍 Analyze Skill Gap'; btn.disabled = false; }

    const el = document.getElementById('gap-results');
    if (!el) return;

    const matched = result?.matched || [];
    const missing = result?.missing || [];
    const targetRole = result?.targetRole || role;
    const engineVersion = result?.engineVersion || 'nlp-v2';

    el.innerHTML = `
      <article class="card animate-fade-in-up">
        <div class="card-header">
          <div>
            <h2 class="card-title">Gap Analysis: ${targetRole}</h2>
            <div class="text-xs text-muted mt-1">Evaluated against ${skills.length} verified candidate skills</div>
          </div>
          <span class="badge badge-accent">Engine: ${engineVersion}</span>
        </div>

        ${matched.length ? `
          <h4 class="mb-2 text-success font-bold text-sm">✓ Skills You Already Have (${matched.length})</h4>
          <div class="flex flex-wrap gap-2 mb-4">
            ${matched.map(s => `<span class="badge badge-success" style="font-size:12px;padding:4px 8px">✓ ${s}</span>`).join('')}
          </div>
          <div class="divider"></div>
        ` : '<div class="insight-card accent mb-4">No matching skills detected for this role yet. Check the gaps below to start learning!</div>'}

        ${missing.length ? `
          <h4 class="mb-2 text-danger font-bold text-sm">✗ Skills to Develop (${missing.length})</h4>
          ${missing.map(s => `
            <div class="list-item">
              <div class="list-item-content">
                <div class="list-item-title font-bold">${s.name || s.skill}</div>
                <div class="list-item-sub">${s.reason || ''}</div>
                ${s.resource ? `<div class="text-xs text-accent mt-2">📚 ${s.resource}</div>` : ''}
              </div>
              <span class="skill-tag ${s.priority || 'medium'}">${s.priority || 'medium'}</span>
            </div>
          `).join('')}
          <div class="flex justify-between items-center mt-4">
            <span class="text-xs text-muted">Ready to prepare?</span>
            <button class="btn btn-sm btn-primary" onclick="Router.navigate('student/roadmap')">
              🗺️ Generate AI Roadmap for ${targetRole}
            </button>
          </div>
        ` : '<div class="insight-card success"><strong>🎉 No gaps detected!</strong> Your skills match all requirements for this role.</div>'}
      </article>
    `;
  }

  // ─── Modal: Paste Resume ──────────────────────────────────
  function openResumeModal() {
    const container = document.getElementById('skill-gap-modals-container') || document.body;
    const modalId = 'gap-resume-modal';

    const existing = document.getElementById(modalId);
    if (existing) existing.remove();

    const html = `
      <div class="modal-backdrop open" id="${modalId}" role="dialog">
        <div class="modal-dialog" style="max-width:680px">
          <div class="modal-header">
            <h2 class="modal-title">📄 Paste Resume & Auto-Extract Skills</h2>
            <button class="modal-close" onclick="StudentSkillGap.closeModal('${modalId}')">✕</button>
          </div>
          <div class="modal-body">
            <p class="text-sm text-muted mb-3">
              Paste your resume text below. Our AI extractor will detect your <strong>programming languages, frameworks, cloud tools, and databases</strong>, updating your profile skills immediately.
            </p>
            <div class="form-group mb-3">
              <textarea id="gap-resume-text" class="form-input" style="height:200px;font-family:monospace;font-size:12px;line-height:1.4" placeholder="Paste your resume text here...

Example:
John Doe | john@domain.com
Skills: Python, SQL, React, Node.js, Docker, Kubernetes, AWS, PostgreSQL..."></textarea>
            </div>
            <div id="gap-resume-status" class="text-xs text-muted"></div>
          </div>
          <div class="modal-footer flex justify-between items-center">
            <button class="btn btn-ghost" onclick="StudentSkillGap.closeModal('${modalId}')">Cancel</button>
            <button class="btn btn-primary" id="btn-gap-extract" onclick="StudentSkillGap.extractResume()">
              ✨ Extract Skills & Re-Analyze
            </button>
          </div>
        </div>
      </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    container.appendChild(wrapper.firstElementChild);
  }

  async function extractResume() {
    const textarea = document.getElementById('gap-resume-text');
    const statusEl = document.getElementById('gap-resume-status');
    const btn = document.getElementById('btn-gap-extract');
    const text = (textarea?.value || '').trim();

    if (text.length < 25) {
      Toast.warning('Please paste at least a few lines of your resume text.');
      return;
    }

    if (btn) { btn.disabled = true; btn.textContent = '⏳ Extracting Skills...'; }
    if (statusEl) statusEl.textContent = 'Extracting technical skills, contact info, and role fit...';

    let result = null;
    try {
      result = await API.post('/interviews/parse-resume', { resumeText: text });
    } catch (e) {
      console.warn('[SkillGap] Parse resume failed:', e);
    }

    const data = result?.data || result || {};
    const extractedSkills = Array.isArray(data.skills) && data.skills.length > 0 ? data.skills : [];

    if (btn) { btn.disabled = false; btn.textContent = '✨ Extract Skills & Re-Analyze'; }

    if (extractedSkills.length === 0) {
      Toast.warning('No skills could be detected from the pasted text. Try pasting a fuller section.');
      return;
    }

    // Save to profile
    const updates = { skills: extractedSkills };
    if (data.name && data.name !== 'Candidate') updates.name = data.name;
    if (data.email) updates.email = data.email;
    if (data.phone) updates.phone = data.phone;
    if (data.target_role) updates.targetRole = data.target_role;
    if (data.projects && data.projects.length) updates.projects = data.projects;
    Store.updateProfile(updates);

    closeModal('gap-resume-modal');
    Toast.success(`Extracted ${extractedSkills.length} skills from your resume!`);

    // Refresh UI and rerun analysis immediately
    render();
  }

  // ─── Modal: Quick Edit Skills ─────────────────────────────
  function openEditSkillsModal() {
    const current = getSkills();
    editSkillsList = [...current];

    const container = document.getElementById('skill-gap-modals-container') || document.body;
    const modalId = 'gap-edit-skills-modal';

    const existing = document.getElementById(modalId);
    if (existing) existing.remove();

    const html = `
      <div class="modal-backdrop open" id="${modalId}" role="dialog">
        <div class="modal-dialog" style="max-width:600px">
          <div class="modal-header">
            <h2 class="modal-title">✏️ Edit Your Profile Skills</h2>
            <button class="modal-close" onclick="StudentSkillGap.closeModal('${modalId}')">✕</button>
          </div>
          <div class="modal-body">
            <p class="text-xs text-muted mb-3">Add skills you know or click ✕ to remove ones you don't. Your gap analysis will update instantly.</p>
            
            <div id="gap-edit-pills" class="flex flex-wrap gap-2 p-2 mb-3" style="background:var(--bg-elevated);border-radius:var(--radius-md);border:1px solid var(--border-subtle);min-height:60px">
              ${renderSkillPills(editSkillsList)}
            </div>

            <div class="flex gap-2">
              <input id="gap-new-skill" class="form-input" placeholder="Type a skill (e.g. Docker, TypeScript, PyTorch)..." onkeydown="if(event.key==='Enter'){event.preventDefault();StudentSkillGap.addSkill();}" />
              <button class="btn btn-secondary btn-sm" type="button" onclick="StudentSkillGap.addSkill()">+ Add</button>
            </div>
          </div>
          <div class="modal-footer flex justify-between items-center">
            <button class="btn btn-ghost" onclick="StudentSkillGap.closeModal('${modalId}')">Cancel</button>
            <button class="btn btn-primary" onclick="StudentSkillGap.saveSkills()">💾 Save & Re-Analyze</button>
          </div>
        </div>
      </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    container.appendChild(wrapper.firstElementChild);
    setTimeout(() => document.getElementById('gap-new-skill')?.focus(), 150);
  }

  function renderSkillPills(skills) {
    return skills.map((s, idx) => `
      <span class="badge badge-accent flex items-center gap-1" style="font-size:12px;padding:4px 8px">
        <span>${s}</span>
        <span style="cursor:pointer;font-weight:bold;margin-left:4px" onclick="StudentSkillGap.removeSkill(${idx})" title="Remove">✕</span>
      </span>
    `).join('');
  }

  function addSkill() {
    const input = document.getElementById('gap-new-skill');
    const val = (input?.value || '').trim();
    if (!val) return;

    val.split(',').map(s => s.trim()).filter(Boolean).forEach(part => {
      if (!editSkillsList.some(s => s.toLowerCase() === part.toLowerCase())) {
        editSkillsList.push(part);
      }
    });

    input.value = '';
    const container = document.getElementById('gap-edit-pills');
    if (container) container.innerHTML = renderSkillPills(editSkillsList);
  }

  function removeSkill(index) {
    editSkillsList.splice(index, 1);
    const container = document.getElementById('gap-edit-pills');
    if (container) container.innerHTML = renderSkillPills(editSkillsList);
  }

  function saveSkills() {
    Store.updateProfile({ skills: editSkillsList });
    closeModal('gap-edit-skills-modal');
    Toast.success('Skills updated!');
    render();
  }

  function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  return {
    render,
    analyze,
    openResumeModal,
    extractResume,
    openEditSkillsModal,
    addSkill,
    removeSkill,
    saveSkills,
    closeModal,
  };
})();
