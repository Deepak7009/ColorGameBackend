const mongoose = require("mongoose");

const withdrawSchema = new mongoose.Schema({
    withDrawAmount: Number,
    upiId: String,
    userId: String,
    status: {
        type: String,
        enum: ['pending', 'success', 'failed'],
        default: 'pending'
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
});

const withDraw = mongoose.model("withDraw", withdrawSchema);

module.exports = withDraw;
