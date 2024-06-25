// /src/routes/propertyRoutes.js
const express = require('express');
const router = express.Router();
const { addProperty,getLookupTables } = require('../controllers/propertyController');

router.post('/add', addProperty);
// New route for fetching lookup tables
router.get('/lookup-tables', getLookupTables);


module.exports = router;
