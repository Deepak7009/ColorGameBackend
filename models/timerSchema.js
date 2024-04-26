const mongoose = require("mongoose");

const timerSchema = new mongoose.Schema({
  timer: {
    type: Number,
    default: 180, // Initial timer value in seconds (3 minutes)
  },
});

const Timer = mongoose.model("Timer", timerSchema);

module.exports = Timer;
