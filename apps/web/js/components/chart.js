/* ============================================================
   CAMPUSLINK — Chart Component
   Bar charts, funnel charts, and trend lines.
   ============================================================ */

const Chart = (() => {
  // Vertical bar chart
  function barChart(data, options = {}) {
    const maxVal = Math.max(...data.map(d => d.value));
    const { height = 180, color = '' } = options;

    return `
      <div class="bar-chart" style="height:${height}px">
        ${data.map((d, i) => {
          const barHeight = Math.max(8, (d.value / maxVal) * (height - 40));
          return `
            <div class="bar-chart-col" style="animation-delay:${i * 80}ms">
              <div class="bar-chart-value">${d.value}${d.unit || ''}</div>
              <div class="bar-chart-bar ${color}" style="height:${barHeight}px" title="${d.label}: ${d.value}"></div>
              <div class="bar-chart-label">${d.label}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // Trend line using bar chart (smaller)
  function trendChart(values, labels, options = {}) {
    const data = values.map((v, i) => ({ value: v, label: labels[i] || '' }));
    return barChart(data, { height: options.height || 160, color: options.color || '' });
  }

  // Funnel chart (horizontal bars)
  function funnelChart(stages) {
    const maxVal = stages[0]?.value || 1;
    return `
      <div class="stack" style="gap:var(--space-3)">
        ${stages.map((s, i) => {
          const pct = Math.round((s.value / maxVal) * 100);
          return `
            <div class="progress-group" style="animation-delay:${i * 100}ms">
              <div class="progress-label">
                <span class="progress-label-name">${s.stage || s.label}</span>
                <span class="progress-label-value">${s.value} (${pct}%)</span>
              </div>
              <div class="progress-bar">
                <div class="progress-bar-fill" style="width:${pct}%"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  return { barChart, trendChart, funnelChart };
})();
