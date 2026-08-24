const express = require('express');
const growthController = require('../controllers/growthController');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(auth);
router.get('/', asyncHandler(growthController.getAll));
router.post('/', asyncHandler(growthController.create));
router.delete('/:id', asyncHandler(growthController.remove));

module.exports = router;
