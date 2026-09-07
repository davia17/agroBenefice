const express = require('express');
const router = express.Router();
const {
  getCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign
} = require('../controllers/campaignController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getCampaigns)
  .post(protect, createCampaign);

router.route('/:id')
  .put(protect, updateCampaign)
  .delete(protect, deleteCampaign);

module.exports = router;