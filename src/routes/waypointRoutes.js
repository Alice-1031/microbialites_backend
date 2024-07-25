const express = require('express');
const router = express.Router();
const { getAllWaypoints, getAllFilteredWaypoints} = require('../controllers/waypointController');


router.get('/get', getAllWaypoints);
router.get('/filter',getAllFilteredWaypoints);



module.exports = router;
