/* ============================================================
   CAMPUSLINK — Career Roadmap Page (Feature 7: AI Roadmap)
   Interactive milestones, dynamic role selector, and robust
   multi-tier fallbacks (Node Groq LLM -> Template -> Client).
   ============================================================ */
const StudentRoadmap = (() => {
  // Built-in role milestone templates for instant client resilience
  const ROLE_TEMPLATES = {
    'Data Analyst': [
      { id: 'da-1', title: 'Master SQL Fundamentals', desc: 'Joins, group by, window functions, and subqueries.', due: 'Week 2', status: 'completed', category: 'skill', resources: ['SQLBolt.com', 'LeetCode SQL 50'] },
      { id: 'da-2', title: 'Python for Data Analysis', desc: 'Pandas, NumPy, and Matplotlib data cleaning & EDA.', due: 'Week 4', status: 'completed', category: 'skill', resources: ['Kaggle Learn Python', 'Automate the Boring Stuff'] },
      { id: 'da-3', title: 'Interactive BI Dashboard', desc: 'Build an end-to-end dashboard in Power BI or Tableau with real data.', due: 'Week 6', status: 'in-progress', category: 'project', resources: ['Power BI Learn', 'Tableau Public'] },
      { id: 'da-4', title: 'Statistics & Hypothesis Testing', desc: 'A/B testing, normal distribution, p-values, and regression.', due: 'Week 8', status: 'pending', category: 'skill', resources: ['Khan Academy Stats', 'StatQuest'] },
      { id: 'da-5', title: 'Timed Aptitude & SQL Mock Mocks', desc: 'Speed tests for company recruitment rounds.', due: 'Week 10', status: 'pending', category: 'practice', resources: ['IndiaBIX', 'CampusLink Mock'] },
      { id: 'da-6', title: 'AI Mock Interviews x3', desc: 'STAR technique behavioral and analytics case study practice.', due: 'Week 12', status: 'pending', category: 'practice', resources: ['CampusLink AI Interview'] },
    ],
    'Software Engineer': [
      { id: 'swe-1', title: 'Data Structures Foundations', desc: 'Arrays, HashMaps, Strings, and Two Pointers.', due: 'Week 2', status: 'completed', category: 'skill', resources: ['NeetCode 150', 'Abdul Bari DSA'] },
      { id: 'swe-2', title: 'Trees, Graphs & Dynamic Programming', desc: 'DFS, BFS, recursion, and memoization patterns.', due: 'Week 4', status: 'in-progress', category: 'skill', resources: ['LeetCode 75', 'NeetCode'] },
      { id: 'swe-3', title: 'Full-Stack Portfolio Project', desc: 'Production-ready web app with authentication and database.', due: 'Week 6', status: 'pending', category: 'project', resources: ['GitHub Actions', 'Vercel / Render'] },
      { id: 'swe-4', title: 'System Design Basics', desc: 'Caching, horizontal scaling, load balancers, and REST APIs.', due: 'Week 8', status: 'pending', category: 'skill', resources: ['System Design Primer', 'Gaurav Sen'] },
      { id: 'swe-5', title: 'Aptitude & CS Fundamentals', desc: 'OS, DBMS, Computer Networks, and OOP revision.', due: 'Week 10', status: 'pending', category: 'skill', resources: ['GateSmashers', 'GeeksforGeeks'] },
      { id: 'swe-6', title: 'Technical Mock Interviews x3', desc: 'Live coding problem solving + behavioral questions.', due: 'Week 12', status: 'pending', category: 'practice', resources: ['CampusLink AI Mock'] },
    ],
    'Web Developer': [
      { id: 'web-1', title: 'Modern JavaScript & TypeScript', desc: 'Closures, Promises, Async/Await, and type definitions.', due: 'Week 2', status: 'completed', category: 'skill', resources: ['JavaScript.info', 'TypeScript Handbook'] },
      { id: 'web-2', title: 'React Ecosystem & State Management', desc: 'Hooks, routing, Context API, and Tailwind/CSS modularity.', due: 'Week 4', status: 'in-progress', category: 'skill', resources: ['React.dev', 'Epic React'] },
      { id: 'web-3', title: 'Backend APIs with Node & SQL', desc: 'Express CRUD, JWT auth, input validation, and PostgreSQL.', due: 'Week 6', status: 'pending', category: 'skill', resources: ['Node.js Docs', 'Prisma ORM'] },
      { id: 'web-4', title: 'Deploy SaaS Capstone', desc: 'Full-stack application deployed live with CI/CD and custom domain.', due: 'Week 8', status: 'pending', category: 'project', resources: ['Vercel', 'Render', 'GitHub'] },
      { id: 'web-5', title: 'Web Performance & Security Audit', desc: 'Lighthouse 90+ score, CORS, sanitize inputs, SEO setup.', due: 'Week 10', status: 'pending', category: 'skill', resources: ['web.dev', 'OWASP Top 10'] },
      { id: 'web-6', title: 'Frontend Interview Deep-Dive', desc: 'DOM manipulation, system questions, and portfolio walkthrough.', due: 'Week 12', status: 'pending', category: 'practice', resources: ['CampusLink AI Interview'] },
    ],
    'ML Engineer': [
      { id: 'ml-1', title: 'Math Foundations (Linear Algebra & Calculus)', desc: 'Matrix operations, gradient descent, and probability basics.', due: 'Week 2', status: 'completed', category: 'skill', resources: ['3Blue1Brown', 'StatQuest'] },
      { id: 'ml-2', title: 'Classical ML Algorithms', desc: 'Linear/Logistic regression, Decision Trees, and Random Forests.', due: 'Week 4', status: 'in-progress', category: 'skill', resources: ['Scikit-Learn Docs', 'Kaggle Courses'] },
      { id: 'ml-3', title: 'Deep Learning & PyTorch', desc: 'Neural network architectures, CNNs, Transformers, and loss functions.', due: 'Week 7', status: 'pending', category: 'skill', resources: ['fast.ai', 'PyTorch Blitz'] },
      { id: 'ml-4', title: 'End-to-End ML API Deployment', desc: 'Wrap trained model in FastAPI and Docker; deploy to cloud.', due: 'Week 9', status: 'pending', category: 'project', resources: ['Docker Docs', 'Full Stack Deep Learning'] },
      { id: 'ml-5', title: 'ML System Design & Case Studies', desc: 'Recommendation systems, feature store, and model evaluation metrics.', due: 'Week 11', status: 'pending', category: 'practice', resources: ['Chip Huyen ML System Design'] },
    ],
    'DevOps Engineer': [
      { id: 'devops-1', title: 'Linux System Administration & Bash', desc: 'SSH, permissions, systemd, process monitoring, and shell scripts.', due: 'Week 2', status: 'completed', category: 'skill', resources: ['Linux Journey', 'OverTheWire'] },
      { id: 'devops-2', title: 'Docker Containerization', desc: 'Multi-stage builds, networks, volumes, and Docker Compose.', due: 'Week 4', status: 'in-progress', category: 'skill', resources: ['Docker Docs', 'Play with Docker'] },
      { id: 'devops-3', title: 'Kubernetes Cluster Setup', desc: 'Pods, Deployments, Services, and Ingress on Minikube / K3s.', due: 'Week 6', status: 'pending', category: 'skill', resources: ['KodeKloud', 'Kubernetes Docs'] },
      { id: 'devops-4', title: 'Automated CI/CD Pipeline', desc: 'GitHub Actions workflow with lint, test, build, and automated deploy.', due: 'Week 8', status: 'pending', category: 'project', resources: ['GitHub Actions', 'AWS Skill Builder'] },
      { id: 'devops-5', title: 'Infrastructure as Code (Terraform)', desc: 'Provision cloud VPC, subnets, and compute instances reproducibly.', due: 'Week 10', status: 'pending', category: 'skill', resources: ['HashiCorp Learn'] },
    ],
  };

  // State
  let state = {
    targetRole: 'Data Analyst',
    milestones: [],
    generatedMilestones: null,
    generatedSummary: '',
    generatedSource: '',
  };

  function init() {
    const profileRole = Store.getProfile()?.targetRole || 'Data Analyst';
    state.targetRole = profileRole;
    // Load from template for initial role
    state.milestones = JSON.parse(JSON.stringify(ROLE_TEMPLATES[profileRole] || ROLE_TEMPLATES['Data Analyst']));
  }

  async function render() {
    if (!state.milestones || state.milestones.length === 0) {
      init();
    }

    const completed = state.milestones.filter(m => m.status === 'completed').length;
    const total = state.milestones.length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    document.getElementById('main').innerHTML = `
      <div class="page-header">
        <div class="page-header-content">
          <div class="page-eyebrow">Career Roadmap</div>
          <h1 class="page-title">Your Learning Journey</h1>
          <p class="page-subtitle">A dynamic milestone-based learning plan aligned to your target role. Click any milestone to update your progress.</p>
        </div>
      </div>

      <div class="grid grid-main">
        <div class="stack">
          <!-- Active Checklist Card -->
          <article class="card animate-fade-in-up">
            <div class="card-header">
              <div class="flex items-center gap-3">
                <h2 class="card-title">Roadmap Progress: <span class="text-accent">${state.targetRole}</span></h2>
              </div>
              <span class="badge badge-accent" id="milestones-count-badge">${completed}/${total} completed</span>
            </div>

            <div class="progress-group mb-6">
              <div class="progress-label">
                <span class="progress-label-name">Overall Progress</span>
                <span class="progress-label-value" id="progress-pct-text">${pct}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-bar-fill" id="progress-bar-fill" style="width:${pct}%"></div>
              </div>
            </div>

            <div class="schedule-timeline" id="milestones-timeline">
              ${renderTimeline(state.milestones)}
            </div>
          </article>

          <!-- Generated AI Roadmap Container -->
          <div id="ai-roadmap-results">
            ${state.generatedMilestones ? renderGeneratedPlan() : ''}
          </div>
        </div>

        <aside class="stack">
          <!-- Target Role Selection Card -->
          <article class="card card-accent animate-fade-in-up" style="animation-delay:80ms">
            <h3 class="card-title mb-2">🎯 Target Career Path</h3>
            <p class="text-xs text-muted mb-4">Choose your target placement role to adapt your milestones:</p>

            <div class="form-group mb-4">
              <select id="roadmap-role-select" class="form-select" onchange="StudentRoadmap.onRoleChange(this.value)" style="width:100%;padding:8px 12px;border-radius:var(--radius-md);background:var(--bg-primary);color:var(--text-primary);border:1px solid var(--border-default)">
                <option value="Data Analyst" ${state.targetRole === 'Data Analyst' ? 'selected' : ''}>📊 Data Analyst</option>
                <option value="Software Engineer" ${state.targetRole === 'Software Engineer' ? 'selected' : ''}>💻 Software Engineer (SDE)</option>
                <option value="Web Developer" ${state.targetRole === 'Web Developer' ? 'selected' : ''}>🌐 Full-Stack Web Developer</option>
                <option value="ML Engineer" ${state.targetRole === 'ML Engineer' ? 'selected' : ''}>🤖 ML / AI Engineer</option>
                <option value="DevOps Engineer" ${state.targetRole === 'DevOps Engineer' ? 'selected' : ''}>☁️ Cloud & DevOps Engineer</option>
              </select>
            </div>

            <button class="btn btn-primary" style="width:100%" id="generate-roadmap-btn" onclick="StudentRoadmap.generateAIRoadmap()">
              🤖 Generate AI Roadmap
            </button>
            <p class="text-xs text-muted mt-3">Uses AI to tailor week-by-week goals matching your current profile.</p>
          </article>

          <!-- Interactive Legend & Tips -->
          <article class="card animate-fade-in-up" style="animation-delay:120ms">
            <div class="card-header"><h2 class="card-title">💡 Progress Controls</h2></div>
            <div class="text-xs text-muted stack" style="gap:var(--space-2)">
              <div class="flex items-center gap-2">
                <span class="status-badge status-accepted" style="padding:2px 8px">completed</span>
                <span>Click to cycle milestone status</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="status-badge status-interview" style="padding:2px 8px">in-progress</span>
                <span>Currently active study task</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="status-badge status-draft" style="padding:2px 8px">pending</span>
                <span>Upcoming milestone</span>
              </div>
            </div>
          </article>

          <!-- Mentor Review -->
          <article class="card animate-fade-in-up" style="animation-delay:150ms">
            <div class="card-header"><h2 class="card-title">Mentor Review</h2></div>
            <div class="insight-card accent">
              <strong>Pending review</strong> Your assigned faculty mentor can approve, adjust, or verify milestones.
            </div>
            <button class="btn btn-sm mt-4" style="width:100%" onclick="Toast.info('Roadmap progress submitted to your mentor for review!')">
              Request Mentor Review
            </button>
          </article>
        </aside>
      </div>
    `;
  }

  function renderTimeline(milestones) {
    return milestones.map((m, i) => {
      const isDone = m.status === 'completed';
      const isInProg = m.status === 'in-progress';
      const borderColor = isDone ? 'var(--success)' : isInProg ? 'var(--accent)' : 'var(--border-default)';
      const badgeClass = isDone ? 'status-accepted' : isInProg ? 'status-interview' : 'status-draft';

      return `
        <div class="schedule-event animate-fade-in-up"
             style="animation-delay:${i * 40}ms; border-left-color:${borderColor}; cursor:pointer; transition:transform 0.15s ease, background 0.15s ease"
             onclick="StudentRoadmap.toggleMilestone(${i})"
             title="Click to toggle status (pending → in-progress → completed)">
          <div class="flex justify-between items-center mb-2">
            <div class="flex items-center gap-3">
              <div class="milestone-number ${isDone ? 'completed' : ''}" style="${isInProg ? 'border-color:var(--accent);color:var(--accent)' : ''}">
                ${isDone ? '✓' : i + 1}
              </div>
              <div>
                <div class="font-bold text-sm ${isDone ? 'text-muted' : ''}" style="${isDone ? 'text-decoration:line-through;opacity:0.8' : ''}">
                  ${m.title}
                </div>
                ${m.category ? `<span class="badge badge-ghost" style="font-size:10px;padding:1px 6px">${m.category}</span>` : ''}
              </div>
            </div>
            <span class="status-badge ${badgeClass}" style="cursor:pointer">${m.status}</span>
          </div>

          <p class="text-sm text-muted mb-2">${m.desc || m.description || ''}</p>

          <div class="flex justify-between items-center text-xs text-muted">
            <span>📅 ${m.due || (m.week ? `Week ${m.week}` : 'Upcoming')}</span>
            ${m.resources?.length ? `<span class="text-accent">📚 ${Array.isArray(m.resources) ? m.resources.slice(0, 2).join(' · ') : m.resources}</span>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  function onRoleChange(newRole) {
    state.targetRole = newRole;
    const template = ROLE_TEMPLATES[newRole] || ROLE_TEMPLATES['Data Analyst'];
    state.milestones = JSON.parse(JSON.stringify(template));
    state.generatedMilestones = null;
    render();
    Toast.info(`Switched roadmap to ${newRole}`);
  }

  function toggleMilestone(index) {
    if (!state.milestones[index]) return;
    const current = state.milestones[index].status;
    const nextStatus = current === 'completed' ? 'pending' : current === 'in-progress' ? 'completed' : 'in-progress';
    state.milestones[index].status = nextStatus;

    // Update progress calculation
    const completed = state.milestones.filter(m => m.status === 'completed').length;
    const total = state.milestones.length;
    const pct = Math.round((completed / total) * 100);

    // Refresh UI smoothly
    const timeline = document.getElementById('milestones-timeline');
    if (timeline) timeline.innerHTML = renderTimeline(state.milestones);

    const badge = document.getElementById('milestones-count-badge');
    if (badge) badge.textContent = `${completed}/${total} completed`;

    const pctText = document.getElementById('progress-pct-text');
    if (pctText) pctText.textContent = `${pct}%`;

    const fill = document.getElementById('progress-bar-fill');
    if (fill) fill.style.width = `${pct}%`;

    if (nextStatus === 'completed') {
      Toast.success(`Milestone completed! Overall progress: ${pct}%`);
    }
  }

  async function generateAIRoadmap() {
    const btn = document.getElementById('generate-roadmap-btn');
    if (btn) {
      btn.textContent = '🤖 Generating Plan...';
      btn.disabled = true;
    }

    const profile = Store.getProfile();
    const targetRole = state.targetRole || profile.targetRole || 'Data Analyst';

    let result = null;
    try {
      result = await API.post('/ai/generate-roadmap', {
        targetRole,
        currentSkills: profile.skills || [],
        skillGaps: [],
        cgpa: profile.cgpa || 7.5,
        projectsCount: 2,
        weeksUntilPlacement: 12,
      });
    } catch (err) {
      console.warn('[Roadmap] Network error calling /ai/generate-roadmap:', err);
    }

    if (btn) {
      btn.textContent = '🤖 Generate AI Roadmap';
      btn.disabled = false;
    }

    let milestones = result?.milestones || result?.data?.milestones || [];
    let summary = result?.summary || result?.data?.summary || '';
    let source = result?.source || result?.data?.source || 'template-fallback';

    // Client resilience: if backend returned empty array or error, use tailored client template
    if (!milestones || milestones.length === 0) {
      const templateList = ROLE_TEMPLATES[targetRole] || ROLE_TEMPLATES['Data Analyst'];
      milestones = templateList.map((m, idx) => ({
        week: idx + 1,
        title: m.title,
        description: m.desc,
        priority: idx < 2 ? 'critical' : idx < 4 ? 'high' : 'medium',
        category: m.category || 'skill',
        resources: m.resources || [],
        success_criteria: 'Complete assigned assignments and mock tests',
      }));
      summary = `Personalized 12-week preparation roadmap for ${targetRole} campus placements.`;
      source = 'client-fallback';
    }

    state.generatedMilestones = milestones;
    state.generatedSummary = summary;
    state.generatedSource = source;

    const el = document.getElementById('ai-roadmap-results');
    if (el) {
      el.innerHTML = renderGeneratedPlan();
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    Toast.success(`AI Roadmap generated for ${targetRole}!`);
  }

  function renderGeneratedPlan() {
    if (!state.generatedMilestones) return '';
    const milestones = state.generatedMilestones;
    const sourceLabel = state.generatedSource === 'groq-llm' ? '🤖 LLM Personalized' : '📋 Curated Placement Plan';

    return `
      <article class="card animate-fade-in-up mt-4" style="border:1px solid var(--accent)">
        <div class="card-header">
          <div>
            <h2 class="card-title">🤖 AI-Generated Roadmap Plan</h2>
            <div class="text-xs text-muted mt-1">${state.generatedSummary}</div>
          </div>
          <div class="flex items-center gap-2">
            <span class="badge badge-accent">${sourceLabel}</span>
            <button class="btn btn-sm btn-primary" onclick="StudentRoadmap.applyGeneratedPlan()">
              ✓ Apply as Active Roadmap
            </button>
          </div>
        </div>

        <div class="schedule-timeline">
          ${milestones.map((m, i) => `
            <div class="schedule-event animate-fade-in-up"
                 style="animation-delay:${i * 40}ms; border-left-color:${m.priority === 'critical' ? 'var(--danger)' : m.priority === 'high' ? 'var(--warning)' : 'var(--accent)'}">
              <div class="flex justify-between items-center mb-2">
                <div class="flex items-center gap-3">
                  <div class="milestone-number">${m.week || i + 1}</div>
                  <div>
                    <div class="font-bold text-sm">${m.title}</div>
                    <span class="badge badge-${m.priority === 'critical' ? 'danger' : m.priority === 'high' ? 'warning' : 'ghost'}" style="font-size:10px;padding:1px 6px">${m.priority || 'medium'}</span>
                    <span class="badge badge-ghost" style="font-size:10px;padding:1px 6px">${m.category || 'skill'}</span>
                  </div>
                </div>
                <span class="text-xs text-muted">Week ${m.week || i + 1}</span>
              </div>
              <p class="text-sm text-muted">${m.description}</p>
              ${m.resources?.length ? `<div class="text-xs text-accent mt-2">📚 ${Array.isArray(m.resources) ? m.resources.join(' · ') : m.resources}</div>` : ''}
              ${m.success_criteria ? `<div class="text-xs text-muted mt-1">✅ Done when: ${m.success_criteria}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </article>
    `;
  }

  function applyGeneratedPlan() {
    if (!state.generatedMilestones || state.generatedMilestones.length === 0) return;
    state.milestones = state.generatedMilestones.map((m, idx) => ({
      id: `gen-${idx}`,
      title: m.title,
      desc: m.description,
      due: `Week ${m.week || idx + 1}`,
      status: 'pending',
      category: m.category,
      resources: m.resources,
    }));
    state.generatedMilestones = null;
    render();
    Toast.success('Active roadmap updated with your AI milestones!');
  }

  return {
    render,
    onRoleChange,
    toggleMilestone,
    generateAIRoadmap,
    applyGeneratedPlan,
  };
})();
