const express = require('express');
const authRoutes = require('./authRoutes');
const tankRoutes = require('./tankRoutes');
const waterRoutes = require('./waterRoutes');
const maintenanceRoutes = require('./maintenanceRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const aiRoutes = require('./aiRoutes');
const growthRoutes = require('./growthRoutes');
const equipmentRoutes = require('./equipmentRoutes');
const planRoutes = require('./planRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/tanks', tankRoutes);
router.use('/water', waterRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/growth', growthRoutes);
router.use('/equipment', equipmentRoutes);
router.use('/plans', planRoutes);
router.use('/ai', aiRoutes);

module.exports = router;
