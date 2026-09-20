/* ============================================================
   CAMPUSLINK — Student Profile Page
   Dynamic user profile with:
   1. Live Store integration (persisted per user)
   2. "Paste Resume" AI extraction (Skills, Email, Experience, etc.)
   3. "Edit Profile" modal with interactive skill tag management
   ============================================================ */
const StudentProfile = (() => {
  let editSkillsList = [];

  function getProfile() {
    return Store.getProfile();
  }

  async function render() {
    const p = getProfile();
    const main = document.getElementById('main');
    if (!main) return;

    // Calculate dynamic profile completion percentage
    let completion = 50;
    if (p.skills && p.skills.length >= 4) completion += 15;
    if (p.projects && p.projects.length >= 1) completion += 15;
    if (p.linkedin || p.github) completion += 10;
    if (p.certifications && p.certifications.length >= 1) completion += 10;
    completion = Math.min(100, completion);

    main.innerHTML = `
      <div class="page-header">
        <div class="page-header-content">
          <div class="page-eyebrow">Student Profile</div>
          <h1 class="page-title">${p.name}</h1>
          <p class="page-subtitle">${p.branch || 'Engineering'} · Batch ${p.year || '2026'} · ${p.regNo || 'REG-2022'}</p>
        </div>
        <div class="page-actions flex items-center gap-2">
          <button class="btn btn-secondary" onclick="StudentProfile.openResumeModal()">
            📄 Paste Resume
          </button>
          <button class="btn btn-primary" onclick="StudentProfile.openEditModal()">
            ✏️ Edit Profile
          </button>
        </div>
      </div>

      <div class="grid grid-main">
        <div class="stack">
          <!-- Academic & Contact Card -->
          <article class="card animate-fade-in-up">
            <div class="card-header">
              <h2 class="card-title">Academic & Contact Information</h2>
              <span class="badge badge-success">CGPA ${p.cgpa || '8.0'}</span>
            </div>
            <div class="grid grid-2 gap-4">
              <div><div class="text-xs text-muted">Full Name</div><div class="font-bold">${p.name}</div></div>
              <div><div class="text-xs text-muted">Target Career Role</div><div class="font-bold text-accent">${p.targetRole || 'Software Engineer'}</div></div>
              <div><div class="text-xs text-muted">Email Address</div><div class="font-bold">${p.email}</div></div>
              <div><div class="text-xs text-muted">Phone Number</div><div class="font-bold">${p.phone || 'Not specified'}</div></div>
              <div><div class="text-xs text-muted">Registration / Roll No.</div><div class="font-bold">${p.regNo || 'REG-2022'}</div></div>
              <div><div class="text-xs text-muted">Branch / Discipline</div><div class="font-bold">${p.branch || 'Computer Science'}</div></div>
              <div><div class="text-xs text-muted">Graduation Year</div><div class="font-bold">${p.year || '2026'}</div></div>
              <div><div class="text-xs text-muted">Active Backlogs</div><div class="font-bold text-success">0 (Eligible)</div></div>
            </div>
          </article>

          <!-- Verified Skills Card -->
          <article class="card animate-fade-in-up" style="animation-delay:80ms">
            <div class="card-header">
              <div class="flex items-center gap-2">
                <h2 class="card-title">Technical Skills</h2>
                <span class="badge badge-accent">${(p.skills || []).length} skills</span>
              </div>
              <button class="btn btn-sm btn-ghost" onclick="StudentProfile.openEditModal('skills')">
                + Add / Manage
              </button>
            </div>
            <div class="flex flex-wrap gap-2 mt-2">
              ${(p.skills || []).length > 0 
                ? (p.skills || []).map(s => `<span class="badge badge-primary" style="font-size:12px;padding:4px 10px">${s}</span>`).join('') 
                : '<p class="text-sm text-muted">No skills added yet. Click "Paste Resume" or "Edit Profile" to add your skills.</p>'
              }
            </div>
          </article>

          <!-- Projects Card -->
          <article class="card animate-fade-in-up" style="animation-delay:160ms">
            <div class="card-header">
              <h2 class="card-title">Projects & Portfolio</h2>
              <button class="btn btn-sm btn-ghost" onclick="StudentProfile.openEditModal()">✏️ Edit</button>
            </div>
            ${(p.projects || []).length > 0 ? (p.projects || []).map(proj => `
              <div class="list-item">
                <div class="list-item-content">
                  <div class="list-item-title">${proj.name}</div>
                  <div class="list-item-sub text-accent">${proj.tech || ''}</div>
                  <p class="text-sm text-muted mt-2">${proj.desc || proj.description || ''}</p>
                </div>
              </div>
            `).join('') : '<p class="text-sm text-muted">No projects listed yet. Paste your resume or add one in Edit Profile.</p>'}
          </article>
        </div>

        <aside class="stack">
          <!-- Profile Completion Gauge -->
          <article class="card card-accent animate-fade-in-up" style="animation-delay:100ms">
            <h3 class="card-title mb-4">Profile Completion</h3>
            <div class="flex justify-center mb-4">
              ${ScoreRing.render(completion, { size: 120, label: 'complete' })}
            </div>
            <div class="insight-card accent">
              ${completion >= 90 
                ? '<strong>Outstanding!</strong> Your profile is comprehensive and ready for company screening.' 
                : '<strong>Keep going!</strong> Add projects, certifications, and links to reach 100% placement readiness.'
              }
            </div>
          </article>

          <!-- Quick Actions -->
          <article class="card animate-fade-in-up" style="animation-delay:140ms">
            <div class="card-header"><h2 class="card-title">Quick Actions</h2></div>
            <div class="stack" style="gap:var(--space-2)">
              <button class="btn btn-sm" style="width:100%;justify-content:flex-start" onclick="StudentProfile.openResumeModal()">
                📄 Paste Resume Text
              </button>
              <button class="btn btn-sm" style="width:100%;justify-content:flex-start" onclick="Router.navigate('student/skill-gap')">
                🔍 Check Skill Gaps
              </button>
              <button class="btn btn-sm" style="width:100%;justify-content:flex-start" onclick="Router.navigate('student/roadmap')">
                🗺️ View Career Roadmap
              </button>
            </div>
          </article>

          <!-- Certifications -->
          <article class="card animate-fade-in-up" style="animation-delay:180ms">
            <div class="card-header"><h2 class="card-title">Certifications</h2></div>
            ${(p.certifications || []).length > 0 
              ? (p.certifications || []).map(c => `<div class="list-item"><div class="list-item-content"><div class="list-item-title">🏅 ${c}</div></div></div>`).join('')
              : '<p class="text-xs text-muted">No certifications recorded yet.</p>'
            }
          </article>

          <!-- Links -->
          <article class="card animate-fade-in-up" style="animation-delay:220ms">
            <div class="card-header"><h2 class="card-title">Online Profiles</h2></div>
            <div class="list-item">
              <div class="list-item-content">
                <div class="list-item-sub">LinkedIn</div>
                <div class="list-item-title text-accent">${p.linkedin || 'Not linked'}</div>
              </div>
            </div>
            <div class="list-item">
              <div class="list-item-content">
                <div class="list-item-sub">GitHub</div>
                <div class="list-item-title text-accent">${p.github || 'Not linked'}</div>
              </div>
            </div>
          </article>
        </aside>
      </div>

      <!-- Modals Container -->
      <div id="profile-modals-container"></div>
    `;
  }

  // ─── Modal 1: Paste Resume ─────────────────────────────────
  function openResumeModal() {
    const container = document.getElementById('profile-modals-container') || document.body;
    const modalId = 'paste-resume-modal';

    // Remove existing if any
    const existing = document.getElementById(modalId);
    if (existing) existing.remove();

    const html = `
      <div class="modal-backdrop open" id="${modalId}" role="dialog">
        <div class="modal-dialog" style="max-width:680px">
          <div class="modal-header">
            <h2 class="modal-title">📄 Paste Resume & Auto-Extract</h2>
            <button class="modal-close" onclick="StudentProfile.closeModal('${modalId}')">✕</button>
          </div>
          <div class="modal-body">
            <p class="text-sm text-muted mb-3">
              Copy and paste the plain text of your resume below (from Word, PDF, or LinkedIn). 
              Our AI parser will extract your <strong>skills, experience, email, target role, education, and projects</strong>.
            </p>
            <div class="form-group mb-3">
              <label class="form-label font-bold text-xs">Resume Text</label>
              <textarea id="resume-paste-text" class="form-input" style="height:220px;font-family:monospace;font-size:12px;line-height:1.4" placeholder="Paste your full resume text here...

Example:
Rahul Prasad | rahul@university.edu | +91 9876543210
B.Tech Computer Science (CGPA: 8.4)
Skills: Python, SQL, React, Node.js, Docker, Machine Learning
Projects: E-Commerce Store with React and Node.js
Experience: Summer Intern at Tech Corp..."></textarea>
            </div>
            <div id="resume-extract-status" class="text-xs text-muted"></div>
          </div>
          <div class="modal-footer flex justify-between items-center">
            <button class="btn btn-ghost" onclick="StudentProfile.closeModal('${modalId}')">Cancel</button>
            <button class="btn btn-primary" id="btn-extract-resume" onclick="StudentProfile.extractResume()">
              ✨ Extract Profile & Skills
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
    const textarea = document.getElementById('resume-paste-text');
    const statusEl = document.getElementById('resume-extract-status');
    const btn = document.getElementById('btn-extract-resume');
    const text = (textarea?.value || '').trim();

    if (text.length < 25) {
      Toast.warning('Please paste at least a few lines of your resume text.');
      return;
    }

    if (btn) { btn.disabled = true; btn.textContent = '⏳ Extracting with AI...'; }
    if (statusEl) statusEl.textContent = 'Analyzing skills, contact details, projects, and role fit...';

    let result = null;
    try {
      result = await API.post('/interviews/parse-resume', { resumeText: text });
    } catch (e) {
      console.warn('[Profile] Parse resume call failed:', e);
    }

    const data = result?.data || result || {};
    const extractedSkills = Array.isArray(data.skills) ? data.skills : [];

    if (btn) { btn.disabled = false; btn.textContent = '✨ Extract Profile & Skills'; }

    // Prepare updates
    const updates = {};
    if (data.name && data.name !== 'Candidate' && data.name !== 'Candidate Student') updates.name = data.name;
    if (data.email) updates.email = data.email;
    if (data.phone) updates.phone = data.phone;
    if (data.target_role) updates.targetRole = data.target_role;
    if (extractedSkills.length > 0) updates.skills = extractedSkills;
    if (data.projects && data.projects.length > 0) {
      updates.projects = data.projects.map(p => ({
        name: p.name || 'Extracted Project',
        tech: p.tech || '',
        desc: p.description || p.desc || '',
      }));
    }
    if (data.certifications && data.certifications.length > 0) {
      updates.certifications = data.certifications;
    }
    if (data.education && data.education.length > 0) {
      const edu = data.education[0];
      if (edu.gpa) updates.cgpa = parseFloat(edu.gpa) || 8.0;
      if (edu.degree) updates.branch = edu.degree;
      if (edu.year) updates.year = String(edu.year).slice(-4);
    }

    // Save to global Store
    Store.updateProfile(updates);

    closeModal('paste-resume-modal');
    Toast.success(`Successfully extracted ${extractedSkills.length} skills and updated your profile!`);
    
    // Re-render current page
    if (window.location.hash.includes('readiness') && typeof StudentReadiness !== 'undefined') {
      StudentReadiness.render();
    } else {
      render();
    }
  }

  // ─── Modal 2: Edit Profile ──────────────────────────────────
  function openEditModal(initialFocus = '') {
    const p = getProfile();
    editSkillsList = [...(p.skills || [])];

    const container = document.getElementById('profile-modals-container') || document.body;
    const modalId = 'edit-profile-modal';

    const existing = document.getElementById(modalId);
    if (existing) existing.remove();

    const html = `
      <div class="modal-backdrop open" id="${modalId}" role="dialog">
        <div class="modal-dialog" style="max-width:720px; max-height:90vh; overflow-y:auto">
          <div class="modal-header">
            <h2 class="modal-title">✏️ Edit Student Profile</h2>
            <button class="modal-close" onclick="StudentProfile.closeModal('${modalId}')">✕</button>
          </div>
          <div class="modal-body">
            <!-- Row 1: Name, Email, Phone -->
            <div class="grid grid-2 gap-3 mb-3">
              <div class="form-group">
                <label class="form-label text-xs font-bold">Full Name</label>
                <input id="edit-name" class="form-input" value="${p.name || ''}" placeholder="Full Name" />
              </div>
              <div class="form-group">
                <label class="form-label text-xs font-bold">Target Role</label>
                <select id="edit-target-role" class="form-select" style="width:100%;padding:8px;border-radius:var(--radius-md);background:var(--bg-primary);color:var(--text-primary);border:1px solid var(--border-default)">
                  <option value="Software Engineer" ${p.targetRole === 'Software Engineer' ? 'selected' : ''}>Software Engineer</option>
                  <option value="Data Analyst" ${p.targetRole === 'Data Analyst' ? 'selected' : ''}>Data Analyst</option>
                  <option value="Web Developer" ${p.targetRole === 'Web Developer' ? 'selected' : ''}>Web Developer</option>
                  <option value="ML Engineer" ${p.targetRole === 'ML Engineer' ? 'selected' : ''}>ML / AI Engineer</option>
                  <option value="DevOps Engineer" ${p.targetRole === 'DevOps Engineer' ? 'selected' : ''}>Cloud / DevOps</option>
                </select>
              </div>
            </div>

            <div class="grid grid-2 gap-3 mb-3">
              <div class="form-group">
                <label class="form-label text-xs font-bold">Email Address</label>
                <input id="edit-email" class="form-input" value="${p.email || ''}" placeholder="Email Address" />
              </div>
              <div class="form-group">
                <label class="form-label text-xs font-bold">Phone Number</label>
                <input id="edit-phone" class="form-input" value="${p.phone || ''}" placeholder="Phone Number" />
              </div>
            </div>

            <!-- Row 2: Branch, Year, CGPA, RegNo -->
            <div class="grid grid-2 gap-3 mb-3">
              <div class="form-group">
                <label class="form-label text-xs font-bold">Branch / Department</label>
                <input id="edit-branch" class="form-input" value="${p.branch || ''}" placeholder="Branch (e.g. Computer Science)" />
              </div>
              <div class="form-group">
                <label class="form-label text-xs font-bold">Graduation Year</label>
                <input id="edit-year" class="form-input" value="${p.year || '2026'}" placeholder="e.g. 2026" />
              </div>
            </div>

            <div class="grid grid-2 gap-3 mb-4">
              <div class="form-group">
                <label class="form-label text-xs font-bold">CGPA (out of 10.0)</label>
                <input id="edit-cgpa" type="number" step="0.1" max="10" class="form-input" value="${p.cgpa || 8.0}" />
              </div>
              <div class="form-group">
                <label class="form-label text-xs font-bold">Registration / Roll No</label>
                <input id="edit-regno" class="form-input" value="${p.regNo || ''}" placeholder="e.g. REG-2022-CSE-042" />
              </div>
            </div>

            <div class="divider my-3"></div>

            <!-- Skills Section with Tag Manager -->
            <div class="form-group mb-4">
              <div class="flex justify-between items-center mb-2">
                <label class="form-label font-bold text-sm">Skills (<span id="edit-skills-count">${editSkillsList.length}</span>)</label>
                <span class="text-xs text-muted">Click ✕ to remove, or type to add</span>
              </div>
              <div id="edit-skills-container" class="flex flex-wrap gap-2 p-2 mb-2" style="background:var(--bg-elevated);border-radius:var(--radius-md);border:1px solid var(--border-subtle);min-height:50px">
                ${renderSkillPills(editSkillsList)}
              </div>
              <div class="flex gap-2">
                <input id="new-skill-input" class="form-input" placeholder="Add a skill (e.g. Docker, TypeScript, PyTorch)..." onkeydown="if(event.key==='Enter'){event.preventDefault();StudentProfile.addSkillFromInput();}" />
                <button class="btn btn-secondary btn-sm" type="button" onclick="StudentProfile.addSkillFromInput()">+ Add Skill</button>
              </div>
            </div>

            <div class="divider my-3"></div>

            <!-- Links -->
            <div class="grid grid-2 gap-3">
              <div class="form-group">
                <label class="form-label text-xs font-bold">LinkedIn URL / Handle</label>
                <input id="edit-linkedin" class="form-input" value="${p.linkedin || ''}" placeholder="linkedin.com/in/username" />
              </div>
              <div class="form-group">
                <label class="form-label text-xs font-bold">GitHub URL / Handle</label>
                <input id="edit-github" class="form-input" value="${p.github || ''}" placeholder="github.com/username" />
              </div>
            </div>
          </div>
          <div class="modal-footer flex justify-between items-center">
            <button class="btn btn-ghost" onclick="StudentProfile.closeModal('${modalId}')">Cancel</button>
            <button class="btn btn-primary" onclick="StudentProfile.saveProfileEdits()">💾 Save Changes</button>
          </div>
        </div>
      </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    container.appendChild(wrapper.firstElementChild);

    if (initialFocus === 'skills') {
      setTimeout(() => document.getElementById('new-skill-input')?.focus(), 150);
    }
  }

  function renderSkillPills(skills) {
    return skills.map((s, idx) => `
      <span class="badge badge-accent flex items-center gap-1" style="font-size:12px;padding:4px 8px">
        <span>${s}</span>
        <span style="cursor:pointer;font-weight:bold;margin-left:4px" onclick="StudentProfile.removeSkill(${idx})" title="Remove">✕</span>
      </span>
    `).join('');
  }

  function addSkillFromInput() {
    const input = document.getElementById('new-skill-input');
    const val = (input?.value || '').trim();
    if (!val) return;

    // Split by comma if user pasted multiple
    const parts = val.split(',').map(s => s.trim()).filter(Boolean);
    parts.forEach(p => {
      if (!editSkillsList.some(s => s.toLowerCase() === p.toLowerCase())) {
        editSkillsList.push(p);
      }
    });

    input.value = '';
    const container = document.getElementById('edit-skills-container');
    const countEl = document.getElementById('edit-skills-count');
    if (container) container.innerHTML = renderSkillPills(editSkillsList);
    if (countEl) countEl.textContent = editSkillsList.length;
  }

  function removeSkill(index) {
    editSkillsList.splice(index, 1);
    const container = document.getElementById('edit-skills-container');
    const countEl = document.getElementById('edit-skills-count');
    if (container) container.innerHTML = renderSkillPills(editSkillsList);
    if (countEl) countEl.textContent = editSkillsList.length;
  }

  function saveProfileEdits() {
    const name = document.getElementById('edit-name')?.value?.trim();
    const targetRole = document.getElementById('edit-target-role')?.value?.trim();
    const email = document.getElementById('edit-email')?.value?.trim();
    const phone = document.getElementById('edit-phone')?.value?.trim();
    const branch = document.getElementById('edit-branch')?.value?.trim();
    const year = document.getElementById('edit-year')?.value?.trim();
    const cgpa = parseFloat(document.getElementById('edit-cgpa')?.value) || 8.0;
    const regNo = document.getElementById('edit-regno')?.value?.trim();
    const linkedin = document.getElementById('edit-linkedin')?.value?.trim();
    const github = document.getElementById('edit-github')?.value?.trim();

    const updates = {
      name: name || 'Candidate Student',
      targetRole: targetRole || 'Software Engineer',
      email: email || '',
      phone: phone || '',
      branch: branch || 'Computer Science',
      year: year || '2026',
      cgpa,
      regNo: regNo || '',
      linkedin: linkedin || '',
      github: github || '',
      skills: editSkillsList,
    };

    Store.updateProfile(updates);
    closeModal('edit-profile-modal');
    Toast.success('Profile updated successfully!');
    if (window.location.hash.includes('readiness') && typeof StudentReadiness !== 'undefined') {
      StudentReadiness.render();
    } else {
      render();
    }
  }

  function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  return {
    render,
    openResumeModal,
    openEditModal,
    extractResume,
    addSkillFromInput,
    removeSkill,
    saveProfileEdits,
    closeModal,
  };
})();
