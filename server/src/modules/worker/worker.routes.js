const express = require('express');
const router = express.Router();
const { requireAuth, authorize } = require('../../middleware/auth.middleware');
const upload = require('../../middleware/upload.middleware');
const { login, getMyTasks, getTask, startTask, resolveTask } = require('./worker.controller');

router.post('/auth/login', login);

router.get('/tasks', requireAuth, authorize('worker'), getMyTasks);
router.get('/tasks/:id', requireAuth, authorize('worker'), getTask);
router.patch('/tasks/:id/start', requireAuth, authorize('worker'), startTask);
router.post(
  '/tasks/:id/resolve',
  requireAuth,
  authorize('worker'),
  upload.array('proof', 5),
  resolveTask
);

module.exports = router;
