import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import PlayerManager from './components/PlayerManager';
import AttendanceTracker from './components/AttendanceTracker';
import FeeManager from './components/FeeManager';
import ClubLeague from './components/ClubLeague';
import Announcements from './components/Announcements';
import Settings from './components/Settings'; // <-- NEW IMPORT
import Login from './components/Login';

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [activeTab, setActiveTab] = useState('home'); 
  
  const [admin, setAdmin] = useState(JSON.parse(localStorage.getItem('adminData')) || null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (admin) {
      axios.defaults.headers.common['adminid'] = admin._id;
    }
  }, [admin]);

  useEffect(() => {
    if (videoRef.current && showIntro) {
      videoRef.current.play().catch((err) => {
        console.log("Autoplay blocked, needs interaction", err);
      });
    }
  }, [showIntro]);

  const handleLogin = (adminData) => {
    setAdmin(adminData);
    localStorage.setItem('adminData', JSON.stringify(adminData));
    axios.defaults.headers.common['adminid'] = adminData._id;
  };

  const handleLogout = () => {
    setAdmin(null);
    localStorage.removeItem('adminData');
    delete axios.defaults.headers.common['adminid'];
    setActiveTab('home');
  };

  if (showIntro) {
    return (
      <div className="fixed inset-0 w-screen h-screen bg-white z-50 flex items-center justify-center overflow-hidden">
        <video 
          ref={videoRef}
          className="w-full h-full object-cover" 
          autoPlay muted playsInline 
          onEnded={() => setShowIntro(false)} 
        >
          <source src="/intro-video.mp4" type="video/mp4" />
        </video>
        <button 
          onClick={() => setShowIntro(false)} 
          className="absolute top-8 right-8 bg-yellow-500 text-black font-black text-sm px-6 py-2.5 rounded shadow-xl tracking-widest hover:bg-yellow-400 transition-colors z-50"
        >
          SKIP
        </button>
      </div>
    );
  }

  if (!admin) {
    return <Login onLogin={handleLogin} />;
  }

  const appLogo = admin.logo || "/Gemini_Generated_Image_dzzau5dzzau5dzza.png";
  const appName = admin.academyName || "TT Academy";
  const appMotto = admin.motto || "Success is where preparation and opportunity meet.";

  const menuItems = [
    { id: 'home', label: 'Home Dashboard', icon: '🏠' },
    { id: 'players', label: 'Player Records', icon: '👥' },
    { id: 'attendance', label: 'Attendance Tracker', icon: '📅' },
    { id: 'fees', label: 'Finance & Revenue', icon: '💳' }, 
    { id: 'league', label: 'Club League', icon: '🏓' }, 
    { id: 'announcements', label: 'Post Announcements', icon: '📢' },
    { id: 'settings', label: 'Edit Branding', icon: '⚙️' }, // <-- NEW MENU ITEM
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <aside className="w-72 bg-gray-100 flex flex-col border-r border-gray-200 z-10">
        <div className="p-6 flex items-center gap-4 cursor-pointer hover:bg-gray-200 transition-colors">
          {admin.logo ? (
            <img src={admin.logo} alt="Logo" className="w-12 h-12 rounded-full object-cover shadow-sm bg-white" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold text-xl shadow-sm">
              {appName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 truncate">
            <h2 className="text-sm font-bold text-gray-900 leading-tight">Admin</h2>
            <p className="text-xs text-gray-500 truncate">{appName}</p>
          </div>
          <button onClick={handleLogout} className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 px-2 py-1 rounded">
            Logout
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 font-medium transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-white text-gray-900 border-r-4 border-yellow-500 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-xl text-yellow-500">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto relative bg-gray-50 flex flex-col">
        <header className="bg-white px-8 py-4 flex items-center justify-between shadow-sm border-b border-gray-200 z-10">
            <div className="flex items-center gap-3">
                <img src={appLogo} alt="Academy Logo" className="h-10 w-10 object-contain rounded" />
                <h1 className="text-xl font-black tracking-tight text-gray-800 uppercase">
                    {appName} <span className="text-red-600">MANAGER</span>
                </h1>
            </div>
        </header>

        <div className="p-8 flex-1 relative">
            {activeTab === 'home' && (
            <div className="h-full flex flex-col items-center justify-center relative -mt-10">
                <img 
                  src={appLogo} 
                  alt="Academy Watermark" 
                  className="absolute w-[30rem] h-[30rem] object-contain opacity-5 pointer-events-none"
                />
                <div className="z-10 text-center space-y-6 max-w-2xl bg-white/60 p-10 rounded-2xl backdrop-blur-sm shadow-xl border border-white">
                  <h2 className="text-5xl font-black text-slate-900 tracking-tight uppercase">
                      {appName}
                  </h2>
                  <div className="w-24 h-1 bg-yellow-500 mx-auto rounded-full"></div>
                  <p className="text-2xl text-slate-700 font-light italic leading-relaxed">
                      "{appMotto}"
                  </p>
                </div>
            </div>
            )}

            {activeTab === 'players' && (
            <div className="bg-[#1e2340] rounded-xl shadow-2xl border border-yellow-500/30 overflow-hidden">
                <div className="bg-[#151930] p-6 border-b border-yellow-500/20">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3"><span className="text-yellow-500">👥</span> Player Records Dashboard</h2>
                </div>
                <div className="p-6 text-gray-800 bg-gray-50"><PlayerManager /></div>
            </div>
            )}

            {activeTab === 'attendance' && (
            <div className="bg-[#1e2340] rounded-xl shadow-2xl border border-yellow-500/30 overflow-hidden">
                <div className="bg-[#151930] p-6 border-b border-yellow-500/20">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3"><span className="text-yellow-500">📅</span> Session & Analytics Tracker</h2>
                </div>
                <div className="p-6 text-gray-800 bg-gray-50"><AttendanceTracker /></div>
            </div>
            )}

            {activeTab === 'fees' && (
            <div className="bg-[#1e2340] rounded-xl shadow-2xl border border-yellow-500/30 overflow-hidden">
                <div className="bg-[#151930] p-6 border-b border-yellow-500/20">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3"><span className="text-yellow-500">💳</span> Finance & Revenue Dashboard</h2>
                </div>
                <div className="p-6 text-gray-800 bg-gray-50"><FeeManager /></div>
            </div>
            )}

            {activeTab === 'league' && (
            <div className="bg-[#1e2340] rounded-xl shadow-2xl border border-yellow-500/30 overflow-hidden">
                <div className="bg-[#151930] p-6 border-b border-yellow-500/20">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3"><span className="text-yellow-500">🏓</span> Club League</h2>
                </div>
                <div className="p-6 text-gray-800 bg-gray-50"><ClubLeague /></div>
            </div>
            )}

            {activeTab === 'announcements' && (
            <div className="bg-[#1e2340] rounded-xl shadow-2xl border border-yellow-500/30 overflow-hidden">
                <div className="bg-[#151930] p-6 border-b border-yellow-500/20">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3"><span className="text-yellow-500">📢</span> Academy Announcements</h2>
                </div>
                <div className="p-6 text-gray-800 bg-gray-50"><Announcements /></div>
            </div>
            )}

            {/* NEW SETTINGS TAB */}
            {activeTab === 'settings' && (
            <div className="bg-[#1e2340] rounded-xl shadow-2xl border border-yellow-500/30 overflow-hidden">
                <div className="bg-[#151930] p-6 border-b border-yellow-500/20">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3"><span className="text-yellow-500">⚙️</span> Edit Academy Branding</h2>
                </div>
                <div className="p-6 text-gray-800 bg-gray-50"><Settings /></div>
            </div>
            )}

        </div>
      </main>
    </div>
  );
}

export default App;