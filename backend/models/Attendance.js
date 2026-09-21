const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  adminId: { type: String, required: true }, // Data Isolation
  date: { type: String, required: true },
  records: [{
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    status: { type: String, enum: ['Present', 'Absent', 'Leave'], default: 'Present' }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);