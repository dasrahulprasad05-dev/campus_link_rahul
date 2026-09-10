/* ============================================================
   CAMPUSLINK — SPA Router
   Hash-based routing with route guards, role checks,
   and animated page transitions.
   ============================================================ */

const Router = (() => {
  const _routes = {};
  let _current = null;
  let _notFoundHandler = null;

  // Register a route
  function register(path, handler, options = {}) {
    _routes[path] = { handler, ...options };
  }

  // Navigate to a route
  function navigate(path, force = false) {
    const cleanPath = (path || '').replace(/^#?\/?/, '').replace(/\/+$/, '');
    const targetHash = cleanPath ? '#/' + cleanPath : '#/landing';
    if (window.location.hash === targetHash || force) {
      _resolve(true);
    } else {
      window.location.hash = targetHash;
    }
  }

  // Get current route path
  function current() {
    return _current;
  }

  // Set 404 handler
  function onNotFound(handler) {
    _notFoundHandler = handler;
  }

  // Resolve the current hash
  async function _resolve(force = false) {
    const raw = (window.location.hash || '').replace(/^#\/?/, '').split('?')[0].replace(/\/+$/, '');
    const path = raw || 'landing';

    // Find matching route
    const route = _routes[path];

    if (!route) {
      if (_notFoundHandler) _notFoundHandler(path);
      else navigate('landing');
      return;
    }

    // Auth guard
    if (route.auth && !Store.isAuthenticated()) {
      navigate('login');
      return;
    }

    // Role guard
    if (route.roles && route.roles.length > 0) {
      const role = Store.getRole();
      if (!route.roles.includes(role)) {
        if (typeof Toast !== 'undefined' && Toast.show) {
          Toast.show(`Access restricted: requires ${route.roles.join(' or ')} role`, 'warning');
        }
        navigate(role + '/dashboard');
        return;
      }
    }

    // If already on same route and not forced, check if content is rendered
    if (_current === path && !force) {
      const main = document.getElementById('main');
      if (!main || !main.querySelector('.empty-state')) {
        return;
      }
    }
    _current = path;

    // Execute route handler
    try {
      await route.handler();
    } catch (err) {
      console.error(`[Router] Error rendering route "${path}":`, err);
      const main = document.querySelector('#main') || document.getElementById('app');
      if (main) {
        main.innerHTML = `
          <div class="empty-state" style="padding:40px;text-align:center">
            <div class="empty-state-icon" style="font-size:48px;margin-bottom:16px">⚠️</div>
            <div class="empty-state-title" style="font-size:20px;font-weight:700;margin-bottom:8px">Something went wrong</div>
            <p class="empty-state-text" style="color:var(--text-secondary);margin-bottom:20px">We couldn't load this section (${err.message || 'Error'}).</p>
            <button class="btn btn-primary" onclick="Router.navigate('${Store.isAuthenticated() ? Store.getRole() + '/dashboard' : 'landing'}', true)">Return to Dashboard</button>
          </div>
        `;
      }
    }
  }

  function getParams() {
    const hash = window.location.hash || '';
    const qIndex = hash.indexOf('?');
    if (qIndex === -1) return {};
    const queryString = hash.substring(qIndex + 1);
    return Object.fromEntries(new URLSearchParams(queryString));
  }

  return { register, navigate, current, onNotFound, init, resolve: _resolve, getParams };
})();
