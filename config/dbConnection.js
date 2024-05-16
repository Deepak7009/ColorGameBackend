const mongoose = require("mongoose");
const Time = require("../models/timeSchema");
const moment = require("moment");

const conn = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGODB_URI);
    console.log("DB Connected", connect.connection.host);

    const createNewTime = async () => {
      let currentTime = await Time.findOne().sort({ _id: -1 }).limit(1);
      let periodId = currentTime ? currentTime.periodId + 1 : 1;

      if (currentTime) {
        await Time.updateOne({ _id: currentTime._id }, { isActive: false });
      }

      const newTime = new Time({
        periodId,
        time: 60,
        startTime: moment(),
        endTime: moment().add(1, 'minute'),
        wonNumber: 0,
      });
      await newTime.save();

      console.log("New time created for period ID:", periodId);
      setTimeout(createNewTime, 60000);
    };

    createNewTime();
  } catch (err) {
    console.error("DB connection error:", err);
    process.exit(1);
  }
}

module.exports = conn;
