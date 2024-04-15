const mongoose = require("mongoose");

const conn = async () => {
    try {
        const connect = await mongoose.connect(process.env.MONGODB_URI);
        console.log("DB Connected", connect.connection.host);
    } catch (err) {
        console.error("DB connection error:", err);
        process.exit(1);
    }
}

module.exports = conn;