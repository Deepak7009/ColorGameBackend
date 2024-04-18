const Bet = require('../models/betSchema');

const addBet = async (req, res) => {
  try {
    const { userId, amount, selection, periodId } = req.body;
    const bet = new Bet({ userId, amount, selection, periodId });
    await bet.save();
    res.status(200).json({ message: 'Bet placed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Inside betController.js

const getLowestBetNumber = async (req, res) => {
  try {
    const periodId = req.params.periodId;
    const betTotals = await Bet.aggregate([
      { $match: { periodId: parseInt(periodId) } },
      { $group: { _id: '$selection', totalAmount: { $sum: '$amount' } } },
      { $sort: { totalAmount: 1 } },
    ]);

    if (betTotals.length > 0) {
      const lowestBet = betTotals[0];
      const multiplyAmount = lowestBet.totalAmount * 9;

      res.status(200).json({
        lowestBetNumber: lowestBet._id,
        multiplyAmount,
      });
    } else {
      res.status(404).json({ message: 'No bets found for this period' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { addBet, getLowestBetNumber };
