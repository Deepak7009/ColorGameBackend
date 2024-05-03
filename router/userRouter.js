const express = require('express');
const { addUser, loginUser, getUserById, updateUserBankBalance } = require('../controller/userController');
const { addBet, getLowestBetNumber, getAllUserBets, updateBetOutcome, getWinningBets } = require('../controller/betController');
const { saveTransaction, updateTransactionStatus, getTransactions } = require('../controller/transactionController');
const { getTimer, startTimer } = require('../controller/timerController');
const { saveWithDraw, getwithDraws, updatewithDrawStatus } = require('../controller/withdrawController')
const router = express.Router();

router.post('/register', addUser);
router.post('/login', loginUser);
router.get('/user/:userId', getUserById);


router.post('/bet', addBet);
router.get('/lowest/:periodId', getLowestBetNumber);

router.get('/bet/result/:periodId/:result', getWinningBets);
router.put('/user/:userId', updateUserBankBalance);
router.get('/bets/:userId', getAllUserBets);
router.put('/bet/updateOutcome', updateBetOutcome)


router.post('/transaction', saveTransaction)
router.get('/transaction', getTransactions)
router.put('/updateStatus', updateTransactionStatus);

router.post('/withDraw', saveWithDraw)
router.get('/withDraw', getwithDraws)
router.put('/status', updatewithDrawStatus);

router.get("/timer", getTimer);
router.post("/timer/start", startTimer);


module.exports = router;
