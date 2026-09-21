const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  player1: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Player', 
    required: true 
  },
  player2: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Player', 
    required: true 
  },
  winner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Player', 
    required: true 
  },
  score: { 
    type: String, // e.g., "11-8, 11-9"
    default: ""
  },
  date: { 
    type: String, 
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Match', matchSchema);