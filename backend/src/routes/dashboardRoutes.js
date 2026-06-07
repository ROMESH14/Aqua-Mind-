const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(auth);
router.get('/', asyncHandler(dashboardController.getDashboard));

module.exports = router;
