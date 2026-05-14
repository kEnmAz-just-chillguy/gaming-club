import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { revenueData, weeklyData, topGames, rooms } from '../data/mockData';
import { TrendingUp, TrendingDown } from 'lucide-react';

const TT = ({ active, payload, label }) => active && payload?.length ? (
  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px' }}>
    <p style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 4 }}>{label}</p>
    {payload.map((p, i) => <p key={i} style={{ color: p.color, fontSize: 12, fontWeight: 600 }}>{p.name}: {typeof p.value === 'number' && p.name?.includes('evenue') ? '$' : ''}{p.value?.toLocaleString()}</p>)}
  </div>
) : null;

export default function Statistics() {
  const [period, setPeriod] = useState('yearly');

  const totalRevenue = revenueData.reduce((a, d) => a + d.revenue, 0);
  const totalExpenses = revenueData.reduce((a, d) => a + d.expenses, 0);
  const totalSessions = revenueData.reduce((a, d) => a + d.sessions, 0);
  const profit = totalRevenue - totalExpenses;

  const kpis = [
    { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, change: '+22%', up: true, color: '#7c3aed', bg: 'rgba(124,58,237,0.12)' },
    { label: 'Total Expenses', value: `$${totalExpenses.toLocaleString()}`, change: '+14%', up: false, color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
    { label: 'Net Profit', value: `$${profit.toLocaleString()}`, change: '+31%', up: true, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    { label: 'Total Sessions', value: totalSessions.toLocaleString(), change: '+18%', up: true, color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
  ];

  const roomTypeData = [
    { name: 'Standard', count: rooms.filter(r => r.type === 'Standard').length },
    { name: 'Premium', count: rooms.filter(r => r.type === 'Premium').length },
    { name: 'VIP Suite', count: rooms.filter(r => r.type === 'VIP Suite').length },
  ];

  return (
    <div className="page-content fade-in">
      <div className="page-header-row mb-20">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 22 }}>Statistics</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Performance analytics and detailed insights</p>
        </div>
        <div className="tabs" style={{ width: 'auto' }}>
          {['weekly', 'monthly', 'yearly'].map(p => (
            <button key={p} className={`tab ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)} style={{ textTransform: 'capitalize', padding: '8px 14px' }}>{p}</button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid mb-20" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {kpis.map((k, i) => (
          <div key={i} className="stat-card" style={{ borderColor: k.color + '33' }}>
            <div className="stat-info">
              <div className="stat-label">{k.label}</div>
              <div className="stat-value" style={{ fontSize: 22, color: k.color }}>{k.value}</div>
              <div className={`stat-change ${k.up ? 'up' : 'down'}`} style={{ marginTop: 8 }}>
                {k.up ? <TrendingUp size={11} style={{ display: 'inline', marginRight: 3 }} /> : <TrendingDown size={11} style={{ display: 'inline', marginRight: 3 }} />}
                {k.change} vs last year
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue & Sessions Chart */}
      <div className="card mb-20">
        <div className="card-header">
          <div className="card-title">Revenue vs Expenses (12 months)</div>
        </div>
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gr1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gr2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gr3" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<TT />} />
              <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#7c3aed" strokeWidth={2} fill="url(#gr1)" />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" strokeWidth={2} fill="url(#gr2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid-2 mb-20">
        {/* Weekly Sessions Bar */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Weekly Sessions vs Bar Sales</div>
          </div>
          <div style={{ height: 230 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<TT />} />
                <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
                <Bar dataKey="sessions" name="Sessions" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="bar" name="Bar Sales" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Games Pie */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Game Popularity</div>
          </div>
          <div style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={topGames} cx="50%" cy="50%" outerRadius={70} dataKey="sessions" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {topGames.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {topGames.map((g, i) => (
              <div key={i} className="flex-between">
                <div className="flex-gap" style={{ gap: 8 }}>
                  <div className="color-dot" style={{ background: g.color }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{g.name}</span>
                </div>
                <div className="flex-gap" style={{ gap: 12 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{g.sessions} sessions</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: g.color }}>{g.percent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Room Type Distribution */}
      <div className="card">
        <div className="card-header"><div className="card-title">Room Type Distribution</div></div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {roomTypeData.map((rt, i) => {
            const colors = ['#7c3aed', '#06b6d4', '#f59e0b'];
            const pct = Math.round((rt.count / rooms.length) * 100);
            return (
              <div key={i} style={{ flex: 1, minWidth: 150 }}>
                <div className="flex-between" style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{rt.name}</span>
                  <span style={{ fontSize: 13, color: colors[i], fontWeight: 700 }}>{rt.count} rooms</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${colors[i]}, ${colors[i]}aa)` }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{pct}% of total</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
