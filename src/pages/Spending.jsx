import { useState } from 'react';
import { spendings as initialSpendings } from '../data/mockData';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Plus, X, Trash2, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';

const categories = ['Equipment', 'Utilities', 'Bar', 'Furniture', 'Software', 'Payroll', 'Maintenance', 'Other'];
const catColors = { Equipment: '#7c3aed', Utilities: '#f59e0b', Bar: '#06b6d4', Furniture: '#10b981', Software: '#8b5cf6', Payroll: '#ef4444', Maintenance: '#ec4899', Other: '#64748b' };

export default function Spending() {
  const [spendings, setSpendings] = useState(initialSpendings);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'Equipment', amount: '', date: new Date().toISOString().slice(0, 10), icon: '💰' });
  const [filterCat, setFilterCat] = useState('All');

  const handleAdd = () => {
    if (!form.name || !form.amount) return;
    setSpendings(prev => [...prev, { id: Date.now(), ...form, amount: +form.amount, color: 'rgba(124,58,237,0.2)', type: 'expense' }]);
    setShowAdd(false);
    setForm({ name: '', category: 'Equipment', amount: '', date: new Date().toISOString().slice(0, 10), icon: '💰' });
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
          <h1 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 22 }}>Spending</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Track all expenses and budget allocation</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={15} /> Add Expense</button>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid mb-20" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {[
          { icon: DollarSign, label: 'Total Spent', value: `$${total.toLocaleString()}`, color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
          { icon: AlertTriangle, label: 'Largest Expense', value: `$${largest?.amount.toLocaleString()}`, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
          { icon: TrendingUp, label: 'Avg per Category', value: `$${Math.round(total / byCategory.length).toLocaleString()}`, color: '#7c3aed', bg: 'rgba(124,58,237,0.12)' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ borderColor: s.color + '33' }}>
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}><s.icon size={20} /></div>
            <div className="stat-info">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ fontSize: 22, color: s.color }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2 mb-20">
        {/* Pie chart */}
        <div className="card">
          <div className="card-header"><div className="card-title">By Category</div></div>
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byCategory} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                  {byCategory.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={v => [`$${v.toLocaleString()}`, '']} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {byCategory.map((c, i) => (
              <div key={i} className="flex-gap" style={{ gap: 6 }}>
                <div className="color-dot" style={{ background: c.color }} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.name}: <strong style={{ color: c.color }}>${c.value.toLocaleString()}</strong></span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar chart */}
        <div className="card">
          <div className="card-header"><div className="card-title">Spending by Category</div></div>
          <div style={{ height: 230 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCategory} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip formatter={v => [`$${v.toLocaleString()}`, 'Spent']} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
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
        <div className="card-header mb-20">
          <div className="card-title">All Expenses</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['All', ...categories].map(c => (
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
            <div className="spending-amount" style={{ color: 'var(--red)' }}>-${s.amount.toLocaleString()}</div>
            <button onClick={() => setSpendings(prev => prev.filter(x => x.id !== s.id))} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginLeft: 8 }}><Trash2 size={14} /></button>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={() => setShowAdd(false)}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, width: 420 }} onClick={e => e.stopPropagation()}>
            <div className="flex-between mb-20">
              <h3>Add Expense</h3>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div className="section-gap">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" placeholder="Expense name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Amount ($)</label>
                <input className="form-input" type="number" placeholder="0" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input className="form-input" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleAdd}>Add Expense</button>
              <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
