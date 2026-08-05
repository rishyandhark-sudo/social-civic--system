/**
 * Creates (or updates the password of) an admin user.
 * Run: node scripts/seedAdmin.js <email> <password> "<Full Name>"
 * Example: node scripts/seedAdmin.js admin@city.gov Str0ngPass! "Priya Admin"
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

async function seed() {
  const [, , email, password, name] = process.argv;

  if (!email || !password) {
    console.error('Usage: node scripts/seedAdmin.js <email> <password> "<Full Name>"');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  const passwordHash = await bcrypt.hash(password, 10);

  await User.findOneAndUpdate(
    { email, role: 'admin' },
    { email, role: 'admin', passwordHash, name: name || 'Admin' },
    { upsert: true, new: true }
  );

  console.log(`Admin user ready: ${email}`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seeding admin failed:', err);
  process.exit(1);
});
