const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  adminId: { type: String, required: true }, // NEW: Locks the player to your account
  name: { type: String, required: true },
  phone: { type: String, required: true },
  feeAmount: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Player', playerSchema);