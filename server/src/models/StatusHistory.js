const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
  complaint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'assigned', 'in_progress', 'resolved'],
    required: true,
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // null for system-triggered changes
  },
  changedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('StatusHistory', statusHistorySchema);
