const Bet = require("../models/betSchema");
const User = require("../models/userSchema");

totalAmount = 0;
let numbers = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
let redgiveamount = 0;
let greengiveamount = 0;
let purplegiveamount = 0;

const callprice = async (userId, amount, selection, periodId) => {
  let winAmount = amount;
  let winAmount2 = amount;
  let givenAmount = 0;
  let givenAmount2 = 0;

  if (selection === "Green") {
    winAmount *= 2; // Multiply by 2 if selection is 'Green'
    winAmount2 *= 1.5;
    givenAmount = winAmount; // Set givenAmount to winAmount for 'Green'
    givenAmount2 = winAmount2; // Set givenAmount to winAmount for 'Green'
   //  greengiveamount = greengiveamount + winAmount;
    totalAmount = greengiveamount;

    numbers[0] += givenAmount2;
    numbers[1] += givenAmount;
    numbers[3] += givenAmount;
    numbers[7] += givenAmount;
    numbers[9] += givenAmount;
    console.log("this is the numbers array " + numbers);
  } else if (selection === "Red") {
    winAmount *= 2; // Multiply by 2 if selection is 'red'
    winAmount2 *= 1.5;
    givenAmount = winAmount; // Set givenAmount to winAmount for 'red'
    givenAmount2 = winAmount2; // Set givenAmount to winAmount for 'red'
   //  redgiveamount = redgiveamount + winAmount;
    totalAmount = redgiveamount;

    numbers[5] += winAmount2;
    numbers[2] += winAmount;
    numbers[4] += winAmount;
    numbers[6] += winAmount;
    numbers[8] += winAmount;
    console.log("this is the numbers array " + numbers);
  } else if (selection === "Violet") {
    winAmount *= 4.5; // Multiply by 4.5 if selection is 'Violet'
    givenAmount = winAmount;
    purplegiveamount = purplegiveamount + givenAmount;
    totalAmount = purplegiveamount;

    numbers[0] += winAmount;
    numbers[5] += winAmount;
    console.log("this is the numbers array " + numbers);
  } else if ([1, 3, 7, 9, 2, 4, 6, , 0, 5, 8].includes(parseInt(selection))) {
    winAmount *= 9; // Multiply by 9 for specific numbers
    numbers[selection] += winAmount;
    totalAmount = numbers[selection];
    console.log("this is the numbers array " + numbers);
  }

  return winAmount;
};

const addBet = async (req, res) => {
  const { userId, amount, selection, periodId } = req.body;
  let winAmount = 0;
  try {
    const getPeriodIdFromDB = await Bet.find()
      .sort([["_id", -1]])
      .limit(1);
    console.log(
      "getPeriodIdFromDB:, periodId",
      getPeriodIdFromDB,
      getPeriodIdFromDB[0]?.periodId,
      periodId
    );
    if (getPeriodIdFromDB && getPeriodIdFromDB[0]?.periodId === periodId) {
      console.log("Period IDs match:", periodId);
      winAmount = await callprice(userId, amount, selection, periodId);
    } else {
      console.log("Period IDs do not match. Resetting numbers array.");
      numbers = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      winAmount = await callprice(userId, amount, selection, periodId);
    }

    //  const winAmount = await callprice(userId, amount, selection, periodId);

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
    const bets = await Bet.find({ periodId: parseInt(periodId) }).select(
      "selection amount"
    );

    console.log("Bets for Period ID:", bets);

    if (bets.length > 0) {
      const betMap = new Map();

      // Calculate total amount for each selection
      bets.forEach((bet) => {
        const { selection, amount } = bet;
        const totalAmount = betMap.has(selection)
          ? betMap.get(selection) + amount
          : amount;
        betMap.set(selection, totalAmount);
      });

      // Check if any selection from 0 to 9 is missing
      // const missingSelections = [
      //   "0",
      //   "1",
      //   "2",
      //   "3",
      //   "4",
      //   "5",
      //   "6",
      //   "7",
      //   "8",
      //   "9",
      // ].filter((selection) => !betMap.has(selection));

      // if (missingSelections.length > 0) {
      //   // If there are missing selections, choose the lowest missing selection as the lowest bet number
      //   const lowestBetNumber = missingSelections.reduce((min, current) =>
      //     parseInt(current) < parseInt(min) ? current : min
      //   );

      //   console.log("Lowest Bet Number (Missing):", lowestBetNumber);

      //   res.status(200).json({
      //     lowestBetNumber: lowestBetNumber,
      //     multiplier: 2, // You can adjust the multiplier as needed
      //   });
      // } else {
      //   // If all selections from 0 to 9 have been bet on, choose the lowest bet based on total amount
      //   const sortedBets = [...betMap.entries()].sort((a, b) => a[1] - b[1]);
      //   const lowestBet = sortedBets[0];

      //   let multiplier = 2;
      //   if (["1", "2", "3", "4", "6", "7", "8", "9"].includes(lowestBet[0])) {
      //     multiplier = 9;
      //   } else if (lowestBet[0] === "Violet") {
      //     multiplier = 1.4;
      //   } else if (["0", "5"].includes(lowestBet[0])) {
      //     multiplier = 4.5;
      //   }

      //   const multiplyAmount = lowestBet[1] * multiplier;
      //   console.log("Lowest Bet (Total Amount):", lowestBet);
      //   console.log("Multiply Amount:", multiplyAmount);

     
      // }
      const leastTotalAmountNumber = numbers.reduce(
         (minIndex, currentAmount, currentIndex, array) => {
           return currentAmount < array[minIndex] ? currentIndex : minIndex;
         },
         0
       );
           console.log("Least Total Amount Index:", leastTotalAmountNumber);

       res.status(200).json({

        lowestBetNumber: leastTotalAmountNumber,
        totalAmount: numbers[leastTotalAmountNumber],

        //  lowestBetNumber: lowestBet[0],
        //  multiplier: multiplier,
       });
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
    const { userId } = req.body;

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
