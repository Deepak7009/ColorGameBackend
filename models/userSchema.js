const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  email:String,
  mobile:Number,
  password:String
});

const User = mongoose.model('user', userSchema);

module.exports = { User };
