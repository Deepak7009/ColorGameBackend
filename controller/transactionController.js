const Transaction = require('../models/transactionSchema ');

const saveTransaction = async (req, res) => {
    try {
        const { transactionId, platform, amount } = req.body;

        if (!transactionId || !platform) {
            return res.status(400).json({ error: 'Transaction ID, platform, and amount are required.' });
        }

        const newTransaction = new Transaction({ transactionId, platform, amount });
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
        console.log('Received Transaction ID:', transactionId);


        const updatedTransaction = await Transaction.findOneAndUpdate({ transactionId }, { status });

        console.log('Updated Transaction:', updatedTransaction); // Log the updated transaction

        res.status(200).json({ message: 'Transaction status updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


module.exports = { saveTransaction, getTransactions, updateTransactionStatus };
