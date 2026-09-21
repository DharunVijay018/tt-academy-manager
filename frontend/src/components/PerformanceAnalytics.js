import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function PerformanceAnalytics() {
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);

  // Form State
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [winner, setWinner] = useState('');
  const [score, setScore] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchPlayers();
    fetchMatches();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await axios.get('[https://tt-academy-manager.onrender.com](https://tt-academy-manager.onrender.com)/api/players/all');
      setPlayers(response.data);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const fetchMatches = async () => {
    try {
      const response = await axios.get('[https://tt-academy-manager.onrender.com](https://tt-academy-manager.onrender.com)/api/matches/all');
      setMatches(response.data);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (player1 === player2) {
      alert("A player cannot play against themselves!");
      return;
    }
    if (winner !== player1 && winner !== player2) {
      alert("The winner must be either Player 1 or Player 2!");
      return;
    }

    try {
      await axios.post('[https://tt-academy-manager.onrender.com](https://tt-academy-manager.onrender.com)/api/matches/add', {
        player1, player2, winner, score, date
      });
      alert('Match recorded successfully!');
      
      // Reset some form fields
      setPlayer1('');
      setPlayer2('');
      setWinner('');
      setScore('');
      
      fetchMatches(); // Refresh data
    } catch (error) {
      console.error('Error recording match:', error);
      alert('Failed to record match.');
    }
  };

  // Calculate Leaderboard Data
  const getLeaderboard = () => {
    const stats = {};
    
    // Initialize stats for all players
    players.forEach(p => {
      stats[p._id] = { name: p.name, wins: 0, losses: 0, totalMatches: 0 };
    });

    // Tally wins and losses
    matches.forEach(m => {
      const p1Id = m.player1?._id;
      const p2Id = m.player2?._id;
      const wId = m.winner?._id;

      if (p1Id && stats[p1Id]) stats[p1Id].totalMatches += 1;
      if (p2Id && stats[p2Id]) stats[p2Id].totalMatches += 1;

      if (wId && stats[wId]) {
        stats[wId].wins += 1;
      }
      
      // Calculate losses
      if (wId === p1Id && p2Id && stats[p2Id]) stats[p2Id].losses += 1;
      if (wId === p2Id && p1Id && stats[p1Id]) stats[p1Id].losses += 1;
    });

    // Convert to array and calculate win percentage, then sort by wins
    return Object.values(stats)
      .filter(s => s.totalMatches > 0) // Only show players who have played
      .map(s => ({
        ...s,
        winRate: s.totalMatches > 0 ? Math.round((s.wins / s.totalMatches) * 100) : 0
      }))
      .sort((a, b) => b.wins - a.wins || b.winRate - a.winRate);
  };

  const leaderboard = getLeaderboard();

  return (
    <div className="space-y-8">
      
      {/* MATCH LOGGER FORM */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Log a Practice Match</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Player 1</label>
            <select required value={player1} onChange={(e) => setPlayer1(e.target.value)} className="w-full p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-yellow-500">
              <option value="" disabled>-- Select --</option>
              {players.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Player 2</label>
            <select required value={player2} onChange={(e) => setPlayer2(e.target.value)} className="w-full p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-yellow-500">
              <option value="" disabled>-- Select --</option>
              {players.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Winner</label>
            <select required value={winner} onChange={(e) => setWinner(e.target.value)} className="w-full p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-yellow-500">
              <option value="" disabled>-- Select Winner --</option>
              {player1 && <option value={player1}>{players.find(p => p._id === player1)?.name}</option>}
              {player2 && <option value={player2}>{players.find(p => p._id === player2)?.name}</option>}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Score (Optional)</label>
            <input type="text" placeholder="e.g., 11-8, 11-9" value={score} onChange={(e) => setScore(e.target.value)} className="w-full p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-yellow-500" />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
            <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-yellow-500" />
          </div>

          <div className="flex items-end">
            <button type="submit" className="w-full bg-yellow-500 text-gray-900 font-bold py-2.5 px-4 rounded hover:bg-yellow-600 transition-colors shadow-sm">
              Save Match Result
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEADERBOARD */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center justify-between">
            <span>Academy Leaderboard</span>
            <span className="text-2xl">🏆</span>
          </h3>
          {leaderboard.length === 0 ? (
            <p className="text-gray-500 italic">Play some matches to populate the leaderboard!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 text-sm">
                    <th className="p-3 border-b">Player</th>
                    <th className="p-3 border-b text-center">W - L</th>
                    <th className="p-3 border-b text-right">Win %</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((stat, index) => (
                    <tr key={stat.name} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 font-bold text-gray-900 flex items-center gap-2">
                        {index === 0 && <span className="text-yellow-500">🥇</span>}
                        {index === 1 && <span className="text-gray-400">🥈</span>}
                        {index === 2 && <span className="text-amber-600">🥉</span>}
                        {index > 2 && <span className="w-5 text-center text-gray-400 text-sm">{index + 1}</span>}
                        {stat.name}
                      </td>
                      <td className="p-3 text-center text-gray-600 font-medium">
                        <span className="text-green-600">{stat.wins}</span> - <span className="text-red-500">{stat.losses}</span>
                      </td>
                      <td className="p-3 text-right font-bold text-blue-600">{stat.winRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RECENT MATCHES */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Recent Matches</h3>
          {matches.length === 0 ? (
            <p className="text-gray-500 italic">No matches recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {matches.slice(0, 5).map(match => (
                <div key={match._id} className="p-3 border border-gray-100 bg-gray-50 rounded flex justify-between items-center">
                  <div className="flex-1 text-center">
                    <span className={`font-bold ${match.winner?._id === match.player1?._id ? 'text-green-600' : 'text-gray-700'}`}>
                      {match.player1?.name || 'Unknown'}
                    </span>
                    <span className="mx-2 text-gray-400 text-sm">vs</span>
                    <span className={`font-bold ${match.winner?._id === match.player2?._id ? 'text-green-600' : 'text-gray-700'}`}>
                      {match.player2?.name || 'Unknown'}
                    </span>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-xs text-gray-500">{match.date}</div>
                    <div className="text-sm font-medium text-gray-700">{match.score}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}