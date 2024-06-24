// /src/routes/propertyRoutes.js
const express = require('express');
const router = express.Router();
const { addProperty } = require('../controllers/propertyController');

router.post('/add', addProperty);

module.exports = router;
