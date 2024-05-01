const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    transactionId: String,
    platform: String,
    amount: Number,
    userId: String,
    status: {
        type: String,
        enum: ['pending', 'success', 'failed'],
        default: 'pending'
    },
    timestamp:
    {
        type: Date,
        default: Date.now
    },
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
