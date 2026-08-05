const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['citizen', 'admin', 'worker'],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Citizens authenticate by phone + OTP
    phone: {
      type: String,
      unique: true,
      sparse: true, // allows multiple docs with phone: null (admins/workers)
      trim: true,
    },
    // Admins and workers authenticate by email + password
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      select: false, // never returned by default queries
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
