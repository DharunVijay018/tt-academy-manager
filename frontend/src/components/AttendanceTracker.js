import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AttendanceTracker() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [players, setPlayers] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [analytics, setAnalytics] = useState([]);
  const [activeTab, setActiveTab] = useState('rollcall'); // 'rollcall' or 'analytics'

  useEffect(() => {
    fetchPlayers();
    fetchAnalytics();
  }, []);

  useEffect(() => {
    if (players.length > 0) {
      fetchAttendanceForDate(date);
    }
  }, [date, players]);

  const fetchPlayers = async () => {
    try {
      const response = await axios.get('https://tt-academy-manager.onrender.com/api/players/all');
      setPlayers(response.data);
      
      // Initialize default records
      const initialRecords = {};
      response.data.forEach(p => { initialRecords[p._id] = 'Present'; });
      setAttendanceRecords(initialRecords);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const fetchAttendanceForDate = async (selectedDate) => {
    try {
      const response = await axios.get(`https://tt-academy-manager.onrender.com/api/attendance/${selectedDate}`);
      if (response.data && response.data.records.length > 0) {
        const loadedRecords = {};
        response.data.records.forEach(record => {
          if (record.player) {
            loadedRecords[record.player._id] = record.status;
          }
        });
        
        // Merge with new players who might not have a record for this date yet
        const mergedRecords = { ...attendanceRecords };
        players.forEach(p => {
          mergedRecords[p._id] = loadedRecords[p._id] || 'Present';
        });
        setAttendanceRecords(mergedRecords);
      } else {
        // Reset to all Present if no data exists
        const defaultRecords = {};
        players.forEach(p => { defaultRecords[p._id] = 'Present'; });
        setAttendanceRecords(defaultRecords);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('https://tt-academy-manager.onrender.com/api/attendance/analytics/all');
      calculateStats(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const calculateStats = (allData) => {
    const stats = {};
    allData.forEach(day => {
      day.records.forEach(rec => {
        if (!rec.player) return;
        const pid = rec.player._id;
        if (!stats[pid]) stats[pid] = { name: rec.player.name, total: 0, present: 0, absent: 0, leave: 0 };
        
        stats[pid].total += 1;
        if (rec.status === 'Present') stats[pid].present += 1;
        if (rec.status === 'Absent') stats[pid].absent += 1;
        if (rec.status === 'Leave') stats[pid].leave += 1;
      });
    });

    const formattedStats = Object.values(stats).map(s => ({
      ...s,
      percentage: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0
    })).sort((a, b) => b.percentage - a.percentage);

    setAnalytics(formattedStats);
  };

  const handleStatusChange = (playerId, status) => {
    setAttendanceRecords({ ...attendanceRecords, [playerId]: status });
  };

  const saveAttendance = async () => {
    try {
      const recordsToSave = Object.keys(attendanceRecords).map(playerId => ({
        player: playerId,
        status: attendanceRecords[playerId]
      }));

      await axios.post('https://tt-academy-manager.onrender.com/api/attendance/save', { date, records: recordsToSave });
      alert(`Attendance for ${date} saved successfully!`);
      fetchAnalytics(); // Refresh stats
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Failed to save attendance.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Navigation */}
      <div className="flex gap-2 border-b border-gray-200 pb-4">
        <button 
          onClick={() => setActiveTab('rollcall')}
          className={`px-4 py-2 font-bold rounded text-sm transition-colors ${activeTab === 'rollcall' ? 'bg-yellow-500 text-gray-900 shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          📝 Daily Roll Call
        </button>
        <button 
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 font-bold rounded text-sm transition-colors ${activeTab === 'analytics' ? 'bg-yellow-500 text-gray-900 shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          📊 Player Analytics
        </button>
      </div>

      {/* ROLL CALL VIEW */}
      {activeTab === 'rollcall' && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h3 className="text-xl font-bold text-gray-800">Session Attendance</h3>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500 font-bold bg-gray-50" 
            />
          </div>

          {players.length === 0 ? (
            <p className="text-gray-500 italic">No players in roster. Add players first.</p>
          ) : (
            <div className="space-y-3 mb-6 max-h-[500px] overflow-y-auto pr-2">
              {players.map(player => (
                <div key={player._id} className="flex flex-col sm:flex-row justify-between items-center p-3 border rounded-lg bg-gray-50 hover:bg-white transition-colors">
                  <span className="font-bold text-gray-800 text-lg mb-2 sm:mb-0">{player.name}</span>
                  
                  <div className="flex bg-gray-200 rounded-lg p-1">
                    <button 
                      onClick={() => handleStatusChange(player._id, 'Present')}
                      className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${attendanceRecords[player._id] === 'Present' ? 'bg-green-500 text-white shadow' : 'text-gray-600 hover:bg-gray-300'}`}
                    >
                      Present
                    </button>
                    <button 
                      onClick={() => handleStatusChange(player._id, 'Absent')}
                      className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${attendanceRecords[player._id] === 'Absent' ? 'bg-red-500 text-white shadow' : 'text-gray-600 hover:bg-gray-300'}`}
                    >
                      Absent
                    </button>
                    <button 
                      onClick={() => handleStatusChange(player._id, 'Leave')}
                      className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${attendanceRecords[player._id] === 'Leave' ? 'bg-yellow-400 text-gray-900 shadow' : 'text-gray-600 hover:bg-gray-300'}`}
                    >
                      Leave
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button 
            onClick={saveAttendance}
            className="w-full bg-slate-800 text-white font-bold py-3 px-4 rounded hover:bg-slate-700 transition-colors shadow-sm"
          >
            Save Session Records
          </button>
        </div>
      )}

      {/* ANALYTICS VIEW */}
      {activeTab === 'analytics' && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Discipline & Attendance Stats</h3>
          
          <div className="overflow-x-auto border rounded">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-sm">
                  <th className="p-3 border-b">Player Name</th>
                  <th className="p-3 border-b text-center">Sessions Logged</th>
                  <th className="p-3 border-b text-center text-green-600">Present</th>
                  <th className="p-3 border-b text-center text-red-500">Absent</th>
                  <th className="p-3 border-b text-center text-yellow-600">Leave</th>
                  <th className="p-3 border-b text-right">Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {analytics.map((stat, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3 font-bold text-gray-900">{stat.name}</td>
                    <td className="p-3 text-center text-gray-600">{stat.total}</td>
                    <td className="p-3 text-center font-bold text-green-600">{stat.present}</td>
                    <td className="p-3 text-center font-bold text-red-500">{stat.absent}</td>
                    <td className="p-3 text-center font-bold text-yellow-600">{stat.leave}</td>
                    <td className={`p-3 text-right font-black text-lg ${stat.percentage < 50 ? 'text-red-500' : 'text-blue-600'}`}>
                      {stat.percentage}%
                    </td>
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