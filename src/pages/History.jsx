import { useState } from 'react';
import { useAllSessions } from '../hooks/useAllSessions';
import { formatSomRaw } from '../utils/currency';
import { SkeletonStatRow, SkeletonSessionRow } from '../components/Skeleton';
import { Search, Clock, Gamepad2, TrendingUp, DollarSign, Crown, BarChart2, Eye, X, ShoppingCart } from 'lucide-react';

export default function History() {
  const { sessions, loading, stats } = useAllSessions();
  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState('all');
  const [selectedSession, setSelectedSession] = useState(null);

  const filtered = sessions.filter(s => {
    const matchSearch =
      (s.room_number || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.session_mode || '').toLowerCase().includes(search.toLowerCase());
    const matchMode = modeFilter === 'all' || s.session_mode === modeFilter;
    return matchSearch && matchMode;
  });

  // Group by date
  const byDate = filtered.reduce((acc, item) => {
    const d = new Date(item.created_at).toLocaleDateString('en-GB', {
      year: 'numeric', month: 'short', day: '2-digit',
    });
    if (!acc[d]) acc[d] = [];
    acc[d].push(item);
    return acc;
  }, {});

  const todayStr = new Date().toLocaleDateString('en-GB', {
    year: 'numeric', month: 'short', day: '2-digit',
  });

  const modeConfig = {
    hours:  { label: '⏱ Hours',  color: '#7c3aed', bg: 'rgba(124,58,237,0.15)' },
    amount: { label: '💵 Fixed',  color: '#06b6d4', bg: 'rgba(6,182,212,0.15)' },
    vip:    { label: '👑 VIP',    color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  };

  const formatDuration = (secs) => {
    if (!secs) return '—';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  // Parse bar items for selected session
  const barItems = (() => {
    if (!selectedSession) return [];
    try { return selectedSession.bar_items ? JSON.parse(selectedSession.bar_items) : []; } catch { return []; }
  })();
  const barTotal = barItems.reduce((s, o) => s + ((o.price ?? 0) * o.qty), 0);

  return (
    <div className="page-content fade-in">
      <div className="page-header mb-20">
        <h1 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 22 }}>Session History</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
          Complete log of all gaming sessions across all rooms
        </p>
      </div>

      {/* Stats */}
      {loading ? (
        <SkeletonStatRow cols={4} />
      ) : (
        <div className="stats-grid mb-20" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {[
            { label: 'Total Sessions', value: stats.total, color: '#7c3aed', bg: 'rgba(124,58,237,0.12)', icon: Gamepad2 },
            { label: 'Total Revenue', value: formatSomRaw(stats.totalRevenue), color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: TrendingUp },
            { label: 'Bar Revenue', value: formatSomRaw(stats.totalBar), color: '#06b6d4', bg: 'rgba(6,182,212,0.12)', icon: DollarSign },
            { label: 'VIP Sessions', value: stats.vipSessions, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: Crown },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="stat-card" style={{ borderColor: s.color + '33' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                  <Icon size={18} color={s.color} />
                </div>
                <div className="stat-info">
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value" style={{ fontSize: 20, color: s.color, fontFamily: 'Orbitron,sans-serif' }}>{s.value}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div className="card mb-20" style={{ padding: '14px 18px' }}>
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <BarChart2 size={14} color="var(--text-muted)" />
            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginRight: 4 }}>Mode:</span>
            {['all', 'hours', 'amount', 'vip'].map(m => (
              <button
                key={m}
                onClick={() => setModeFilter(m)}
                className={`btn btn-sm ${modeFilter === m ? 'btn-primary' : 'btn-secondary'}`}
                style={{ textTransform: 'capitalize' }}
              >
                {m === 'all' ? 'All' : modeConfig[m]?.label || m}
              </button>
            ))}
          </div>
          <div className="search-bar" style={{ maxWidth: 240 }}>
            <Search size={13} color="var(--text-muted)" />
            <input
              placeholder="Search by room..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && sessions.length === 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
              <SkeletonSessionRow />
            </div>
          ))}
        </div>
      )}

      {/* Timeline */}
      {!loading && (
        <div className="section-gap">
          {Object.entries(byDate).length === 0 ? (
            <div className="card flex-center" style={{ padding: 60, flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 40 }}>🔍</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                {sessions.length === 0
                  ? 'No sessions recorded yet. Complete a session to see history.'
                  : 'No sessions match your filters.'}
              </div>
            </div>
          ) : Object.entries(byDate).map(([date, items]) => (
            <div key={date} style={{ marginBottom: 20 }}>
              {/* Date header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 999, padding: '4px 14px' }}>
                  {date === todayStr ? '📅 Today' : date}
                </div>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {items.length} session{items.length !== 1 ? 's' : ''} · {formatSomRaw(items.reduce((a, s) => a + (s.total_amount || 0), 0))}
                </div>
              </div>

              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {items.map((item, idx) => {
                  const mc = modeConfig[item.session_mode] || modeConfig.hours;
                  const timeStr = new Date(item.created_at).toLocaleTimeString('en-US', {
                    hour: '2-digit', minute: '2-digit', hour12: false,
                  });
                  return (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: '14px 20px',
                        borderBottom: idx < items.length - 1 ? '1px solid var(--border)' : 'none',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Mode icon */}
                      <div style={{ width: 40, height: 40, borderRadius: 11, background: mc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>
                        {item.session_mode === 'vip' ? '👑' : item.session_mode === 'amount' ? '💵' : '🎮'}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                            Room {item.room_number}
                          </span>
                          <span style={{ fontSize: 10, background: mc.bg, color: mc.color, padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>
                            {mc.label}
                          </span>
                          <span style={{
                            fontSize: 10,
                            background: item.payment_method === 'card' ? 'rgba(6,182,212,0.15)' : item.payment_method === 'split' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
                            color: item.payment_method === 'card' ? '#06b6d4' : item.payment_method === 'split' ? '#f59e0b' : '#10b981',
                            padding: '2px 8px', borderRadius: 999, fontWeight: 700,
                          }}>
                            {item.payment_method === 'card' ? '💳 Card' : item.payment_method === 'split' ? '🔄 Split' : '💵 Cash'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>⏱ {formatDuration(item.duration_secs)}</span>
                          {item.start_time && (
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                              🕐 {item.start_time}{item.end_time ? ` → ${item.end_time}` : ''}
                            </span>
                          )}
                          {item.payment_method === 'split' && (
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                              💵 Cash: {formatSomRaw(item.cash_amount)} · 💳 Card: {formatSomRaw(item.card_amount)}
                            </span>
                          )}
                          {item.bar_amount > 0 && (
                            <span style={{ fontSize: 11, color: '#06b6d4' }}>☕ Bar: {formatSomRaw(item.bar_amount)}</span>
                          )}
                        </div>
                      </div>

                      {/* Amount */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#10b981', fontFamily: 'Orbitron, sans-serif' }}>
                          {formatSomRaw(item.total_amount)}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                          🎮 {formatSomRaw(item.play_amount)}
                        </div>
                      </div>

                      {/* Eye button */}
                      <button
                        onClick={e => { e.stopPropagation(); setSelectedSession(item); }}
                        title="View bar orders"
                        style={{
                          background: 'rgba(6,182,212,0.1)',
                          border: '1px solid rgba(6,182,212,0.25)',
                          borderRadius: 8,
                          width: 32, height: 32,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer',
                          color: '#06b6d4',
                          flexShrink: 0,
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(6,182,212,0.22)'; e.currentTarget.style.borderColor = 'rgba(6,182,212,0.5)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(6,182,212,0.1)'; e.currentTarget.style.borderColor = 'rgba(6,182,212,0.25)'; }}
                      >
                        <Eye size={14} />
                      </button>

                      {/* Time */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: 11, flexShrink: 0, minWidth: 48 }}>
                        <Clock size={11} />
                        {timeStr}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bar Detail Modal */}
      {selectedSession && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500 }}
          onClick={() => setSelectedSession(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid rgba(6,182,212,0.3)',
              borderRadius: 20,
              padding: 28,
              minWidth: 340,
              maxWidth: 420,
              width: '90vw',
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
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>
                    Bar Orders — Room {selectedSession.room_number}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                    {barItems.length === 0
                      ? 'No bar orders for this session'
                      : `${barItems.reduce((s, o) => s + o.qty, 0)} items · ${formatSomRaw(barTotal)}`}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Items list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {barItems.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '28px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 36 }}>🛒</div>
                  <div>No bar orders were placed for this session</div>
                </div>
              ) : (
                barItems.map((order, idx) => {
                  const unitPrice = order.price ?? 0;
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
                        {order.icon || '🛒'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{order.item}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                          {formatSomRaw(unitPrice)} × {order.qty}
                          {order.time && <span style={{ marginLeft: 8 }}>· {order.time}</span>}
                        </div>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#06b6d4', fontFamily: 'Orbitron, sans-serif', flexShrink: 0 }}>
                        {formatSomRaw(lineTotal)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer total */}
            {barItems.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)', borderRadius: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Bar Total</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#10b981', fontFamily: 'Orbitron, sans-serif' }}>{formatSomRaw(barTotal)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
