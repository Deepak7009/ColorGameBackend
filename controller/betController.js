const Bet = require("../models/betSchema");
const Transaction = require('../models/transactionSchema ');

const addBet = async (req, res) => {
  try {
    const { userId, amount, selection, periodId, transactionId, platform } = req.body;

    // Create a new transaction
    const transaction = new Transaction({ transactionId, amount, platform });

    // Save the transaction
    await transaction.save();

    // Create a new bet associated with the transaction
    const bet = new Bet({ userId, amount, selection, periodId, transaction: transaction._id });

    // Save the bet
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
    console.log("Received Period ID:", periodId);

    const betTotals = await Bet.aggregate([
      { $match: { periodId: parseInt(periodId) } }, // Match bets for the specified periodId
      {
        $group: {
          _id: "$selection",
          totalAmount: { $sum: "$amount" },
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
                  { $in: ["$_id", ["Green", "0", "1", "3", "7", "9"]] },
                  { $in: ["$_id", ["Red", "2", "4", "5", "6", "8"]] },
                ],
              },
              then: {
                $cond: {
                  if: { $in: ["$_id", ["Green", "0", "1", "3", "7", "9"]] },
                  then: 2,
                  else: 9,
                },
              },
              else: null,
            },
          },
        },
      }, // Project the multiplier based on selection (_id)
      { $sort: { totalAmount: 1 } }, // Sort by total amount ascending
    ]);

    console.log("Bet Totals:", betTotals);

    if (betTotals.length > 0) {
      const lowestBet = betTotals.find((bet) => bet.multiplier !== null);
      if (lowestBet) {
        const multiplyAmount = lowestBet.totalAmount * lowestBet.multiplier;
        console.log("Lowest Bet:", lowestBet);
        console.log("Multiply Amount:", multiplyAmount);

        res.status(200).json({
          lowestBetNumber: lowestBet._id,
          multiplyAmount,
        });
      } else {
        console.log("No valid bets found for this period");
        res
          .status(404)
          .json({ message: "No valid bets found for this period" });
      }
    } else {
      console.log("No bets found for this period");
      res.status(404).json({ message: "No bets found for this period" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { addBet, getLowestBetNumber };
