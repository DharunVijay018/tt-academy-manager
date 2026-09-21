import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ClubLeague() {
  const [allLeagues, setAllLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState('schedule'); 
  
  // Setup State
  const [rosterPlayers, setRosterPlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [leagueName, setLeagueName] = useState('');
  const [tablesCount, setTablesCount] = useState(2);
  const [guestName, setGuestName] = useState('');

  useEffect(() => {
    fetchRoster();
    fetchAllLeagues();
  }, []);

  const fetchRoster = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/players/all');
      setRosterPlayers(response.data);
    } catch (error) {
      console.error('Error fetching roster:', error);
    }
  };

  const fetchAllLeagues = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/leagues/all');
      setAllLeagues(response.data);
    } catch (error) {
      console.error('Error fetching leagues:', error);
    }
  };

  const handleTogglePlayer = (player) => {
    const isSelected = selectedPlayers.some(p => p._id === player._id);
    if (isSelected) {
      setSelectedPlayers(selectedPlayers.filter(p => p._id !== player._id));
    } else {
      setSelectedPlayers([...selectedPlayers, { _id: player._id, name: player.name }]);
    }
  };

  const handleAddGuest = () => {
    if (!guestName.trim()) return;
    const newGuest = { _id: `guest-${Date.now()}`, name: `${guestName} (Guest)` };
    setSelectedPlayers([...selectedPlayers, newGuest]);
    setGuestName('');
  };

  const handleRemoveSelected = (id) => {
    setSelectedPlayers(selectedPlayers.filter(p => p._id !== id));
  };

  const createLeague = async () => {
    if (!leagueName.trim()) return alert("Please enter a League Name.");
    if (selectedPlayers.length < 2) return alert("You need at least 2 players!");

    let list = [...selectedPlayers];
    if (list.length % 2 !== 0) {
      list.push({ _id: 'bye', name: 'BYE' });
    }

    const totalRounds = list.length - 1;
    const halfSize = list.length / 2;
    let rounds = [];
    let matchIdCounter = 1;
    let currentState = [...list];

    for (let round = 0; round < totalRounds; round++) {
      let roundMatches = [];
      for (let i = 0; i < halfSize; i++) {
        let p1 = currentState[i];
        let p2 = currentState[list.length - 1 - i];

        if (p1._id !== 'bye' && p2._id !== 'bye') {
          roundMatches.push({
            id: matchIdCounter++,
            round: round + 1,
            player1: p1,
            player2: p2,
            winner: null,
            score: '',
            tableAssigned: (i % tablesCount) + 1,
            completed: false
          });
        }
      }
      rounds.push(...roundMatches);
      let temp = currentState.pop();
      currentState.splice(1, 0, temp);
    }

    try {
      const response = await axios.post('http://localhost:5000/api/leagues/add', {
        name: leagueName,
        tablesCount,
        players: selectedPlayers,
        fixtures: rounds
      });
      
      // Reset form and enter the new league
      setLeagueName('');
      setSelectedPlayers([]);
      setIsCreating(false);
      setSelectedLeague(response.data);
      setActiveTab('schedule');
      fetchAllLeagues(); // Refresh background list
      alert('League created & saved successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to save league.');
    }
  };

  const updateMatch = async (matchId, winnerId, scoreVal, isCompleted) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/leagues/${selectedLeague._id}/match`, {
        matchId: matchId,
        winner: winnerId,
        score: scoreVal,
        completed: isCompleted
      });
      setSelectedLeague(response.data);
      fetchAllLeagues(); // Keep master list synced
    } catch (error) {
      console.error(error);
      alert('Failed to update match.');
    }
  };

  const deleteLeague = async (id, e) => {
    if (e) e.stopPropagation(); // Prevent opening the league when clicking delete
    if (!window.confirm("Are you sure you want to permanently delete this league?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/leagues/${id}`);
      if (selectedLeague && selectedLeague._id === id) {
        setSelectedLeague(null);
      }
      fetchAllLeagues();
    } catch (error) {
      alert('Failed to delete league.');
    }
  };

  const getStandings = () => {
    if (!selectedLeague) return [];
    const stats = {};
    selectedLeague.players.forEach(p => {
      stats[p._id] = { id: p._id, name: p.name, played: 0, wins: 0, losses: 0, points: 0 };
    });

    selectedLeague.fixtures.forEach(m => {
      if (m.completed && m.winner) {
        let p1Id = m.player1._id;
        let p2Id = m.player2._id;
        let loserId = m.winner === p1Id ? p2Id : p1Id;

        if (stats[m.winner]) {
          stats[m.winner].played += 1;
          stats[m.winner].wins += 1;
          stats[m.winner].points += 2;
        }
        if (stats[loserId]) {
          stats[loserId].played += 1;
          stats[loserId].losses += 1;
        }
      }
    });
    return Object.values(stats).sort((a, b) => b.points - a.points || b.wins - a.wins);
  };

  return (
    <div className="space-y-6">
      
      {/* MASTER NAVIGATION */}
      <div className="flex gap-2 border-b border-gray-200 pb-4">
        {selectedLeague || isCreating ? (
          <button 
            onClick={() => { setSelectedLeague(null); setIsCreating(false); }}
            className="px-4 py-2 font-bold rounded text-sm bg-gray-800 text-white shadow hover:bg-gray-700"
          >
            🔙 Back to All Leagues
          </button>
        ) : (
          <button 
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 font-bold rounded text-sm bg-yellow-500 text-gray-900 shadow hover:bg-yellow-600"
          >
            ➕ Create New League
          </button>
        )}

        {selectedLeague && (
          <>
            <button 
              onClick={() => setActiveTab('schedule')}
              className={`px-4 py-2 font-bold rounded text-sm transition-colors ${activeTab === 'schedule' ? 'bg-yellow-500 text-gray-900 shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              📅 Fixtures & Schedules
            </button>
            <button 
              onClick={() => setActiveTab('standings')}
              className={`px-4 py-2 font-bold rounded text-sm transition-colors ${activeTab === 'standings' ? 'bg-yellow-500 text-gray-900 shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              🏆 Live Standings
            </button>
          </>
        )}
      </div>

      {/* VIEW 1: LEAGUE DASHBOARD (LIST ALL LEAGUES) */}
      {!selectedLeague && !isCreating && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
          <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Active & Saved Leagues</h3>
          
          {allLeagues.length === 0 ? (
            <p className="text-gray-500 italic">You have no active leagues. Create one to get started!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allLeagues.map(league => {
                const totalMatches = league.fixtures.length;
                const completedMatches = league.fixtures.filter(f => f.completed).length;
                const progress = totalMatches === 0 ? 0 : Math.round((completedMatches / totalMatches) * 100);

                return (
                  <div 
                    key={league._id} 
                    onClick={() => { setSelectedLeague(league); setActiveTab('schedule'); }}
                    className="border border-gray-200 rounded-lg p-5 cursor-pointer hover:shadow-md transition-shadow bg-gray-50 hover:bg-white relative group"
                  >
                    <h4 className="text-lg font-black text-gray-900 mb-2 pr-8">{league.name}</h4>
                    <p className="text-sm text-gray-600 mb-4 font-medium">👥 {league.players.length} Players Competing</p>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                      <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="text-xs text-right text-gray-500 font-bold">{progress}% Completed</p>

                    <button 
                      onClick={(e) => deleteLeague(league._id, e)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete League"
                    >
                      🗑️
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: ADD NEW LEAGUE (SETUP) */}
      {isCreating && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
          <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Configure New League</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b pb-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">League Name</label>
              <input 
                type="text" 
                placeholder="e.g., Summer Open 2026"
                value={leagueName} 
                onChange={(e) => setLeagueName(e.target.value)} 
                className="w-full p-3 border rounded bg-gray-50 focus:ring-2 focus:ring-yellow-500 font-bold" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Tables Available</label>
              <input 
                type="number" 
                min="1" 
                value={tablesCount} 
                onChange={(e) => setTablesCount(parseInt(e.target.value) || 1)} 
                className="w-full p-3 border rounded bg-gray-50 focus:ring-2 focus:ring-yellow-500 font-bold" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold text-gray-800 mb-3">1. Select Club Members</h4>
              <div className="max-h-60 overflow-y-auto border rounded p-3 bg-gray-50 space-y-2">
                {rosterPlayers.map(p => (
                  <label key={p._id} className="flex items-center cursor-pointer hover:bg-gray-200 p-2 rounded transition">
                    <input 
                      type="checkbox" 
                      checked={selectedPlayers.some(sp => sp._id === p._id)}
                      onChange={() => handleTogglePlayer(p)}
                      className="w-4 h-4 text-yellow-500 rounded focus:ring-yellow-500 mr-3"
                    />
                    <span className="text-gray-800 font-medium">{p.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 mb-3">2. Add External Guests</h4>
              <div className="flex gap-2 mb-4">
                <input 
                  type="text" 
                  placeholder="Guest Name..."
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="flex-1 p-2 border rounded text-sm focus:ring-2 focus:ring-yellow-500"
                />
                <button onClick={handleAddGuest} className="bg-gray-800 text-white px-4 py-2 rounded text-sm font-bold hover:bg-gray-700">Add Guest</button>
              </div>

              <h4 className="font-bold text-gray-800 mb-2">Final Player List ({selectedPlayers.length})</h4>
              <div className="flex flex-wrap gap-2">
                {selectedPlayers.map(p => (
                  <div key={p._id} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                    {p.name}
                    <button onClick={() => handleRemoveSelected(p._id)} className="text-red-500 hover:text-red-700">✖</button>
                  </div>
                ))}
                {selectedPlayers.length === 0 && <span className="text-sm text-gray-500 italic">No players selected yet.</span>}
              </div>
            </div>
          </div>

          <button 
            onClick={createLeague}
            className="w-full bg-yellow-500 text-gray-900 font-bold py-3 px-4 rounded hover:bg-yellow-600 transition-colors shadow-sm text-lg mt-4"
          >
            Create & Save League
          </button>
        </div>
      )}

      {/* VIEW 3A: SCHEDULE & FIXTURES FOR SELECTED LEAGUE */}
      {selectedLeague && activeTab === 'schedule' && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
          <div className="flex justify-between items-end border-b pb-4">
            <div>
              <h3 className="text-2xl font-black text-gray-800">{selectedLeague.name}</h3>
              <p className="text-sm text-gray-500">Match Schedules & Results Entry</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {selectedLeague.fixtures.map(match => (
              <div key={match.id} className={`p-4 border rounded-lg flex flex-col xl:flex-row justify-between items-center gap-4 ${match.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                
                <div className="flex items-center gap-4 w-full xl:w-auto">
                  <span className="px-3 py-1 bg-slate-800 text-yellow-400 font-bold text-xs rounded whitespace-nowrap">
                    Table {match.tableAssigned}
                  </span>
                  <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">Round {match.round}</span>
                </div>

                <div className="flex items-center gap-3 flex-1 justify-center w-full">
                  <span className={`font-bold text-right flex-1 ${match.winner === match.player1._id ? 'text-green-600' : 'text-gray-800'}`}>
                    {match.player1.name} {match.winner === match.player1._id && '👑'}
                  </span>
                  <span className="text-gray-400 text-sm px-2">vs</span>
                  <span className={`font-bold text-left flex-1 ${match.winner === match.player2._id ? 'text-green-600' : 'text-gray-800'}`}>
                    {match.winner === match.player2._id && '👑 '} {match.player2.name}
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full xl:w-auto justify-end">
                  {match.completed ? (
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-green-700">
                        Score: {match.score || 'N/A'}
                      </span>
                      <button 
                        onClick={() => updateMatch(match.id, null, '', false)}
                        className="bg-gray-200 text-gray-700 font-bold px-3 py-1.5 rounded text-xs hover:bg-gray-300"
                      >
                        Redo Result
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <select id={`winner-${match.id}`} className="p-1.5 border rounded text-xs bg-white">
                        <option value="">Winner...</option>
                        <option value={match.player1._id}>{match.player1.name}</option>
                        <option value={match.player2._id}>{match.player2.name}</option>
                      </select>
                      <input 
                        type="text" 
                        id={`score-${match.id}`}
                        placeholder="Score" 
                        className="p-1.5 border rounded text-xs w-20 bg-white"
                      />
                      <button 
                        onClick={() => {
                          const winnerId = document.getElementById(`winner-${match.id}`).value;
                          const scoreVal = document.getElementById(`score-${match.id}`).value;
                          if (!winnerId) return alert("Select a winner.");
                          updateMatch(match.id, winnerId, scoreVal, true);
                        }}
                        className="bg-yellow-500 text-gray-900 font-bold px-3 py-1.5 rounded text-xs hover:bg-yellow-600"
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3B: STANDINGS FOR SELECTED LEAGUE */}
      {selectedLeague && activeTab === 'standings' && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
          <h3 className="text-xl font-bold text-gray-800 border-b pb-2">{selectedLeague.name} Standings</h3>
          <div className="overflow-x-auto border rounded">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-sm">
                  <th className="p-3 border-b">Rank</th>
                  <th className="p-3 border-b">Player Name</th>
                  <th className="p-3 border-b text-center">Played</th>
                  <th className="p-3 border-b text-center">Won</th>
                  <th className="p-3 border-b text-center">Lost</th>
                  <th className="p-3 border-b text-right">Points</th>
                </tr>
              </thead>
              <tbody>
                {getStandings().map((row, index) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3 font-bold text-gray-800">
                      {index === 0 && <span className="text-yellow-500">🥇 </span>}
                      {index === 1 && <span className="text-gray-400">🥈 </span>}
                      {index === 2 && <span className="text-amber-600">🥉 </span>}
                      {index + 1}
                    </td>
                    <td className="p-3 font-bold text-gray-900">{row.name}</td>
                    <td className="p-3 text-center text-gray-600">{row.played}</td>
                    <td className="p-3 text-center text-green-600 font-bold">{row.wins}</td>
                    <td className="p-3 text-center text-red-500 font-bold">{row.losses}</td>
                    <td className="p-3 text-right font-black text-blue-600 text-lg">{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}