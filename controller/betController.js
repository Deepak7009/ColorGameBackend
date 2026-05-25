const Bet = require("../models/betSchema");
const User = require("../models/userSchema");
const PeriodInfo = require("../models/periodInfoSchema ");

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
    winAmount *= 2;
    winAmount2 *= 0.5;
    givenAmount = winAmount;
    givenAmount2 = winAmount2;
    greengiveamount = greengiveamount + winAmount;
    totalAmount = greengiveamount;

    numbers[0] += givenAmount2;
    numbers[1] += givenAmount;
    numbers[3] += givenAmount;
    numbers[7] += givenAmount;
    numbers[9] += givenAmount;
    console.log("this is the numbers array " + numbers);
  } else if (selection === "Red") {
    winAmount *= 2;
    winAmount2 *= 0.5;
    givenAmount = winAmount;
    givenAmount2 = winAmount2;
    redgiveamount = redgiveamount + winAmount;
    totalAmount = redgiveamount;

    numbers[5] += winAmount2;
    numbers[2] += winAmount;
    numbers[4] += winAmount;
    numbers[6] += winAmount;
    numbers[8] += winAmount;
    console.log("this is the numbers array " + numbers);
  } else if (selection === "Violet") {
    winAmount *= 4.5;
    givenAmount = winAmount;
    purplegiveamount = purplegiveamount + givenAmount;
    totalAmount = purplegiveamount;

    numbers[0] += winAmount;
    numbers[5] += winAmount;
    console.log("this is the numbers array " + numbers);
  } else if ([1, 3, 7, 9, 2, 4, 6, , 0, 5, 8].includes(parseInt(selection))) {
    winAmount *= 9;
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
    const getPeriodIdFromDB = await Bet.find().sort([['_id', -1]]).limit(1)
    console.log('getPeriodIdFromDB:, periodId', getPeriodIdFromDB, getPeriodIdFromDB[0]?.periodId, periodId);
    if (getPeriodIdFromDB && getPeriodIdFromDB[0]?.periodId === periodId) {
      console.log('Period IDs match:', periodId);
      winAmount = await callprice(userId, amount, selection, periodId);
    } else {
      console.log('Period IDs do not match. Resetting numbers array.');
      numbers = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      winAmount = await callprice(userId, amount, selection, periodId);
    }

    const bet = new Bet({
      userId,
      amount,
      winAmount,
      totalAmount,
      selection,
      periodId,
      outcome: 'Pending'
    });

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.bankBalance -= amount;
    await user.save();
    await bet.save();

    res.status(200).json({ message: "Bet placed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getLowestBetNumberold = async (req, res) => {
  try {
    const periodId = req.params.periodId;
    console.log("Received Period ID:", periodId);

    // Example numbers array
    // const numbers = [10, 5, 2, 2, 7];

    const allBetNumbers = await Bet.aggregate([
      {
        $match: {
          periodId: Number(periodId)
        }
      },
      {
        $group: {
          _id: "$selection",
          totalWinAmount: {
            $sum: "$winAmount"
          }
        }
      }
    ]);

    // Create totals for all numbers 0-9
    const totals = Array.from({ length: 10 }, (_, i) => {
      const found = allBetNumbers.find(
        item => item._id === i.toString() || item._id === i
      );

      return {
        number: i,
        totalWinAmount: found ? found.totalWinAmount : 0
      };
    });

    // Find lowest total
    const minWinAmount = Math.min(
      ...totals.map(item => item.totalWinAmount)
    );

    // Get all numbers having the lowest total
    const lowestNumbers = totals.filter(
      item => item.totalWinAmount === minWinAmount
    );

    // Pick random one
    const randomLowest =
      lowestNumbers[Math.floor(Math.random() * lowestNumbers.length)];

    console.log("Selected Number:", randomLowest.number);
    console.log("Lowest Total WinAmount:", randomLowest.totalWinAmount);

    // Find the minimum value
    const minValue = Math.min(...numbers);

    // Get all indexes having the minimum value
    const minIndexes = numbers
      .map((value, index) => (value === minValue ? index : null))
      .filter(index => index !== null);

    // Pick a random index from the matching indexes
    const randomIndex =
      minIndexes[Math.floor(Math.random() * minIndexes.length)];

    res.status(200).json({
      lowestBetNumber: randomLowest.number || randomIndex,
      totalAmount: minValue,
      randomLowest: randomLowest
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getLowestBetNumber = async (req, res) => {
  try {
    const periodId = req.params.periodId;

    const bets = await Bet.find({
      periodId: Number(periodId)
    });

    // total exposure for numbers 0-9
    const numbers = Array(10).fill(0);

    bets.forEach(bet => {
      let { selection, winAmount } = bet;

      selection = selection.toString();

      // GREEN
      if (selection === "Green") {

        numbers[0] += winAmount * 0.5;

        numbers[1] += winAmount;
        numbers[3] += winAmount;
        numbers[7] += winAmount;
        numbers[9] += winAmount;
      }

      // RED
      else if (selection === "Red") {

        numbers[5] += winAmount * 0.5;

        numbers[2] += winAmount;
        numbers[4] += winAmount;
        numbers[6] += winAmount;
        numbers[8] += winAmount;
      }

      // VIOLET
      else if (selection === "Violet") {

        numbers[0] += winAmount;
        numbers[5] += winAmount;
      }

      // DIRECT NUMBER
      else if (
        !isNaN(selection) &&
        Number(selection) >= 0 &&
        Number(selection) <= 9
      ) {
        numbers[Number(selection)] += winAmount;
      }
    });

    console.log("Numbers Exposure:", numbers);

    // minimum exposure
    const minValue = Math.min(...numbers);

    // all numbers with lowest exposure
    const minIndexes = numbers
      .map((value, index) =>
        value === minValue ? index : null
      )
      .filter(index => index !== null);

    // random lowest number
    const randomIndex =
      minIndexes[Math.floor(Math.random() * minIndexes.length)];

    res.status(200).json({
      lowestBetNumber: randomIndex,
      totalAmount: minValue,
      numbers
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Internal server error"
    });
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

    // Helper function to get color associated with a number
    const getColorForNumber = (number) => {
      if (["1", "3", "7", "9"].includes(number)) {
        return "Green";
      } else if (["2", "4", "6", "8"].includes(number)) {
        return "Red";
      } else if (["0", "5"].includes(number)) {
        return "Violet";
      } else {
        return null;
      }
    };

    const winningBets = await Bet.find({
      periodId,
      $or: [{ selection: result }, { selection: getColorForNumber(result) }]
    });

    res.status(200).json({ winningBets });

  } catch (error) {
    console.error("Error fetching winning bets:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateBetOutcome = async (req, res) => {
  try {
    const { periodId, result } = req.body;

    const periodInfo = await PeriodInfo.findOne({ periodId });
    if (periodInfo && periodInfo.outcomeUpdated) {
      return res.status(200).json({
        message: "Bet outcomes already updated for this period"
      });
    }

    const getColorForNumber = (number) => {
      if (["1", "3", "7", "9"].includes(number)) {
        return "Green";
      } else if (["2", "4", "6", "8"].includes(number)) {
        return "Red";
      } else if (["0", "5"].includes(number)) {
        return "Violet";
      } else {
        return null;
      }
    };

    const allBets = await Bet.find({ periodId });
    console.log("allBets", allBets);
    const winningBets = allBets.filter(
      bet => bet.selection === result || getColorForNumber(result) === bet.selection);
    await Promise.all(winningBets.map(async (bet) => {
      bet.outcome = 'Win';
      await bet.save();
    }));

    const nonWinningBets = allBets.filter(bet => !winningBets.includes(bet));
    await Promise.all(nonWinningBets.map(async (bet) => {
      bet.outcome = 'Loss';
      await bet.save();
    }));

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


module.exports = { addBet, getLowestBetNumber, getAllUserBets, updateBetOutcome, getWinningBets };

