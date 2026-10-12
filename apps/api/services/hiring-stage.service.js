/* ============================================================
   CAMPUSGRID — Multi-Round Company Hiring Pipeline Service
   Tracks candidate progress through company-specific hiring rounds:
   Aptitude Test → Tech Round 1 → Tech Round 2 → HR Round → Offer.
   ============================================================ */

const { v4: uuidv4 } = require('uuid');
const { query } = require('../db/pool');
const notifService = require('./notification.service');

// Default standard hiring stages template
const DEFAULT_STAGES = [
  { stage_order: 1, stage_name: 'Online Aptitude & Coding Test', stage_type: 'test', is_eliminatory: true },
  { stage_order: 2, stage_name: 'Technical Round 1 (DSA & Core CS)', stage_type: 'interview', is_eliminatory: true },
  { stage_order: 3, stage_name: 'Technical Round 2 (System Design & Projects)', stage_type: 'interview', is_eliminatory: true },
  { stage_order: 4, stage_name: 'HR & Culture Fit Round', stage_type: 'hr', is_eliminatory: true },
  { stage_order: 5, stage_name: 'Final Selection & Offer Discussion', stage_type: 'offer', is_eliminatory: false },
];

// In-memory store for stages and candidate progress
const _stagesByJob = new Map();
const _progressByApp = new Map();

/**
 * Get or initialize stages for a given job
 */
async function getStagesForJob(jobId, companyId) {
  if (_stagesByJob.has(jobId)) {
    return _stagesByJob.get(jobId);
  }

  // Check DB
  try {
    const res = await query(
      'SELECT * FROM hiring_stages WHERE job_id = $1 ORDER BY stage_order ASC',
      [jobId]
    );
    if (res && res.rows && res.rows.length > 0) {
      _stagesByJob.set(jobId, res.rows);
      return res.rows;
    }
  } catch {}

  // Generate default stages
  const stages = DEFAULT_STAGES.map(s => ({
    id: `stage-${jobId.slice(0, 8)}-${s.stage_order}`,
    company_id: companyId,
    job_id: jobId,
    ...s,
    created_at: new Date().toISOString(),
  }));

  _stagesByJob.set(jobId, stages);
  return stages;
}

/**
 * Get candidate's progress across all stages for an application
 */
async function getApplicationStageProgress(applicationId, jobId, companyId, studentUserId) {
  const stages = await getStagesForJob(jobId, companyId);
  
  let progressList = _progressByApp.get(applicationId);
  if (!progressList) {
    // Check DB
    try {
      const res = await query(
        'SELECT * FROM candidate_stage_progress WHERE application_id = $1',
        [applicationId]
      );
      if (res && res.rows && res.rows.length > 0) {
        progressList = res.rows;
        _progressByApp.set(applicationId, progressList);
      }
    } catch {}
  }

  if (!progressList) {
    // Initialize default progress: first stage scheduled/in-progress, rest pending
    progressList = stages.map((stage, idx) => ({
      id: `prog-${applicationId.slice(0, 8)}-${idx + 1}`,
      application_id: applicationId,
      stage_id: stage.id,
      stage_name: stage.stage_name,
      stage_order: stage.stage_order,
      stage_type: stage.stage_type,
      status: idx === 0 ? 'in-progress' : 'pending',
      scheduled_at: idx === 0 ? new Date(Date.now() + 86400000 * 2).toISOString() : null,
      completed_at: null,
      feedback: idx === 0 ? 'Aptitude link sent to registered email' : null,
      score: null,
      interviewer_name: idx === 0 ? 'Automated Assessment' : 'Technical Panel',
      updated_at: new Date().toISOString(),
    }));
    _progressByApp.set(applicationId, progressList);
  }

  // Merge stage metadata with progress records
  return stages.map(stage => {
    const prog = progressList.find(p => p.stage_id === stage.id || p.stage_order === stage.stage_order);
    return {
      stage_id: stage.id,
      stage_name: stage.stage_name,
      stage_order: stage.stage_order,
      stage_type: stage.stage_type,
      is_eliminatory: stage.is_eliminatory,
      status: prog ? prog.status : 'pending',
      scheduled_at: prog ? prog.scheduled_at : null,
      completed_at: prog ? prog.completed_at : null,
      feedback: prog ? prog.feedback : null,
      score: prog ? prog.score : null,
      interviewer_name: prog ? prog.interviewer_name : null,
    };
  });
}

/**
 * Update candidate progress for a specific stage
 */
async function updateStageProgress(applicationId, stageOrderOrId, updateData, studentUserId, companyName) {
  let progressList = _progressByApp.get(applicationId) || [];
  
  let target = progressList.find(p => p.stage_id === stageOrderOrId || p.stage_order === parseInt(stageOrderOrId, 10));
  if (!target) {
    target = {
      id: `prog-${uuidv4()}`,
      application_id: applicationId,
      stage_id: String(stageOrderOrId),
      stage_order: parseInt(stageOrderOrId, 10) || 1,
      status: 'pending',
    };
    progressList.push(target);
    _progressByApp.set(applicationId, progressList);
  }

  // Apply updates
  if (updateData.status) target.status = updateData.status;
  if (updateData.scheduled_at) target.scheduled_at = updateData.scheduled_at;
  if (updateData.feedback) target.feedback = updateData.feedback;
  if (updateData.score !== undefined) target.score = updateData.score;
  if (updateData.interviewer_name) target.interviewer_name = updateData.interviewer_name;
  if (updateData.status === 'passed' || updateData.status === 'completed') {
    target.completed_at = new Date().toISOString();
  }
  target.updated_at = new Date().toISOString();

  // Try DB update
  try {
    await query(
      `INSERT INTO candidate_stage_progress (application_id, stage_id, status, scheduled_at, feedback, score, interviewer_name, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (application_id, stage_id)
       DO UPDATE SET status = EXCLUDED.status, scheduled_at = EXCLUDED.scheduled_at, feedback = EXCLUDED.feedback, score = EXCLUDED.score, interviewer_name = EXCLUDED.interviewer_name, completed_at = EXCLUDED.completed_at`,
      [applicationId, target.stage_id, target.status, target.scheduled_at, target.feedback, target.score, target.interviewer_name, target.completed_at]
    );
  } catch {}

  // Dispatch real-time notification to the student
  if (studentUserId) {
    const statusText = target.status === 'passed' ? '🎉 Passed' : target.status === 'scheduled' ? '📅 Scheduled' : `Updated (${target.status})`;
    notifService.createNotification({
      userId: studentUserId,
      type: 'stage_updated',
      title: `${statusText}: Round ${target.stage_order} at ${companyName || 'Recruiter'}`,
      message: `${target.stage_name || `Round ${target.stage_order}`}: Status is now "${target.status}". ${target.feedback ? `Feedback: "${target.feedback}"` : ''} ${target.scheduled_at ? `Date: ${new Date(target.scheduled_at).toLocaleDateString()}` : ''}`,
      metadata: { applicationId, stageOrder: target.stage_order, status: target.status },
    }).catch(err => console.warn('[Notif] Stage notice error:', err.message));
  }

  return target;
}

module.exports = {
  getStagesForJob,
  getApplicationStageProgress,
  updateStageProgress,
};
