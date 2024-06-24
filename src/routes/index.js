// /src/routes/index.js
const express = require('express');
const router = express.Router();
const propertyRoutes = require('./propertyRoutes');

router.use('/properties', propertyRoutes);

module.exports = router;
