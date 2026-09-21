const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');

// 1. Register New Account
router.post('/register', async (req, res) => {
  try {
    const existing = await Admin.findOne({ email: req.body.email });
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    const newAdmin = new Admin(req.body);
    await newAdmin.save();
    res.status(201).json(newAdmin);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// 2. Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ error: 'Account not found' });
    if (admin.password !== password) return res.status(401).json({ error: 'Incorrect password' });
    
    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// 3. Reset Password (Simulated verification via matching email/phone)
router.post('/reset', async (req, res) => {
  const { contact, newPassword } = req.body; // contact can be email or phone
  try {
    const admin = await Admin.findOne({ $or: [{ email: contact }, { phone: contact }] });
    if (!admin) return res.status(404).json({ error: 'No account found with that Email/Phone.' });

    admin.password = newPassword;
    await admin.save();
    res.status(200).json({ message: 'Password reset successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

module.exports = router;