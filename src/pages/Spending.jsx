import { useState, useEffect } from 'react';
import { spendings as initialSpendings, employees } from '../data/mockData';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Plus, X, Trash2, Wallet, AlertTriangle, TrendingUp, User } from 'lucide-react';

import { supabase } from '../config/supabase';

const categories = ['Jihozlar', 'Kommunal', 'Bar', 'Mebel', 'Dasturiy ta\'minot', 'Xodimlar (Kassa)', 'Texnik xizmat', 'Boshqa'];
const catColors = {
  Jihozlar: '#7c3aed',
  Kommunal: '#f59e0b',
  Bar: '#06b6d4',
  Mebel: '#10b981',
  'Dasturiy ta\'minot': '#8b5cf6',
  'Xodimlar (Kassa)': '#ef4444',
  'Texnik xizmat': '#ec4899',
  Boshqa: '#64748b'
};

const categoryIcons = {
  Jihozlar: '🖥️',
  Kommunal: '⚡',
  Bar: '☕',
  Mebel: '🪑',
  'Dasturiy ta\'minot': '🎮',
  'Xodimlar (Kassa)': '👥',
  'Texnik xizmat': '🧹',
  Boshqa: '💰'
};

const defaultSpendings = [
  { id: 1, name: 'Kompyuter qismlarini yangilash', category: 'Jihozlar', amount: 45000000, date: '2025-05-01', icon: '🖥️', color: 'rgba(124,58,237,0.2)', type: 'expense' },
  { id: 2, name: 'Elektr energiyasi to\'lovi', category: 'Kommunal', amount: 8200000, date: '2025-05-05', icon: '⚡', color: 'rgba(245,158,11,0.2)', type: 'expense' },
  { id: 3, name: 'Kofe va yeguliklar zaxirasi', category: 'Bar', amount: 3500000, date: '2025-05-06', icon: '☕', color: 'rgba(6,182,212,0.2)', type: 'expense' },
  { id: 4, name: 'O\'yin o\'rindiqlari x4', category: 'Mebel', amount: 12000000, date: '2025-05-08', icon: '🪑', color: 'rgba(16,185,129,0.2)', type: 'expense' },
  { id: 5, name: 'Internet obunasi', category: 'Kommunal', amount: 2000000, date: '2025-05-10', icon: '🌐', color: 'rgba(6,182,212,0.2)', type: 'expense' },
  { id: 6, name: 'O\'yin litsenziyalari (Steam)', category: 'Dasturiy ta\'minot', amount: 6800000, date: '2025-05-11', icon: '🎮', color: 'rgba(139,92,246,0.2)', type: 'expense' },
  { id: 7, name: 'Xodimlar oyligi', category: 'Xodimlar (Kassa)', amount: 110500000, date: '2025-05-01', icon: '👥', color: 'rgba(239,68,68,0.2)', type: 'expense' },
  { id: 8, name: 'Tozalash vositalari', category: 'Texnik xizmat', amount: 1300000, date: '2025-05-12', icon: '🧹', color: 'rgba(16,185,129,0.2)', type: 'expense' },
];

