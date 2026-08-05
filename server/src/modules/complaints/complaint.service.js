const mongoose = require('mongoose');
const Complaint = require('../../models/Complaint');
const Category = require('../../models/Category');
const StatusHistory = require('../../models/StatusHistory');
const { geocodeAddress } = require('../../utils/geocode');
const eventBus = require('../../utils/eventBus');

const VALID_PRIORITIES = ['low', 'medium', 'high', 'critical'];

/**
 * Creates a complaint and its initial status history entry as one
 * logical unit. Uses a transaction where available (replica-set Mongo);
 * falls back gracefully if the deployment doesn't support them (e.g. a
 * bare standalone Mongo instance in local dev).
 */
async function createComplaint({ citizenId, categoryId, description, address, priority, mediaUrls }) {
  const category = await Category.findById(categoryId);
  if (!category) {
    const err = new Error('Selected category does not exist');
    err.statusCode = 400;
    throw err;
  }

  const resolvedPriority = VALID_PRIORITIES.includes(priority) ? priority : 'medium';
  const coordinates = await geocodeAddress(address);

  const session = await mongoose.startSession();
  let complaint;

  try {
    await session.withTransaction(async () => {
      const [created] = await Complaint.create(
        [
          {
            citizen: citizenId,
            category: categoryId,
            description,
            address,
            priority: resolvedPriority,
            mediaUrls: mediaUrls || [],
            ...(coordinates && { location: { type: 'Point', coordinates } }),
          },
        ],
        { session }
      );

      await StatusHistory.create(
        [
          {
            complaint: created._id,
            status: 'pending',
            changedBy: citizenId,
          },
        ],
        { session }
      );

      complaint = created;
    });
  } catch (err) {
    // Standalone MongoDB (no replica set) doesn't support transactions —
    // fall back to sequential writes so local dev still works.
    if (err.message && err.message.includes('Transaction numbers')) {
      complaint = await Complaint.create({
        citizen: citizenId,
        category: categoryId,
        description,
        address,
        priority: resolvedPriority,
        mediaUrls: mediaUrls || [],
        ...(coordinates && { location: { type: 'Point', coordinates } }),
      });
      await StatusHistory.create({
        complaint: complaint._id,
        status: 'pending',
        changedBy: citizenId,
      });
    } else {
      throw err;
    }
  } finally {
    session.endSession();
  }

  return complaint;
}

// The single source of truth for which status can move to which.
// Both the admin and worker modules call transitionStatus() below rather
// than writing to complaint.status directly, so this map is the only
// place the workflow rules live.
const ALLOWED_TRANSITIONS = {
  pending: ['verified', 'rejected'],
  verified: ['assigned'],
  assigned: ['in_progress'],
  in_progress: ['resolved'],
  rejected: [], // terminal
  resolved: [], // terminal
};

/**
 * Moves a complaint from its current status to newStatus, if that
 * transition is legal, and records the change in StatusHistory.
 * extra can carry status-specific fields (e.g. rejectionReason).
 */
async function transitionStatus({ complaintId, newStatus, changedBy, extra = {} }) {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    const err = new Error('Complaint not found');
    err.statusCode = 404;
    throw err;
  }

  const allowedNext = ALLOWED_TRANSITIONS[complaint.status] || [];
  if (!allowedNext.includes(newStatus)) {
    const err = new Error(
      `Cannot move complaint from "${complaint.status}" to "${newStatus}"`
    );
    err.statusCode = 400;
    throw err;
  }

  Object.assign(complaint, extra, { status: newStatus });
  await complaint.save();

  await StatusHistory.create({
    complaint: complaint._id,
    status: newStatus,
    changedBy,
  });

  eventBus.emit('complaint:statusChanged', {
    complaintId: complaint._id.toString(),
    citizenId: complaint.citizen.toString(),
    status: newStatus,
  });

  return complaint;
}

async function getComplaintsByCitizen(citizenId) {
  return Complaint.find({ citizen: citizenId })
    .populate('category', 'name')
    .sort({ createdAt: -1 });
}

