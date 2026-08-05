const complaintService = require('../complaints/complaint.service');

async function getSummary(req, res, next) {
  try {
    const summary = await complaintService.getAdminAnalyticsSummary();
    return res.status(200).json({ summary });
  } catch (err) {
    return next(err);
  }
}

async function getHotspots(req, res, next) {
  try {
    const hotspots = await complaintService.getHotspots();
    return res.status(200).json({ hotspots });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getSummary, getHotspots };
