import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, Sun, Moon, LogOut, RefreshCw, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

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
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const info = titles[location.pathname] || titles['/'];

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
          <button className="topbar-btn" title="Settings" onClick={() => navigate('/settings')}>
            <Settings size={15} />
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
        <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Confirm Logout</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Are you sure you want to log out of the admin panel?</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
