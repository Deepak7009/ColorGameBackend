const withDraw = require('../models/withdrawSchema');
const User = require('../models/userSchema');


const saveWithDraw = async (req, res) => {
   try {
      const { upiId, withDrawAmount, userId } = req.body;

      if (!upiId || !withDrawAmount || !userId) {
         return res.status(400).json({ error: 'UPI ID and withDrawAmount are required.' });
      }

      const newwithDraw = new withDraw({ upiId, withDrawAmount, userId });
      await newwithDraw.save();

      res.status(201).json({ message: 'withDraw details saved successfully', newwithDraw });
   }
   catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
   }
};

const getwithDraws = async (req, res) => {
   const filter = req.query.filter; // Get filter from query parameters
   let query = {};

   // Depending on the filter value, modify the query object to filter withDraws accordingly
   if (filter === 'pending') {
      query = { status: 'pending' };
   } else if (filter === 'success') {
      query = { status: 'success' };
   } else if (filter === 'failed') {
      query = { status: 'failed' };
   }

   try {
      // Fetch withDraws based on the constructed query
      const withDraws = await withDraw.find(query);
      res.status(200).json(withDraws);
      //console.log(withDraws)
   } catch (error) {
      console.error('Error fetching withDraws:', error);
      res.status(500).json({ error: 'Internal server error' });
   }
};

const updatewithDrawStatus = async (req, res) => {
   try {
      const { upiId, status } = req.body;

      // Check if the withDraw is already marked as 'success'
      const existingwithDraw = await withDraw.findOne({ upiId });
      if (existingwithDraw && existingwithDraw.status === 'success') {
         return res.status(400).json({ error: 'withDraw already processed' });
      }

      const updatedwithDraw = await withDraw.findOneAndUpdate({ upiId }, { status }, { new: true });
      let user;

      if (status === 'success') {
         const withDrawAmount = updatedwithDraw.withDrawAmount;

         //console.log ( "withDraw withDrawAmount :", withDrawAmount) 

         const userId = updatedwithDraw.userId;
         //console.log ( "userId  :", userId) 

         const user = await User.findOne({ _id: userId });
         //console.log ( "user  :", user) 

         if (!user) {
            return res.status(404).json({ error: 'User not found' });
         }

         // Update the user's withDrawAmount
         user.bankBalance -= withDrawAmount;
         console.log("updated withDrawAmount :", user.bankBalance)
         await user.save();
      }

      res.status(200).json({ message: 'withDraw status updated successfully', bankBalance: user ? user.bankBalance : null });
   } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
   }
};

module.exports = { saveWithDraw, getwithDraws, updatewithDrawStatus };
