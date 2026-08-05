const Assignment = require('../../models/Assignment');
const User = require('../../models/User');
const complaintService = require('../complaints/complaint.service');

/**
 * Admin action: assigns a verified complaint to a worker.
 * Creates the Assignment record, then moves the complaint verified -> assigned
 * through the shared state machine (so the transition rules stay in one place).
 */
async function createAssignment({ complaintId, workerId, deadline, assignedBy }) {
  const worker = await User.findOne({ _id: workerId, role: 'worker' });
  if (!worker) {
    const err = new Error('Selected worker does not exist');
    err.statusCode = 400;
    throw err;
  }

  const existing = await Assignment.findOne({ complaint: complaintId });
  if (existing) {
    const err = new Error('This complaint is already assigned');
    err.statusCode = 400;
    throw err;
  }

  // transitionStatus throws if the complaint isn't currently "verified",
  // so an assignment can never be created against the wrong state
  const complaint = await complaintService.transitionStatus({
    complaintId,
    newStatus: 'assigned',
    changedBy: assignedBy,
  });

  const assignment = await Assignment.create({
    complaint: complaintId,
    worker: workerId,
    deadline,
  });

  return { assignment, complaint };
}

async function getTasksForWorker(workerId) {
  return Assignment.find({ worker: workerId })
    .populate({
      path: 'complaint',
      populate: { path: 'category', select: 'name' },
    })
    .sort({ createdAt: -1 });
}

async function getAssignmentForWorker(assignmentId, workerId) {
  const assignment = await Assignment.findById(assignmentId).populate({
    path: 'complaint',
    populate: { path: 'category', select: 'name' },
  });
  if (!assignment) {
    const err = new Error('Assignment not found');
    err.statusCode = 404;
    throw err;
  }
  if (assignment.worker.toString() !== workerId) {
    const err = new Error('This task is not assigned to you');
    err.statusCode = 403;
    throw err;
  }
  return assignment;
}

async function getTaskById(assignmentId, workerId) {
  return getAssignmentForWorker(assignmentId, workerId);
}

async function startTask({ assignmentId, workerId }) {
  const assignment = await getAssignmentForWorker(assignmentId, workerId);
  const complaint = await complaintService.transitionStatus({
    complaintId: assignment.complaint._id,
    newStatus: 'in_progress',
    changedBy: workerId,
  });
  return { assignment, complaint };
}

async function resolveTask({ assignmentId, workerId, proofUrls, notes }) {
  const assignment = await getAssignmentForWorker(assignmentId, workerId);

  assignment.proofUrls = proofUrls || [];
  assignment.notes = notes;
  assignment.resolvedAt = new Date();
  await assignment.save();

  const complaint = await complaintService.transitionStatus({
    complaintId: assignment.complaint._id,
    newStatus: 'resolved',
    changedBy: workerId,
  });

  return { assignment, complaint };
}

module.exports = {
  createAssignment,
  getTasksForWorker,
  getAssignmentForWorker,
  getTaskById,
  startTask,
  resolveTask,
};
