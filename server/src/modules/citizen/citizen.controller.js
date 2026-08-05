const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const otpService = require('./otp.service');

// Basic E.164-ish check — tighten this to your target country format later
const PHONE_REGEX = /^\+?[1-9]\d{7,14}$/;

async function requestOtp(req, res) {
  const { phone } = req.body;

  if (!phone || !PHONE_REGEX.test(phone)) {
    return res.status(400).json({ message: 'A valid phone number is required' });
  }

  otpService.sendOtp(phone);
  return res.status(200).json({ message: 'OTP sent successfully' });
}

async function verifyOtp(req, res) {
  const { phone, otp, name } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ message: 'Phone and OTP are required' });
  }

  const result = otpService.verifyOtp(phone, otp);
  if (!result.valid) {
    return res.status(400).json({ message: result.reason });
  }

  // Find or create the citizen user — first-time verification doubles as signup
  let user = await User.findOne({ phone, role: 'citizen' });
  if (!user) {
    user = await User.create({
      phone,
      role: 'citizen',
      name: name || 'Citizen',
    });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  return res.status(200).json({
    token,
    user: { id: user._id, name: user.name, phone: user.phone, role: user.role },
  });
}

module.exports = { requestOtp, verifyOtp };
