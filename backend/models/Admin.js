const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true }, 
  academyName: { type: String, required: true },
  motto: { type: String, default: "Success is where preparation and opportunity meet." },
  logo: { type: String, default: "" },
  isApproved: { type: Boolean, default: false } // <-- The digital bouncer lock
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);