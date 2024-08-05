const express = require('express');
const router = express.Router();
const { createUser, updateLogin } = require('../controllers/user/userController');
const{ login } = require('../controllers/user/authController');



router.post('/create', createUser);
router.post('/login',login);
router.post('/update', updateLogin);



module.exports = router;
