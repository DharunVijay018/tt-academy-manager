import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function PlayerManager() {
  const [players, setPlayers] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [feeAmount, setFeeAmount] = useState('');

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/players/all');
      setPlayers(response.data);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/players/add', { 
        name: name, 
        phone: phone,
        feeAmount: Number(feeAmount)
      });
      setName('');
      setPhone('');
      setFeeAmount('');
      fetchPlayers(); 
    } catch (error) {
      console.error('Error adding player:', error);
      alert('Failed to add player.');
    }
  };

  // New Delete Function
  const handleDeletePlayer = async (id) => {
    if (window.confirm('Are you sure you want to remove this player?')) {
      try {
        await axios.delete(`http://localhost:5000/api/players/${id}`);
        fetchPlayers(); // Refresh the list after deleting
      } catch (error) {
        console.error('Error deleting player:', error);
        alert('Failed to delete player.');
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Add Player Form */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 className="text-xl font-bold text-academyNavy mb-4">Add New Player</h3>
        <form onSubmit={handleAddPlayer} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Player Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input 
              type="text" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Fee Amount</label>
            <input 
              type="number" 
              value={feeAmount}
              onChange={(e) => setFeeAmount(e.target.value)}
              className="mt-1 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required 
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-yellow-500 text-white font-bold py-2 px-4 rounded hover:bg-yellow-600 transition-colors"
          >
            Save Player
          </button>
        </form>
      </div>

      {/* Player Roster */}
      <div>
        <h3 className="text-xl font-bold text-academyNavy mb-4">Academy Roster</h3>
        {players.length === 0 ? (
          <p className="text-gray-500 italic">No players registered yet.</p>
        ) : (
          <ul className="space-y-3">
            {players.map((player) => (
              <li key={player._id} className="p-4 bg-white border border-gray-200 rounded shadow-sm flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="font-bold text-gray-800">{player.name}</span>
                  <span className="text-sm text-gray-500">📞 {player.phone} | Fee: ₹{player.feeAmount}</span>
                </div>
                <button 
                  onClick={() => handleDeletePlayer(player._id)}
                  className="text-red-500 hover:text-red-700 font-bold px-3 py-1 rounded border border-red-200 hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}