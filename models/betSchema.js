const mongoose = require("mongoose");

const betSchema = new mongoose.Schema({
  userId: String,
  amount: Number,
  winAmount: Number,
  selection: String,
  periodId: Number,
  totalAmount: Number,
  outcome: String,
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction"
  },

  timestamp: {
    type: Date,
    default: Date.now
  },
});

const Bet = mongoose.model("Bet", betSchema);

module.exports = Bet;
