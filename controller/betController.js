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


const getLowestBetNumber = async (req, res) => {
  try {
    const periodId = req.params.periodId;
    console.log('Received Period ID:', periodId); // Log the received periodId

    const betTotals = await Bet.aggregate([
      { $match: { periodId: parseInt(periodId) } }, // Match bets for the specified periodId
      {
        $group: {
          _id: '$selection',
          totalAmount: { $sum: '$amount' },
        },
      }, // Calculate total amount for each selection
      {
        $project: {
          _id: 1,
          totalAmount: 1,
          multiplier: {
            $cond: {
              if: {
                $or: [
                  { $eq: ['$_id', 'Green'] },
                  { $eq: ['$_id', 'Red'] },
                ],
              },
              then: 2,
              else: 9,
            },
          },
        },
      }, // Project the multiplier based on selection (_id)
      { $sort: { totalAmount: 1 } }, // Sort by total amount ascending
    ]);

    console.log('Bet Totals:', betTotals); // Log the calculated totals

    if (betTotals.length > 0) {
      const lowestBet = betTotals[0]; // Get the bet with the lowest total amount
      const multiplyAmount = lowestBet.totalAmount * lowestBet.multiplier; // Multiply the lowest amount by the multiplier
      console.log('Lowest Bet:', lowestBet); // Log the lowest bet details
      console.log('Multiply Amount:', multiplyAmount); // Log the multiplied amount

      res.status(200).json({
        lowestBetNumber: lowestBet._id,
        multiplyAmount,
      });
    } else {
      console.log('No bets found for this period');
      res.status(404).json({ message: 'No bets found for this period' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


module.exports = { addBet, getLowestBetNumber };
