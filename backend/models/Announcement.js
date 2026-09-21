const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  adminId: { type: String, required: true }, // Locks notice board to your account
  title: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: String, required: true },
  image: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);