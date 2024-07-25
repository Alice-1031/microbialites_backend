// /src/routes/propertyRoutes.js
const express = require('express');
const router = express.Router();
const { addProperty,getLookupTables, deleteProperty } = require('../controllers/propertyController');
const { verifyToken, checkRole } = require('../controllers/user/authController'); // Adjust path as necessary

//Apply middleware to protect routes
router.post('/add', verifyToken, checkRole(['Admin']), addProperty);
router.delete('/delete', verifyToken, checkRole(['Admin']), deleteProperty)
//route for fetching list of lookup tables
router.get('/lookup-tables', getLookupTables);

// Dummy route for testing insert permissions
router.post('/insert', verifyToken, checkRole(['Super User', 'Admin']), (req, res) => {
    res.json({ message: 'Insert operation successful' });
});

module.exports = router;
