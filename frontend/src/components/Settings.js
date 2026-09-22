import React, { useState } from 'react';
import axios from 'axios';

export default function Settings({ adminId, currentName, currentMotto, currentLogo }) {
  const [academyName, setAcademyName] = useState(currentName || '');
  const [motto, setMotto] = useState(currentMotto || '');
  const [logo, setLogo] = useState(currentLogo || '');
  const [message, setMessage] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('Updating...');
    
    try {
      // Send the new data to the backend route we just created
      await axios.put(`https://tt-academy-manager.onrender.com/api/admins/update-branding/${adminId}`, {
        academyName,
        motto,
        logo
      });
      
      setMessage('Settings updated successfully! Refresh to see changes.');
      
      // Instantly updates the browser tab name!
      document.title = academyName; 
    } catch (err) {
      setMessage('Failed to update settings.');
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded shadow mt-10">
      <h2 className="text-2xl font-bold mb-6">Academy Settings</h2>
      
      {message && <p className="mb-4 text-sm font-semibold text-blue-600">{message}</p>}
      
      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Academy Name</label>
          <input 
            type="text" 
            value={academyName} 
            onChange={(e) => setAcademyName(e.target.value)} 
            className="w-full border rounded p-2"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Academy Motto</label>
          <input 
            type="text" 
            value={motto} 
            onChange={(e) => setMotto(e.target.value)} 
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Logo Image URL</label>
          <input 
            type="text" 
            value={logo} 
            onChange={(e) => setLogo(e.target.value)} 
            placeholder="https://example.com/my-logo.png"
            className="w-full border rounded p-2"
          />
          <p className="text-xs text-gray-500 mt-1">Paste a direct link to an image (e.g., from Imgur or Google Drive).</p>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700">
          Save Changes
        </button>
      </form>
    </div>
  );
}