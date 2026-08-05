/**
 * Run once against a fresh database: node scripts/seedCategories.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../src/models/Category');

const CATEGORIES = [
  { name: 'Water stagnation', description: 'Standing water, drainage blockages, flooding' },
  { name: 'Road damage', description: 'Potholes, broken pavement, damaged sidewalks' },
  { name: 'Electrical hazard', description: 'Exposed wires, broken streetlights, transformer issues' },
  { name: 'Sanitation', description: 'Garbage collection, overflowing bins, illegal dumping' },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  for (const cat of CATEGORIES) {
    await Category.updateOne({ name: cat.name }, { $set: cat }, { upsert: true });
  }

  console.log(`Seeded ${CATEGORIES.length} categories`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
