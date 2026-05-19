import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Settings, Monitor, BarChart3,
  Users, Wallet, Coffee, History, Palette,
  ChevronRight, Gamepad2
} from 'lucide-react';
import { rooms as initialRooms } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, badge: 'rooms' },
  { path: '/rooms', label: 'Manage Rooms', icon: Monitor, badge: null },
  { path: '/statistics', label: 'Statistics', icon: BarChart3, badge: null },
  { path: '/employees', label: 'Employees', icon: Users, badge: null },
  { path: '/spending', label: 'Spending', icon: Wallet, badge: null },
  { path: '/bars', label: 'Bars', icon: Coffee, badge: null },
  { path: '/history', label: 'History', icon: History, badge: null },
  { path: '/appearance', label: 'Appearance', icon: Palette, badge: null },
  { path: '/settings', label: 'Settings', icon: Settings, badge: null },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [roomsCount, setRoomsCount] = useState(initialRooms.length);
  const { user } = useAuth();

  useEffect(() => {
    const updateCount = () => {
      const saved = localStorage.getItem('gc_rooms_v2');
      if (saved) {
        try {
          setRoomsCount(JSON.parse(saved).length);
        } catch (e) {}
      } else {
        setRoomsCount(initialRooms.length);
      }
    };
    updateCount();
    window.addEventListener('rooms_updated', updateCount);
    return () => window.removeEventListener('rooms_updated', updateCount);
  }, []);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Gamepad2 size={20} color="#fff" />
        </div>
        <span className="logo-text">GameZone</span>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">Main Menu</div>
        <ul className="sidebar-nav">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path} className="sidebar-item">
                <button
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  <span className="sidebar-icon"><Icon size={17} /></span>
                  <span>{item.label}</span>
                  {item.badge === 'rooms' ? (
                    <span className="sidebar-badge">{roomsCount}</span>
                  ) : item.badge ? (
                    <span className="sidebar-badge">{item.badge}</span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="sidebar-footer">
        <div className="user-card" onClick={() => navigate('/settings')} style={{ cursor: 'pointer' }}>
          <div className="user-avatar">{user?.name ? user.name.charAt(0).toUpperCase() : 'A'}</div>
          <div className="user-info">
            <div className="user-name">{user?.name || 'Admin User'}</div>
            <div className="user-role">{user?.role || 'Super Admin'}</div>
          </div>
          <ChevronRight size={14} color="var(--text-muted)" />
        </div>
      </div>
    </aside>
  );
}
