const express = require('express');
const aiController = require('../controllers/aiController');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(auth);
router.get('/tanks/:tankId/species', asyncHandler(aiController.getSpeciesAdvice));
router.get('/tanks/:tankId/predictions', asyncHandler(aiController.getPredictions));
router.get('/tanks/:tankId/plants', asyncHandler(aiController.getPlantAdvice));
router.post('/analyze/fish', asyncHandler(aiController.analyzeFish));
router.post('/analyze/water', asyncHandler(aiController.analyzeWater));
router.post('/analyze/plants', asyncHandler(aiController.analyzePlants));

module.exports = router;
