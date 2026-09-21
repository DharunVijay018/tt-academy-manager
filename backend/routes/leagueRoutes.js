const express = require('express');
const router = express.Router();
const League = require('../models/League');

router.get('/all', async (req, res) => {
  try {
    const adminId = req.headers.adminid;
    const leagues = await League.find({ adminId }).sort({ createdAt: -1 });
    res.status(200).json(leagues);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leagues' });
  }
});

router.post('/add', async (req, res) => {
  try {
    const adminId = req.headers.adminid;
    const newLeague = new League({ ...req.body, adminId });
    await newLeague.save();
    res.status(201).json(newLeague);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create league' });
  }
});

router.put('/:leagueId/match', async (req, res) => {
  const { matchId, winner, score, completed } = req.body;
  try {
    const league = await League.findOne({ _id: req.params.leagueId, adminId: req.headers.adminid });
    if (!league) return res.status(404).json({ error: 'League not found' });

    const matchIndex = league.fixtures.findIndex(m => m.id === matchId);
    if (matchIndex !== -1) {
      league.fixtures[matchIndex].winner = winner;
      league.fixtures[matchIndex].score = score;
      league.fixtures[matchIndex].completed = completed;
      await league.save();
    }
    res.status(200).json(league);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update match' });
  }
});

router.delete('/:leagueId', async (req, res) => {
  try {
    await League.findOneAndDelete({ _id: req.params.leagueId, adminId: req.headers.adminid });
    res.status(200).json({ message: 'League deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete league' });
  }
});

module.exports = router;