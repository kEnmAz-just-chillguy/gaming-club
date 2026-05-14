import { useState } from 'react';
import { employees as initialEmployees } from '../data/mockData';
import { Plus, X, Search, Edit2, Trash2 } from 'lucide-react';

const shiftColors = { Morning: 'badge-green', Evening: 'badge-orange', Night: 'badge-purple' };
const deptColors = { Finance: '#06b6d4', IT: '#7c3aed', Operations: '#10b981', Safety: '#ef4444', Bar: '#f59e0b' };

export default function Employees() {
  const [employees, setEmployees] = useState(initialEmployees);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', role: '', department: 'Operations', salary: '', shift: 'Morning', status: 'active', avatar: '', color: '#7c3aed' });

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.role.toLowerCase().includes(search.toLowerCase()) ||
    e.department.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    if (!form.name || !form.role) return;
    if (editId) {
      setEmployees(prev => prev.map(e => e.id === editId ? { ...e, ...form, salary: +form.salary } : e));
      setEditId(null);
    } else {
      setEmployees(prev => [...prev, { id: Date.now(), ...form, salary: +form.salary, joined: new Date().toISOString().slice(0, 10), avatar: form.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) }]);
    }
    setShowAdd(false);
    setForm({ name: '', role: '', department: 'Operations', salary: '', shift: 'Morning', status: 'active', avatar: '', color: '#7c3aed' });
  };

  const handleEdit = (emp) => {
    setForm({ ...emp, salary: String(emp.salary) });
    setEditId(emp.id);
    setShowAdd(true);
  };

  const handleDelete = (id) => setEmployees(prev => prev.filter(e => e.id !== id));

  const totalSalary = employees.reduce((a, e) => a + e.salary, 0);
  const active = employees.filter(e => e.status === 'active').length;

  return (
    <div className="page-content fade-in">
      <div className="page-header-row mb-20">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 22 }}>Employees</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Manage staff, roles and shifts</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowAdd(true); setEditId(null); setForm({ name: '', role: '', department: 'Operations', salary: '', shift: 'Morning', status: 'active', avatar: '', color: '#7c3aed' }); }}>
          <Plus size={15} /> Add Employee
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid mb-20" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {[
          { label: 'Total Staff', value: employees.length, color: '#7c3aed', bg: 'rgba(124,58,237,0.12)' },
          { label: 'Active', value: active, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
          { label: 'On Leave', value: employees.length - active, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
          { label: 'Monthly Payroll', value: `$${totalSalary.toLocaleString()}`, color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
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
          <input placeholder="Search by name, role, department..." value={search} onChange={e => setSearch(e.target.value)} />
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
                <th>Department</th>
                <th>Shift</th>
                <th>Salary</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
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
                  <td>
                    <span style={{ color: deptColors[emp.department] || '#94a3b8', fontWeight: 500, fontSize: 12 }}>{emp.department}</span>
                  </td>
                  <td><span className={`badge ${shiftColors[emp.shift]}`}>{emp.shift}</span></td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>${emp.salary.toLocaleString()}</td>
                  <td>
                    <span className={`badge ${emp.status === 'active' ? 'badge-green' : 'badge-orange'}`}>
                      {emp.status === 'active' ? 'Active' : 'Off Duty'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{emp.joined}</td>
                  <td>
                    <div className="flex-gap" style={{ gap: 6 }}>
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
              {[['Name', 'name', 'text', 'Full name'], ['Role', 'role', 'text', 'e.g. Cashier'], ['Salary ($)', 'salary', 'number', '0']].map(([label, key, type, ph]) => (
                <div key={key} className="form-group">
                  <label className="form-label">{label}</label>
                  <input className="form-input" type={type} placeholder={ph} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
                </div>
              ))}
              {[['Department', 'department', ['Operations', 'Finance', 'IT', 'Safety', 'Bar']], ['Shift', 'shift', ['Morning', 'Evening', 'Night']], ['Status', 'status', ['active', 'off']]].map(([label, key, opts]) => (
                <div key={key} className="form-group">
                  <label className="form-label">{label}</label>
                  <select className="form-input" value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}>
                    {opts.map(o => <option key={o}>{o}</option>)}
                  </select>
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
