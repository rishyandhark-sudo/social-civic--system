const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const assignmentService = require('../complaints/assignment.service');

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ email, role: 'worker' }).select('+passwordHash');
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

async function getMyTasks(req, res, next) {
  try {
    const tasks = await assignmentService.getTasksForWorker(req.user.id);
    return res.status(200).json({ tasks });
  } catch (err) {
    return next(err);
  }
}

async function getTask(req, res, next) {
  try {
    const task = await assignmentService.getTaskById(req.params.id, req.user.id);
    return res.status(200).json({ task });
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ message: err.message });
    return next(err);
  }
}

async function startTask(req, res, next) {
  try {
    const result = await assignmentService.startTask({
      assignmentId: req.params.id,
      workerId: req.user.id,
    });
    return res.status(200).json({ message: 'Task started', ...result });
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ message: err.message });
    return next(err);
  }
}

async function resolveTask(req, res, next) {
  try {
    const { notes } = req.body;
    const proofUrls = (req.files || []).map((file) => `/uploads/${file.filename}`);

    if (proofUrls.length === 0) {
      return res.status(400).json({ message: 'At least one proof photo is required' });
    }

    const result = await assignmentService.resolveTask({
      assignmentId: req.params.id,
      workerId: req.user.id,
      proofUrls,
      notes,
    });
    return res.status(200).json({ message: 'Task marked resolved', ...result });
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ message: err.message });
    return next(err);
  }
}

module.exports = { login, getMyTasks, getTask, startTask, resolveTask };
