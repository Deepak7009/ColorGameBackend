// const mongoose = require("mongoose");

// const timerSchema = new mongoose.Schema({
//   timer: {
//     type: Number,
//     default: 180, // Initial timer value in seconds (3 minutes)
//   },
//   periodId: {
//     type: Number,
//     default: 1, // Initial period ID
//   },
// });

// const Timer = mongoose.model("Timer", timerSchema);

// module.exports = Timer;

const mongoose = require('mongoose');

// Define the Timer schema
const timerSchema = new mongoose.Schema({
  periodId: {
    type: Number,
    default: 1234567890,
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 1000); // Default end time is 3 minutes from now
    },
  },
});

// Custom method to check if the timer is active
timerSchema.methods.isActive = function() {
  return Date.now() < this.endTime;
};

// Create a Timer model based on the schema
const Timer = mongoose.model('Timer', timerSchema);

module.exports = Timer;

