import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Settings, Monitor, BarChart3,
  Users, Wallet, Coffee, History, Palette,
  ChevronRight, Gamepad2
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'All Rooms', icon: Gamepad2, badge: '12' },
  { path: '/rooms', label: 'Rooms', icon: Monitor, badge: '12' },
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
                  {item.badge && <span className="sidebar-badge">{item.badge}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">A</div>
          <div className="user-info">
            <div className="user-name">Admin User</div>
            <div className="user-role">Super Admin</div>
          </div>
          <ChevronRight size={14} color="var(--text-muted)" />
        </div>
      </div>
    </aside>
  );
}
