import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rooms as initialRooms } from '../data/mockData';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Monitor, Clock, Gamepad2, DollarSign, Wrench, Search } from 'lucide-react';
import { formatSomRaw } from '../utils/currency';

const statusConfig = {
  occupied:    { label: 'Occupied',    color: '#ef4444', bg: 'rgba(239,68,68,0.12)',    dot: '#ef4444',  glow: 'rgba(239,68,68,0.25)' },
  available:   { label: 'Available',   color: '#10b981', bg: 'rgba(16,185,129,0.12)',   dot: '#10b981',  glow: 'rgba(16,185,129,0.2)' },
  maintenance: { label: 'Maintenance', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',   dot: '#f59e0b',  glow: 'rgba(245,158,11,0.2)' },
};

const typeIcons = { 'VIP Suite': '👑', 'Premium': '⭐', 'Standard': '🖥️' };

// Universal Room Timer using absolute timestamps from room object
function RoomTimer({ room }) {
  const calcTime = () => {
    if (!room || room.status !== 'occupied') return { secs: 0, isCountdown: false };
    const now = Date.now();
    if (room.endTime) {
      const rem = Math.floor((room.endTime - now) / 1000);
      return { secs: rem > 0 ? rem : 0, isCountdown: true };
    }
    if (room.startTime) {
      return { secs: Math.floor((now - room.startTime) / 1000), isCountdown: false };
    }
    // fallback for legacy mock data
    if (room.since) {
      const [h, m] = room.since.split(':').map(Number);
      const start = new Date();
      start.setHours(h, m, 0, 0);
      const diff = Math.floor((now - start.getTime()) / 1000);
      return { secs: diff > 0 ? diff : 0, isCountdown: false };
    }
    return { secs: 0, isCountdown: false };
  };

  const [time, setTime] = useState(calcTime);
  
  useEffect(() => {
    const ref = setInterval(() => setTime(calcTime()), 1000);
    return () => clearInterval(ref);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.status, room.startTime, room.endTime]);

  const { secs, isCountdown } = time;
  const h = String(Math.floor(secs / 3600)).padStart(2, '0');
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  
  let color = '#10b981';
  if (isCountdown) {
    if (secs <= 0) color = '#6b7280'; // time's up
    else if (secs <= 120) color = '#ef4444'; // less than 2 min
    else if (secs <= 600) color = '#f59e0b'; // less than 10 min
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Clock size={13} color={color} />
      <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 13, fontWeight: 700, color, letterSpacing: 1 }}>
        {h}:{m}:{s}
      </span>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [rooms] = useLocalStorage('gc_rooms_v2', initialRooms);

  const counts = {
    all:         rooms.length,
    occupied:    rooms.filter(r => r.status === 'occupied').length,
    available:   rooms.filter(r => r.status === 'available').length,
    maintenance: rooms.filter(r => r.status === 'maintenance').length,
  };

  const totalRevenue = rooms.reduce((a, r) => a + r.revenue, 0);

  const filtered = rooms.filter(r => {
    const matchStatus = filter === 'all' || r.status === filter;
    const matchSearch = search === '' ||
      r.number.toLowerCase().includes(search.toLowerCase()) ||
      (r.player && r.player.toLowerCase().includes(search.toLowerCase())) ||
      (r.game && r.game.toLowerCase().includes(search.toLowerCase()));
    return matchStatus && matchSearch;
  });

  return (
    <div className="page-content fade-in">

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 22, fontWeight: 800 }}>Live Dashboard</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>
          Live overview of all {rooms.length} gaming rooms
        </p>
      </div>

      {/* Summary Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { icon: Gamepad2, label: 'Occupied',    value: counts.occupied,    color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
          { icon: Monitor,  label: 'Available',   value: counts.available,   color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
          { icon: Wrench,   label: 'Maintenance', value: counts.maintenance, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
          { icon: DollarSign, label: 'Revenue Today', value: formatSomRaw(totalRevenue), color: '#7c3aed', bg: 'rgba(124,58,237,0.12)' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ padding: '18px 20px' }}>
            <div className="stat-icon" style={{ background: s.bg, color: s.color, width: 44, height: 44, borderRadius: 12, fontSize: 20 }}>
              <s.icon size={20} />
            </div>
            <div className="stat-info">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ fontSize: 24 }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        {Object.entries(counts).map(([key, count]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`btn ${filter === key ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            style={{ textTransform: 'capitalize', minWidth: 100 }}
          >
            {key === 'all' ? '🏠' : key === 'occupied' ? '🎮' : key === 'available' ? '✅' : '🔧'}{' '}
            {key} <span style={{ opacity: 0.7, marginLeft: 4 }}>({count})</span>
          </button>
        ))}

        <div style={{
          marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '7px 14px', minWidth: 200,
          transition: 'all 0.2s',
        }}>
          <Search size={13} color="var(--text-muted)" />
          <input
            placeholder="Room, player, game..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              background: 'none', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontSize: 13,
              fontFamily: 'inherit', width: '100%',
            }}
          />
        </div>
      </div>

      {/* Room Cards Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 15 }}>No rooms match your filter</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 18 }}>
          {filtered.map(room => {
            const cfg = statusConfig[room.status];
            return (
              <div
                key={room.id}
                onClick={() => navigate(`/room/${room.id}`)}
                style={{
                  background: 'var(--bg-card)',
                  border: `1px solid ${cfg.color}40`,
                  borderRadius: 16,
                  padding: 20,
                  transition: 'all 0.25s',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = `0 8px 28px ${cfg.glow}`;
                  e.currentTarget.style.borderColor = cfg.color + '80';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = cfg.color + '40';
                }}
              >
                {/* Glow orb top-right */}
                <div style={{
                  position: 'absolute', top: -30, right: -30,
                  width: 100, height: 100, borderRadius: '50%',
                  background: cfg.glow, pointerEvents: 'none',
                }} />

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>
                      {room.number}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                      {typeIcons[room.type]} {room.type}
                    </div>
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: cfg.bg, borderRadius: 999,
                    padding: '4px 10px', fontSize: 11, fontWeight: 700, color: cfg.color,
                  }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.dot,
                      ...(room.status === 'occupied' ? { boxShadow: `0 0 6px ${cfg.dot}` } : {}) }} />
                    {cfg.label}
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: 'var(--border)', marginBottom: 14 }} />

                {/* Session info or idle */}
                {room.status === 'occupied' ? (
                  <div className="flex-between">
                    <RoomTimer room={room} />
                  </div>
                ) : room.status === 'available' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontSize: 13, fontWeight: 600 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                    Ready for a session
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f59e0b', fontSize: 13, fontWeight: 600 }}>
                    <Wrench size={13} />
                    Under maintenance
                  </div>
                )}

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Gamepad2 size={12} color="var(--text-muted)" />
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{room.console}</span>
                  </div>
                  {room.status === 'occupied' && room.revenue > 0 && (
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#10b981' }}>{formatSomRaw(room.revenue)}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
