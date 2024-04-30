const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer')
const User = require('../models/userSchema');

const addUser = async (req, res) => {
    try {
        const { username, email, mobile, password } = req.body;

        const existingUsername = await User.findOne({ username });
        const existingEmail = await User.findOne({ email });

        if (existingUsername) {
            return res.status(400).json({ error: "Username already exists" });
        }

        if (existingEmail) {
            return res.status(400).json({ error: "Email already in use" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            mobile,
            password: hashedPassword,
        });

        await newUser.save();

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.my_mail,
                pass: process.env.email_pass,
            },
        });

        const mailOptions = {
            from: process.env.my_mail,
            to: email,
            subject: "Registration Successful",
            text: `Dear ${username},\n\nCongratulations! You have successfully registered.\n\nUsername: ${username}\nPassword: ${password}\n\nThank you.`,
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                res.status(500).json({ error: "Error sending email" });
            } else {
                console.log("Email sent: " + info.response);
                const token = jwt.sign({ username }, "secretkey");
                res.status(201).json({
                    message: "User registered successfully. Email sent!",
                    newUser,
                    token,
                });
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Incorrect password" });
        }

        const token = jwt.sign({ username: user.username, userId: user._id, mobile: user.mobile }, "secretkey");
        console.log(token);

        res.status(200).json({
            message: "Login successful",
            token,
            userId: user._id,
            mobile: user.mobile,
            bankBalance: user.bankBalance,
        });
        console.log("token : ", token)
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}


const getUserById = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const updateUserBankBalance = async (req, res) => {
   try {
      const { userId } = req.params;
      const { bankBalance } = req.body;

      const user = await User.findByIdAndUpdate(userId, { bankBalance }, { new: true });

      if (!user) {
         return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json({ message: "User's bank balance updated successfully", user });
   } catch (error) {
      console.error("Error updating user's bank balance:", error);
      res.status(500).json({ error: "Internal server error" });
   }
};


module.exports = { addUser, loginUser, getUserById, updateUserBankBalance };

