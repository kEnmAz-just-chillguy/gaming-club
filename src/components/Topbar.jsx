import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, Sun, Moon, LogOut, RefreshCw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const titles = {
  '/': { title: 'Dashboard', sub: 'Live overview of every gaming room in the club.' },
  '/rooms': { title: 'Rooms', sub: 'Monitor and manage all gaming rooms.' },
  '/statistics': { title: 'Statistics', sub: 'Detailed performance analytics and insights.' },
  '/employees': { title: 'Employees', sub: 'Manage your staff and shifts.' },
  '/spending': { title: 'Spending', sub: 'Track expenses and budget allocation.' },
  '/bars': { title: 'Bars', sub: 'Manage bar menu, stock and sales.' },
  '/history': { title: 'History', sub: 'Full log of sessions, purchases and events.' },
  '/appearance': { title: 'Appearance', sub: 'Customize the look and feel of your panel.' },
  '/settings': { title: 'Settings', sub: 'Configure club settings and preferences.' },
};

export default function Topbar() {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  
  const info = titles[location.pathname]
    || (location.pathname.startsWith('/room/') ? { title: 'Room Detail', sub: 'Full room info, session history and bar orders.' } : titles['/']);

  const confirmLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="topbar">
        <div className="topbar-title">
          <h2>{info.title}</h2>
          <p>{info.sub}</p>
        </div>

        <div className="search-bar">
          <Search size={14} color="var(--text-muted)" />
          <input placeholder="Search anything..." />
        </div>

        <div className="topbar-actions">
          <button className="topbar-btn" title="Refresh" onClick={() => window.location.reload()}>
            <RefreshCw size={15} />
          </button>
          <button className="topbar-btn" title="Toggle theme" onClick={toggleTheme}>
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button className="topbar-btn" title="Notifications">
            <Bell size={15} />
            <span className="notif-dot" />
          </button>
          <button className="topbar-btn" title="Logout" onClick={() => setShowLogoutConfirm(true)} style={{ color: 'var(--red)' }}>
            <LogOut size={15} />
          </button>
          <div className="user-avatar" style={{ width: 38, height: 38, fontSize: 14, cursor: 'pointer' }} onClick={() => navigate('/settings')}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
        </div>
      </header>

      {showLogoutConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowLogoutConfirm(false)}>
          <div className="fade-in" style={{ background: '#1A1C23', border: '1px solid rgba(255,255,255,0.05)', padding: 32, borderRadius: 20, width: '100%', maxWidth: 400, textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(239,68,68,0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <LogOut size={32} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: '#fff', fontFamily: 'Orbitron, sans-serif' }}>Are you sure?</h3>
            <p style={{ color: '#8b8d97', marginBottom: 24, fontSize: 14 }}>You are about to log out of the admin panel. You will need to enter your credentials to access it again.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                style={{ flex: 1, padding: '12px', background: '#13141A', color: '#fff', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 14, transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#1e2029'}
                onMouseLeave={e => e.currentTarget.style.background = '#13141A'}
              >
                Cancel
              </button>
              <button 
                onClick={confirmLogout}
                style={{ flex: 1, padding: '12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 14, boxShadow: '0 4px 12px rgba(239,68,68,0.3)', transition: 'opacity 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
