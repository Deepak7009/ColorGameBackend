const Bet = require("../models/betSchema");
const User = require("../models/userSchema");
const PeriodInfo = require("../models/periodInfoSchema ");

totalAmount = 0;
let numbers = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
let ream = 0;
let gram = 0;
let vam = 0;

const addBet = async (req, res) => {
   try {

      const { userId, amount, selection, periodId } = req.body;

      let winAmount = amount;
      let outcome = 'Pending';
      let givenAmount = 0;

      if (selection === "Green") {
         winAmount *= 2; // Multiply by 2 if selection is 'Green'
         givenAmount = winAmount; // Set givenAmount to winAmount for 'Green'
         gram = gram + winAmount;
         totalAmount = gram;

         numbers[1] += givenAmount;
         numbers[3] += givenAmount;
         numbers[7] += givenAmount;
         numbers[9] += givenAmount;
         console.log("this is the numbers array " + numbers);
      } else if (selection === "Red") {
         winAmount *= 2; // Multiply by 2 if selection is 'Red'
         givenAmount = winAmount;
         ream = ream + winAmount;
         totalAmount = ream;

         numbers[2] += winAmount;
         numbers[4] += winAmount;
         numbers[6] += winAmount;
         numbers[8] += winAmount;
         console.log("this is the numbers array " + numbers);
      } else if ([1, 3, 7, 9, 2, 4, 6, 8].includes(parseInt(selection))) {
         winAmount *= 9; // Multiply by 9 for specific numbers
         numbers[selection] += winAmount;
         totalAmount = numbers[selection];
         console.log("this is the numbers array " + numbers);
      } else {
         winAmount *= 1.4;
         givenAmount = winAmount;
         vam = vam + winAmount;
         totalAmount = vam;

         numbers[0] += givenAmount;
         numbers[5] += givenAmount;
         console.log("this is the numbers array " + numbers);

      }

      const bet = new Bet({
         userId,
         amount,
         winAmount,
         totalAmount,
         selection,
         periodId,
         outcome
      });


      const user = await User.findById(userId);
      if (!user) {
         return res.status(404).json({ error: "User not found" });
      }
      user.bankBalance -= amount;
      await user.save(); // Save the updated bank balance

      await bet.save();
      res.status(200).json({ message: "Bet placed successfully" });

   } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
   }
};

const updateBetOutcome = async (req, res) => {
   try {
      const { periodId, result } = req.body;

      // Check if the outcomes have already been updated for this period
      const periodInfo = await PeriodInfo.findOne({ periodId });
      if (periodInfo && periodInfo.outcomeUpdated) {
         // Outcomes already updated for this period, no need to update again
         return res.status(200).json({ message: "Bet outcomes already updated for this period" });
      }

      // Find all bets for the specified period
      const allBets = await Bet.find({ periodId });

      // Update outcome to 'Win' for winning bets
      const winningBets = allBets.filter(bet => bet.selection === result);
      await Promise.all(winningBets.map(async (bet) => {
         bet.outcome = 'Win';
         await bet.save();
         
      }));

      // Update outcome to 'Loss' for non-winning bets
      const nonWinningBets = allBets.filter(bet => bet.selection !== result);
      await Promise.all(nonWinningBets.map(async (bet) => {
         bet.outcome = 'Loss';
         await bet.save();
      }));

      // Update periodInfo to indicate that outcomes have been updated for this period
      if (!periodInfo) {
         await PeriodInfo.create({ periodId, outcomeUpdated: true });
      } else {
         periodInfo.outcomeUpdated = true;
         await periodInfo.save();
      }

      res.status(200).json({ message: "Bet outcomes updated successfully" });
   } catch (error) {
      console.error("Error updating bet outcomes:", error);
      res.status(500).json({ error: "Internal server error" });
   }
};

const getLowestBetNumber = async (req, res) => {
   try {
      const periodId = req.params.periodId;
      console.log("Received Period ID:", periodId);


      const betTotals = await Bet.aggregate([
         { $match: { periodId: parseInt(periodId) } },
         {
            $group: {
               _id: "$selection",
               totalAmount: { $sum: "$amount" },
            },
         },
         {
            $project: {
               _id: 1,
               totalAmount: 1,
               multiplier: {
                  $cond: {
                     if: {
                        $or: [
                           { $in: ["$_id", ["Green", "Red"]] },
                           { $in: ["$_id", ["1", "2", "3", "4", "6", "7", "8", "9"]] },
                        ],
                     },
                     then: {
                        $cond: {
                           if: { $in: ["$_id", ["1", "2", "3", "4", "6", "7", "8", "9"]] },
                           then: 9, // Multiplier for selections 1, 2, 3, 4, 6, 7, 8, 9
                           else: 2, // Default multiplier for Green and Red
                        },
                     },
                     else: {
                        $cond: {
                           if: { $eq: ["$_id", "Violet"] },
                           then: 1.4, // Multiplier for Violet
                           else: 4, // Multiplier for selections 0 and 5
                        },
                     },
                  },
               },
            },
         },
         { $sort: { totalAmount: 1 } },
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
               multiplier: lowestBet.multiplier,
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

const getAllUserBets = async (req, res) => {
   try {
      const userId = req.params.userId;
      const userBets = await Bet.find({ userId: userId });

      res.status(200).json({ userBets });

   } catch (error) {
      console.error("Error fetching user bets:", error);
      res.status(500).json({ error: "Internal server error" });
   }
};

const getWinningBets = async (req, res) => {
   try {
      const { periodId, result } = req.params;
      const winningBets = await Bet.find({ periodId, selection: result });

      res.status(200).json({ winningBets });

   } catch (error) {
      console.error("Error fetching winning bets:", error);
      res.status(500).json({ error: "Internal server error" });
   }
};

module.exports = { addBet, getLowestBetNumber, getAllUserBets, updateBetOutcome, getWinningBets };

