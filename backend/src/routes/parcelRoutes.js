const express = require('express');
const router = express.Router();
const { getParcels, createParcel, deleteParcel, updateParcel } = require('../controllers/parcelController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getParcels)
  .post(protect, createParcel);

router.route('/:id')
  .put(protect, updateParcel)
  .delete(protect, deleteParcel);

module.exports = router;