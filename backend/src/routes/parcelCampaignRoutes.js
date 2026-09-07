const express = require('express');
const router = express.Router();
const {
  getParcelCampaigns,
  createParcelCampaign,
  updateParcelCampaign,
  deleteParcelCampaign
} = require('../controllers/parcelCampaignController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getParcelCampaigns)
  .post(protect, createParcelCampaign);

router.route('/:id')
  .put(protect, updateParcelCampaign) 
  .delete(protect, deleteParcelCampaign);

module.exports = router;
