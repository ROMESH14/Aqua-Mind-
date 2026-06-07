const express = require('express');
const maintenanceController = require('../controllers/maintenanceController');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(auth);
router.get('/tasks', asyncHandler(maintenanceController.getTasks));
router.post('/tasks', asyncHandler(maintenanceController.createTask));
router.patch('/tasks/:id', asyncHandler(maintenanceController.toggleTask));
router.delete('/tasks/:id', asyncHandler(maintenanceController.deleteTask));
router.get('/logs', asyncHandler(maintenanceController.getLogs));
router.post('/logs', asyncHandler(maintenanceController.createLog));

module.exports = router;
