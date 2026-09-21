const express = require('express');
const router = express.Router();
const Player = require('../models/Player');

// Route 1: Add a new player (saves with your adminId)
router.post('/add', async (req, res) => {
  try {
    const adminId = req.headers.adminid; // Grab your ID from the secure header
    if (!adminId) return res.status(401).json({ error: 'Unauthorized' });

    const { name, phone, feeAmount } = req.body;
    const newPlayer = new Player({ adminId, name, phone, feeAmount });
    await newPlayer.save();
    res.status(201).json({ message: 'Player added successfully!', player: newPlayer });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add player' });
  }
});

// Route 2: Get all players (only fetches YOUR players)
router.get('/all', async (req, res) => {
  try {
    const adminId = req.headers.adminid;
    if (!adminId) return res.status(401).json({ error: 'Unauthorized' });

    const players = await Player.find({ adminId }); // Filters by your ID
    res.status(200).json(players);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

// Route 3: Delete a player
router.delete('/:id', async (req, res) => {
  try {
    await Player.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Player deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete player' });
  }
});

module.exports = router;