const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,

});

const User = mongoose.model('user', productSchema);

module.exports = { User };
f