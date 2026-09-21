const mongoose = require('mongoose');

const leagueSchema = new mongoose.Schema({
  adminId: { type: String, required: true }, // Locks league to your account
  name: { type: String, required: true },
  tablesCount: { type: Number, default: 2 },
  players: [{ _id: String, name: String }],
  fixtures: [{
    id: Number,
    round: Number,
    player1: { _id: String, name: String },
    player2: { _id: String, name: String },
    winner: String,
    score: String,
    tableAssigned: Number,
    completed: { type: Boolean, default: false }
  }]
}, { timestamps: true });

module.exports = mongoose.model('League', leagueSchema);