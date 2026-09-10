/* ============================================================
   CAMPUSLINK — Global State Store
   Reactive pub/sub state management with localStorage persistence.
   ============================================================ */

const Store = (() => {
  // Default state
  const _defaults = {
    user: null,       // { id, name, email, role, avatar }
    token: null,
    role: 'student',  // current active role view
    sidebarOpen: false,
    theme: 'dark',
  };

  // State container
  let _state = { ..._defaults };

  // Subscriber map: key => Set of callbacks
  const _subs = {};

  // Load persisted state from localStorage
  function _hydrate() {
    try {
      const saved = localStorage.getItem('campuslink_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        _state = { ..._defaults, ...parsed };
      }
    } catch (e) {
      console.warn('[Store] Failed to hydrate state:', e);
    }
  }

  // Persist select keys to localStorage
  function _persist() {
    try {
      const toSave = {
        user: _state.user,
        token: _state.token,
        role: _state.role,
        theme: _state.theme,
      };
      localStorage.setItem('campuslink_state', JSON.stringify(toSave));
    } catch (e) {
      console.warn('[Store] Failed to persist state:', e);
    }
  }

  // Get a value
  function get(key) {
    return key ? _state[key] : { ..._state };
  }

  // Set a value and notify subscribers
  function set(key, value) {
    const prev = _state[key];
    if (prev === value) return;
    _state[key] = value;
    _persist();
    _notify(key, value, prev);
  }

  // Set multiple values at once
  function setMany(obj) {
    const changed = [];
    for (const [key, value] of Object.entries(obj)) {
      const prev = _state[key];
      if (prev !== value) {
        _state[key] = value;
        changed.push({ key, value, prev });
      }
    }
    if (changed.length > 0) {
      _persist();
      changed.forEach(({ key, value, prev }) => _notify(key, value, prev));
    }
  }

  // Subscribe to state changes
  function subscribe(key, callback) {
    if (!_subs[key]) _subs[key] = new Set();
    _subs[key].add(callback);
    // Return unsubscribe function
    return () => _subs[key].delete(callback);
  }

  // Notify subscribers
  function _notify(key, value, prev) {
    if (_subs[key]) {
      _subs[key].forEach(cb => {
        try { cb(value, prev); } catch (e) { console.error('[Store] Subscriber error:', e); }
      });
    }
    // Also notify wildcard listeners
    if (_subs['*']) {
      _subs['*'].forEach(cb => {
        try { cb(key, value, prev); } catch (e) { console.error('[Store] Wildcard subscriber error:', e); }
      });
    }
  }

  // Check if user is authenticated
  function isAuthenticated() {
    return !!_state.token && !!_state.user;
  }

  // Get current role
  function getRole() {
    return _state.role || 'student';
  }

  // Get user initials for avatar
  function getUserInitials() {
    if (!_state.user || !_state.user.name) return '??';
    return _state.user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  // Reset state (logout)
  function reset() {
    _state = { ..._defaults };
    _persist();
    _notify('user', null, null);
    _notify('token', null, null);
  }

  // Initialize
  _hydrate();

  return { get, set, setMany, subscribe, isAuthenticated, getRole, getUserInitials, reset };
})();
