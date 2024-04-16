const mongoose = require('mongoose');

const betSchema = new mongoose.Schema({
    number: Number,
    amount: Number,
  });

  const Bet = mongoose.model("Bet", betSchema);
  module.exports = {Bet}