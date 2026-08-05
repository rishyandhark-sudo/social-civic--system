/**
 * Simulated OTP service.
 *
 * Stores OTPs in memory keyed by phone number. This is fine for local dev
 * and demos but does NOT survive a server restart and won't work across
 * multiple server instances — swap the Map for Redis before deploying,
 * and swap the console.log in sendOtp() for a real SMS provider
 * (Twilio, MSG91, Firebase Auth) at the same time.
 */

const otpStore = new Map(); // phone -> { otp, expiresAt }

const OTP_EXPIRY_MS = (Number(process.env.OTP_EXPIRY_MINUTES) || 5) * 60 * 1000;

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
}

function sendOtp(phone) {
  const otp = generateOtp();
  const expiresAt = Date.now() + OTP_EXPIRY_MS;
  otpStore.set(phone, { otp, expiresAt });

  // --- SIMULATION: replace this block with a real SMS provider call ---
  console.log(`[OTP SIMULATION] Sending OTP ${otp} to ${phone}`);
  // ---------------------------------------------------------------------

  return { success: true };
}

function verifyOtp(phone, submittedOtp) {
  const record = otpStore.get(phone);

  if (!record) {
    return { valid: false, reason: 'No OTP was requested for this number' };
  }
  if (Date.now() > record.expiresAt) {
    otpStore.delete(phone);
    return { valid: false, reason: 'OTP has expired' };
  }
  if (record.otp !== submittedOtp) {
    return { valid: false, reason: 'Incorrect OTP' };
  }

  otpStore.delete(phone); // one-time use
  return { valid: true };
}

module.exports = { sendOtp, verifyOtp };
