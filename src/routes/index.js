// /src/routes/index.js
const express = require('express');
const router = express.Router();
const propertyRoutes = require('./propertyRoutes');
const waypointRoutes = require('./waypointRoutes');
const userRoutes =  require('./userRoutes')

router.use('/properties', propertyRoutes);
router.use('/waypoints',waypointRoutes);
router.use('/users',userRoutes);

module.exports = router;
