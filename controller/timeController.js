const Time = require("../models/timeSchema");
const moment = require("moment");

let timeInterval;

const startTime = async (req, res) => {
  try {
    console.log("Starting/resetting time...");

    const resetTime = async () => {
      try {
        let currentTime = await Time.findOne().sort({ _id: -1 }).limit(1);
        let periodId = 1234567891;
        if (currentTime) {
          periodId = currentTime.periodId + 1;
        }

        if (currentTime) {
          await Time.updateOne({ _id: currentTime._id }, { isActive: false });
        }

        const newTime = new Time({
          periodId,
          time: 60,
          startTime: moment(),
          endTime: moment().add(1, 'minute'),
          wonNumber: req.body.wonNumber, // Update wonNumber based on request body
        });
        await newTime.save();

        console.log("New time created for period ID:", periodId);
      } catch (error) {
        console.error("Error resetting time:", error);
      }
    };

    timeInterval = setInterval(resetTime, 60000);

    console.log("Time started/reset successfully.");
    res.status(200).json({ message: "Time started/reset successfully." });
  } catch (error) {
    console.error("Error starting/resetting time:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getTime = async (req, res) => {
  try {
    let time = await Time.findOne().sort({ periodId: -1 });
    if (!time) {
      console.log("Time not found.");
    }

    const now = moment();
    const endTime = moment(time.endTime);
    const remainingTime = Math.max(0, endTime.diff(now, 'seconds')); // Calculate remaining time in seconds
    time.time = remainingTime;


    console.log("Time fetched successfully:", time);
    res.json({
      periodId: time ? time.periodId : null,
      time: time ? time.time : null,
      startTime: time ? time.startTime : null,
      endTime: time ? time.endTime : null,
    });
  } catch (error) {
    console.error("Error fetching time:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getLatestPeriods = async (req, res) => {
  try {
    const latestPeriods = await Time.find({ isActive: false }).sort({ periodId: -1 }).limit(10);
    res.status(200).json({ Periods: latestPeriods });
  } catch (error) {
    console.error("Error fetching latest periods:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


const updateWonNumber = async (req, res) => {
  try {
    const { periodId, newWonNumber } = req.body;
    const updatedTime = await Time.findOneAndUpdate(
      { periodId: periodId },
      { $set: { wonNumber: newWonNumber } },
      { new: true }
    );
    res.status(200).json({ message: "Won number updated successfully", updatedTime });
  } catch (error) {
    console.error("Error updating won number:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { startTime, getTime, getLatestPeriods, updateWonNumber };
