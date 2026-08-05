const express = require('express');
const router = express.Router();
const { requestOtp, verifyOtp } = require('./citizen.controller');
const { getMyAnalytics } = require('./citizen.analytics.controller');
const { requireAuth, authorize } = require('../../middleware/auth.middleware');

router.post('/auth/otp/request', requestOtp);
router.post('/auth/otp/verify', verifyOtp);
router.get('/analytics', requireAuth, authorize('citizen'), getMyAnalytics);

module.exports = router;
