/* CAMPUSLINK — Scheduler Service */

function checkConflicts(events = []) {
  const conflicts = [];

  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      const a = events[i];
      const b = events[j];

      // Check venue and time overlap
      if (a.venue && b.venue && a.venue === b.venue) {
        if (a.start < b.end && b.start < a.end) {
          conflicts.push({
            event1: a,
            event2: b,
            reason: `Venue "${a.venue}" has overlapping time slots`,
            type: 'venue_time',
          });
        }
      }
    }
  }

  return {
    valid: conflicts.length === 0,
    conflicts,
    checkedAt: new Date().toISOString(),
    eventsChecked: events.length,
  };
}

module.exports = { checkConflicts };
