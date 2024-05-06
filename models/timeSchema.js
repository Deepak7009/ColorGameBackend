const mongoose = require("mongoose");

const timeSchema = new mongoose.Schema({
  periodId: {
    type: Number,
    required: true,
  },
  
  time: {
    type: Number,
    required: true,
    default: 60, // Default time is 60 seconds
  },

  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
    default: () => Date.now() + 60000, // Default end time is 1 minute after start time
  },
  isActive: {
    type: Boolean,
    default: true, // Initially, the period is active
  },

});

const Time = mongoose.model("Time", timeSchema);

module.exports = Time;
