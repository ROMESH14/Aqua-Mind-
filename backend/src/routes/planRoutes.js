const express = require('express');
const planController = require('../controllers/planController');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(auth);
router.get('/', asyncHandler(planController.getAll));
router.get('/:id', asyncHandler(planController.getOne));
router.post('/', asyncHandler(planController.create));
router.delete('/:id', asyncHandler(planController.remove));

module.exports = router;
