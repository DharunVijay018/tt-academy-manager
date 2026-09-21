const express = require('express');
const router = express.Router();
const Match = require('../models/Match');

// Route 1: Get all matches (with player names attached)
router.get('/all', async (req, res) => {
  try {
    const matches = await Match.find()
      .populate('player1', 'name')
      .populate('player2', 'name')
      .populate('winner', 'name')
      .sort({ createdAt: -1 }); // Newest matches first
    res.status(200).json(matches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

// Route 2: Record a new match
router.post('/add', async (req, res) => {
  const { player1, player2, winner, score, date } = req.body;
  
  try {
    // Basic validation to ensure player1 and player2 aren't the same person
    if (player1 === player2) {
      return res.status(400).json({ error: 'A player cannot play against themselves.' });
    }

    const newMatch = new Match({ player1, player2, winner, score, date });
    await newMatch.save();
    res.status(201).json({ message: 'Match recorded successfully', match: newMatch });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to record match' });
  }
});

module.exports = router;