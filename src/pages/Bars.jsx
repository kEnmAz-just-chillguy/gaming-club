import { useState } from 'react';
import { barItems as initialItems } from '../data/mockData';
import { Plus, X, Search, Edit2, Trash2, Coffee, TrendingUp, Package } from 'lucide-react';

const categories = ['All', 'Hot Drinks', 'Cold Drinks', 'Food', 'Snacks'];

export default function Bars() {
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', category: 'Hot Drinks', price: '', stock: '', icon: '☕' });

  const filtered = items
    .filter(i => cat === 'All' || i.category === cat)
    .filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  const totalRevenue = items.reduce((a, i) => a + i.sold * i.price, 0);
  const totalSold = items.reduce((a, i) => a + i.sold, 0);
  const lowStock = items.filter(i => i.stock - i.sold < 20).length;

  const handleSave = () => {
    if (!form.name) return;
    if (editId) {
      setItems(prev => prev.map(i => i.id === editId ? { ...i, ...form, price: +form.price, stock: +form.stock } : i));
      setEditId(null);
    } else {
      setItems(prev => [...prev, { id: Date.now(), ...form, price: +form.price, stock: +form.stock, sold: 0 }]);
    }
    setShowAdd(false);
    setForm({ name: '', category: 'Hot Drinks', price: '', stock: '', icon: '☕' });
  };

  const handleEdit = (item) => {
    setForm({ ...item, price: String(item.price), stock: String(item.stock) });
    setEditId(item.id);
    setShowAdd(true);
  };

  return (
    <div className="page-content fade-in">
      <div className="page-header-row mb-20">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 22 }}>Bars</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Manage menu items, stock and sales</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowAdd(true); setEditId(null); setForm({ name: '', category: 'Hot Drinks', price: '', stock: '', icon: '☕' }); }}>
          <Plus size={15} /> Add Item
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid mb-20" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {[
          { icon: TrendingUp, label: 'Total Bar Revenue', value: `$${totalRevenue.toFixed(0)}`, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
          { icon: Coffee, label: 'Items Sold', value: totalSold, color: '#7c3aed', bg: 'rgba(124,58,237,0.12)' },
          { icon: Package, label: 'Menu Items', value: items.length, color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
          { icon: X, label: 'Low Stock', value: lowStock, color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
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

      {/* Filter + Search */}
      <div className="card mb-20" style={{ padding: '14px 18px' }}>
        <div className="flex-between">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {categories.map(c => (
              <button key={c} onClick={() => setCat(c)} className={`btn btn-sm ${cat === c ? 'btn-primary' : 'btn-secondary'}`}>{c}</button>
            ))}
          </div>
          <div className="search-bar" style={{ maxWidth: 220 }}>
            <Search size={13} color="var(--text-muted)" />
            <input placeholder="Search item..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {filtered.map(item => {
          const remaining = item.stock - item.sold;
          const soldPct = Math.round((item.sold / item.stock) * 100);
          const isLow = remaining < 20;
          return (
            <div key={item.id} className="card" style={{ borderColor: isLow ? 'rgba(239,68,68,0.3)' : 'var(--border)' }}>
              <div className="flex-between mb-20">
                <div style={{ fontSize: 28 }}>{item.icon}</div>
                <div className="flex-gap" style={{ gap: 6 }}>
                  <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }} onClick={() => handleEdit(item)}><Edit2 size={11} /></button>
                  <button className="btn btn-danger btn-sm" style={{ padding: '4px 8px' }} onClick={() => setItems(prev => prev.filter(i => i.id !== item.id))}><Trash2 size={11} /></button>
                </div>
              </div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{item.category}</div>
              <div className="flex-between mt-16">
                <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent-light)' }}>${item.price.toFixed(2)}</span>
                <span className={`badge ${isLow ? 'badge-red' : 'badge-green'}`}>{isLow ? 'Low Stock' : 'In Stock'}</span>
              </div>
              <div style={{ marginTop: 12 }}>
                <div className="flex-between" style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Sold: {item.sold} / {item.stock}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>{soldPct}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${soldPct}%`, background: isLow ? 'var(--red)' : 'linear-gradient(90deg, var(--accent), var(--cyan))' }} />
                </div>
              </div>
              <div style={{ marginTop: 10, fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>
                Revenue: ${(item.sold * item.price).toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={() => setShowAdd(false)}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, width: 400 }} onClick={e => e.stopPropagation()}>
            <div className="flex-between mb-20">
              <h3>{editId ? 'Edit Item' : 'Add Bar Item'}</h3>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div className="section-gap">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" placeholder="Item name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  {['Hot Drinks', 'Cold Drinks', 'Food', 'Snacks'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Price ($)</label>
                <input className="form-input" type="number" step="0.5" min="0" placeholder="0.00" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Stock</label>
                <input className="form-input" type="number" min="0" placeholder="100" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Icon (emoji)</label>
                <input className="form-input" placeholder="☕" value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave}>{editId ? 'Update' : 'Add'} Item</button>
              <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
