const express = require('express');
const router = express.Router();
const { getFinancialSummary } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/summary', protect, getFinancialSummary);

module.exports = router;