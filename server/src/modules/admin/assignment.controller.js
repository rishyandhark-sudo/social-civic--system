const User = require('../../models/User');
const assignmentService = require('../complaints/assignment.service');

async function listWorkers(req, res, next) {
  try {
    const workers = await User.find({ role: 'worker', isActive: true }).select('name email');
    return res.status(200).json({ workers });
  } catch (err) {
    return next(err);
  }
}

async function assignWorker(req, res, next) {
  try {
    const { complaintId, workerId, deadline } = req.body;
    if (!complaintId || !workerId) {
      return res.status(400).json({ message: 'complaintId and workerId are required' });
    }

    const result = await assignmentService.createAssignment({
      complaintId,
      workerId,
      deadline,
      assignedBy: req.user.id,
    });

    return res.status(201).json({ message: 'Worker assigned', ...result });
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ message: err.message });
    return next(err);
  }
}

module.exports = { listWorkers, assignWorker };
