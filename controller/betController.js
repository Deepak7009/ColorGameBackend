const Bet = require("../models/betSchema");
const User = require("../models/userSchema")

totalAmount = 0;
let numbers = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
let ream = 0;
let gram = 0;
let vam = 0;

const addBet = async (req, res) => {
   try {

      const { userId, amount, selection, periodId } = req.body;

      let winAmount = amount;
      let givenAmount = 0;

      // Check the selection and update winAmount accordingly
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
         // Sum winAmount with the winAmount for 'Green' and store in givenAmount
         // givenAmount = winAmount + (2 * amount);
         // givenAmount = winAmount + greenGive;
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
         // givenAmount,
         totalAmount,
         selection,
         // greenGive,
         periodId,
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


const getLowestBetNumber = async (req, res) => {
   try {
      const periodId = req.params.periodId;
      console.log("Received Period ID:", periodId);

      // Query to find bets for the specified period ID
      const bets = await Bet.find({ periodId: parseInt(periodId) }).select('selection amount');

      console.log("Bets for Period ID:", bets);

      if (bets.length > 0) {
         const betMap = new Map();

         // Calculate total amount for each selection
         bets.forEach(bet => {
            const { selection, amount } = bet;
            const totalAmount = betMap.has(selection) ? betMap.get(selection) + amount : amount;
            betMap.set(selection, totalAmount);
         });

         // Check if any selection from 0 to 9 is missing
         const missingSelections = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].filter(selection => !betMap.has(selection));

         if (missingSelections.length > 0) {
            // If there are missing selections, choose the lowest missing selection as the lowest bet number
            const lowestBetNumber = missingSelections.reduce((min, current) => (parseInt(current) < parseInt(min) ? current : min));

            console.log("Lowest Bet Number (Missing):", lowestBetNumber);

            res.status(200).json({
               lowestBetNumber: lowestBetNumber,
               multiplier: 2, // You can adjust the multiplier as needed
            });
         } else {
            // If all selections from 0 to 9 have been bet on, choose the lowest bet based on total amount
            const sortedBets = [...betMap.entries()].sort((a, b) => a[1] - b[1]);
            const lowestBet = sortedBets[0];

            let multiplier = 2;
            if (['1', '2', '3', '4', '6', '7', '8', '9'].includes(lowestBet[0])) {
               multiplier = 9; 
            } else if (lowestBet[0] === 'Violet') {
               multiplier = 1.4;
            } else if (['0', '5'].includes(lowestBet[0])) {
               multiplier = 4.5;
            }

            const multiplyAmount = lowestBet[1] * multiplier;
            console.log("Lowest Bet (Total Amount):", lowestBet);
            console.log("Multiply Amount:", multiplyAmount);

            res.status(200).json({
               lowestBetNumber: lowestBet[0],
               multiplier: multiplier,
            });
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




const getWinningBets = async (req, res) => {
   try {
      const { periodId, result } = req.params;

      // Fetch bets where the selection matches the result for the given period ID
      const winningBets = await Bet.find({ periodId, selection: result });

      res.status(200).json({ winningBets });

   } catch (error) {
      console.error("Error fetching winning bets:", error);
      res.status(500).json({ error: "Internal server error" });
   }
};


const getAllUserBets = async (req, res) => {
   try {
      const {userId}= req.body;

      // Fetch all bets placed by the user
      const userBets = await Bet.find();
      //console.log(userBets);

      res.status(200).json({ userBets });

   } catch (error) {
      console.error("Error fetching user bets:", error);
      res.status(500).json({ error: "Internal server error" });
   }
};


module.exports = { addBet, getLowestBetNumber, getWinningBets, getAllUserBets };
