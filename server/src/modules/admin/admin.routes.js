const express = require('express');
const router = express.Router();
const { requireAuth, authorize } = require('../../middleware/auth.middleware');
const { login, getComplaints, verifyComplaint, rejectComplaint } = require('./admin.controller');
const { listWorkers, assignWorker } = require('./assignment.controller');
const { getSummary, getHotspots } = require('./admin.analytics.controller');

router.post('/auth/login', login);

router.get('/complaints', requireAuth, authorize('admin'), getComplaints);
router.patch('/complaints/:id/verify', requireAuth, authorize('admin'), verifyComplaint);
router.patch('/complaints/:id/reject', requireAuth, authorize('admin'), rejectComplaint);

router.get('/workers', requireAuth, authorize('admin'), listWorkers);
router.post('/assignments', requireAuth, authorize('admin'), assignWorker);

router.get('/analytics/summary', requireAuth, authorize('admin'), getSummary);
router.get('/analytics/hotspots', requireAuth, authorize('admin'), getHotspots);

module.exports = router;
