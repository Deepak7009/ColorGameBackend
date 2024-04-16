const Bet = require('../models/betSchema')

const addBet = async (req, res) => {
    const { number, amount } = req.body;
    try {
      const bet = new Bet({ number, amount });
      await bet.save();
      res.status(201).send("Bet saved successfully");
    } catch (error) {
      res.status(500).send(error.message);
    }
  };

  
  const getNumber= async (req, res) => {
    const randomNumber = Math.floor(Math.random() * 10); 
    res.send({ randomNumber });
  };

  module.exports = {addBet, getNumber}
  