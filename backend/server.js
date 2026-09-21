const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Connect Database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected! 🚀'))
  .catch(err => console.log('DB Connection Error: ', err));

app.get('/', (req, res) => res.send('DHARUN API V2 IS RUNNING!'));

// Link the API routes
app.use('/api/players', require('./routes/playerRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/matches', require('./routes/matchRoutes'));
app.use('/api/leagues', require('./routes/leagueRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));