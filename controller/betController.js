const Bet = require('../models/betSchema')

const addBet = async (req, res) => {
  try {
    const { userId, amount, selection } = req.body;
    const bet = new Bet({ userId, amount, selection });
    await bet.save();
    res.status(200).json({ message: 'Bet placed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
  };

  
  const getNumber= async (req, res) => {
    const winningNumberColor = Math.floor(Math.random() * 10); // Generate random winning number/color
  res.status(200).json({ winningNumberColor });
  };

  module.exports = {addBet, getNumber}
  