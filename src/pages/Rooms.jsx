import { useState, useEffect } from 'react';
import { useSupabaseRooms } from '../hooks/useSupabaseRooms';
import { Monitor, Users, Gamepad2, Clock, Plus, X, Check, Trash2, Edit } from 'lucide-react';
import { formatSomRaw } from '../utils/currency';
import { SkeletonRoomGrid } from '../components/Skeleton';

const statusConfig = {
  occupied: { label: 'Occupied', color: 'var(--red)', bg: 'rgba(239,68,68,0.12)', dot: '#ef4444' },
  available: { label: 'Available', color: 'var(--green)', bg: 'rgba(16,185,129,0.12)', dot: '#10b981' },
  maintenance: { label: 'Maintenance', color: 'var(--orange)', bg: 'rgba(245,158,11,0.12)', dot: '#f59e0b' },
};

import { supabase } from '../config/supabase';

export default function Rooms() {
  const { rooms, loading, addRoom, updateRoom, deleteRoom } = useSupabaseRooms();
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newRoom, setNewRoom] = useState({ number: '', type: '', equipment: '', pricePerHour: '' });
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [editRoom, setEditRoom] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const filtered = filter === 'all' ? rooms : rooms.filter(r => r.status === filter);
  const sortedFiltered = [...filtered].sort((a, b) => {
    if (a.status === 'occupied' && b.status !== 'occupied') return -1;
    if (a.status !== 'occupied' && b.status === 'occupied') return 1;
    if (a.status === 'occupied' && b.status === 'occupied') {
      return (b.startTime || 0) - (a.startTime || 0);
    }
    return b.id - a.id;
  });

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateRoom(id, { status: newStatus, startTime: null, endTime: null, revenue: 0 });
      setSelected(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdd = async () => {
    if (!newRoom.number) return;
    try {
      setSubmitting(true);
      await addRoom({
        ...newRoom,
        status: 'available',
        startTime: null,
        endTime: null,
        revenue: 0
      });
      setShowAdd(false);
      setNewRoom({ number: '', type: 'Standard', equipment: '', pricePerHour: '' });
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editRoom.number) return;
    try {
      setSubmitting(true);
      await updateRoom(editRoom.id, editRoom);
      setEditRoom(null);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setRoomToDelete(id);
  };

  const confirmDelete = async () => {
    if (roomToDelete) {
      try {
        setSubmitting(true);
        await deleteRoom(roomToDelete);
        setSelected(null);
        setRoomToDelete(null);
      } catch (e) {
        console.error(e);
      } finally {
        setSubmitting(false);
      }
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
      {loading && rooms.length === 0 ? (
        <SkeletonRoomGrid count={6} />
      ) : sortedFiltered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏠</div>
          <div style={{ fontSize: 15 }}>No rooms found</div>
        </div>
      ) : null}
      {!loading || rooms.length > 0 ? (
        <div className="room-grid">
          {sortedFiltered.map(room => {
            const cfg = statusConfig[room.status];
            return (
              <div key={room.id} className={`room-card ${room.status}`} onClick={() => setSelected(room)}>
                <div className="flex-between">
                  <div className="room-number">{room.number}</div>
                  <div className="status-badge" style={{ background: cfg.bg, color: cfg.color, display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot }} />
                    {cfg.label}
                  </div>
                </div>
                <div className="room-type">{room.type}</div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                    <span>Equipment:</span>
                    <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{room.equipment || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                    <span>Price/Hour:</span>
                    <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{room.pricePerHour ? `${formatSomRaw(room.pricePerHour)}/hr` : '—'}</span>
                  </div>
                </div>

                {room.status === 'occupied' && (
                  <div style={{ marginTop: 12, padding: '10px', background: 'rgba(255,255,255,0.04)', borderRadius: 8 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)' }} />
                      Current Session Active
                    </div>
                    {room.startTime && (
                      <div className="flex-gap" style={{ gap: 6, marginTop: 6, display: 'flex', alignItems: 'center' }}>
                        <Clock size={12} color="var(--text-muted)" />
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Since {room.startTime}</span>
                      </div>
                    )}
                  </div>
                )}

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
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Room Detail Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={() => setSelected(null)}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, minWidth: 340, maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div className="flex-between mb-20">
              <h3 style={{ fontFamily: 'Orbitron, sans-serif' }}>Room {selected.number}</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {[
                ['Type', selected.type],
                ['Equipment', selected.equipment || '—'],
                ['Price/Hour', selected.pricePerHour ? formatSomRaw(selected.pricePerHour) : '—'],
                ['Status', selected.status.charAt(0).toUpperCase() + selected.status.slice(1)],
                ['Start Time', selected.startTime || '—'],
                ['End Time', selected.endTime || '—'],
                ['Revenue', selected.revenue ? formatSomRaw(selected.revenue) : '—']
              ].map(([k, v]) => (
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
                <input 
                  className="form-input" 
                  placeholder="e.g. VIP, PlayStation" 
                  value={editRoom.type} 
                  onChange={e => setEditRoom(p => ({ ...p, type: e.target.value }))} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Equipment</label>
                <input className="form-input" type="text" placeholder="e.g. PS5, PS4, 4 PCs" value={editRoom.equipment || (editRoom.pcs ? `${editRoom.pcs} PCs` : '')} onChange={e => setEditRoom(p => ({ ...p, equipment: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Price per Hour (so'm)</label>
                <input className="form-input" type="number" min="0" placeholder="e.g. 30000" value={editRoom.pricePerHour || ''} onChange={e => setEditRoom(p => ({ ...p, pricePerHour: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                onClick={handleEdit} 
                disabled={submitting}
              >
                {submitting ? <div className="spinner" style={{ width: 14, height: 14, borderTopColor: '#fff' }} /> : 'Save Changes'}
              </button>
              <button className="btn btn-secondary" onClick={() => setEditRoom(null)} disabled={submitting}>Cancel</button>
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
                <input 
                  className="form-input" 
                  placeholder="e.g. VIP, PlayStation" 
                  value={newRoom.type} 
                  onChange={e => setNewRoom(p => ({ ...p, type: e.target.value }))} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Equipment</label>
                <input className="form-input" type="text" placeholder="e.g. PS5, PS4, 4 PCs" value={newRoom.equipment} onChange={e => setNewRoom(p => ({ ...p, equipment: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Price per Hour (so'm)</label>
                <input className="form-input" type="number" min="0" placeholder="e.g. 30000" value={newRoom.pricePerHour} onChange={e => setNewRoom(p => ({ ...p, pricePerHour: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                onClick={handleAdd} 
                disabled={submitting}
              >
                {submitting ? <div className="spinner" style={{ width: 14, height: 14, borderTopColor: '#fff' }} /> : 'Add Room'}
              </button>
              <button className="btn btn-secondary" onClick={() => setShowAdd(false)} disabled={submitting}>Cancel</button>
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
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setRoomToDelete(null)} disabled={submitting}>Cancel</button>
              <button 
                className="btn" 
                style={{ flex: 1, background: 'var(--red)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                onClick={confirmDelete} 
                disabled={submitting}
              >
                {submitting ? <div className="spinner" style={{ width: 14, height: 14, borderTopColor: '#fff' }} /> : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
