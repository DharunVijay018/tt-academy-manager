const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');

router.get('/all', async (req, res) => {
  try {
    const adminId = req.headers.adminid;
    const announcements = await Announcement.find({ adminId }).sort({ createdAt: -1 });
    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

router.post('/add', async (req, res) => {
  try {
    const adminId = req.headers.adminid;
    const newAnnouncement = new Announcement({ ...req.body, adminId });
    await newAnnouncement.save();
    res.status(201).json(newAnnouncement);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create announcement' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Announcement.findOneAndDelete({ _id: req.params.id, adminId: req.headers.adminid });
    res.status(200).json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
});

module.exports = router;