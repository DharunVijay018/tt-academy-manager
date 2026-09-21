const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');

router.get('/all', async (req, res) => {
  try {
    const adminId = req.headers.adminid;
    if (!adminId) return res.status(401).json({ error: 'Unauthorized' });

    const payments = await Payment.find({ adminId }).populate('player', 'name feeAmount').sort({ createdAt: -1 });
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

router.post('/add', async (req, res) => {
  try {
    const adminId = req.headers.adminid;
    if (!adminId) return res.status(401).json({ error: 'Unauthorized' });

    const { player, amount, datePaid, monthCovered } = req.body;
    const newPayment = new Payment({ adminId, player, amount, datePaid, monthCovered });
    await newPayment.save();
    res.status(201).json({ message: 'Payment recorded successfully', payment: newPayment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record payment' });
  }
});

module.exports = router;