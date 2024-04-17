const Bet = require('../models/betSchema')


const addBet = async (req, res) => {
  try {
    const { userId, amount, selection, periodId  } = req.body;
    const bet = new Bet({ userId, amount, selection, periodId  });
    await bet.save();
    res.status(200).json({ message: 'Bet placed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
  };



  module.exports = {addBet}
  