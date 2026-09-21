const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  adminId: { type: String, required: true }, // Locks payment to your account
  player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  amount: { type: Number, required: true },
  datePaid: { type: String, required: true },
  monthCovered: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);