export default function Spending() {
  const [spendings, setSpendings] = useState(() => {
    const saved = localStorage.getItem('gaming_club_spendings_list');
    return saved ? JSON.parse(saved) : defaultSpendings;
  });

  const getSpendings = async () => {
    try {
      const { data, error } = await supabase
        .from("spendings")
        .select("*");
      if (error) throw error;
      if (data && data.length > 0) {
        setSpendings(data);
      }
    } catch (err) {
      console.error("Error fetching spendings from Supabase:", err);
    }
  };

  useEffect(() => {
    getSpendings();
  }, []);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'Jihozlar', amount: '', date: new Date().toISOString().slice(0, 10), icon: '🖥️' });
  const [filterCat, setFilterCat] = useState('All');
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);

  const saveSpendings = (updated) => {
    setSpendings(updated);
    localStorage.setItem('gaming_club_spendings_list', JSON.stringify(updated));
  };

  const handleAdd = () => {
    if (!form.name || !form.amount) return;

    const newTx = {
      id: Date.now(),
      name: form.name,
      category: form.category,
      amount: Number(form.amount),
      date: form.date,
      icon: form.icon,
      color: 'rgba(124,58,237,0.2)',
      type: 'expense'
    };

    const updated = [newTx, ...spendings];
    saveSpendings(updated);
    setShowAdd(false);
    setForm({ name: '', category: 'Jihozlar', amount: '', date: new Date().toISOString().slice(0, 10), icon: '🖥️' });
    setCatDropdownOpen(false);
  };

  const handleDelete = (id) => {
    const updated = spendings.filter(s => s.id !== id);
    saveSpendings(updated);
  };

  const filtered = filterCat === 'All' ? spendings : spendings.filter(s => s.category === filterCat);
  const total = spendings.reduce((a, s) => a + s.amount, 0);
  const largest = [...spendings].sort((a, b) => b.amount - a.amount)[0];

  const byCategory = categories.map(cat => ({
    name: cat,
    value: spendings.filter(s => s.category === cat).reduce((a, s) => a + s.amount, 0),
    color: catColors[cat],
  })).filter(c => c.value > 0);

  return (
    <div className="page-content fade-in">
      <div className="page-header-row mb-20">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 22 }}>Xarajatlar Tahlili</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Barcha xarajatlar va budjet taqsimotini nazorat qiling</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={15} /> Yangi qo'shish</button>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid mb-20" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {[
          { icon: Wallet, label: 'Jami Xarajatlar', value: `${total.toLocaleString('uz-UZ')} so'm`, color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
          { icon: AlertTriangle, label: 'Eng Katta Chiqim', value: largest ? `${largest.amount.toLocaleString('uz-UZ')} so'm` : '0 so\'m', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
          { icon: TrendingUp, label: 'Toifa O\'rtachasi', value: byCategory.length > 0 ? `${Math.round(total / byCategory.length).toLocaleString('uz-UZ')} so'm` : '0 so\'m', color: '#7c3aed', bg: 'rgba(124,58,237,0.12)' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ borderColor: s.color + '33' }}>
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}><s.icon size={20} /></div>
            <div className="stat-info">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ fontSize: 18, color: s.color, wordBreak: 'break-word' }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2 mb-20">
        {/* Pie chart */}
        <div className="card">
          <div className="card-header"><div className="card-title">Toifalar bo'yicha</div></div>
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byCategory} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                  {byCategory.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={v => [`${v.toLocaleString('uz-UZ')} so'm`, '']} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {byCategory.map((c, i) => (
              <div key={i} className="flex-gap" style={{ gap: 6 }}>
                <div className="color-dot" style={{ background: c.color }} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.name}: <strong style={{ color: c.color }}>{c.value.toLocaleString('uz-UZ')} so'm</strong></span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar chart */}
        <div className="card">
          <div className="card-header"><div className="card-title">Xarajatlar Diagrammasi</div></div>
          <div style={{ height: 230 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCategory} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tickFormatter={v => `${(v / 1000000).toFixed(0)}M`} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip formatter={v => [`${v.toLocaleString('uz-UZ')} so'm`, 'Chiqim']} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {byCategory.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filter + List */}
      <div className="card">
        <div className="card-header mb-20" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div className="card-title">Barcha xarajatlar</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => setFilterCat('All')} className={`btn btn-sm ${filterCat === 'All' ? 'btn-primary' : 'btn-secondary'}`}>Barchasi</button>
            {categories.map(c => (
              <button key={c} onClick={() => setFilterCat(c)} className={`btn btn-sm ${filterCat === c ? 'btn-primary' : 'btn-secondary'}`}>{c}</button>
            ))}
          </div>
        </div>
        {filtered.map(s => (
          <div key={s.id} className="spending-item">
            <div className="spending-icon" style={{ background: s.color }}>{s.icon}</div>
            <div>
              <div className="spending-name">{s.name}</div>
              <div className="spending-cat">{s.category} • {s.date}</div>
            </div>
            <div className="spending-amount" style={{ color: 'var(--red)' }}>-{s.amount.toLocaleString('uz-UZ')} so'm</div>
            <button onClick={() => handleDelete(s.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginLeft: 8 }}><Trash2 size={14} /></button>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            zIndex: 200,
            overflowY: 'auto',
            paddingTop: '60px',
            paddingBottom: '40px'
          }}
          onClick={() => {
            setShowAdd(false);
            setCatDropdownOpen(false);
          }}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: 28,
              width: 420,
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex-between mb-20">
              <h3 style={{ fontFamily: 'Orbitron, sans-serif' }}>Yangi tranzaksiya</h3>
              <button onClick={() => {
                setShowAdd(false);
                setCatDropdownOpen(false);
              }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <div className="section-gap">
              <div className="form-group">
                <label className="form-label">Nomi</label>
                <input className="form-input" placeholder="Xarajat nomi" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>

              <div className="form-group" style={{ position: 'relative' }}>
                <label className="form-label">Kategoriya</label>
                <div
                  onClick={() => setCatDropdownOpen(!catDropdownOpen)}
                  className="form-input"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{categoryIcons[form.category] || '💰'}</span>
                    <span style={{ color: 'var(--text-primary)', fontSize: 13 }}>{form.category}</span>
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{catDropdownOpen ? '▲' : '▼'}</span>
                </div>

                {catDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 4px)',
                      left: 0,
                      right: 0,
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                      zIndex: 210,
                      maxHeight: 180,
                      overflowY: 'auto',
                      padding: 4,
                    }}
                  >
                    {categories
                      .filter(c => c !== 'Xodimlar (Kassa)')
                      .map(c => (
                        <div
                          key={c}
                          onClick={() => {
                            setForm(p => ({ ...p, category: c, icon: categoryIcons[c] || '💰' }));
                            setCatDropdownOpen(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '10px 12px',
                            borderRadius: 6,
                            cursor: 'pointer',
                            background: form.category === c ? 'var(--accent-glow)' : 'transparent',
                            transition: 'background 0.2s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                          onMouseLeave={e => e.currentTarget.style.background = form.category === c ? 'var(--accent-glow)' : 'transparent'}
                        >
                          <span>{categoryIcons[c] || '💰'}</span>
                          <span style={{ color: 'var(--text-primary)', fontSize: 13 }}>{c}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Suma (so'mda)</label>
                <input className="form-input" type="number" placeholder="0" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
              </div>

              <div className="form-group">
                <label className="form-label">Sana</label>
                <input className="form-input" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleAdd}>Qo'shish</button>
              <button className="btn btn-secondary" onClick={() => {
                setShowAdd(false);
                setCatDropdownOpen(false);
              }}>Bekor qilish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
