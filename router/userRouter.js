const express = require('express');
const { addUser, loginUser } = require('../controller/userController');
const { addBet, getLowestBetNumber } = require('../controller/betController');
const router = express.Router();

router.post('/register', addUser);
router.post('/login', loginUser);

router.post('/bet', addBet);
router.get('/lowest/:periodId', getLowestBetNumber); // Route for getting lowest bet number for a period

module.exports = router;
