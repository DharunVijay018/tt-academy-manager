const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  academyName: { type: String, default: "My Table Tennis Academy" },
  logoUrl: { type: String, default: "/images/logo.png" }
});

module.exports = mongoose.model('User', UserSchema);