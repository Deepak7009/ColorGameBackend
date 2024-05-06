const Timer = require("../models/timerSchema");

// const startTimer = async (req, res) => {
//   try {
//     console.log("Starting/resetting timer...");
//     let timer = await Timer.findOne();
//     if (!timer) {
//       console.log("Timer not found.");
//       return res.status(404).json({ error: "Timer not found" });
//     }

//     const periodId = timer.periodId; // Get current period ID
//     const newPeriodId = (periodId % 10) + 1; // Increment period ID cyclically from 1 to 10

//     // Update timer and period ID in the database
//     timer = await Timer.findOneAndUpdate({}, { timer: 180, periodId: newPeriodId }, { new: true });

//     console.log("Timer and Period ID updated successfully:", timer);
//     res.json({ success: true, timer: timer.timer, periodId: timer.periodId });
//   } catch (error) {
//     console.error("Error starting/resetting timer:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// const getTimer = async (req, res) => {
//   try {
//     console.log("Fetching timer...");
//     let timer = await Timer.findOne();
//     if (!timer) {
//       console.log("Timer not found. Initializing...");
//       timer = await Timer.create({ timer: 180 }); // Initialize timer if not found
//     }
//     console.log("Timer fetched successfully:", timer);
//     res.json({ timer: timer.timer });
//   } catch (error) {
//     console.error("Error fetching timer:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

const startTimer = async (req, res) => {
  try {
    const { newPeriodId } = req.body;
    if (!newPeriodId) {
      return res.status(400).json({ error: "New period ID is required" });
    }

    let timer = await Timer.findOne();
    if (!timer) {
      timer = new Timer({ periodId: newPeriodId });
    } else {
      timer.periodId = newPeriodId;
    }

    await timer.save();
    res.json({ success: true, newPeriodId: timer.periodId });
  } catch (error) {
    console.error("Error updating period ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getTimer = async (req, res) => {
  try {
    // Find the timer document or create a new one if it doesn't exist
    let timer = await Timer.findOne();
    if (!timer) {
      timer = new Timer();
    }

    // Start the 3-minute countdown
    setTimeout(async () => {
      // Increment periodId by 1
      timer.periodId++;
      await timer.save();
      res.json({ success: true, periodId: timer.periodId });
    }, 30 * 1000); // 3 minutes in milliseconds
  } catch (error) {
    console.error("Error starting timer:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { startTimer, getTimer };
