/* ============================================================
   CAMPUSLINK — Skill Badge Component
   ============================================================ */

const SkillBadge = (() => {
  function render(skills, options = {}) {
    if (!skills || !skills.length) return '';
    return `
      <div class="flex flex-wrap gap-2">
        ${skills.map(s => {
          const name = typeof s === 'string' ? s : s.name;
          const cls = typeof s === 'object' ? (s.status || '') : '';
          return `<span class="skill-tag ${cls}">${name}</span>`;
        }).join('')}
      </div>
    `;
  }

  // Matched vs missing comparison
  function comparison(matched, missing) {
    return `
      <div class="flex flex-wrap gap-2">
        ${(matched || []).map(s => `<span class="skill-tag matched">✓ ${s}</span>`).join('')}
        ${(missing || []).map(s => `<span class="skill-tag missing">✗ ${s}</span>`).join('')}
      </div>
    `;
  }

  return { render, comparison };
})();
