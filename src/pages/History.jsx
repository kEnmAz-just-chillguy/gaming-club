import { useState } from 'react';
import { historyData } from '../data/mockData';
import { Search, Filter, Clock, Gamepad2, ShoppingCart, Wrench, CheckCircle, AlertCircle, Activity } from 'lucide-react';

const typeConfig = {
  session: { icon: Gamepad2, color: '#7c3aed', bg: 'rgba(124,58,237,0.15)', label: 'Session' },
  purchase: { icon: ShoppingCart, color: '#06b6d4', bg: 'rgba(6,182,212,0.15)', label: 'Purchase' },
  maintenance: { icon: Wrench, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', label: 'Maintenance' },
};

const statusConfig = {
  completed: { label: 'Completed', cls: 'badge-green', icon: CheckCircle },
  active: { label: 'Active', cls: 'badge-purple', icon: Activity },
  pending: { label: 'Pending', cls: 'badge-orange', icon: AlertCircle },
};

export default function History() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [history] = useState(historyData);

  const filtered = history.filter(h => {
    const matchSearch = h.desc.toLowerCase().includes(search.toLowerCase()) || h.user.toLowerCase().includes(search.toLowerCase()) || h.room.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || h.type === typeFilter;
    const matchStatus = statusFilter === 'all' || h.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const byDate = filtered.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {});

  const counts = {
    total: history.length,
    sessions: history.filter(h => h.type === 'session').length,
    purchases: history.filter(h => h.type === 'purchase').length,
    maintenance: history.filter(h => h.type === 'maintenance').length,
  };

  return (
    <div className="page-content fade-in">
      <div className="page-header mb-20">
        <h1 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 22 }}>History</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Full log of all sessions, purchases and events</p>
      </div>

      {/* Stats */}
      <div className="stats-grid mb-20" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {[
          { label: 'Total Events', value: counts.total, color: '#7c3aed', bg: 'rgba(124,58,237,0.12)' },
          { label: 'Sessions', value: counts.sessions, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
          { label: 'Purchases', value: counts.purchases, color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
          { label: 'Maintenance', value: counts.maintenance, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ borderColor: s.color + '33' }}>
            <div className="stat-info">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ fontSize: 24, color: s.color, fontFamily: 'Orbitron,sans-serif' }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card mb-20" style={{ padding: '14px 18px' }}>
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <Filter size={14} color="var(--text-muted)" />
            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginRight: 4 }}>Type:</span>
            {['all', 'session', 'purchase', 'maintenance'].map(t => (
              <button key={t} onClick={() => setTypeFilter(t)} className={`btn btn-sm ${typeFilter === t ? 'btn-primary' : 'btn-secondary'}`} style={{ textTransform: 'capitalize' }}>{t}</button>
            ))}
            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8, marginRight: 4 }}>Status:</span>
            {['all', 'completed', 'active', 'pending'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`} style={{ textTransform: 'capitalize' }}>{s}</button>
            ))}
          </div>
          <div className="search-bar" style={{ maxWidth: 240 }}>
            <Search size={13} color="var(--text-muted)" />
            <input placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="section-gap">
        {Object.entries(byDate).map(([date, events]) => (
          <div key={date}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 999, padding: '4px 14px' }}>
                {date === new Date().toISOString().slice(0, 10) ? 'Today' : date}
              </div>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {events.map((item, idx) => {
                const tc = typeConfig[item.type];
                const sc = statusConfig[item.status];
                const Icon = tc.icon;
                const StatusIcon = sc.icon;
                return (
                  <div key={item.id} style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
                    borderBottom: idx < events.length - 1 ? '1px solid var(--border)' : 'none',
                    transition: 'background 0.2s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Type icon */}
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: tc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={17} color={tc.color} />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.desc}</div>
                      <div style={{ display: 'flex', gap: 10, marginTop: 3, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>👤 {item.user}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>🚪 {item.room}</span>
                      </div>
                    </div>

                    {/* Amount */}
                    {item.amount != null && (
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green)', flexShrink: 0 }}>
                        +${item.amount}
                      </div>
                    )}

                    {/* Status */}
                    <span className={`badge ${sc.cls}`}>
                      <StatusIcon size={10} />
                      {sc.label}
                    </span>

                    {/* Time */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: 11, flexShrink: 0, minWidth: 55 }}>
                      <Clock size={11} />
                      {item.time}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="card flex-center" style={{ padding: 60, flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 40 }}>🔍</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>No events found matching your filters</div>
          </div>
        )}
      </div>
    </div>
  );
}
