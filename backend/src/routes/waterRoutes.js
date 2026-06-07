const express = require('express');
const waterController = require('../controllers/waterController');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(auth);
router.get('/tanks/:tankId/latest', asyncHandler(waterController.getLatest));
router.get('/tanks/:tankId/history', asyncHandler(waterController.getHistory));
router.post('/tanks/:tankId/readings', asyncHandler(waterController.logReading));

module.exports = router;
