const mongoose = require('mongoose');

const HolidaySchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String, required: true },
  description: String
});

module.exports = mongoose.model('Holiday', HolidaySchema);