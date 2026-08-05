const express = require('express');
const router = express.Router();
const { requireAuth, authorize } = require('../../middleware/auth.middleware');
const upload = require('../../middleware/upload.middleware');
const {
  submitComplaint,
  getMyComplaints,
  getComplaintById,
  getPublicDashboard,
  getHotspots,
} = require('./complaint.controller');

// Citizens only: submit a new complaint with up to 5 photo/video files
router.post(
  '/',
  requireAuth,
  authorize('citizen'),
  upload.array('media', 5),
  submitComplaint
);

// Citizens only: list their own complaints (used by the tracking dashboard)
router.get('/mine', requireAuth, authorize('citizen'), getMyComplaints);

// Public dashboard — no auth required. Must be registered before /:id,
// otherwise Express would try to match "public"/"hotspots" as an :id.
router.get('/public', getPublicDashboard);
router.get('/hotspots', getHotspots);

// Any authenticated role can fetch one complaint; ownership is checked
// inside the controller for citizens specifically
router.get('/:id', requireAuth, getComplaintById);

module.exports = router;
