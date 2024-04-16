const express = require('express');
const { addUser, loginUser } = require('../controller/userController');
const { addBet, getNumber } = require('../controller/betController');
const router = express.Router();

router.post('/register', addUser)
router.post('/login', loginUser)

router.post('/bet', addBet)
router.get('/number', getNumber)


module.exports = router;