async function getComplaintById(complaintId) {
  const complaint = await Complaint.findById(complaintId).populate('category', 'name');
  if (!complaint) return null;
  const statusHistory = await StatusHistory.find({ complaint: complaintId }).sort({ changedAt: 1 });
  return { complaint, statusHistory };
}

/**
 * Filterable, paginated listing for the admin dashboard.
 * filters: { status, category, priority, area }
 * pagination: { page, limit }
 */
async function listComplaints({ status, category, priority, area, page = 1, limit = 20 }) {
  const query = {};
  if (status) query.status = status;
  if (category) query.category = category;
  if (priority) query.priority = priority;
  if (area) query.address = { $regex: area, $options: 'i' };

  const skip = (Number(page) - 1) * Number(limit);

  const [complaints, total] = await Promise.all([
    Complaint.find(query)
      .populate('category', 'name')
      .populate('citizen', 'name phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Complaint.countDocuments(query),
  ]);

  return {
    complaints,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
  };
}

/**
 * Public dashboard feed — deliberately excludes citizen contact info and
 * excludes "pending"/"rejected" so unverified reports don't show publicly.
 */
async function getPublicComplaints({ category, page = 1, limit = 20 }) {
  const query = { status: { $in: ['verified', 'assigned', 'in_progress', 'resolved'] } };
  if (category) query.category = category;

  const skip = (Number(page) - 1) * Number(limit);

  const [complaints, total] = await Promise.all([
    Complaint.find(query)
      .select('category status priority address location mediaUrls createdAt')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Complaint.countDocuments(query),
  ]);

  return {
    complaints,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
  };
}

/**
 * Aggregated counts for the map/hotspots view. Groups by category and by
 * status. Geo-clustering (grouping nearby coordinates) can be added once
 * geocodeAddress() is wired to a real provider and complaints reliably have
 * coordinates — for now this gives category/status hotspots, which is
 * useful on its own for "what kind of issue is most reported" views.
 */
async function getHotspots() {
  const byCategory = await Complaint.aggregate([
    { $match: { status: { $ne: 'rejected' } } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
    { $unwind: '$category' },
    { $project: { _id: 0, category: '$category.name', count: 1 } },
    { $sort: { count: -1 } },
  ]);

  const byArea = await Complaint.aggregate([
    { $match: { status: { $ne: 'rejected' } } },
    { $group: { _id: '$address', count: { $sum: 1 } } },
    { $project: { _id: 0, address: '$_id', count: 1 } },
    { $sort: { count: -1 } },
    { $limit: 20 },
  ]);

  return { byCategory, byArea };
}

async function getCitizenAnalytics(citizenId) {
  const counts = await Complaint.aggregate([
    { $match: { citizen: new mongoose.Types.ObjectId(citizenId) } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const total = counts.reduce((sum, c) => sum + c.count, 0);
  const byStatus = counts.reduce((acc, c) => ({ ...acc, [c._id]: c.count }), {});

  return { total, byStatus };
}

async function getAdminAnalyticsSummary() {
  const byStatus = await Complaint.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const byPriority = await Complaint.aggregate([
    { $group: { _id: '$priority', count: { $sum: 1 } } },
  ]);
  const total = await Complaint.countDocuments();

  // Average time from creation to resolution, in hours — a basic SLA metric
  const avgResolutionHours = await Complaint.aggregate([
    { $match: { status: 'resolved' } },
    {
      $project: {
        resolutionMs: { $subtract: ['$updatedAt', '$createdAt'] },
      },
    },
    { $group: { _id: null, avgMs: { $avg: '$resolutionMs' } } },
  ]);

  return {
    total,
    byStatus: byStatus.reduce((acc, c) => ({ ...acc, [c._id]: c.count }), {}),
    byPriority: byPriority.reduce((acc, c) => ({ ...acc, [c._id]: c.count }), {}),
    avgResolutionHours: avgResolutionHours[0] ? avgResolutionHours[0].avgMs / (1000 * 60 * 60) : null,
  };
}

module.exports = {
  createComplaint,
  getComplaintsByCitizen,
  getComplaintById,
  listComplaints,
  transitionStatus,
  getPublicComplaints,
  getHotspots,
  getCitizenAnalytics,
  getAdminAnalyticsSummary,
};
