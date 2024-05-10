const mongoose = require("mongoose");

const timeSchema = new mongoose.Schema({
  periodId: {
    type: Number,
    required: true,
  },
  
  time: {
    type: Number,
    required: true,
    default: 60, 
  },

  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
    default: () => Date.now() + 60000, 
  },
  isActive: {
    type: Boolean,
    default: true, 
  },
  wonNumber: {
    type: Number,
    required: true,
    default: 0, 
  },
});

const Time = mongoose.model("Time", timeSchema);

module.exports = Time;
