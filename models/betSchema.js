const mongoose = require('mongoose');

const betSchema = new mongoose.Schema({
  userId: String,
  amount: Number,
  selection: String,
  timestamp: { type: Date, default: Date.now },
});

const Bet = mongoose.model('Bet', betSchema);

module.exports = Bet;
