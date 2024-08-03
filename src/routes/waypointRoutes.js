const express = require('express');
const router = express.Router();
const { getAllWaypoints, getAllFilteredWaypoints,getAllPeriodNames} = require('../controllers/waypointController');


router.get('/get', getAllWaypoints);
router.get('/filter',getAllFilteredWaypoints);
router.get('/period-names',getAllPeriodNames);



module.exports = router;
