const Transaction = require('../models/transactionSchema ');
const User = require('../models/userSchema');

const saveTransaction = async (req, res) => {
    try {
        const { transactionId, platform, amount, userId } = req.body;

        if (!transactionId || !platform || !userId) {
            return res.status(400).json({ error: 'Transaction ID, platform, and amount are required.' });
        }

        const newTransaction = new Transaction({ transactionId, platform, amount, userId });
        await newTransaction.save();

        res.status(201).json({ message: 'Transaction details saved successfully', newTransaction });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getTransactions = async (req, res) => {
    const filter = req.query.filter; // Get filter from query parameters
    let query = {};

    // Depending on the filter value, modify the query object to filter transactions accordingly
    if (filter === 'pending') {
        query = { status: 'pending' };
    } else if (filter === 'success') {
        query = { status: 'success' };
    } else if (filter === 'failed') {
        query = { status: 'failed' };
    }

    try {
        // Fetch transactions based on the constructed query
        const transactions = await Transaction.find(query);
        res.status(200).json(transactions);
        //console.log(transactions)
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateTransactionStatus = async (req, res) => {
    try {
        const { transactionId, status } = req.body;

        // Check if the transaction is already marked as 'success'
        const existingTransaction = await Transaction.findOne({ transactionId });
        if (existingTransaction && existingTransaction.status === 'success') {
            return res.status(400).json({ error: 'Transaction already processed' });
        }

        const updatedTransaction = await Transaction.findOneAndUpdate({ transactionId }, { status }, { new: true });
        let user;

        if (status === 'success') {
            const transactionAmount = updatedTransaction.amount;

            //console.log ( "Transaction Amount :", transactionAmount) 

            const userId = updatedTransaction.userId;
            //console.log ( "userId  :", userId) 

            const user = await User.findOne({ _id: userId });
            //console.log ( "user  :", user) 

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Update the user's amount
            user.bankBalance += transactionAmount;
            console.log("updated amount :", user.bankBalance)
            await user.save();
        }

        res.status(200).json({ message: 'Transaction status updated successfully', bankBalance: user ? user.bankBalance : null });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


module.exports = { saveTransaction, getTransactions, updateTransactionStatus };
