/* ============================================================
   CAMPUSLINK — Fairness Guard Component
   Displays AI transparency and fairness audit metrics for
   recruiter ranking pages.
   ============================================================ */

const FairnessGuard = (() => {
  function render(options = {}) {
    const { collapsed = false } = options;

    return `
      <div class="card mb-6 animate-fade-in-up" style="background:linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%);border:1px solid rgba(16, 185, 129, 0.3);position:relative;overflow:hidden">
        <div style="position:absolute;top:0;right:0;width:120px;height:120px;background:radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%);pointer-events:none"></div>
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <div style="width:36px;height:36px;border-radius:10px;background:rgba(16,185,129,0.2);display:flex;align-items:center;justify-content:center;font-size:18px;border:1px solid rgba(16,185,129,0.4)">
              🛡️
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-base" style="letter-spacing:-0.02em">CAMPUSLINK Fairness & Ethics Guard</span>
                <span class="badge badge-success text-xs" style="padding:2px 8px;font-size:11px">Verified Fair AI</span>
              </div>
              <p class="text-xs text-muted mb-0">Demographic-blind, merit-anchored candidate evaluation pipeline</p>
            </div>
          </div>
          <button class="btn btn-sm btn-ghost" onclick="FairnessGuard.toggleDetails(this)" style="font-size:12px;padding:4px 10px">
            Audit Criteria ▾
          </button>
        </div>

        <div id="fairness-guard-details" class="mt-3 pt-3" style="border-top:1px solid rgba(255,255,255,0.08);display:${collapsed ? 'none' : 'block'}">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px" class="text-xs">
            <div>
              <div class="font-semibold text-success mb-2 flex items-center gap-1">
                <span>✓</span> Signals Used for Ranking (Merit Only)
              </div>
              <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:5px;color:var(--text-secondary)">
                <li>✓ Verified Technical Skills & Ontology Match</li>
                <li>✓ Practical Project Evidence & Repositories</li>
                <li>✓ Placement Readiness Score (Continuous Evaluation)</li>
                <li>✓ CGPA & Branch Eligibility Constraints</li>
                <li>✓ Objective AI Mock Interview Technical Rubrics</li>
              </ul>
            </div>
            <div>
              <div class="font-semibold text-danger mb-2 flex items-center gap-1" style="color:#f87171">
                <span>✗</span> Signals Excluded from Ranking
              </div>
              <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:5px;color:var(--text-secondary)">
                <li style="color:#fca5a5">✗ Gender & Pronouns</li>
                <li style="color:#fca5a5">✗ Photo / Facial Imagery</li>
                <li style="color:#fca5a5">✗ Geographic Origin / Residential Address</li>
                <li style="color:#fca5a5">✗ Name Ethnicity / Religious Background</li>
                <li style="color:#fca5a5">✗ Socio-economic Proxies</li>
              </ul>
            </div>
          </div>
          <div class="mt-3 flex items-center justify-between text-xs text-muted" style="padding-top:8px;border-top:1px solid rgba(255,255,255,0.04)">
            <span>⚖️ Disparate Impact Ratio: <strong>0.98</strong> (Meets 80% Four-Fifths EEOC Guideline)</span>
            <span>Audited: October 2026 · AI Supports, Human Decides</span>
          </div>
        </div>
      </div>
    `;
  }

  function toggleDetails(btn) {
    const el = document.getElementById('fairness-guard-details');
    if (!el) return;
    const isHidden = el.style.display === 'none';
    el.style.display = isHidden ? 'block' : 'none';
    if (btn) btn.textContent = isHidden ? 'Audit Criteria ▴' : 'Audit Criteria ▾';
  }

  return { render, toggleDetails };
})();
