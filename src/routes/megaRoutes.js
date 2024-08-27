const express = require('express');
const router = express.Router();
const {megaThumbnails} = require('../controllers/megaController');

router.post('/thumbnails',megaThumbnails);

module.exports = router;