import { useState, useEffect } from 'react';
import { employees as initialEmployees } from '../data/mockData';
import { Plus, X, Search, Edit2, Trash2 } from 'lucide-react';

export default function Employees() {
  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem('employees_v1'); // Changing key to avoid conflicts with previous versions if any, actually wait, just 'employees' is fine.
    const raw = localStorage.getItem('employees');
    return raw ? JSON.parse(raw) : initialEmployees;
  });

  useEffect(() => {
    localStorage.setItem('employees', JSON.stringify(employees));
  }, [employees]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', role: '', telephone: '', email: '', password: '', avatar: '', color: '#7c3aed' });

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    if (!form.name || !form.role) return;
    if (editId) {
      setEmployees(prev => prev.map(e => e.id === editId ? { ...e, ...form } : e));
      setEditId(null);
    } else {
      setEmployees(prev => [...prev, { id: Date.now(), ...form, joined: new Date().toISOString().slice(0, 10), avatar: form.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) }]);
    }
    setShowAdd(false);
    setForm({ name: '', role: '', telephone: '', email: '', password: '', avatar: '', color: '#7c3aed' });
  };

  const handleEdit = (emp) => {
    setForm({ ...emp });
    setEditId(emp.id);
    setShowAdd(true);
  };

  const handleDelete = (id) => setEmployees(prev => prev.filter(e => e.id !== id));

  return (
    <div className="page-content fade-in">
      <div className="page-header-row mb-20">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 22 }}>Employees</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Manage staff, roles and shifts</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowAdd(true); setEditId(null); setForm({ name: '', role: '', telephone: '', email: '', password: '', avatar: '', color: '#7c3aed' }); }}>
          <Plus size={15} /> Add Employee
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid mb-20" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
        {[
          { label: 'Total Staff', value: employees.length, color: '#7c3aed', bg: 'rgba(124,58,237,0.12)' }
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ borderColor: s.color + '33' }}>
            <div className="stat-info">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ fontSize: 22, color: s.color, fontFamily: 'Orbitron,sans-serif' }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="card mb-20" style={{ padding: '14px 18px' }}>
        <div className="search-bar" style={{ maxWidth: 360 }}>
          <Search size={14} color="var(--text-muted)" />
          <input placeholder="Search by name or role..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Role</th>
                <th>Telephone</th>
                <th>Email</th>
                <th>Joined</th>
                <th style={{ width: '100px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(emp => (
                <tr key={emp.id}>
                  <td>
                    <div className="flex-gap">
                      <div className="avatar" style={{ background: emp.color }}>{emp.avatar}</div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{emp.name}</div>
                      </div>
                    </div>
                  </td>
                  <td>{emp.role}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{emp.telephone || '-'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{emp.email || '-'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{emp.joined}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="flex-gap" style={{ gap: 6, justifyContent: 'flex-end' }}>
                      <button className="btn btn-secondary btn-sm" style={{ padding: '5px 9px' }} onClick={() => handleEdit(emp)}><Edit2 size={12} /></button>
                      <button className="btn btn-danger btn-sm" style={{ padding: '5px 9px' }} onClick={() => handleDelete(emp.id)}><Trash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={() => setShowAdd(false)}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, width: 440 }} onClick={e => e.stopPropagation()}>
            <div className="flex-between mb-20">
              <h3>{editId ? 'Edit Employee' : 'Add Employee'}</h3>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div className="section-gap">
              {[['Name', 'name', 'text', 'Full name'], ['Role', 'role', 'text', 'e.g. Cashier'], ['Telephone number', 'telephone', 'tel', '+1 234 567 8900'], ['Email', 'email', 'email', 'example@mail.com'], ['Password', 'password', 'password', 'Enter password']].map(([label, key, type, ph]) => (
                <div key={key} className="form-group">
                  <label className="form-label">{label}</label>
                  <input className="form-input" type={type} placeholder={ph} value={form[key] || ''} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave}>{editId ? 'Update' : 'Add'} Employee</button>
              <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
