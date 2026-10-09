/* ============================================================
   CAMPUSLINK — KPI Card Component
   ============================================================ */

const KPICard = (() => {
  function render(kpis) {
    if (!kpis) return '';
    const items = Array.isArray(kpis) ? kpis : [kpis];
    if (!items.length) return '';
    return `
      <section class="grid grid-kpis stagger-children">
        ${items.map(k => `
          <div class="kpi-card">
            <div class="kpi-icon ${k.color || 'blue'}">${k.icon || '📊'}</div>
            <div class="kpi-label">${k.label || ''}</div>
            <div class="kpi-value">${k.value || ''}</div>
            <div class="kpi-delta ${_deltaClass(k.delta)}">${k.delta || ''}</div>
          </div>
        `).join('')}
      </section>
    `;
  }

  function _deltaClass(text) {
    if (!text) return 'neutral';
    if (text.includes('↑') || text.includes('Improving') || text.includes('+')) return 'positive';
    if (text.includes('↓') || text.includes('Declining') || text.includes('-')) return 'negative';
    return 'neutral';
  }

  return { render };
})();

// Global alias for compatibility
if (typeof window !== 'undefined') {
  window.KPICard = KPICard;
  window.KpiCard = KPICard;
}

