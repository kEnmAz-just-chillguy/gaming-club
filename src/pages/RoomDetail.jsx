import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSupabaseRooms } from '../hooks/useSupabaseRooms';
import { useRoomSessions } from '../hooks/useRoomSessions';
import { formatSomRaw, RATE_PER_HOUR_SOM } from '../utils/currency';
import { SkeletonSmallSessionRow, SkeletonLine, SkeletonBlock } from '../components/Skeleton';
import {
  ArrowLeft, Monitor, Clock, Gamepad2,
  Wrench, Coffee, CheckCircle, XCircle, AlertTriangle, ShoppingCart, X, Eye
} from 'lucide-react';
import { supabase } from '../config/supabase';

const statusCfg = {
  occupied: { label: 'Occupied', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', dot: '#ef4444' },
  available: { label: 'Available', color: '#10b981', bg: 'rgba(16,185,129,0.12)', dot: '#10b981' },
  maintenance: { label: 'Maintenance', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', dot: '#f59e0b' },
};
const typeIcons = { 
  'VIP Suite': '👑', 
  'VIP': '👑', 
  'Premium': '⭐', 
  'Standard': '🖥️', 
  'Obshiy': '👥', 
  'PlayStation': '🎮' 
};

const SectionTitle = ({ icon: Icon, label, color = 'var(--accent-light)' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
      <Icon size={16} />
    </div>
    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{label}</span>
  </div>
);

const getSessionTimes = (startTimeStr, endTimeStr) => {
  const now = Date.now();
  let startMs = null;
  let endMs = null;
  const TWO_HOURS = 2 * 60 * 60 * 1000;
  const ONE_DAY = 24 * 60 * 60 * 1000;

  if (startTimeStr) {
    const [h, m] = startTimeStr.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    startMs = d.getTime();
    if (startMs > now + TWO_HOURS) startMs -= ONE_DAY;
  }

  if (endTimeStr) {
    const [h, m] = endTimeStr.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    endMs = d.getTime();
    if (startMs && endMs < startMs) {
      endMs += ONE_DAY;
    } else if (!startMs && endMs < now - 12 * 60 * 60 * 1000) {
      endMs += ONE_DAY;
    }
  }

  return { startMs, endMs };
};

const mapProductDetails = (name) => {
  const lowercaseName = name.toLowerCase();
  
  let icon = '🛒';
  let category = 'Snacks';
  
  if (lowercaseName.includes('water') || lowercaseName.includes('suv') || lowercaseName.includes('mineral')) {
    icon = '💧';
    category = 'Drinks';
  } else if (lowercaseName.includes('cola') || lowercaseName.includes('coca') || lowercaseName.includes('pepsi') || lowercaseName.includes('fanta') || lowercaseName.includes('sprite') || lowercaseName.includes('limonad')) {
    icon = '🥤';
    category = 'Drinks';
  } else if (lowercaseName.includes('energy') || lowercaseName.includes('pulse') || lowercaseName.includes('red bull') || lowercaseName.includes('adrenal') || lowercaseName.includes('flash')) {
    icon = '⚡';
    category = 'Drinks';
  } else if (lowercaseName.includes('juice') || lowercaseName.includes('sok') || lowercaseName.includes('shirin')) {
    icon = '🧃';
    category = 'Drinks';
  } else if (lowercaseName.includes('coffee') || lowercaseName.includes('kofe') || lowercaseName.includes('espresso') || lowercaseName.includes('cappuccino') || lowercaseName.includes('latte')) {
    icon = '☕';
    category = 'Hot';
  } else if (lowercaseName.includes('tea') || lowercaseName.includes('choy')) {
    icon = '🍵';
    category = 'Hot';
  } else if (lowercaseName.includes('burger') || lowercaseName.includes('sandwich') || lowercaseName.includes('hotdog') || lowercaseName.includes('shaurma') || lowercaseName.includes('lavash') || lowercaseName.includes('pizza')) {
    icon = '🍔';
    category = 'Food';
  } else if (lowercaseName.includes('chips') || lowercaseName.includes('chiz') || lowercaseName.includes('pishiriq') || lowercaseName.includes('pechine') || lowercaseName.includes('shokolad') || lowercaseName.includes('snack') || lowercaseName.includes('nuts')) {
    icon = '🍟';
    category = 'Snacks';
  }
  
  return { icon, category };
};

export default function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { rooms: globalRooms, loading, updateRoom } = useSupabaseRooms();
  const room = globalRooms.find(r => r.id === Number(id));

  const [barItems, setBarItems] = useState([]);
  const [barLoading, setBarLoading] = useState(true);

  useEffect(() => {
    const fetchBarItems = async () => {
      setBarLoading(true);
      try {
        const { data, error } = await supabase
          .from('bars')
          .select('*')
          .order('name', { ascending: true });
        if (!error && data) {
          const mapped = data.map(item => {
            const { icon, category } = mapProductDetails(item.name);
            return {
              id: item.id,
              name: item.name,
              price: item.sotuv_narxi || 0,
              originalPrice: item.price || 0,
              qtyAvailable: item.quantity || 0,
              unit: item.unit || 'dona',
              category,
              icon
            };
          });
          setBarItems(mapped);
        }
      } catch (err) {
        console.error('Error fetching bar items in RoomDetail:', err);
      } finally {
        setBarLoading(false);
      }
    };
    fetchBarItems();
  }, []);

  const [showOccupyModal, setShowOccupyModal] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showBarMenu, setShowBarMenu] = useState(false);
  const [checkoutAmount, setCheckoutAmount] = useState(0);
  const [occupyMode, setOccupyMode] = useState('hours');
  const [occupyValue, setOccupyValue] = useState('');
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash', 'card', 'split'
  const [cashAmount, setCashAmount] = useState(0);
  const [cardAmount, setCardAmount] = useState(0);
  const [showBarDetail, setShowBarDetail] = useState(false);
  const [selectedSessionBarItems, setSelectedSessionBarItems] = useState(null); // null = live session, array = historical
  const [roomState, setRoomState] = useState(room);
  const [liveBarOrders, setLiveBarOrders] = useState([]);

  // Sync roomState whenever Supabase realtime pushes an update
  useEffect(() => {
    if (room) {
      setRoomState(room);
    }
  }, [room]);

  // Helper function to update state locally and in Supabase
  const updateRoomState = async (updates) => {
    if (!room) return;
    try {
      // Optimistic local update
      setRoomState(prev => ({ ...prev, ...updates }));
      await updateRoom(room.id, updates);
    } catch (e) {
      console.error('Failed to update room in database:', e);
      // Revert if update fails
      setRoomState(room);
    }
  };

  const [remaining, setRemaining] = useState(() => {
    if (room?.endTime) {
      const { endMs } = getSessionTimes(room.startTime, room.endTime);
      return Math.max(0, Math.floor((endMs - Date.now()) / 1000));
    }
    return 0;
  });
  const [vipElapsed, setVipElapsed] = useState(() => {
    if (room?.startTime) {
      const { startMs } = getSessionTimes(room.startTime, null);
      return Math.max(0, Math.floor((Date.now() - startMs) / 1000));
    }
    return 0;
  });

  const [barCategory, setBarCategory] = useState('All');
  const timerRef = useRef(null);
  const isVipRef = useRef(false);
  const nextBarId = useRef(100);

  const RATE_PER_HOUR = (roomState || room)?.pricePerHour ? Number((roomState || room).pricePerHour) : RATE_PER_HOUR_SOM;

  let totalSecs = 0;
  if ((roomState || room)?.startTime && (roomState || room)?.endTime) {
    const { startMs, endMs } = getSessionTimes((roomState || room).startTime, (roomState || room).endTime);
    totalSecs = Math.max(0, Math.round((endMs - startMs) / 1000));
  }

  const formatCountdown = (secs) => {
    const s = Math.max(0, secs);
    const h = String(Math.floor(s / 3600)).padStart(2, '0');
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  const getTimerColor = (secs) => {
    if (secs <= 0) return '#6b7280';
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
        const { startMs } = getSessionTimes(roomState.startTime, null);
        setVipElapsed(Math.floor((now - startMs) / 1000));
        isVipRef.current = true;
      } else if (roomState.endTime) {
        const { endMs } = getSessionTimes(roomState.startTime, roomState.endTime);
        const rem = Math.floor((endMs - now) / 1000);
        setRemaining(rem > 0 ? rem : 0);
        isVipRef.current = false;
      }
    };

    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomState?.status, roomState?.startTime, roomState?.endTime, roomState?.sessionMode]);

  // ── Must be called before any early returns (Rules of Hooks) ──────────────
  const { sessions, saveSession, loading: sessionsLoading } = useRoomSessions(room?.id, 7);
  // ─────────────────────────────────────────────────────────────────────────

  // Show loading while Supabase fetches OR while roomState hasn't been set yet
  if (loading && globalRooms.length === 0) {
    return (
      <div className="page-content fade-in">
        {/* Back + title skeleton */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <SkeletonBlock width={80} height={34} radius={8} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SkeletonLine width={160} height={22} />
            <SkeletonLine width={120} height={13} />
          </div>
          <SkeletonLine width={90} height={28} radius={999} />
        </div>

        {/* Hero card + actions skeleton */}
        <div className="grid-7-3" style={{ marginBottom: 24 }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ padding: '16px 12px', background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
                  <SkeletonBlock width={32} height={32} radius={8} />
                  <SkeletonLine width="60%" height={11} />
                  <SkeletonLine width="80%" height={18} />
                </div>
              ))}
            </div>
            <SkeletonBlock width="100%" height={90} radius={12} />
          </div>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SkeletonLine width="50%" height={11} />
            <SkeletonBlock width="100%" height={40} radius={8} />
            <SkeletonBlock width="100%" height={40} radius={8} />
            <SkeletonBlock width="100%" height={80} radius={10} />
          </div>
        </div>

        {/* Sessions + bar skeleton */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <SkeletonBlock width={32} height={32} radius={8} style={{ flexShrink: 0 }} />
              <SkeletonLine width={120} height={15} />
            </div>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ padding: '12px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                <SkeletonSmallSessionRow />
              </div>
            ))}
          </div>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <SkeletonBlock width={32} height={32} radius={8} style={{ flexShrink: 0 }} />
              <SkeletonLine width={100} height={15} />
            </div>
            <SkeletonBlock width="100%" height={120} radius={10} />
          </div>
        </div>
      </div>
    );
  }

  if (!room) return (
    <div className="page-content" style={{ textAlign: 'center', paddingTop: 80 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
      <div style={{ fontSize: 18, color: 'var(--text-muted)' }}>Room not found</div>
      <button className="btn btn-secondary btn-sm" style={{ marginTop: 20 }} onClick={() => navigate(-1)}>Go Back</button>
    </div>
  );

  // roomState lags one render behind room on first load — wait for the useEffect to sync
  if (!roomState) return null;

  // roomState may lag one render behind room when first loaded — use room as fallback
  const activeRoom = roomState || room;

  const barTotal = liveBarOrders.reduce((a, o) => a + o.qty * o.price, 0);
  const sessionTotal = sessions.reduce((a, s) => a + (s.total_amount || 0), 0);
  const cfg = statusCfg[activeRoom.status];

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

  const handleOccupy = async () => {
    if (occupyMode !== 'vip' && !occupyValue) return;
    setIsStartingSession(true);
    const val = Number(occupyValue);
    const now = new Date();
    const startTimeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

    let updates = {};
    if (occupyMode === 'vip') {
      isVipRef.current = true;
      setVipElapsed(0);
      setRemaining(0);
      updates = {
        status: 'occupied',
        startTime: startTimeStr,
        endTime: null,
        revenue: 0,
        sessionMode: 'vip',
      };
    } else {
      isVipRef.current = false;
      const secs = occupyMode === 'hours'
        ? Math.round(val * 3600)
        : Math.round((val / RATE_PER_HOUR) * 3600);
      setRemaining(secs);
      
      const end = new Date(now.getTime() + (secs * 1000));
      const endTimeStr = end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

      updates = {
        status: 'occupied',
        startTime: startTimeStr,
        endTime: endTimeStr,
        revenue: occupyMode === 'amount' ? val : 0,
        sessionMode: occupyMode,
      };
    }

    try {
      await updateRoomState(updates);
      setShowOccupyModal(false);
      setOccupyValue('');
    } catch (e) {
      console.error('Error starting session:', e);
    } finally {
      setIsStartingSession(false);
    }
  };

  const roundUpTo500 = (amount) => Math.ceil(amount / 500) * 500;

  const handleEndSession = () => {
    clearInterval(timerRef.current);
    const rawTotal = isVipRef.current
      ? parseFloat(((vipElapsed / 3600) * RATE_PER_HOUR).toFixed(2)) + barTotal
      : playCost + barTotal;
    const rounded = roundUpTo500(rawTotal);
    setCheckoutAmount(rounded);
    setPaymentMethod('cash');
    setCashAmount(rounded);
    setCardAmount(0);
    setShowCheckout(true);
    isVipRef.current = false;
  };

  const handleSelectPaymentMethod = (method) => {
    setPaymentMethod(method);
    if (method === 'cash') {
      setCashAmount(checkoutAmount);
      setCardAmount(0);
    } else if (method === 'card') {
      setCashAmount(0);
      setCardAmount(checkoutAmount);
    } else if (method === 'split') {
      const half = Math.round(checkoutAmount / 2);
      setCashAmount(half);
      setCardAmount(checkoutAmount - half);
    }
  };

  const handleSplitChange = (type, val) => {
    const value = Math.max(0, Math.min(checkoutAmount, val));
    if (type === 'cash') {
      setCashAmount(value);
      setCardAmount(checkoutAmount - value);
    } else {
      setCardAmount(value);
      setCashAmount(checkoutAmount - value);
    }
  };

  const confirmCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const updates = { 
        status: 'available', 
        startTime: null, 
        endTime: null, 
        revenue: checkoutAmount 
      };
      await updateRoomState(updates);

      // ── Save this session to Supabase ──────────────────────────────────────────
      const durationSecs = isVip ? vipElapsed : (totalSecs - remaining);
      const now = new Date();
      const endTimeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      const res = await saveSession({
        room_id: room.id,
        room_number: room.number,
        start_time: roomState.startTime || null,
        end_time: endTimeStr,
        session_mode: roomState.sessionMode || 'hours',
        play_amount: playCost,
        bar_amount: barTotal,
        total_amount: checkoutAmount,
        duration_secs: Math.max(0, Math.round(durationSecs)),
        payment_method: paymentMethod,
        cash_amount: cashAmount,
        card_amount: cardAmount,
        bar_items: liveBarOrders.length > 0 ? JSON.stringify(liveBarOrders) : null,
      });

      if (res && !res.success) {
        alert(
          "⚠️ Database Schema Notice:\n\n" +
          "The session payment could not be saved to Supabase because the database table 'room_sessions' needs to be updated with new columns.\n\n" +
          "Please run the following SQL command in your Supabase SQL Editor:\n\n" +
          "ALTER TABLE room_sessions \n" +
          "ADD COLUMN payment_method text DEFAULT 'cash',\n" +
          "ADD COLUMN cash_amount numeric DEFAULT 0,\n" +
          "ADD COLUMN card_amount numeric DEFAULT 0;\n\n" +
          "Error detail: " + res.error.message
        );
      }
      // ──────────────────────────────────────────────────────────────────────────

      setShowCheckout(false);
      setVipElapsed(0);
      setRemaining(0);
      setLiveBarOrders([]);
    } catch (e) {
      console.error('Error confirming checkout:', e);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleMaintenance = () => {
    const updates = { 
      status: 'maintenance', 
      startTime: null,
      endTime: null
    };
    updateRoomState(updates);
    clearInterval(timerRef.current);
    isVipRef.current = false;
    setVipElapsed(0);
    setRemaining(0);
    setLiveBarOrders([]);
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
            {typeIcons[room.type] || '🎮'} {room.type} · {room.console}
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
                    <div>Started at <strong style={{ color: 'var(--text-secondary)' }}>{roomState.startTime}</strong></div>

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
            <button className="btn btn-secondary" onClick={() => updateRoomState({ status: 'available', startTime: null, endTime: null })} style={{ justifyContent: 'center' }}>
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

      {/* Bottom 2 columns: History | Bar Orders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Session History */}
        <div className="card">
          <SectionTitle icon={Clock} label="Last 7 Sessions" color="#7c3aed" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {sessionsLoading && sessions.length === 0 ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                  <SkeletonSmallSessionRow />
                </div>
              ))
            ) : sessions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 13 }}>No sessions yet</div>
            ) : sessions.map((s, i) => {
              // Format duration from duration_secs
              const dur = s.duration_secs || 0;
              const dh = Math.floor(dur / 3600);
              const dm = Math.floor((dur % 3600) / 60);
              const durationLabel = dh > 0 ? `${dh}h ${dm}m` : `${dm}m`;
              // Format date from created_at
              const createdAt = new Date(s.created_at);
              const dateLabel = createdAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
              const modeLabel = s.session_mode === 'vip' ? '👑 VIP' : s.session_mode === 'amount' ? '💵 Fixed' : '⏱ Hours';
              return (
                <div key={s.id} style={{ padding: '12px 0', borderBottom: i < sessions.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: '#10b981' }} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Session</span>
                        <span style={{ fontSize: 10, background: 'rgba(124,58,237,0.15)', color: '#7c3aed', padding: '1px 7px', borderRadius: 999, fontWeight: 700 }}>{modeLabel}</span>
                        <span style={{ 
                          fontSize: 10, 
                          background: s.payment_method === 'card' ? 'rgba(6,182,212,0.15)' : s.payment_method === 'split' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)', 
                          color: s.payment_method === 'card' ? '#06b6d4' : s.payment_method === 'split' ? '#f59e0b' : '#10b981', 
                          padding: '1px 7px', 
                          borderRadius: 999, 
                          fontWeight: 700 
                        }}>
                          {s.payment_method === 'card' ? '💳 Card' : s.payment_method === 'split' ? '🔄 Split' : '💵 Cash'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>⏱ {durationLabel}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>📅 {dateLabel}</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                        {s.start_time} {s.end_time ? `→ ${s.end_time}` : ''}
                      </div>
                      {s.payment_method === 'split' && (
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                          💵 Cash: {formatSomRaw(s.cash_amount)} · 💳 Card: {formatSomRaw(s.card_amount)}
                        </div>
                      )}
                      {s.bar_amount > 0 && (() => {
                        let parsedItems = null;
                        try { parsedItems = s.bar_items ? JSON.parse(s.bar_items) : null; } catch {}
                        return (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                            <span style={{ fontSize: 11, color: '#06b6d4' }}>☕ Bar: {formatSomRaw(s.bar_amount)}</span>
                            <button
                              onClick={e => { e.stopPropagation(); setSelectedSessionBarItems(parsedItems || []); setShowBarDetail(true); }}
                              title="View bar items"
                              style={{
                                background: 'rgba(6,182,212,0.12)',
                                border: '1px solid rgba(6,182,212,0.25)',
                                borderRadius: 6,
                                width: 20, height: 20,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer',
                                color: '#06b6d4',
                                flexShrink: 0,
                                padding: 0,
                              }}
                            >
                              <Eye size={11} />
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#10b981', flexShrink: 0, marginLeft: 12 }}>{formatSomRaw(s.total_amount)}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(124,58,237,0.08)', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>7-session total</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent-light)', fontFamily: 'Orbitron, sans-serif' }}>{formatSomRaw(sessionTotal)}</span>
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
          onClick={() => !isStartingSession && setShowOccupyModal(false)}
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
              <button 
                onClick={() => !isStartingSession && setShowOccupyModal(false)} 
                disabled={isStartingSession}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: isStartingSession ? 'not-allowed' : 'pointer', opacity: isStartingSession ? 0.5 : 1 }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="tabs" style={{ marginBottom: 20 }}>
              <button className={`tab ${occupyMode === 'hours' ? 'active' : ''}`} onClick={() => !isStartingSession && setOccupyMode('hours')} disabled={isStartingSession}>⏱ By Hours</button>
              <button className={`tab ${occupyMode === 'amount' ? 'active' : ''}`} onClick={() => !isStartingSession && setOccupyMode('amount')} disabled={isStartingSession}>💵 By Amount</button>
              <button className={`tab ${occupyMode === 'vip' ? 'active' : ''}`} onClick={() => !isStartingSession && setOccupyMode('vip')} disabled={isStartingSession}>👑 VIP</button>
            </div>

            {/* VIP description */}
            {occupyMode === 'vip' && (
              <div style={{ padding: '12px 16px', background: 'rgba(139,92,246,0.1)', borderRadius: 10, border: '1px solid rgba(139,92,246,0.3)', marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#8b5cf6', marginBottom: 4 }}>👑 Play Now, Pay Later</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>Timer counts up from 0. When the session ends, the total amount owed is calculated automatically.</div>
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
                    disabled={isStartingSession}
                  />

                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1, justifyContent: 'center' }} 
                onClick={handleOccupy}
                disabled={isStartingSession}
              >
                {isStartingSession ? (
                  <>
                    <div className="spinner spinner-sm" style={{ marginRight: 8 }}></div>
                    Starting...
                  </>
                ) : (
                  <>
                    <Gamepad2 size={15} /> Start Session
                  </>
                )}
              </button>
              <button className="btn btn-secondary" onClick={() => setShowOccupyModal(false)} disabled={isStartingSession}>Cancel</button>
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
                {barLoading ? (
                  Array.from({ length: 6 }).map((_, idx) => (
                    <div key={idx} style={{ height: 64, borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px' }}>
                      <div className="skeleton" style={{ width: 38, height: 38, borderRadius: 10 }} />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div className="skeleton" style={{ width: '80%', height: 12, borderRadius: 4 }} />
                        <div className="skeleton" style={{ width: '40%', height: 10, borderRadius: 4 }} />
                      </div>
                    </div>
                  ))
                ) : filtered.length === 0 ? (
                  <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                    No products found in inventory
                  </div>
                ) : (
                  filtered.map(item => {
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
                  })
                )}
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
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>Session Checkout</p>
            </div>

            <div style={{ background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.15)', borderRadius: 14, padding: '20px 24px', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Play Time {isVip ? `(${formatCountdown(vipElapsed)})` : ''}</span>
                <span style={{ fontSize: 16, fontWeight: 800, fontFamily: 'Orbitron, sans-serif', color: 'var(--text-primary)' }}>{formatSomRaw(playCost)}</span>
              </div>
              {barTotal > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Bar Orders ({liveBarOrders.length})</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#06b6d4' }}>{formatSomRaw(barTotal)}</span>
                    <button
                      onClick={() => { setSelectedSessionBarItems(null); setShowBarDetail(true); }}
                      title="View bar orders"
                      style={{
                        background: 'rgba(6,182,212,0.12)',
                        border: '1px solid rgba(6,182,212,0.3)',
                        borderRadius: 8,
                        width: 28, height: 28,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#06b6d4',
                        transition: 'all 0.2s',
                        flexShrink: 0,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(6,182,212,0.25)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(6,182,212,0.12)'; }}
                    >
                      <Eye size={13} />
                    </button>
                  </div>
                </div>
              )}
              <div style={{ height: 1, background: 'var(--border)', margin: '14px 0' }} />
              {(() => {
                const rawSubtotal = playCost + barTotal;
                const isRounded = checkoutAmount !== rawSubtotal;
                return (
                  <div>
                    {isRounded && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Subtotal</span>
                          <span style={{ fontSize: 10, background: 'rgba(245,158,11,0.15)', color: '#f59e0b', padding: '1px 6px', borderRadius: 999, fontWeight: 700 }}>
                            ↑ rounded to 500
                          </span>
                        </div>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'line-through' }}>{formatSomRaw(rawSubtotal)}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Total Owed</span>
                      <span style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Orbitron, sans-serif', color: '#10b981' }}>{formatSomRaw(checkoutAmount)}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Payment Method Selector */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Payment Method</div>
              <div className="tabs" style={{ background: 'var(--bg-secondary)', padding: 4, borderRadius: 'var(--radius-sm)', display: 'flex', gap: 4 }}>
                <button 
                  className={`tab ${paymentMethod === 'cash' ? 'active' : ''}`} 
                  onClick={() => handleSelectPaymentMethod('cash')}
                  disabled={isCheckingOut}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  💵 Cash
                </button>
                <button 
                  className={`tab ${paymentMethod === 'card' ? 'active' : ''}`} 
                  onClick={() => handleSelectPaymentMethod('card')}
                  disabled={isCheckingOut}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  💳 Card
                </button>
                <button 
                  className={`tab ${paymentMethod === 'split' ? 'active' : ''}`} 
                  onClick={() => handleSelectPaymentMethod('split')}
                  disabled={isCheckingOut}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  🔄 Split
                </button>
              </div>
            </div>

            {/* Split Amount Inputs */}
            {paymentMethod === 'split' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 11 }}>Cash Portion (so'm)</label>
                  <input
                    className="form-input"
                    type="number"
                    min={0}
                    max={checkoutAmount}
                    value={cashAmount}
                    disabled={isCheckingOut}
                    onChange={e => handleSplitChange('cash', Number(e.target.value))}
                    style={{ padding: '8px 12px', fontSize: 13 }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 11 }}>Card Portion (so'm)</label>
                  <input
                    className="form-input"
                    type="number"
                    min={0}
                    max={checkoutAmount}
                    value={cardAmount}
                    disabled={isCheckingOut}
                    onChange={e => handleSplitChange('card', Number(e.target.value))}
                    style={{ padding: '8px 12px', fontSize: 13 }}
                  />
                </div>
              </div>
            )}

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', justifyContent: 'center', fontSize: 15, padding: '13px' }} 
              onClick={confirmCheckout}
              disabled={isCheckingOut}
            >
              {isCheckingOut ? (
                <>
                  <div className="spinner spinner-sm" style={{ marginRight: 8 }}></div>
                  Processing...
                </>
              ) : (
                <>
                  ✅ Confirm Payment
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Bar Detail Modal */}
      {showBarDetail && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500 }}
          onClick={() => { setShowBarDetail(false); setSelectedSessionBarItems(null); }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid rgba(6,182,212,0.3)',
              borderRadius: 20,
              padding: 28,
              minWidth: 340,
              maxWidth: 400,
              boxShadow: '0 24px 60px rgba(0,0,0,0.6), 0 0 40px rgba(6,182,212,0.08)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(6,182,212,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingCart size={17} color="#06b6d4" />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>Bar Orders</div>
                  {(() => {
                    const items = selectedSessionBarItems ?? liveBarOrders;
                    const total = selectedSessionBarItems
                      ? items.reduce((s, o) => s + ((barItems.find(b => b.name === o.item)?.price ?? 0) * o.qty), 0)
                      : barTotal;
                    return <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{items.reduce((s, o) => s + o.qty, 0)} items · {formatSomRaw(total)}</div>;
                  })()}
                </div>
              </div>
              <button
                onClick={() => { setShowBarDetail(false); setSelectedSessionBarItems(null); }}
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Items list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {(() => {
                const items = selectedSessionBarItems ?? liveBarOrders;
                if (items.length === 0) {
                  return <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '20px 0' }}>No item breakdown available</div>;
                }
                return items.map((order, idx) => {
                  const itemDef = barItems.find(b => b.name === order.item);
                  const icon = itemDef?.icon || '🛒';
                  const unitPrice = itemDef?.price ?? order.price ?? 0;
                  const lineTotal = unitPrice * order.qty;
                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 14px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: 12,
                      }}
                    >
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                        {icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{order.item}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                          {formatSomRaw(unitPrice)} × {order.qty}
                        </div>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#06b6d4', fontFamily: 'Orbitron, sans-serif', flexShrink: 0 }}>
                        {formatSomRaw(lineTotal)}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Footer total */}
            {(() => {
              const items = selectedSessionBarItems ?? liveBarOrders;
              const total = selectedSessionBarItems
                ? items.reduce((s, o) => s + ((barItems.find(b => b.name === o.item)?.price ?? 0) * o.qty), 0)
                : barTotal;
              return (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)', borderRadius: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Total</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: '#10b981', fontFamily: 'Orbitron, sans-serif' }}>{formatSomRaw(total)}</span>
                </div>
              );
            })()}
              </div>
        </div>
      )}
    </div>
  );
}
