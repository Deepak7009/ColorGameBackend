const withDraw = require("../models/withdrawSchema");
const User = require("../models/userSchema");

const saveWithDraw = async (req, res) => {
  try {
    const { upiId, withDrawAmount, userId } = req.body;

    if (!upiId || !withDrawAmount || !userId) {
      return res
        .status(400)
        .json({ error: "UPI ID and withDrawAmount are required." });
    }

    const newWithDraw = new withDraw({ upiId, withDrawAmount, userId });
    await newWithDraw.save();

    res
      .status(201)
      .json({ message: "Withdraw details saved successfully", newWithDraw });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getWithDraws = async (req, res) => {
  const filter = req.query.filter; // Get filter from query parameters
  let query = {};

  // Depending on the filter value, modify the query object to filter withdrawals accordingly
  if (filter === "pending") {
    query = { status: "pending" };
  } else if (filter === "success") {
    query = { status: "success" };
  } else if (filter === "failed") {
    query = { status: "failed" };
  }

  try {
    // Fetch withdrawals based on the constructed query
    const withdrawals = await withDraw.find(query);
    res.status(200).json(withdrawals);
  } catch (error) {
    console.error("Error fetching withdrawals:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateWithDrawStatus = async (req, res) => {
  try {
    const { upiId, status } = req.body;

    // Update withdrawal status
    const updatedWithdraw = await withDraw.findOneAndUpdate(
      { upiId },
      { status },
      { new: true }
    );

    // If no withdrawal is found, return 404
    if (!updatedWithdraw) {
      return res.status(404).json({ error: "Withdrawal not found" });
    }

    // If the withdrawal is already marked as 'success', return 400
    if (updatedWithdraw.status === "success") {
      return res.status(400).json({ error: "Withdraw already processed" });
    }

    let user;

    // If status is 'success', update user's bank balance
    if (status === "success") {
      const withDrawAmount = updatedWithdraw.withDrawAmount;
      const userId = updatedWithdraw.userId;

      // Find the user
      user = await User.findOne({ _id: userId });

      // If user is not found, return 404
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Update the user's bank balance
      user.bankBalance -= withDrawAmount;
      console.log("Updated bank balance :", user.bankBalance);
      await user.save();
    }

    res.status(200).json({
      message: "Withdraw status updated successfully",
      bankBalance: user ? user.bankBalance : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { saveWithDraw, getWithDraws, updateWithDrawStatus };
