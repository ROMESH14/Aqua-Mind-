const express = require('express');
const notifyController = require('../controllers/notifyController');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(auth);
router.get('/', asyncHandler(notifyController.list));
router.post('/read', asyncHandler(notifyController.markRead));
router.get('/stream', asyncHandler(notifyController.stream));

module.exports = router;
