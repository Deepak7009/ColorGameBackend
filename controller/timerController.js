const Timer = require("../models/timerSchema");

const startTimer = async (req, res) => {
    try {
      console.log("Starting/resetting timer...");
      const timer = await Timer.findOneAndUpdate({}, { timer: 180 }, { new: true });
      if (!timer) {
        console.log("Timer not found.");
        return res.status(404).json({ error: "Timer not found" });
      }
      console.log("Timer updated successfully:", timer);
      res.json({ success: true, timer: timer.timer });
    } catch (error) {
      console.error("Error starting/resetting timer:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  
  const getTimer = async (req, res) => {
    try {
      console.log("Fetching timer...");
      let timer = await Timer.findOne();
      if (!timer) {
        console.log("Timer not found. Initializing...");
        timer = await Timer.create({ timer: 180 }); // Initialize timer if not found
      }
      console.log("Timer fetched successfully:", timer);
      res.json({ timer: timer.timer });
    } catch (error) {
      console.error("Error fetching timer:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  
  
  

module.exports = { startTimer, getTimer };
