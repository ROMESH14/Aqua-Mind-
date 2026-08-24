const express = require('express');
const equipmentController = require('../controllers/equipmentController');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(auth);
router.get('/', asyncHandler(equipmentController.getAll));
router.post('/', asyncHandler(equipmentController.create));
router.put('/:id', asyncHandler(equipmentController.update));
router.delete('/:id', asyncHandler(equipmentController.remove));

module.exports = router;
