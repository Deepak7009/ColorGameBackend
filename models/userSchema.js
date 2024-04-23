const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  email:String,
  mobile:Number,
  password:String,
  bankBalance: {
    type: Number,
    default: '0'
 },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
