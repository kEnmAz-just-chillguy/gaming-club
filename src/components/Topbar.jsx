import { useLocation } from 'react-router-dom';
import { Search, Bell, Sun, Moon, Settings, RefreshCw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const titles = {
  '/': { title: 'Dashboard', sub: 'Welcome back, Admin! Here\'s what\'s happening today.' },
  '/rooms': { title: 'Rooms', sub: 'Monitor and manage all gaming rooms.' },
  '/all-rooms': { title: 'All Rooms', sub: 'Live overview of every gaming room in the club.' },
  '/statistics': { title: 'Statistics', sub: 'Detailed performance analytics and insights.' },
  '/employees': { title: 'Employees', sub: 'Manage your staff and shifts.' },
  '/spending': { title: 'Spending', sub: 'Track expenses and budget allocation.' },
  '/bars': { title: 'Bars', sub: 'Manage bar menu, stock and sales.' },
  '/history': { title: 'History', sub: 'Full log of sessions, purchases and events.' },
  '/appearance': { title: 'Appearance', sub: 'Customize the look and feel of your panel.' },
  '/settings': { title: 'Settings', sub: 'Configure club settings and preferences.' },
};

export default function Topbar() {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const info = titles[location.pathname]
    || (location.pathname.startsWith('/room/') ? { title: 'Room Detail', sub: 'Full room info, session history and bar orders.' } : titles['/']);

  return (
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
        <button className="topbar-btn" title="Settings">
          <Settings size={15} />
        </button>
        <div className="user-avatar" style={{ width: 38, height: 38, fontSize: 14, cursor: 'pointer' }}>A</div>
      </div>
    </header>
  );
}
