import { useState } from 'react';
import { rooms as initialRooms } from '../data/mockData';
import { Monitor, Users, Gamepad2, Clock, Plus, X, Check } from 'lucide-react';

const statusConfig = {
  occupied: { label: 'Occupied', color: 'var(--red)', bg: 'rgba(239,68,68,0.12)', dot: '#ef4444' },
  available: { label: 'Available', color: 'var(--green)', bg: 'rgba(16,185,129,0.12)', dot: '#10b981' },
  maintenance: { label: 'Maintenance', color: 'var(--orange)', bg: 'rgba(245,158,11,0.12)', dot: '#f59e0b' },
};

export default function Rooms() {
  const [rooms, setRooms] = useState(initialRooms);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newRoom, setNewRoom] = useState({ number: '', type: 'Standard', pcs: 4 });

  const filtered = filter === 'all' ? rooms : rooms.filter(r => r.status === filter);

  const handleStatusChange = (id, newStatus) => {
    setRooms(prev => prev.map(r => r.id === id ? { ...r, status: newStatus, player: null, game: null, since: null, revenue: 0 } : r));
    setSelected(null);
  };

  const handleAdd = () => {
    if (!newRoom.number) return;
    setRooms(prev => [...prev, { id: Date.now(), ...newRoom, status: 'available', game: null, player: null, since: null, revenue: 0 }]);
    setShowAdd(false);
    setNewRoom({ number: '', type: 'Standard', pcs: 4 });
  };

  const counts = {
    all: rooms.length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
    available: rooms.filter(r => r.status === 'available').length,
    maintenance: rooms.filter(r => r.status === 'maintenance').length,
  };

  return (
    <div className="page-content fade-in">
      <div className="page-header-row mb-20">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 22 }}>Rooms</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Manage all gaming rooms and their status</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={15} /> Add Room
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        {Object.entries(counts).map(([key, count]) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`btn ${filter === key ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            style={{ textTransform: 'capitalize' }}>
            {key} ({count})
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="stats-grid mb-20" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {[
          { label: 'Occupied', value: counts.occupied, icon: Gamepad2, color: 'var(--red)', bg: 'rgba(239,68,68,0.12)' },
          { label: 'Available', value: counts.available, icon: Check, color: 'var(--green)', bg: 'rgba(16,185,129,0.12)' },
          { label: 'Maintenance', value: counts.maintenance, icon: X, color: 'var(--orange)', bg: 'rgba(245,158,11,0.12)' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}><s.icon size={20} /></div>
            <div className="stat-info">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ fontSize: 28 }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Room Grid */}
      <div className="room-grid">
        {filtered.map(room => {
          const cfg = statusConfig[room.status];
          return (
            <div key={room.id} className={`room-card ${room.status}`} onClick={() => setSelected(room)}>
              <div className="flex-between">
                <div className="room-number">{room.number}</div>
                <span className="badge" style={{ background: cfg.bg, color: cfg.color }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, display: 'inline-block' }} />
                  {cfg.label}
                </span>
              </div>
              <div className="room-type">{room.type}</div>
              {room.status === 'occupied' && (
                <div style={{ marginTop: 12, padding: '10px', background: 'rgba(255,255,255,0.04)', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Current Session</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>👤 {room.player}</div>
                  <div style={{ fontSize: 12, color: 'var(--accent-light)', marginTop: 2 }}>🎮 {room.game}</div>
                </div>
              )}
              <div className="room-meta">
                <div className="flex-gap" style={{ gap: 6 }}>
                  <Monitor size={12} color="var(--text-muted)" />
                  <span className="room-pcs">{room.pcs} PCs</span>
                </div>
                {room.since && (
                  <div className="flex-gap" style={{ gap: 6 }}>
                    <Clock size={12} color="var(--text-muted)" />
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{room.since}</span>
                  </div>
                )}
                {room.revenue > 0 && (
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)' }}>${room.revenue}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Room Detail Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={() => setSelected(null)}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, minWidth: 340, maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div className="flex-between mb-20">
              <h3 style={{ fontFamily: 'Orbitron, sans-serif' }}>Room {selected.number}</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {[['Type', selected.type], ['PCs', selected.pcs], ['Status', selected.status], ['Game', selected.game || '—'], ['Player', selected.player || '—'], ['Since', selected.since || '—'], ['Revenue', selected.revenue ? `$${selected.revenue}` : '—']].map(([k, v]) => (
                <div key={k} className="flex-between">
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{k}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-success btn-sm" onClick={() => handleStatusChange(selected.id, 'available')}>Set Available</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleStatusChange(selected.id, 'maintenance')}>Maintenance</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Room Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={() => setShowAdd(false)}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, minWidth: 340 }} onClick={e => e.stopPropagation()}>
            <div className="flex-between mb-20">
              <h3>Add New Room</h3>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div className="section-gap">
              <div className="form-group">
                <label className="form-label">Room Number</label>
                <input className="form-input" placeholder="e.g. E-01" value={newRoom.number} onChange={e => setNewRoom(p => ({ ...p, number: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-input" value={newRoom.type} onChange={e => setNewRoom(p => ({ ...p, type: e.target.value }))}>
                  <option>Standard</option><option>Premium</option><option>VIP Suite</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Number of PCs</label>
                <input className="form-input" type="number" min={1} max={20} value={newRoom.pcs} onChange={e => setNewRoom(p => ({ ...p, pcs: +e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleAdd}>Add Room</button>
              <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
