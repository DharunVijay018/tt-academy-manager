import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [image, setImage] = useState(''); // Stores the uploaded image

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get('[https://tt-academy-manager.onrender.com](https://tt-academy-manager.onrender.com)/api/announcements/all');
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  // Convert uploaded image to a storable format (Base64 string)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result); // Saves the image preview
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    try {
      await axios.post('[https://tt-academy-manager.onrender.com](https://tt-academy-manager.onrender.com)/api/announcements/add', {
        title, message, date, image
      });
      // Reset form
      setTitle('');
      setMessage('');
      setImage('');
      // Refresh list
      fetchAnnouncements();
      alert('Announcement posted to Notice Board!');
    } catch (error) {
      console.error('Error posting announcement:', error);
      alert('Failed to post announcement.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await axios.delete(`[https://tt-academy-manager.onrender.com](https://tt-academy-manager.onrender.com)/api/announcements/${id}`);
      fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      alert('Failed to delete announcement.');
    }
  };

  const shareToWhatsApp = (title, message) => {
    const text = `*${title}*\n\n${message}\n\n_Shared from TT Management App_`;
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* 1. DRAFTING FORM */}
      <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-fit">
        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Create Announcement</h3>
        <form onSubmit={handlePost} className="space-y-4">
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Title / Headline</label>
            <input 
              type="text" 
              required 
              placeholder="e.g., Weekend Tournament!"
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="w-full p-2 border rounded focus:ring-2 focus:ring-yellow-500 bg-gray-50" 
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Message Details</label>
            <textarea 
              required 
              rows="4"
              placeholder="Type your message here..."
              value={message} 
              onChange={(e) => setMessage(e.target.value)} 
              className="w-full p-2 border rounded focus:ring-2 focus:ring-yellow-500 bg-gray-50 resize-none" 
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Attach Poster/Image (Optional)</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleImageUpload} 
              className="w-full p-2 border rounded text-sm bg-gray-50 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100" 
            />
            {image && (
              <div className="mt-2 relative">
                <img src={image} alt="Preview" className="w-full h-32 object-cover rounded border" />
                <button 
                  type="button" 
                  onClick={() => setImage('')}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow hover:bg-red-600"
                >
                  X
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
            <input 
              type="date" 
              required 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              className="w-full p-2 border rounded focus:ring-2 focus:ring-yellow-500 bg-gray-50" 
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-yellow-500 text-gray-900 font-bold py-3 px-4 rounded hover:bg-yellow-600 transition-colors shadow-sm"
          >
            Save to Notice Board
          </button>
        </form>
      </div>

      {/* 2. NOTICE BOARD HISTORY */}
      <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
          <span>Academy Notice Board</span> 📌
        </h3>
        
        {announcements.length === 0 ? (
          <p className="text-gray-500 italic text-center py-8">No announcements posted yet.</p>
        ) : (
          <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
            {announcements.map((ann) => (
              <div key={ann._id} className="border border-gray-200 rounded-lg p-5 bg-gray-50 hover:bg-white transition-colors shadow-sm">
                
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-xl font-black text-gray-900">{ann.title}</h4>
                  <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-1 rounded">{ann.date}</span>
                </div>
                
                {/* Poster Image Display */}
                {ann.image && (
                  <img src={ann.image} alt="Announcement Poster" className="w-full max-h-64 object-cover rounded-md mb-4 border shadow-sm" />
                )}

                <p className="text-gray-700 whitespace-pre-wrap mb-4">{ann.message}</p>
                
                <div className="flex justify-between items-center border-t pt-4">
                  <button 
                    onClick={() => handleDelete(ann._id)}
                    className="text-red-500 hover:text-red-700 font-bold text-sm px-3 py-1.5 rounded hover:bg-red-50 transition-colors"
                  >
                    🗑️ Delete Post
                  </button>
                  <button 
                    onClick={() => shareToWhatsApp(ann.title, ann.message)}
                    className="flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded font-bold text-sm hover:bg-[#20b858] transition-colors shadow-sm"
                  >
                    <span className="text-lg">💬</span> Share to WhatsApp
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}