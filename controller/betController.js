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
    const bets = await Bet.aggregate([
      { $match: { periodId: parseInt(periodId) } }, // Match bets for the specified periodId
      { $group: { _id: '$selection', lowestAmount: { $min: '$amount' } } }, // Group by selection and find the lowest amount
      { $sort: { lowestAmount: 1 } }, // Sort by lowest amount ascending
      { $limit: 1 }, // Limit to the lowest amount
    ]);
    console.log('Aggregation Result:', bets); // Log the aggregation result
    if (bets.length > 0) {
      res.status(200).json({ lowestBetNumber: bets[0]._id });
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
