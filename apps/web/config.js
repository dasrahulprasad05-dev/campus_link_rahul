/* ============================================================
   CAMPUSLINK — Frontend Global Configuration
   ============================================================ */

// Clear stale cached URLs if pointing to incorrect or deprecated hosts
try {
  const cached = localStorage.getItem('CAMPUSLINK_API_URL');
  if (cached && (cached.includes('campuslink-web') || cached.includes('localhost:3000'))) {
    localStorage.removeItem('CAMPUSLINK_API_URL');
  }
} catch (_e) {}

// Point to the live Node.js Express backend on Render
// In production on Vercel, direct requests to node-js-web-app.onrender.com (CORS enabled)
const _DEFAULT_REMOTE_BACKEND = 'https://node-js-web-app.onrender.com';

window.__API_URL__ = window.__API_URL__ 
  || localStorage.getItem('CAMPUSLINK_API_URL') 
  || (window.location.hostname === 'localhost' && window.location.port === '3000' ? '' : _DEFAULT_REMOTE_BACKEND);

// Background warm-up ping: wakes up free-tier Render container silently
(function warmUpServer() {
  const root = window.__API_URL__ || _DEFAULT_REMOTE_BACKEND;
  if (root && typeof fetch !== 'undefined') {
    fetch(`${root}/api/v1/health`, { method: 'GET', keepalive: true }).catch(() => {});
  }
})();
