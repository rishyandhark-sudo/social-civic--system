const complaintService = require('./complaint.service');

async function submitComplaint(req, res, next) {
  try {
    const { categoryId, description, address, priority } = req.body;

    if (!categoryId || !description || !address) {
      return res.status(400).json({ message: 'categoryId, description, and address are required' });
    }

    // Files arrive via multer (upload.middleware.js). In local dev these are
    // saved to disk and exposed at /uploads/<filename> — see app.js static
    // serving. Swap this mapping for Cloudinary/S3 URLs when you wire that in.
    const mediaUrls = (req.files || []).map((file) => `/uploads/${file.filename}`);

    const complaint = await complaintService.createComplaint({
      citizenId: req.user.id,
      categoryId,
      description,
      address,
      priority,
      mediaUrls,
    });

    return res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint,
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    return next(err);
  }
}

async function getMyComplaints(req, res, next) {
  try {
    const complaints = await complaintService.getComplaintsByCitizen(req.user.id);
    return res.status(200).json({ complaints });
  } catch (err) {
    return next(err);
  }
}

async function getComplaintById(req, res, next) {
  try {
    const result = await complaintService.getComplaintById(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    const { complaint, statusHistory } = result;
    // Citizens may only view their own complaint detail
    if (req.user.role === 'citizen' && complaint.citizen.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You do not have access to this complaint' });
    }
    return res.status(200).json({ complaint, statusHistory });
  } catch (err) {
    return next(err);
  }
}

async function getPublicDashboard(req, res, next) {
  try {
    const { category, page, limit } = req.query;
    const result = await complaintService.getPublicComplaints({ category, page, limit });
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function getHotspots(req, res, next) {
  try {
    const result = await complaintService.getHotspots();
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

module.exports = { submitComplaint, getMyComplaints, getComplaintById, getPublicDashboard, getHotspots };
