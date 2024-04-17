const express = require('express');
const { addUser, loginUser } = require('../controller/userController');
const { addBet } = require('../controller/betController');
const router = express.Router();

router.post('/register', addUser)
router.post('/login', loginUser)

router.post('/bet', addBet)

module.exports = router;
