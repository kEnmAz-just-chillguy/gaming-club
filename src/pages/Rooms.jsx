import { useState, useEffect } from 'react';
import { rooms as initialRooms } from '../data/mockData';
import { Monitor, Users, Gamepad2, Clock, Plus, X, Check, Trash2, Edit } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { formatSomRaw } from '../utils/currency';

import { supabase } from '../config/supabase';

const statusConfig = {
  occupied: { label: 'Occupied', color: 'var(--red)', bg: 'rgba(239,68,68,0.12)', dot: '#ef4444' },
  available: { label: 'Available', color: 'var(--green)', bg: 'rgba(16,185,129,0.12)', dot: '#10b981' },
  maintenance: { label: 'Maintenance', color: 'var(--orange)', bg: 'rgba(245,158,11,0.12)', dot: '#f59e0b' },
};

export default function Rooms() {
  const [rooms, setRooms] = useLocalStorage('gc_rooms_v2', initialRooms);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newRoom, setNewRoom] = useState({ number: '', type: 'Standard', equipment: '', pricePerHour: '' });
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [editRoom, setEditRoom] = useState(null);

  const getRooms = async () => {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select("*");
      if (error) throw error;
      if (data && data.length > 0) {
        setRooms(data);
      }
    } catch (err) {
      console.error("Error fetching rooms from Supabase:", err);
    }
  };

  useEffect(() => {
    getRooms();
  }, []);

  useEffect(() => {
    window.dispatchEvent(new Event('rooms_updated'));
  }, [rooms]);

  const filtered = filter === 'all' ? rooms : rooms.filter(r => r.status === filter);

  const handleStatusChange = (id, newStatus) => {
    setRooms(prev => prev.map(r => r.id === id ? { ...r, status: newStatus, player: null, game: null, since: null, revenue: 0 } : r));
    setSelected(null);
  };

  const handleAdd = () => {
    if (!newRoom.number) return;
    setRooms(prev => [...prev, { id: Date.now(), ...newRoom, status: 'available', game: null, player: null, since: null, revenue: 0 }]);
    setShowAdd(false);
    setNewRoom({ number: '', type: 'Standard', equipment: '', pricePerHour: '' });
  };

  const handleEdit = () => {
    if (!editRoom.number) return;
    setRooms(prev => prev.map(r => r.id === editRoom.id ? { ...r, ...editRoom } : r));
    setEditRoom(null);
  };

  const handleDelete = (id) => {
    setRoomToDelete(id);
    setNewRoom({ number: '', type: 'Standard', console: 'PS3' });
  };

  const confirmDelete = () => {
    if (roomToDelete) {
      setRooms(prev => prev.filter(r => r.id !== roomToDelete));
      setSelected(null);
      setRoomToDelete(null);
    }
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



      {/* Room Grid */}
      <div className="room-grid">
        {filtered.map(room => {
          const cfg = statusConfig[room.status];
          return (
            <div key={room.id} className={`room-card ${room.status}`} onClick={() => setSelected(room)}>
              <div className="flex-between">
                <div className="room-number">{room.number}</div>
              </div>
              <div className="room-type">{room.type}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={(e) => { e.stopPropagation(); setEditRoom(room); }}
                >
                  <Edit size={14} style={{ marginRight: 6 }} /> Edit
                </button>
                <button
                  className="btn btn-sm"
                  style={{ flex: 1, background: 'rgba(239,68,68,0.1)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={(e) => { e.stopPropagation(); setRoomToDelete(room.id); }}
                >
                  <Trash2 size={14} style={{ marginRight: 6 }} /> Delete
                </button>
              </div>
              {room.status === 'occupied' && (
                <div style={{ marginTop: 12, padding: '10px', background: 'rgba(255,255,255,0.04)', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Current Session Active</div>
                </div>
              )}
              <div className="room-meta">
                <div className="flex-gap" style={{ gap: 6 }}>
                  <Gamepad2 size={12} color="var(--text-muted)" />
                  <span className="room-pcs">{room.console}</span>
                </div>
                {room.since && (
                  <div className="flex-gap" style={{ gap: 6 }}>
                    <Clock size={12} color="var(--text-muted)" />
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{room.since}</span>
                  </div>
                )}
                {room.status === 'occupied' && room.revenue > 0 && (
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)' }}>{formatSomRaw(room.revenue)}</span>
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
              {[['Type', selected.type], ['Equipment', selected.equipment || (selected.pcs ? `${selected.pcs} PCs` : '')], ['Price/Hour', selected.pricePerHour ? `$${selected.pricePerHour}` : '—'], ['Status', selected.status], ['Game', selected.game || '—'], ['Player', selected.player || '—'], ['Since', selected.since || '—'], ['Revenue', selected.revenue ? `$${selected.revenue}` : '—']].map(([k, v]) => (
                <div key={k} className="flex-between">
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{k}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="btn btn-success btn-sm" onClick={() => handleStatusChange(selected.id, 'available')}>Set Available</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleStatusChange(selected.id, 'maintenance')}>Maintenance</button>
                <button className="btn btn-secondary btn-sm" onClick={() => setSelected(null)}>Close</button>
              </div>
              <button
                className="btn btn-sm"
                style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center' }}
                onClick={() => handleDelete(selected.id)}>
                <Trash2 size={14} style={{ marginRight: 4 }} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Room Modal */}
      {editRoom && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={() => setEditRoom(null)}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, minWidth: 340 }} onClick={e => e.stopPropagation()}>
            <div className="flex-between mb-20">
              <h3>Edit Room</h3>
              <button onClick={() => setEditRoom(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div className="section-gap">
              <div className="form-group">
                <label className="form-label">Room Number</label>
                <input className="form-input" placeholder="e.g. E-01" value={editRoom.number} onChange={e => setEditRoom(p => ({ ...p, number: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-input" value={editRoom.type} onChange={e => setEditRoom(p => ({ ...p, type: e.target.value }))}>
                  <option>Obshiy</option>
                  <option>VIP</option>
                  <option>PlayStation</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Equipment</label>
                <input className="form-input" type="text" placeholder="e.g. PS5, PS4, 4 PCs" value={editRoom.equipment || (editRoom.pcs ? `${editRoom.pcs} PCs` : '')} onChange={e => setEditRoom(p => ({ ...p, equipment: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Price per Hour</label>
                <input className="form-input" type="number" min="0" placeholder="e.g. 15" value={editRoom.pricePerHour || ''} onChange={e => setEditRoom(p => ({ ...p, pricePerHour: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleEdit}>Save Changes</button>
              <button className="btn btn-secondary" onClick={() => setEditRoom(null)}>Cancel</button>
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
                  <option>Obshiy</option>
                  <option>VIP</option>
                  <option>PlayStation</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Equipment</label>
                <input className="form-input" type="text" placeholder="e.g. PS5, PS4, 4 PCs" value={newRoom.equipment} onChange={e => setNewRoom(p => ({ ...p, equipment: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Price per Hour</label>
                <input className="form-input" type="number" min="0" placeholder="e.g. 15" value={newRoom.pricePerHour} onChange={e => setNewRoom(p => ({ ...p, pricePerHour: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleAdd}>Add Room</button>
              <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {roomToDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }} onClick={() => setRoomToDelete(null)}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, minWidth: 320, maxWidth: 400, textAlign: 'center', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }} onClick={e => e.stopPropagation()}>
            <div style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--red)', width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Trash2 size={24} />
            </div>
            <h3 style={{ marginBottom: 8, fontFamily: 'Orbitron, sans-serif' }}>Delete Room?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>Are you sure you want to delete this room? This action cannot be undone and will remove it from the system.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setRoomToDelete(null)}>Cancel</button>
              <button className="btn" style={{ flex: 1, background: 'var(--red)', color: 'white', border: 'none' }} onClick={confirmDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}