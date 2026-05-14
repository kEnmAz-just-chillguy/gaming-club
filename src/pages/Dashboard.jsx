import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, TrendingDown, Users, Monitor, DollarSign, Coffee, Activity, Clock } from 'lucide-react';
import { revenueData, weeklyData, topGames, rooms, employees } from '../data/mockData';

const StatCard = ({ icon: Icon, label, value, change, up, color, bg }) => (
  <div className="stat-card fade-in">
    <div className="stat-icon" style={{ background: bg, color }}>
      <Icon size={22} />
    </div>
    <div className="stat-info">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className={`stat-change ${up ? 'up' : 'down'}`}>
        {up ? <TrendingUp size={11} style={{display:'inline',marginRight:3}} /> : <TrendingDown size={11} style={{display:'inline',marginRight:3}} />}
        {change} this month
      </div>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 6 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, fontSize: 13, fontWeight: 600 }}>
            {p.name}: ${p.value?.toLocaleString() ?? p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [chartTab, setChartTab] = useState('monthly');
  const data = chartTab === 'monthly' ? revenueData : weeklyData;

  const occupied = rooms.filter(r => r.status === 'occupied').length;
  const available = rooms.filter(r => r.status === 'available').length;
  const activeStaff = employees.filter(e => e.status === 'active').length;
  const todayRevenue = rooms.filter(r => r.revenue > 0).reduce((a, r) => a + r.revenue, 0);

  const recentActivity = [
    { icon: '🎮', text: 'Room A-01 session ended — Alex M.', time: '2 min ago', color: 'var(--accent)' },
    { icon: '☕', text: 'Bar purchase — Energy Drink x2', time: '8 min ago', color: 'var(--cyan)' },
    { icon: '🔧', text: 'Room B-03 set to maintenance', time: '25 min ago', color: 'var(--orange)' },
    { icon: '👤', text: 'New session — Room D-02 (Nina S.)', time: '34 min ago', color: 'var(--green)' },
    { icon: '💰', text: 'Payment received — $60.00', time: '1h ago', color: 'var(--pink)' },
  ];

  return (
    <div className="page-content fade-in">
      {/* Hero Banner */}
      <div className="hero-banner mb-20">
        <h3>Welcome back, Admin! 👋</h3>
        <p>Your gaming club is running smoothly. {occupied} of {rooms.length} rooms are currently occupied.</p>
        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button className="btn btn-primary btn-sm">View Rooms</button>
          <button className="btn btn-secondary btn-sm" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}>Export Report</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid mb-20">
        <StatCard icon={Monitor} label="Occupied Rooms" value={occupied} change="+3" up={true} color="#7c3aed" bg="rgba(124,58,237,0.15)" />
        <StatCard icon={Activity} label="Available Rooms" value={available} change="-3" up={false} color="#06b6d4" bg="rgba(6,182,212,0.15)" />
        <StatCard icon={DollarSign} label="Today Revenue" value={`$${todayRevenue}`} change="+12%" up={true} color="#10b981" bg="rgba(16,185,129,0.15)" />
        <StatCard icon={Users} label="Active Staff" value={activeStaff} change="+1" up={true} color="#f59e0b" bg="rgba(245,158,11,0.15)" />
        <StatCard icon={Coffee} label="Bar Sales Today" value="$124" change="+18%" up={true} color="#ec4899" bg="rgba(236,72,153,0.15)" />
        <StatCard icon={Clock} label="Avg Session" value="2.4h" change="+0.3h" up={true} color="#8b5cf6" bg="rgba(139,92,246,0.15)" />
      </div>

      {/* Charts Row */}
      <div className="grid-7-3 mb-20">
        {/* Revenue Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Revenue Analytics</div>
              <div className="card-subtitle">Revenue vs Expenses overview</div>
            </div>
            <div className="tabs" style={{ width: 'auto' }}>
              <button className={`tab ${chartTab === 'monthly' ? 'active' : ''}`} onClick={() => setChartTab('monthly')}>Monthly</button>
              <button className={`tab ${chartTab === 'weekly' ? 'active' : ''}`} onClick={() => setChartTab('weekly')}>Weekly</button>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey={chartTab === 'monthly' ? 'month' : 'day'} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#7c3aed" strokeWidth={2} fill="url(#rev)" />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" strokeWidth={2} fill="url(#exp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Games Pie */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Top Games</div>
              <div className="card-subtitle">By session count</div>
            </div>
          </div>
          <div style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={topGames} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="sessions" paddingAngle={3}>
                  {topGames.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v + ' sessions', n]} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
            {topGames.map((g, i) => (
              <div key={i} className="flex-between">
                <div className="flex-gap" style={{ gap: 8 }}>
                  <div className="color-dot" style={{ background: g.color }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{g.name}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: g.color }}>{g.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid-2">
        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Activity</div>
            <button className="btn btn-secondary btn-sm">View All</button>
          </div>
          {recentActivity.map((item, i) => (
            <div key={i} className="notif-item">
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                {item.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div className="notif-text">{item.text}</div>
                <div className="notif-time">{item.time}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Room Status Summary */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Room Status</div>
            <span className="badge badge-purple">{rooms.length} Total</span>
          </div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Occupied', count: occupied, color: 'var(--red)', bg: 'rgba(239,68,68,0.1)' },
              { label: 'Available', count: available, color: 'var(--green)', bg: 'rgba(16,185,129,0.1)' },
              { label: 'Maintenance', count: rooms.filter(r => r.status === 'maintenance').length, color: 'var(--orange)', bg: 'rgba(245,158,11,0.1)' },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, background: s.bg, borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: s.color, fontFamily: 'Orbitron, sans-serif' }}>{s.count}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {rooms.filter(r => r.status === 'occupied').slice(0, 4).map(r => (
              <div key={r.id} className="flex-between">
                <div className="flex-gap">
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)' }} />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Room {r.number}</span>
                </div>
                <div className="flex-gap" style={{ gap: 12 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.game}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.player}</span>
                  <span style={{ fontSize: 12, color: 'var(--accent-light)', fontWeight: 600 }}>since {r.since}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
