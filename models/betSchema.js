const mongoose = require("mongoose");

const betSchema = new mongoose.Schema({
  userId: String,
  amount: Number,
  selection: String,
  periodId: Number,
  winAmount: Number,
  totalAmount: Number,
  // givenAmount: Number, // Add the new field for GivenAmount
  // greenGive: Number,
  timestamp: { type: Date, default: Date.now },
});

const Bet = mongoose.model("Bet", betSchema);

module.exports = Bet;
