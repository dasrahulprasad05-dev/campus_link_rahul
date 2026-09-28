/* ============================================================
   CAMPUSLINK — Audit Log Middleware
   Records critical actions to the audit_log table.
   ============================================================ */

const { query, memoryDb } = require('../db/pool');

/**
 * Record an action in the audit log.
 * @param {Object} params
 * @param {string} params.userId - ID of the user performing the action
 * @param {string} params.userRole - Role of the user
 * @param {string} params.action - Action name (e.g., 'application.create', 'offer.accept')
 * @param {string} [params.entityType] - Type of entity affected (e.g., 'application', 'offer')
 * @param {string} [params.entityId] - ID of the entity affected
 * @param {*} [params.oldValue] - Previous value (for updates)
 * @param {*} [params.newValue] - New value (for updates)
 */
async function logAudit({ userId, userRole, action, entityType, entityId, oldValue, newValue }) {
  try {
    const id = `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    await query(
      `INSERT INTO audit_log (id, user_id, user_role, action, entity_type, entity_id, old_value, new_value)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        id,
        userId,
        userRole,
        action,
        entityType || null,
        entityId || null,
        oldValue ? JSON.stringify(oldValue) : null,
        newValue ? JSON.stringify(newValue) : null,
      ]
    );
  } catch (err) {
    // Non-critical: don't let audit failures break the main flow
    console.warn('[AuditLog] Failed to write audit entry:', err.message);
  }
}

/**
 * Get recent audit log entries (for admin view).
 * @param {number} limit
 * @returns {Promise<Array>}
 */
async function getRecentLogs(limit = 50) {
  try {
    const result = await query(
      `SELECT * FROM audit_log ORDER BY timestamp DESC LIMIT $1`,
      [limit]
    );
    return result.rows || [];
  } catch (err) {
    console.warn('[AuditLog] Failed to read audit logs:', err.message);
    return [];
  }
}

module.exports = { logAudit, getRecentLogs };
