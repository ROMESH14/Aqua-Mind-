const express = require('express');
const tankController = require('../controllers/tankController');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(auth);
router.get('/', asyncHandler(tankController.getAll));
router.get('/:id', asyncHandler(tankController.getOne));
router.post('/', asyncHandler(tankController.create));
router.put('/:id', asyncHandler(tankController.update));
router.delete('/:id', asyncHandler(tankController.remove));

module.exports = router;
