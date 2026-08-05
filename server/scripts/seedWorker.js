/**
 * Creates (or updates the password of) a worker user.
 * Run: node scripts/seedWorker.js <email> <password> "<Full Name>"
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

async function seed() {
  const [, , email, password, name] = process.argv;

  if (!email || !password) {
    console.error('Usage: node scripts/seedWorker.js <email> <password> "<Full Name>"');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  const passwordHash = await bcrypt.hash(password, 10);

  await User.findOneAndUpdate(
    { email, role: 'worker' },
    { email, role: 'worker', passwordHash, name: name || 'Worker' },
    { upsert: true, new: true }
  );

  console.log(`Worker user ready: ${email}`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seeding worker failed:', err);
  process.exit(1);
});
