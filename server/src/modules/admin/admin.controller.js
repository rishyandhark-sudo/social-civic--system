const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const complaintService = require('../complaints/complaint.service');

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // passwordHash has select: false on the schema, so it must be requested explicitly
  const user = await User.findOne({ email, role: 'admin' }).select('+passwordHash');
  if (!user || !user.passwordHash) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  return res.status(200).json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
}

async function getComplaints(req, res, next) {
  try {
    const { status, category, priority, area, page, limit } = req.query;
    const result = await complaintService.listComplaints({ status, category, priority, area, page, limit });
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function verifyComplaint(req, res, next) {
  try {
    const complaint = await complaintService.transitionStatus({
      complaintId: req.params.id,
      newStatus: 'verified',
      changedBy: req.user.id,
    });
    return res.status(200).json({ message: 'Complaint verified', complaint });
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ message: err.message });
    return next(err);
  }
}

async function rejectComplaint(req, res, next) {
  try {
    const { reason } = req.body;
    const complaint = await complaintService.transitionStatus({
      complaintId: req.params.id,
      newStatus: 'rejected',
      changedBy: req.user.id,
      extra: reason ? { rejectionReason: reason } : {},
    });
    return res.status(200).json({ message: 'Complaint rejected', complaint });
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ message: err.message });
    return next(err);
  }
}

module.exports = { login, getComplaints, verifyComplaint, rejectComplaint };
