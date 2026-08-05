const complaintService = require('../complaints/complaint.service');

async function getMyAnalytics(req, res, next) {
  try {
    const analytics = await complaintService.getCitizenAnalytics(req.user.id);
    return res.status(200).json({ analytics });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getMyAnalytics };
