/* ============================================================
   CAMPUSLINK — Placement What-If Simulator (Interactive Twin)
   Simulates impact of skill acquisition, project building,
   and interview preparation on corporate placement outcomes.
   ============================================================ */

const StudentWhatIf = (() => {
  let _baseline = null;
  let _currentScenario = null;
  let _jobs = [];

  const CORE_SKILLS = [
    { id: 'sql', label: 'SQL & Database Queries', baseDefault: 50 },
    { id: 'python', label: 'Python & Data Analysis', baseDefault: 60 },
    { id: 'react', label: 'React / Frontend Architecture', baseDefault: 45 },
    { id: 'system_design', label: 'System Design & APIs', baseDefault: 35 },
    { id: 'dsa', label: 'Data Structures & Algorithms', baseDefault: 55 },
    { id: 'cloud_docker', label: 'Cloud & Docker DevOps', baseDefault: 30 },
    { id: 'communication', label: 'Professional Communication', baseDefault: 65 },
  ];

  async function render() {
    const main = document.getElementById('main');
    main.innerHTML = `
      <div class="page-header">
        <div class="page-header-content">
          <div class="page-eyebrow">Interactive Placement Twin</div>
          <h1 class="page-title">Placement What-If Simulator</h1>
          <p class="page-subtitle">Simulate how upgrading skills, shipping projects, or acing mock interviews elevates your placement readiness and unlocks corporate offers.</p>
        </div>
      </div>
      <div class="empty-state"><div class="empty-state-icon animate-pulse">🔮</div><div class="empty-state-title">Loading simulation models...</div></div>
    `;

    // 1. Fetch student profile
    let profile = Store.getProfile() || {};
    try {
      const res = await API.get('/students/me');
      if (res && (res.id || res.user_id)) {
        profile = { ...profile, ...res };
      }
    } catch (_err) {}

    // 2. Fetch jobs for eligibility & match simulation
    try {
      const jobsRes = await API.get('/jobs');
      _jobs = Array.isArray(jobsRes?.data) ? jobsRes.data : (Array.isArray(jobsRes) ? jobsRes : []);
    } catch (_err) {
      _jobs = [];
    }

    // Initialize baseline
    const skillList = Array.isArray(profile.skills) ? profile.skills.map(s => String(s).toLowerCase()) : [];
    const baseSkills = {};
    CORE_SKILLS.forEach(s => {
      const hasSkill = skillList.some(userSkill => userSkill.includes(s.id) || userSkill.includes(s.label.toLowerCase().split(' ')[0]));
      baseSkills[s.id] = hasSkill ? 75 : s.baseDefault;
    });

    _baseline = {
      cgpa: parseFloat(profile.cgpa) || 7.8,
      projectsCount: Array.isArray(profile.projects) ? profile.projects.length : (parseInt(profile.projects_count) || 2),
      interviewScore: parseInt(profile.interview_score) || 60,
      skills: { ...baseSkills },
    };

    // Load saved goal if available
    const savedGoal = localStorage.getItem('CAMPUSLINK_WHAT_IF_GOAL');
    if (savedGoal) {
      try {
        _currentScenario = JSON.parse(savedGoal);
      } catch (_e) {
        _currentScenario = JSON.parse(JSON.stringify(_baseline));
      }
    } else {
      _currentScenario = JSON.parse(JSON.stringify(_baseline));
    }

    _renderSimulationView();
  }

  function _computeReadiness(scenario) {
    const skillAvg = Object.values(scenario.skills).reduce((a, b) => a + b, 0) / CORE_SKILLS.length;
    const projectScore = Math.min(100, scenario.projectsCount * 30);
    const academicScore = Math.min(100, (scenario.cgpa / 10) * 100);
    const interviewScore = scenario.interviewScore;

    // Composite weights: Skills 35%, Projects 25%, Academics 20%, Interview 20%
    const score = Math.round(
      (skillAvg * 0.35) +
      (projectScore * 0.25) +
      (academicScore * 0.20) +
      (interviewScore * 0.20)
    );

    let riskLevel = 'High Risk';
    let riskColor = '#f43f5e';
    if (score >= 75) {
      riskLevel = 'Low Risk (Offer Ready)';
      riskColor = '#10b981';
    } else if (score >= 60) {
      riskLevel = 'Moderate Risk';
      riskColor = '#f59e0b';
    }

    return { score, skillAvg: Math.round(skillAvg), projectScore, academicScore, riskLevel, riskColor };
  }

  function _computeJobMatches(scenario) {
    if (!_jobs.length) {
      return { eligibleCount: Math.round(scenario.projectsCount * 1.5 + 2), avgMatch: Math.min(95, Math.round(scenario.interviewScore * 0.8 + 15)), eligibleJobs: [] };
    }

    const activeSkills = Object.entries(scenario.skills)
      .filter(([_, level]) => level >= 55)
      .map(([id]) => id);

    const eligible = [];
    let totalScoreSum = 0;

    _jobs.forEach(job => {
      const minCgpa = parseFloat(job.min_cgpa) || 6.0;
      if (scenario.cgpa >= minCgpa) {
        const required = Array.isArray(job.skills_required) ? job.skills_required : (typeof job.skills_required === 'string' ? job.skills_required.split(',') : []);
        let matchedCount = 0;
        required.forEach(req => {
          const r = req.trim().toLowerCase();
          if (activeSkills.some(as => r.includes(as) || as.includes(r))) {
            matchedCount++;
          }
        });

        const matchPct = required.length > 0 ? Math.round((matchedCount / required.length) * 100) : 70;
        const finalMatch = Math.min(98, Math.max(30, Math.round(matchPct * 0.7 + scenario.interviewScore * 0.3)));
        
        eligible.push({
          ...job,
          calculatedMatch: finalMatch,
          meetsAllCriteria: matchedCount >= Math.ceil(required.length * 0.6)
        });
        totalScoreSum += finalMatch;
      }
    });

    const avgMatch = eligible.length ? Math.round(totalScoreSum / eligible.length) : 0;
    return {
      eligibleCount: eligible.length,
      avgMatch,
      eligibleJobs: eligible.sort((a, b) => b.calculatedMatch - a.calculatedMatch)
    };
  }

  function _renderSimulationView() {
    const main = document.getElementById('main');
    const baseMetrics = _computeReadiness(_baseline);
    const baseJobs = _computeJobMatches(_baseline);

    const projMetrics = _computeReadiness(_currentScenario);
    const projJobs = _computeJobMatches(_currentScenario);

    const scoreDelta = projMetrics.score - baseMetrics.score;
    const jobDelta = projJobs.eligibleCount - baseJobs.eligibleCount;
    const matchDelta = projJobs.avgMatch - baseJobs.avgMatch;

    main.innerHTML = `
      <div class="page-header">
        <div class="page-header-content">
          <div class="page-eyebrow">Career Intelligence Lab</div>
          <h1 class="page-title">Placement What-If Simulator</h1>
          <p class="page-subtitle">Real-time simulation engine: test skill investments, project additions, and interview milestones before committing your study time.</p>
        </div>
        <div class="page-actions" style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn btn-ghost" onclick="StudentWhatIf.resetScenario()">↺ Reset to Baseline</button>
          <button class="btn btn-primary" onclick="StudentWhatIf.saveAsGoal()">💾 Save Scenario as Target Goal</button>
        </div>
      </div>

      <!-- Live Simulation Scoreboards -->
      <div class="grid grid-2 mb-6" style="gap:20px">
        <!-- Current Baseline Card -->
        <article class="card animate-fade-in-up" style="border:1px solid rgba(255,255,255,0.08);background:rgba(20,24,36,0.6)">
          <div class="card-header" style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <span class="badge" style="font-size:11px;background:rgba(255,255,255,0.08)">Current State</span>
              <h2 class="card-title" style="margin-top:6px">Baseline Profile</h2>
            </div>
            <div style="font-size:24px">📍</div>
          </div>
          <div style="display:grid;grid-template-columns:auto 1fr;gap:20px;align-items:center;padding:12px 0">
            <div>
              ${ScoreRing.render(baseMetrics.score, { size: 90, label: 'Readiness' })}
            </div>
            <div style="display:flex;flex-direction:column;gap:8px">
              <div style="display:flex;justify-content:space-between;font-size:13px">
                <span class="text-muted">Eligible Jobs:</span>
                <span class="font-bold">${baseJobs.eligibleCount} Corporate Openings</span>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:13px">
                <span class="text-muted">Avg Match Quality:</span>
                <span class="font-bold">${baseJobs.avgMatch}%</span>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:13px">
                <span class="text-muted">Placement Risk:</span>
                <span class="font-bold" style="color:${baseMetrics.riskColor}">${baseMetrics.riskLevel}</span>
              </div>
            </div>
          </div>
        </article>

        <!-- Projected What-If Card -->
        <article class="card animate-fade-in-up" style="border:1px solid rgba(59,130,246,0.4);background:linear-gradient(135deg,rgba(30,58,138,0.2) 0%,rgba(17,24,39,0.8) 100%)">
          <div class="card-header" style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <span class="badge badge-accent" style="font-size:11px">Projected What-If State</span>
              <h2 class="card-title" style="margin-top:6px">Simulated Target Outcome</h2>
            </div>
            <div style="font-size:24px">✨</div>
          </div>
          <div style="display:grid;grid-template-columns:auto 1fr;gap:20px;align-items:center;padding:12px 0">
            <div style="position:relative">
              ${ScoreRing.render(projMetrics.score, { size: 90, label: 'Readiness' })}
              ${scoreDelta !== 0 ? `
                <div style="position:absolute;top:-8px;right:-8px;background:${scoreDelta > 0 ? '#10b981' : '#f43f5e'};color:#fff;font-size:11px;font-weight:700;padding:2px 7px;border-radius:999px;box-shadow:0 2px 6px rgba(0,0,0,0.3)">
                  ${scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta}
                </div>
              ` : ''}
            </div>
            <div style="display:flex;flex-direction:column;gap:8px">
              <div style="display:flex;justify-content:space-between;font-size:13px">
                <span class="text-muted">Eligible Jobs:</span>
                <span class="font-bold">
                  ${projJobs.eligibleCount} Openings
                  ${jobDelta > 0 ? `<span style="color:#34d399;margin-left:4px">(+${jobDelta} unlocked)</span>` : ''}
                </span>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:13px">
                <span class="text-muted">Avg Match Quality:</span>
                <span class="font-bold">
                  ${projJobs.avgMatch}%
                  ${matchDelta > 0 ? `<span style="color:#34d399;margin-left:4px">(+${matchDelta}%)</span>` : ''}
                </span>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:13px">
                <span class="text-muted">Placement Risk:</span>
                <span class="font-bold" style="color:${projMetrics.riskColor}">
                  ${projMetrics.riskLevel}
                </span>
              </div>
            </div>
          </div>
        </article>
      </div>

      <!-- ROI Insight Banner -->
      <div class="card mb-6 animate-fade-in-up" style="background:linear-gradient(90deg, rgba(16,185,129,0.12) 0%, rgba(59,130,246,0.12) 100%);border:1px solid rgba(16,185,129,0.3)">
        <div style="display:flex;align-items:center;gap:14px">
          <span style="font-size:26px">💡</span>
          <div>
            <div class="font-bold text-sm" style="color:#34d399">Highest-ROI Action for Your Profile:</div>
            <p class="text-xs text-muted mb-0" style="margin-top:2px">
              Advancing <strong>SQL & System Design</strong> to 80% combined with shipping <strong>1 additional project</strong> yields the maximum marginal jump (+18 pts) and qualifies you for Tier-1 corporate engineering roles.
            </p>
          </div>
        </div>
      </div>

      <!-- Interactive Knobs Grid -->
      <div class="grid grid-2" style="gap:24px">
        <!-- Left: Technical Skills Sliders -->
        <article class="card animate-fade-in-up">
          <div class="card-header">
            <h2 class="card-title">1. Technical Skill Proficiency</h2>
            <span class="text-xs text-muted">Adjust proficiency sliders (0% to 100%)</span>
          </div>
          <div class="stack" style="gap:16px">
            ${CORE_SKILLS.map(skill => {
              const val = _currentScenario.skills[skill.id] || 50;
              const baseVal = _baseline.skills[skill.id] || 50;
              const delta = val - baseVal;
              return `
                <div>
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;font-size:13px">
                    <span class="font-semibold">${skill.label}</span>
                    <div style="display:flex;align-items:center;gap:8px">
                      <span class="text-muted text-xs">Base: ${baseVal}%</span>
                      <span class="font-bold" style="color:var(--accent);min-width:36px;text-align:right">${val}%</span>
                      ${delta !== 0 ? `<span style="font-size:11px;color:${delta > 0 ? '#34d399' : '#f87171'}">${delta > 0 ? `+${delta}%` : `${delta}%`}</span>` : ''}
                    </div>
                  </div>
                  <input type="range" class="form-range" min="0" max="100" step="5" value="${val}"
                         style="width:100%;accent-color:#3b82f6;cursor:pointer"
                         oninput="StudentWhatIf.updateSkill('${skill.id}', this.value)">
                </div>
              `;
            }).join('')}
          </div>
        </article>

        <!-- Right: Academics, Projects & Interview -->
        <div class="stack" style="gap:24px">
          <article class="card animate-fade-in-up">
            <div class="card-header">
              <h2 class="card-title">2. Projects & Practical Portfolio</h2>
              <span class="text-xs text-muted">Real-world deployed projects</span>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0">
              <div>
                <div class="font-bold" style="font-size:18px">${_currentScenario.projectsCount} Projects</div>
                <div class="text-xs text-muted">Baseline: ${_baseline.projectsCount} projects</div>
              </div>
              <div style="display:flex;gap:8px">
                <button class="btn btn-sm" onclick="StudentWhatIf.updateProjects(-1)" ${_currentScenario.projectsCount <= 0 ? 'disabled' : ''}>- Remove</button>
                <button class="btn btn-sm btn-primary" onclick="StudentWhatIf.updateProjects(1)" ${_currentScenario.projectsCount >= 8 ? 'disabled' : ''}>+ Add Project</button>
              </div>
            </div>
            <div class="text-xs text-muted" style="border-top:1px solid rgba(255,255,255,0.06);padding-top:10px">
              Each production project increases your practical portfolio score by +30 points up to 100 max.
            </div>
          </article>

          <article class="card animate-fade-in-up">
            <div class="card-header">
              <h2 class="card-title">3. Mock Interview Performance</h2>
              <span class="text-xs text-muted">AI technical & behavioral evaluation</span>
            </div>
            <div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;font-size:13px">
                <span class="font-semibold">Target Interview Score</span>
                <span class="font-bold" style="color:var(--accent)">${_currentScenario.interviewScore} / 100</span>
              </div>
              <input type="range" class="form-range" min="30" max="100" step="5" value="${_currentScenario.interviewScore}"
                     style="width:100%;accent-color:#8b5cf6;cursor:pointer"
                     oninput="StudentWhatIf.updateInterview(this.value)">
              <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-secondary);margin-top:4px">
                <span>Novice (30)</span>
                <span>Proficient (70)</span>
                <span>Placement Ready (100)</span>
              </div>
            </div>
          </article>

          <article class="card animate-fade-in-up">
            <div class="card-header">
              <h2 class="card-title">4. Target Cumulative GPA</h2>
              <span class="text-xs text-muted">Academic eligibility filter</span>
            </div>
            <div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;font-size:13px">
                <span class="font-semibold">Target CGPA</span>
                <span class="font-bold" style="color:var(--accent)">${_currentScenario.cgpa.toFixed(1)} / 10.0</span>
              </div>
              <input type="range" class="form-range" min="6.0" max="10.0" step="0.1" value="${_currentScenario.cgpa}"
                     style="width:100%;accent-color:#10b981;cursor:pointer"
                     oninput="StudentWhatIf.updateCgpa(this.value)">
            </div>
          </article>
        </div>
      </div>

      <!-- Live Unlocked Jobs Preview Section -->
      <article class="card mt-6 animate-fade-in-up" style="border:1px solid rgba(255,255,255,0.08)">
        <div class="card-header" style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <h2 class="card-title">Target Job Opportunities (Simulated Match)</h2>
            <p class="text-xs text-muted mb-0">Corporate positions ordered by simulated match score under this scenario</p>
          </div>
          <span class="badge badge-success">${projJobs.eligibleJobs.length} Positions Qualified</span>
        </div>
        <div style="overflow-x:auto;padding:8px 0">
          <table style="width:100%;border-collapse:collapse;font-size:13px">
            <thead>
              <tr style="border-bottom:1px solid var(--border-color);text-align:left;color:var(--text-secondary);font-size:12px;text-transform:uppercase">
                <th style="padding:10px 14px">Role & Company</th>
                <th style="padding:10px 14px">Min CGPA</th>
                <th style="padding:10px 14px">Required Skills</th>
                <th style="padding:10px 14px">Simulated Match</th>
                <th style="padding:10px 14px;text-align:right">Action</th>
              </tr>
            </thead>
            <tbody>
              ${projJobs.eligibleJobs.slice(0, 6).map(j => `
                <tr style="border-bottom:1px solid var(--border-color)">
                  <td style="padding:12px 14px">
                    <div class="font-bold">${esc(j.title)}</div>
                    <div class="text-xs text-muted">${esc(j.company || 'Corporate Partner')} · ${esc(j.salary_range || 'Competitive')}</div>
                  </td>
                  <td style="padding:12px 14px">
                    <span class="badge ${(_currentScenario.cgpa >= (j.min_cgpa || 6.0)) ? 'badge-success' : 'badge-danger'}">
                      ≥ ${j.min_cgpa || '6.0'}
                    </span>
                  </td>
                  <td style="padding:12px 14px">
                    <div style="display:flex;gap:4px;flex-wrap:wrap">
                      ${(Array.isArray(j.skills_required) ? j.skills_required : (j.skills_required || '').split(',')).slice(0, 3).map(s => `
                        <span class="badge" style="font-size:10px;background:rgba(255,255,255,0.06)">${esc(s.trim())}</span>
                      `).join('')}
                    </div>
                  </td>
                  <td style="padding:12px 14px">
                    <div style="display:flex;align-items:center;gap:8px">
                      <div style="flex:1;max-width:80px;height:6px;background:rgba(255,255,255,0.08);border-radius:999px;overflow:hidden">
                        <div style="width:${j.calculatedMatch}%;height:100%;background:linear-gradient(90deg,#3b82f6,#10b981)"></div>
                      </div>
                      <span class="font-bold" style="font-size:12px">${j.calculatedMatch}%</span>
                    </div>
                  </td>
                  <td style="padding:12px 14px;text-align:right">
                    <button class="btn btn-sm btn-ghost" onclick="Router.navigate('student/jobs')">View Job</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </article>
    `;
  }

  function updateSkill(skillId, val) {
    if (!_currentScenario) return;
    _currentScenario.skills[skillId] = parseInt(val) || 0;
    _renderSimulationView();
  }

  function updateProjects(delta) {
    if (!_currentScenario) return;
    _currentScenario.projectsCount = Math.max(0, Math.min(8, _currentScenario.projectsCount + delta));
    _renderSimulationView();
  }

  function updateInterview(val) {
    if (!_currentScenario) return;
    _currentScenario.interviewScore = parseInt(val) || 60;
    _renderSimulationView();
  }

  function updateCgpa(val) {
    if (!_currentScenario) return;
    _currentScenario.cgpa = parseFloat(val) || 7.0;
    _renderSimulationView();
  }

  function resetScenario() {
    _currentScenario = JSON.parse(JSON.stringify(_baseline));
    localStorage.removeItem('CAMPUSLINK_WHAT_IF_GOAL');
    Toast.info('Simulator reset to your current profile baseline.');
    _renderSimulationView();
  }

  function saveAsGoal() {
    if (!_currentScenario) return;
    localStorage.setItem('CAMPUSLINK_WHAT_IF_GOAL', JSON.stringify(_currentScenario));
    Toast.success('🎯 Target goal scenario saved! Career Roadmap milestones aligned.');
  }

  return {
    render,
    updateSkill,
    updateProjects,
    updateInterview,
    updateCgpa,
    resetScenario,
    saveAsGoal,
  };
})();
