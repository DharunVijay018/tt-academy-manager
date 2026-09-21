const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');

router.get('/:date', async (req, res) => {
  try {
    const adminId = req.headers.adminid;
    const attendance = await Attendance.findOne({ adminId, date: req.params.date }).populate('records.player', 'name');
    res.status(200).json(attendance || { records: [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

router.get('/analytics/all', async (req, res) => {
  try {
    const adminId = req.headers.adminid;
    // Fetch all attendance records for this academy to calculate stats
    const allRecords = await Attendance.find({ adminId }).populate('records.player', 'name');
    res.status(200).json(allRecords);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

router.post('/save', async (req, res) => {
  try {
    const adminId = req.headers.adminid;
    const { date, records } = req.body;
    let attendance = await Attendance.findOne({ adminId, date });
    
    if (attendance) {
      attendance.records = records;
    } else {
      attendance = new Attendance({ adminId, date, records });
    }
    
    await attendance.save();
    res.status(200).json({ message: 'Attendance saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save attendance' });
  }
});

module.exports = router;