const mongoose = require("mongoose");

const periodInfoSchema = new mongoose.Schema({
   periodId: {
      type: Number,
      required: true,
      unique: true,
   },
   outcomeUpdated: {
      type: Boolean,
      default: false,
   },
});

const PeriodInfo = mongoose.model("PeriodInfo", periodInfoSchema);

module.exports = PeriodInfo;
