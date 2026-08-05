const express = require('express');
const router = express.Router();
const Category = require('../../models/Category');

// Public-ish read — any logged-in role can fetch the category list for a dropdown
router.get('/', async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json({ categories });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
