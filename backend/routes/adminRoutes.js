const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const { Resend } = require('resend');

// Initialize Resend with your API Key
const resend = new Resend(process.env.RESEND_API_KEY);

// 1. Register New Account (Now sends HTTP approval email via Resend)
router.post('/register', async (req, res) => {
  try {
    const existing = await Admin.findOne({ email: req.body.email });
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    const newAdmin = new Admin(req.body);
    await newAdmin.save();

    // Send the 1-Click Approval Email via Resend
    try {
      const approveLink = `https://tt-academy-manager.onrender.com/api/admin/quick-approve/${newAdmin._id}`;

      await resend.emails.send({
        from: 'onboarding@resend.dev', // Resend's free testing sender address
        to: process.env.ADMIN_EMAIL,   // This must match your registered Resend email exactly
        subject: 'New Academy Registration Request',
        html: `
          <h3>New SaaS Registration Request</h3>
          <p><strong>Email:</strong> ${newAdmin.email}</p>
          <p><strong>Academy Name:</strong> ${newAdmin.academyName}</p>
          <br/>
          <a href="${approveLink}" style="padding: 12px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Approve This User
          </a>
        `
      });
    } catch (emailErr) {
      console.log("Email failed to send, but user registered:", emailErr);
    }

    res.status(201).json(newAdmin);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// 2. Login (Checks if user is approved)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ error: 'Account not found' });
    if (admin.password !== password) return res.status(401).json({ error: 'Incorrect password' });
    
    // THE DIGITAL BOUNCER
    if (!admin.isApproved) {
      return res.status(403).json({ error: 'Your account is pending admin approval.' });
    }
    
    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// 3. Reset Password 
router.post('/reset', async (req, res) => {
  const { contact, newPassword } = req.body; 
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

// 4. Update Academy Branding
router.put('/update-branding/:id', async (req, res) => {
  try {
    const { academyName, motto, logo } = req.body;
    
    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.params.id, 
      { academyName, motto, logo }, 
      { new: true } 
    );
    
    if (!updatedAdmin) return res.status(404).json({ message: "Admin not found" });
    
    res.json({ message: "Branding updated successfully!", data: updatedAdmin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. 1-Click Email Approval Route
router.get('/quick-approve/:id', async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).send("User not found.");

    admin.isApproved = true;
    await admin.save();
    
    // Redirects you to your live website once you click the email button
    res.redirect('https://ttacademymanager.vercel.app/'); 
  } catch (err) {
    res.status(500).send("Error approving user.");
  }
});

module.exports = router;