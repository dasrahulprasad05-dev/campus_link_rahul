/* ============================================================
   CAMPUSLINK — Frontend Global Configuration
   ============================================================ */

// If hosting the frontend on Vercel and the backend on Render,
// set your Render Backend API URL below (e.g., 'https://campuslink-web.onrender.com').
// If hosting frontend + backend together on Render, leave it empty '' (same-origin).
window.__API_URL__ = window.__API_URL__ || localStorage.getItem('CAMPUSLINK_API_URL') || '';
