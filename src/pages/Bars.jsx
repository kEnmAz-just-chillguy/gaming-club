import { useState, useEffect } from 'react';
import { Plus, X, Search, Edit2, Trash2 } from 'lucide-react';

export default function Bars() {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('bar_products');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('bar_products', JSON.stringify(items));
  }, [items]);

  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', quantity: '' });

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  const handleSave = () => {
    if (!form.name) return;
    if (editId) {
      setItems(prev => prev.map(i => i.id === editId ? { ...i, ...form, price: +form.price, quantity: +form.quantity } : i));
      setEditId(null);
    } else {
      setItems(prev => [...prev, { id: Date.now(), name: form.name, price: +form.price, quantity: +form.quantity }]);
    }
    setShowAdd(false);
    setForm({ name: '', price: '', quantity: '' });
  };

  const handleEdit = (item) => {
    setForm({ name: item.name, price: String(item.price), quantity: String(item.quantity) });
    setEditId(item.id);
    setShowAdd(true);
  };

  return (
    <div className="page-content fade-in">
      <div className="page-header-row mb-20">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 22 }}>Bars</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Manage products and inventory</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowAdd(true); setEditId(null); setForm({ name: '', price: '', quantity: '' }); }}>
          <Plus size={15} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="card mb-20" style={{ padding: '14px 18px' }}>
        <div className="search-bar" style={{ maxWidth: 300 }}>
          <Search size={13} color="var(--text-muted)" />
          <input placeholder="Search product..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Items Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {filtered.map(item => (
          <div key={item.id} className="card">
            <div className="flex-between mb-16">
              <div style={{ fontWeight: 600, fontSize: 16 }}>{item.name}</div>
              <div className="flex-gap" style={{ gap: 6 }}>
                <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }} onClick={() => handleEdit(item)}><Edit2 size={11} /></button>
                <button className="btn btn-danger btn-sm" style={{ padding: '4px 8px' }} onClick={() => setItems(prev => prev.filter(i => i.id !== item.id))}><Trash2 size={11} /></button>
              </div>
            </div>
            <div className="flex-between mt-16">
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent-light)' }}>{item.price.toLocaleString()} so'm</span>
              <span className="badge badge-purple">Qty: {item.quantity}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={() => setShowAdd(false)}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, width: 400 }} onClick={e => e.stopPropagation()}>
            <div className="flex-between mb-20">
              <h3>{editId ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div className="section-gap">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" placeholder="Product name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Narxi (so'm)</label>
                <input className="form-input" type="number" step="100" min="0" placeholder="5000" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input className="form-input" type="number" min="0" placeholder="10" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave}>{editId ? 'Update' : 'Add'} Product</button>
              <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
