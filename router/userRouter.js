const express = require('express');
const { addUser, loginUser, getUserById  } = require('../controller/userController');
const { addBet, getLowestBetNumber } = require('../controller/betController');
const {saveTransaction, updateTransactionStatus, getTransactions } = require('../controller/transactionController');
const { getTimer, startTimer } = require('../controller/timerController');
const router = express.Router();

router.post('/register', addUser);
router.post('/login', loginUser);
router.get('/user/:userId', getUserById);


router.post('/bet', addBet);
router.get('/lowest/:periodId', getLowestBetNumber); 

router.post('/transaction',saveTransaction)
router.get('/transaction', getTransactions)
router.put('/updateStatus', updateTransactionStatus);

router.get("/timer", getTimer);
router.post("/timer/start", startTimer);

module.exports = router;
