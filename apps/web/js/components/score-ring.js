/* ============================================================
   CAMPUSLINK — Score Ring Component
   Animated circular progress indicator with SVG.
   ============================================================ */

const ScoreRing = (() => {
  function render(score, options = {}) {
    const { size = 150, strokeWidth = 8, label = 'out of 100', gradient = 'scoreGradient' } = options;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return `
      <div class="score-ring" style="width:${size}px;height:${size}px;--ring-circumference:${circumference};--ring-offset:${offset}">
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          <circle class="score-ring-bg"
                  cx="${size / 2}" cy="${size / 2}" r="${radius}" />
          <circle class="score-ring-progress"
                  cx="${size / 2}" cy="${size / 2}" r="${radius}"
                  stroke="url(#${gradient})"
                  stroke-dasharray="${circumference}"
                  stroke-dashoffset="${offset}" />
        </svg>
        <div class="score-ring-content">
          <div class="score-ring-value gradient-text">${score}</div>
          <div class="score-ring-label">${label}</div>
        </div>
      </div>
    `;
  }

  // Mini ring for inline use
  function mini(score, options = {}) {
    return render(score, { size: 64, strokeWidth: 5, label: '', ...options });
  }

  return { render, mini };
})();
