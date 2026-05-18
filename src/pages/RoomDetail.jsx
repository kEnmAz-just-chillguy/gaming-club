import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { rooms as mockRooms, roomSessions as mockSessions, roomBarOrders as mockBarOrders, barItems as mockBarItems, spendings } from '../data/mockData';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { formatSomRaw, RATE_PER_HOUR_SOM } from '../utils/currency';
import {
  ArrowLeft, Monitor, Clock, Gamepad2, Users, DollarSign,
  Wrench, Coffee, CheckCircle, XCircle, AlertTriangle, ShoppingCart, X
} from 'lucide-react';

const statusCfg = {
  occupied:    { label: 'Occupied',    color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  dot: '#ef4444' },
  available:   { label: 'Available',   color: '#10b981', bg: 'rgba(16,185,129,0.12)', dot: '#10b981' },
  maintenance: { label: 'Maintenance', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', dot: '#f59e0b' },
};
const typeIcons = { 'VIP Suite': '👑', 'Premium': '⭐', 'Standard': '🖥️' };

const SectionTitle = ({ icon: Icon, label, color = 'var(--accent-light)' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
      <Icon size={16} />
    </div>
    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{label}</span>
  </div>
);

export default function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [globalRooms, setGlobalRooms] = useLocalStorage('gc_rooms_v2', mockRooms);
  const [globalBarOrders, setGlobalBarOrders] = useLocalStorage('gc_roomBarOrders', mockBarOrders);
  const [barItems] = useLocalStorage('gc_barItems', mockBarItems);
  const room = globalRooms.find(r => r.id === Number(id));

  const [showOccupyModal, setShowOccupyModal] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showBarMenu, setShowBarMenu] = useState(false);
  const [checkoutAmount, setCheckoutAmount] = useState(0);
  const [occupyMode, setOccupyMode] = useState('hours');
  const [occupyValue, setOccupyValue] = useState('');
  const [roomState, setRoomState] = useState(room);
  const [liveBarOrders, setLiveBarOrders] = useState(globalBarOrders[room?.number] || []);

  // Sync local state back to localStorage
  useEffect(() => {
    setGlobalRooms(prev => prev.map(r => r.id === roomState.id ? roomState : r));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomState]);

  useEffect(() => {
    if (roomState) {
      setGlobalBarOrders(prev => ({ ...prev, [roomState.number]: liveBarOrders }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveBarOrders, roomState?.number]);
  const [remaining, setRemaining] = useState(() => {
    if (room?.endTime) return Math.max(0, Math.floor((room.endTime - Date.now()) / 1000));
    return 0;
  });
  const [vipElapsed, setVipElapsed] = useState(() => {
    if (room?.sessionMode === 'vip' && room?.startTime) return Math.max(0, Math.floor((Date.now() - room.startTime) / 1000));
    if (room?.since && !room?.startTime) {
      const [h, m] = room.since.split(':').map(Number);
      const start = new Date(); start.setHours(h, m, 0, 0);
      return Math.max(0, Math.floor((Date.now() - start.getTime()) / 1000));
    }
    return 0;
  });
  const [totalSecs, setTotalSecs] = useState(() => {
    if (room?.startTime && room?.endTime) {
      return Math.round((room.endTime - room.startTime) / 1000);
    }
    return 0;
  });
  const [barCategory, setBarCategory] = useState('All');
  const timerRef = useRef(null);
  const isVipRef = useRef(false);
  const nextBarId = useRef(100);

  const RATE_PER_HOUR = RATE_PER_HOUR_SOM;

  const formatCountdown = (secs) => {
    const s = Math.max(0, secs);
    const h = String(Math.floor(s / 3600)).padStart(2, '0');
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  const getTimerColor = (secs) => {
    if (secs <= 0)   return '#6b7280';
    if (secs <= 120) return '#ef4444';
    if (secs <= 600) return '#f59e0b';
    return '#10b981';
  };

  // Unified Timer Effect using absolute timestamps
  useEffect(() => {
    if (roomState?.status !== 'occupied') {
      clearInterval(timerRef.current);
      return;
    }
    const tick = () => {
      const now = Date.now();
      if (roomState.sessionMode === 'vip' && roomState.startTime) {
        setVipElapsed(Math.floor((now - roomState.startTime) / 1000));
        isVipRef.current = true;
      } else if (roomState.endTime) {
        const rem = Math.floor((roomState.endTime - now) / 1000);
        setRemaining(rem > 0 ? rem : 0);
        isVipRef.current = false;
      } else if (roomState.since && !roomState.startTime) {
        // Fallback for mock data without startTime
        const [h, m] = roomState.since.split(':').map(Number);
        const start = new Date();
        start.setHours(h, m, 0, 0);
        const diff = Math.floor((now - start.getTime()) / 1000);
        setVipElapsed(diff > 0 ? diff : 0);
        isVipRef.current = true;
      }
    };
    
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomState?.status, roomState?.startTime, roomState?.endTime, roomState?.sessionMode]);

  if (!room) return (
    <div className="page-content" style={{ textAlign: 'center', paddingTop: 80 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
      <div style={{ fontSize: 18, color: 'var(--text-muted)' }}>Room not found</div>
      <button className="btn btn-secondary btn-sm" style={{ marginTop: 20 }} onClick={() => navigate(-1)}>Go Back</button>
    </div>
  );

  const sessions = mockSessions[room.number] || [];
  const barTotal = liveBarOrders.reduce((a, o) => a + o.qty * o.price, 0);
  const sessionTotal = sessions.reduce((a, s) => a + s.amount, 0);
  const cfg = statusCfg[roomState.status];

  const isVip = roomState?.sessionMode === 'vip';
  let playCost = 0;
  if (roomState?.status === 'occupied') {
    if (isVip) {
      playCost = Math.round((vipElapsed / 3600) * RATE_PER_HOUR);
    } else if (roomState.sessionMode === 'hours' && totalSecs > 0) {
      playCost = Math.round((totalSecs / 3600) * RATE_PER_HOUR);
    } else {
      playCost = roomState.revenue || 0;
    }
  }

  const addBarItem = (item) => {
    if (roomState.status !== 'occupied') return; // guard: room must be occupied
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    setLiveBarOrders(prev => {
      const existing = prev.find(o => o.item === item.name);
      if (existing) {
        return prev.map(o => o.item === item.name ? { ...o, qty: o.qty + 1 } : o);
      }
      nextBarId.current += 1;
      return [...prev, { id: nextBarId.current, item: item.name, qty: 1, price: item.price, icon: item.icon, time: timeStr }];
    });
  };

  const removeBarItem = (itemName) => {
    setLiveBarOrders(prev => prev
      .map(o => o.item === itemName ? { ...o, qty: o.qty - 1 } : o)
      .filter(o => o.qty > 0)
    );
  };

  const handleOccupy = () => {
    if (occupyMode !== 'vip' && !occupyValue) return;
    const val = Number(occupyValue);
    const nowMs = Date.now();
    const sinceStr = new Date(nowMs).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

    if (occupyMode === 'vip') {
      isVipRef.current = true;
      setVipElapsed(0);
      setRemaining(0);
      setTotalSecs(0);
      setRoomState(prev => ({
        ...prev, status: 'occupied',
        player: null, game: null,
        since: sinceStr, startTime: nowMs, endTime: null,
        revenue: 0, sessionMode: 'vip',
      }));
    } else {
      isVipRef.current = false;
      const secs = occupyMode === 'hours'
        ? Math.round(val * 3600)
        : Math.round((val / RATE_PER_HOUR) * 3600);
      setTotalSecs(secs);
      setRemaining(secs);
      setRoomState(prev => ({
        ...prev, status: 'occupied',
        player: null, game: null,
        since: sinceStr, startTime: nowMs, endTime: nowMs + (secs * 1000),
        revenue: occupyMode === 'amount' ? val : 0,
        sessionMode: occupyMode,
      }));
    }
    setShowOccupyModal(false);
    setOccupyValue('');
  };

  const handleEndSession = () => {
    clearInterval(timerRef.current);
    if (isVipRef.current) {
      const owed = parseFloat(((vipElapsed / 3600) * RATE_PER_HOUR).toFixed(2));
      setCheckoutAmount(owed + barTotal);
      setShowCheckout(true);
    } else {
      setCheckoutAmount(playCost + barTotal);
      setShowCheckout(true);
    }
    isVipRef.current = false;
  };

  const confirmCheckout = () => {
    setShowCheckout(false);
    setVipElapsed(0);
    setRemaining(0);
    setLiveBarOrders([]);
    setRoomState(prev => ({ ...prev, status: 'available', player: null, game: null, since: null, startTime: null, endTime: null, revenue: checkoutAmount }));
  };

  const handleMaintenance = () => {
    clearInterval(timerRef.current);
    isVipRef.current = false;
    setVipElapsed(0);
    setRemaining(0);
    setLiveBarOrders([]);
    setRoomState(prev => ({ ...prev, status: 'maintenance', player: null, game: null, since: null }));
  };

  return (
    <div className="page-content fade-in">

      {/* Back + Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm" style={{ gap: 6 }}>
          <ArrowLeft size={14} /> Back
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 24, fontWeight: 800 }}>
            Room {room.number}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>
            {typeIcons[room.type]} {room.type} · {room.console}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: cfg.bg, borderRadius: 999, padding: '6px 14px', fontSize: 13, fontWeight: 700, color: cfg.color }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.dot, boxShadow: roomState.status === 'occupied' ? `0 0 8px ${cfg.dot}` : 'none' }} />
          {cfg.label}
        </div>
      </div>

      {/* Top Section: Room Info + Actions */}
      <div className="grid-7-3" style={{ marginBottom: 24 }}>

        {/* Room Hero Card */}
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(6,182,212,0.06))', borderColor: 'var(--border-accent)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 150, height: 150, borderRadius: '50%', background: `${cfg.color}18`, pointerEvents: 'none' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
            {[
              { label: 'Room Type', value: room.type, icon: typeIcons[room.type] },
              { label: 'Console', value: room.console, icon: '🎮' },
              { label: 'Today Revenue', value: formatSomRaw(roomState.revenue), icon: '💰' },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '16px 12px', background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 26, marginBottom: 6 }}>{item.icon}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{item.label}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4, fontFamily: 'Orbitron, sans-serif' }}>{item.value}</div>
              </div>
            ))}
          </div>

          {roomState.status === 'occupied' && (() => {
            const displaySecs = isVip ? vipElapsed : remaining;
            const timerColor = isVip ? '#8b5cf6' : getTimerColor(remaining);
            const timesUp = !isVip && remaining === 0;
            const isWarning = !isVip && remaining > 0 && remaining <= 600;
            const vipOwed = formatSomRaw(playCost);
            return (
              <div style={{
                marginTop: 20, padding: '20px',
                background: isVip ? 'rgba(139,92,246,0.08)' : timesUp ? 'rgba(107,114,128,0.08)' : isWarning ? 'rgba(245,158,11,0.08)' : 'rgba(16,185,129,0.08)',
                borderRadius: 12,
                border: `1px solid ${timerColor}40`,
                transition: 'all 0.5s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Current Session</div>
                  {isVip && <span style={{ fontSize: 10, background: 'rgba(139,92,246,0.2)', color: '#8b5cf6', padding: '2px 10px', borderRadius: 999, fontWeight: 700, letterSpacing: 0.5 }}>👑 VIP — PAY LATER</span>}
                </div>

                {/* Timer display */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: `${timerColor}18`, borderRadius: 10,
                    padding: '10px 20px', border: `1px solid ${timerColor}50`,
                    transition: 'all 0.5s',
                  }}>
                    {!timesUp && (
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: timerColor, boxShadow: `0 0 8px ${timerColor}`, animation: 'glowPulse 1.5s ease infinite' }} />
                    )}
                    {timesUp
                      ? <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 18, fontWeight: 800, color: '#6b7280' }}>⏰ TIME&apos;S UP</span>
                      : <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 28, fontWeight: 800, color: timerColor, letterSpacing: 3, transition: 'color 0.5s' }}>
                          {formatCountdown(displaySecs)}
                        </span>
                    }
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.8 }}>
                    <div>Started at <strong style={{ color: 'var(--text-secondary)' }}>{roomState.since}</strong></div>
                    {isVip && <div style={{ color: '#8b5cf6', fontWeight: 600 }}>Running cost: <strong>{vipOwed}</strong></div>}
                    {isWarning && !timesUp && <div style={{ color: '#f59e0b', fontWeight: 600 }}>⚠ Less than {remaining <= 120 ? '2 minutes' : '10 minutes'} left!</div>}
                  </div>
                </div>

                {/* Progress bar — only for pre-paid modes */}
                {!isVip && remaining > 0 && totalSecs > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 999, width: `${(remaining / totalSecs) * 100}%`, background: `linear-gradient(90deg, ${timerColor}, ${timerColor}99)`, transition: 'width 1s linear, background 0.5s' }} />
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Users size={14} color={timerColor} />
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{roomState.player}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Gamepad2 size={14} color="var(--accent-light)" />
                    <span style={{ fontSize: 13, color: 'var(--accent-light)', fontWeight: 600 }}>{roomState.game}</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Action Buttons */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Quick Actions</div>

          {roomState.status !== 'occupied' && (
            <button className="btn btn-primary" onClick={() => setShowOccupyModal(true)} style={{ justifyContent: 'center' }}>
              <Gamepad2 size={15} /> Occupy Room
            </button>
          )}
          {roomState.status === 'occupied' && (
            <button className="btn btn-success" onClick={handleEndSession} style={{ justifyContent: 'center' }}>
              <CheckCircle size={15} /> End Session
            </button>
          )}
          <button
            className="btn btn-danger"
            onClick={handleMaintenance}
            disabled={roomState.status === 'maintenance'}
            style={{ justifyContent: 'center', opacity: roomState.status === 'maintenance' ? 0.5 : 1 }}
          >
            <Wrench size={15} /> Set Maintenance
          </button>
          {roomState.status !== 'available' && (
            <button className="btn btn-secondary" onClick={() => setRoomState(prev => ({ ...prev, status: 'available', player: null, game: null, since: null }))} style={{ justifyContent: 'center' }}>
              <CheckCircle size={15} /> Mark Available
            </button>
          )}

          <div style={{ marginTop: 8, padding: '12px 14px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Current Session Total</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#06b6d4', fontFamily: 'Orbitron, sans-serif' }}>{formatSomRaw(playCost + barTotal)}</div>
            <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--text-muted)', marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
              <span>🎮 Play: {formatSomRaw(playCost)}</span>
              <span>•</span>
              <span>☕ Bar: {formatSomRaw(barTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom 3 columns: History | Spending | Bar Orders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 20 }}>

        {/* Session History */}
        <div className="card">
          <SectionTitle icon={Clock} label="Last 7 Sessions" color="#7c3aed" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {sessions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 13 }}>No sessions yet</div>
            ) : sessions.map((s, i) => (
              <div key={s.id} style={{ padding: '12px 0', borderBottom: i < sessions.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <div style={{
                        width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                        background: s.status === 'active' ? '#ef4444' : '#10b981',
                        boxShadow: s.status === 'active' ? '0 0 6px #ef4444' : 'none',
                      }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{s.player}</span>
                      {s.status === 'active' && (
                        <span style={{ fontSize: 10, background: 'rgba(239,68,68,0.15)', color: '#ef4444', padding: '1px 7px', borderRadius: 999, fontWeight: 700 }}>LIVE</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, color: 'var(--accent-light)' }}>🎮 {s.game}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>⏱ {s.duration}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>📅 {s.date}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                      {s.start} {s.end ? `→ ${s.end}` : '→ ongoing'}
                    </div>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#10b981', flexShrink: 0, marginLeft: 12 }}>{formatSomRaw(s.amount)}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(124,58,237,0.08)', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>7-session total</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent-light)', fontFamily: 'Orbitron, sans-serif' }}>{formatSomRaw(sessionTotal)}</span>
          </div>
        </div>

        {/* Spending / Charges */}
        <div className="card">
          <SectionTitle icon={DollarSign} label="Club Spending" color="#f59e0b" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {spendings.map((s, i) => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < spendings.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                  {s.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.category} · {s.date}</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', flexShrink: 0 }}>-{formatSomRaw(s.amount)}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(239,68,68,0.08)', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total spending</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#ef4444' }}>
              -{formatSomRaw(spendings.reduce((a, s) => a + s.amount, 0))}
            </span>
          </div>
        </div>

        {/* Bar Orders */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06b6d4' }}>
                <Coffee size={16} />
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Bar Orders</span>
              {roomState.status !== 'occupied' && (
                <span style={{ fontSize: 10, background: 'rgba(239,68,68,0.12)', color: '#ef4444', padding: '2px 8px', borderRadius: 999, fontWeight: 700, letterSpacing: 0.5 }}>
                  🔒 ROOM EMPTY
                </span>
              )}
            </div>
            <button
              onClick={() => roomState.status === 'occupied' && setShowBarMenu(true)}
              disabled={roomState.status !== 'occupied'}
              title={roomState.status !== 'occupied' ? 'Room must be occupied to add bar orders' : 'Add bar order'}
              style={{
                width: 30, height: 30, borderRadius: '50%',
                background: roomState.status === 'occupied' ? 'rgba(6,182,212,0.15)' : 'rgba(107,114,128,0.1)',
                border: `1px solid ${roomState.status === 'occupied' ? 'rgba(6,182,212,0.4)' : 'rgba(107,114,128,0.2)'}`,
                color: roomState.status === 'occupied' ? '#06b6d4' : '#6b7280',
                fontSize: 18, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: roomState.status === 'occupied' ? 'pointer' : 'not-allowed',
                lineHeight: 1, transition: 'all 0.2s', opacity: roomState.status === 'occupied' ? 1 : 0.5,
              }}
            >+</button>
          </div>

          {roomState.status !== 'occupied' ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🔒</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Room not occupied</div>
              <div style={{ fontSize: 12, lineHeight: 1.6 }}>Bar orders can only be placed<br />when the room has an active session.</div>
            </div>
          ) : liveBarOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
              <ShoppingCart size={28} style={{ opacity: 0.3, marginBottom: 8 }} />
              <div style={{ fontSize: 13, marginBottom: 10 }}>No orders yet</div>
              <button onClick={() => setShowBarMenu(true)} className="btn btn-secondary btn-sm" style={{ gap: 6 }}>
                + Add Order
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {liveBarOrders.map((o, i) => (
                  <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < liveBarOrders.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>
                      {o.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{o.item}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>@ {formatSomRaw(o.price)} · {o.time}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <button onClick={() => removeBarItem(o.item)} style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>−</button>
                      <span style={{ fontSize: 13, fontWeight: 700, minWidth: 16, textAlign: 'center' }}>×{o.qty}</span>
                      <button onClick={() => addBarItem({ name: o.item, price: o.price, icon: o.icon })} style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.3)', color: '#06b6d4', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>+</button>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#06b6d4', marginLeft: 6, flexShrink: 0 }}>{formatSomRaw(o.qty * o.price)}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(6,182,212,0.08)', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Bar total</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#06b6d4', fontFamily: 'Orbitron, sans-serif' }}>{formatSomRaw(barTotal)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Occupy Modal */}
      {showOccupyModal && (
        <div
          onClick={() => setShowOccupyModal(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-accent)', borderRadius: 18, padding: 28, minWidth: 380, maxWidth: 440, boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <div>
                <h3 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 18, fontWeight: 800 }}>Occupy Room {room.number}</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>Set up a new gaming session</p>
              </div>
              <button onClick={() => setShowOccupyModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="tabs" style={{ marginBottom: 20 }}>
              <button className={`tab ${occupyMode === 'hours' ? 'active' : ''}`} onClick={() => setOccupyMode('hours')}>⏱ By Hours</button>
              <button className={`tab ${occupyMode === 'amount' ? 'active' : ''}`} onClick={() => setOccupyMode('amount')}>💵 By Amount</button>
              <button className={`tab ${occupyMode === 'vip' ? 'active' : ''}`} onClick={() => setOccupyMode('vip')}>👑 VIP</button>
            </div>

            {/* VIP description */}
            {occupyMode === 'vip' && (
              <div style={{ padding: '12px 16px', background: 'rgba(139,92,246,0.1)', borderRadius: 10, border: '1px solid rgba(139,92,246,0.3)', marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#8b5cf6', marginBottom: 4 }}>👑 Play Now, Pay Later</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>Timer counts up from 0. When the session ends, the total amount owed is calculated automatically at <strong style={{ color: 'var(--text-secondary)' }}>{formatSomRaw(RATE_PER_HOUR)}/hr</strong>.</div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {occupyMode !== 'vip' && (
                <div className="form-group">
                  <label className="form-label">{occupyMode === 'hours' ? 'Duration (hours) *' : `Pre-paid Amount (so'm) *`}</label>
                  <input
                    className="form-input"
                    type="number"
                    min={occupyMode === 'hours' ? 0.5 : 1}
                    step={occupyMode === 'hours' ? 0.5 : 1}
                    placeholder={occupyMode === 'hours' ? 'e.g. 2' : 'e.g. 100000'}
                    value={occupyValue}
                    onChange={e => setOccupyValue(e.target.value)}
                  />
                  {occupyValue && occupyMode === 'hours' && (
                    <div style={{ fontSize: 12, color: 'var(--accent-light)', marginTop: 4 }}>
                      Estimated cost: {formatSomRaw(Number(occupyValue) * RATE_PER_HOUR)} (@ {formatSomRaw(RATE_PER_HOUR)}/hr)
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleOccupy}>
                <Gamepad2 size={15} /> Start Session
              </button>
              <button className="btn btn-secondary" onClick={() => setShowOccupyModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {/* Bar Menu Modal */}
      {showBarMenu && (() => {
        const BAR_CATS = ['All', 'Drinks', 'Hot', 'Food', 'Snacks'];
        const filtered = barCategory === 'All' ? barItems : barItems.filter(i => i.category === barCategory);
        return (
          <div onClick={() => setShowBarMenu(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-accent)', borderRadius: 20, padding: 28, width: 460, maxWidth: '95vw', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <div>
                  <h3 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 17, fontWeight: 800 }}>🍽 Bar Menu</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>Room {room.number} · tap to add</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {barTotal > 0 && <span style={{ fontSize: 13, fontWeight: 700, color: '#06b6d4' }}>Cart: {formatSomRaw(barTotal)}</span>}
                  <button onClick={() => setShowBarMenu(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
                {BAR_CATS.map(cat => (
                  <button key={cat} onClick={() => setBarCategory(cat)} style={{ padding: '5px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid', transition: 'all 0.2s', background: barCategory === cat ? '#06b6d4' : 'transparent', color: barCategory === cat ? '#fff' : 'var(--text-muted)', borderColor: barCategory === cat ? '#06b6d4' : 'var(--border)' }}>
                    {cat}
                  </button>
                ))}
              </div>

              <div style={{ overflowY: 'auto', flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, paddingBottom: 4 }}>
                {filtered.map(item => {
                  const ordered = liveBarOrders.find(o => o.item === item.name);
                  return (
                    <button key={item.id} onClick={() => addBarItem(item)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: ordered ? 'rgba(6,182,212,0.08)' : 'var(--bg-secondary)', border: `1px solid ${ordered ? '#06b6d4' : 'var(--border)'}`, borderRadius: 12, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', position: 'relative' }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{item.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                        <div style={{ fontSize: 11, color: '#06b6d4', fontWeight: 700 }}>{formatSomRaw(item.price)}</div>
                      </div>
                      {ordered && (
                        <div style={{ position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: '50%', background: '#06b6d4', color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {ordered.qty}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{liveBarOrders.length} type(s) · {formatSomRaw(barTotal)} total</span>
                <button className="btn btn-primary btn-sm" onClick={() => setShowBarMenu(false)}>✓ Done</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Checkout Modal */}
      {showCheckout && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400 }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: 20, padding: 32, minWidth: 360, maxWidth: 420, boxShadow: '0 24px 60px rgba(0,0,0,0.6), 0 0 40px rgba(6,182,212,0.1)' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>{isVip ? '👑' : '🧾'}</div>
              <h3 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 20, fontWeight: 800, color: isVip ? '#8b5cf6' : '#06b6d4' }}>
                {isVip ? 'VIP Session Checkout' : 'Session Checkout'}
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>{roomState.player || 'Guest'} · {roomState.game || 'Session'}</p>
            </div>

            <div style={{ background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.15)', borderRadius: 14, padding: '20px 24px', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Play Time {isVip ? `(${formatCountdown(vipElapsed)})` : ''}</span>
                <span style={{ fontSize: 16, fontWeight: 800, fontFamily: 'Orbitron, sans-serif', color: 'var(--text-primary)' }}>{formatSomRaw(playCost)}</span>
              </div>
              {barTotal > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Bar Orders ({liveBarOrders.length})</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#06b6d4' }}>{formatSomRaw(barTotal)}</span>
                </div>
              )}
              <div style={{ height: 1, background: 'var(--border)', margin: '14px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Total Owed</span>
                <span style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Orbitron, sans-serif', color: '#10b981' }}>{formatSomRaw(checkoutAmount)}</span>
              </div>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 15, padding: '13px' }} onClick={confirmCheckout}>
              ✅ Confirm Payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
