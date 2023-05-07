// run ONE TIME! I already ran this on 5/2
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
});

module.exports = mongoose.model('User', userSchema);
