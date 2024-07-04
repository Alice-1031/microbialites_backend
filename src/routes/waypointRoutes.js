const express = require('express');
const router = express.Router();
const { getAllWaypoints} = require('../controllers/waypointController');


router.get('/get', getAllWaypoints);



module.exports = router;
