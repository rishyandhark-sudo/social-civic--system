const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'assigned', 'in_progress', 'resolved'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    // Manual location entry per spec, plus optional coordinates for map/hotspot features
    address: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: undefined,
      },
    },
    mediaUrls: {
      type: [String],
      default: [],
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Enables geo queries: nearby complaints, map bounding boxes, hotspot aggregation
complaintSchema.index({ location: '2dsphere' });
complaintSchema.index({ status: 1, category: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
