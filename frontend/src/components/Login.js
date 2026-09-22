import React, { useState } from 'react';
import axios from 'axios';

export default function Login({ onLogin }) {
  const [view, setView] = useState('login'); // 'login', 'register', 'forgot'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [academyName, setAcademyName] = useState('');
  const [motto, setMotto] = useState('');
  const [logo, setLogo] = useState('');
  const [contactInfo, setContactInfo] = useState(''); // For forgot password

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogo(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('https://tt-academy-manager.onrender.com/api/admin/login', { email, password });
      onLogin(response.data); // Pass full admin data to App.js
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post('https://tt-academy-manager.onrender.com/api/admin/register', {
        email, phone, password, academyName, motto, logo
      });
      
      // Prevent auto-login. Show success message and redirect to login page.
      setSuccess('Registration successful! Please wait for admin approval.');
      setView('login');
      
      // Clear sensitive form fields
      setPassword('');
      
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post('https://tt-academy-manager.onrender.com/api/admin/reset', {
        contact: contactInfo, newPassword: password
      });
      setSuccess('Password updated! Please log in.');
      setView('login');
      setPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border-t-4 border-yellow-500 space-y-6 max-h-[90vh] overflow-y-auto">
        
        <div className="text-center">
          <h1 className="text-2xl font-black tracking-tight text-gray-800">
            TT MANAGEMENT <span className="text-red-600">APP</span>
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            {view === 'login' && 'Admin Portal'}
            {view === 'register' && 'Create Academy Account'}
            {view === 'forgot' && 'Reset Password'}
          </p>
        </div>

        {error && <p className="text-red-500 text-sm font-bold text-center bg-red-50 p-2 rounded">{error}</p>}
        {success && <p className="text-green-600 text-sm font-bold text-center bg-green-50 p-2 rounded">{success}</p>}

        {/* LOGIN VIEW */}
        {view === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 pt-2">
            <input type="email" required placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border rounded focus:ring-2 focus:ring-yellow-500 bg-gray-50" />
            <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded focus:ring-2 focus:ring-yellow-500 bg-gray-50" />
            <button type="submit" className="w-full bg-yellow-500 text-gray-900 font-black py-3 rounded hover:bg-yellow-600 transition">LOGIN</button>
            <div className="flex justify-between text-sm font-bold text-gray-500 pt-2">
              <button type="button" onClick={() => { setView('forgot'); setError(''); setSuccess(''); }} className="hover:text-yellow-600">Forgot Password?</button>
              <button type="button" onClick={() => { setView('register'); setError(''); setSuccess(''); }} className="hover:text-yellow-600">Create Account</button>
            </div>
          </form>
        )}

        {/* REGISTER VIEW */}
        {view === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4 pt-2">
            <input type="text" required placeholder="Academy Name" value={academyName} onChange={(e) => setAcademyName(e.target.value)} className="w-full p-3 border rounded focus:ring-2 focus:ring-yellow-500 bg-gray-50" />
            <input type="text" placeholder="Academy Motto (Optional)" value={motto} onChange={(e) => setMotto(e.target.value)} className="w-full p-3 border rounded focus:ring-2 focus:ring-yellow-500 bg-gray-50" />
            
            <div className="border p-3 rounded bg-gray-50">
              <label className="block text-xs font-bold text-gray-500 mb-1">Upload Academy Logo (Optional)</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-sm" />
              {logo && <img src={logo} alt="Preview" className="h-12 mt-2 object-contain" />}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border rounded focus:ring-2 focus:ring-yellow-500 bg-gray-50" />
              <input type="text" required placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-3 border rounded focus:ring-2 focus:ring-yellow-500 bg-gray-50" />
            </div>
            
            <input type="password" required placeholder="Create Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded focus:ring-2 focus:ring-yellow-500 bg-gray-50" />
            
            <button type="submit" className="w-full bg-slate-800 text-white font-black py-3 rounded hover:bg-slate-700 transition">CREATE ACCOUNT</button>
            <div className="text-center text-sm font-bold text-gray-500 pt-2">
              <button type="button" onClick={() => { setView('login'); setError(''); setSuccess(''); }} className="hover:text-yellow-600">Back to Login</button>
            </div>
          </form>
        )}

        {/* FORGOT PASSWORD VIEW */}
        {view === 'forgot' && (
          <form onSubmit={handleReset} className="space-y-4 pt-2">
            <p className="text-xs text-gray-500 font-bold mb-2">Enter your registered Email OR Mobile number to set a new password.</p>
            <input type="text" required placeholder="Email or Mobile Number" value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} className="w-full p-3 border rounded focus:ring-2 focus:ring-yellow-500 bg-gray-50" />
            <input type="password" required placeholder="New Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded focus:ring-2 focus:ring-yellow-500 bg-gray-50" />
            
            <button type="submit" className="w-full bg-yellow-500 text-gray-900 font-black py-3 rounded hover:bg-yellow-600 transition">RESET PASSWORD</button>
            <div className="text-center text-sm font-bold text-gray-500 pt-2">
              <button type="button" onClick={() => { setView('login'); setError(''); setSuccess(''); }} className="hover:text-yellow-600">Cancel</button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}