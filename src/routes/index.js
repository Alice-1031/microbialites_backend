// /src/routes/index.js
const express = require('express');
const router = express.Router();
const propertyRoutes = require('./propertyRoutes');
const waypointRoutes = require('./waypointRoutes');

router.use('/properties', propertyRoutes);
router.use('/waypoints',waypointRoutes);

module.exports = router;
