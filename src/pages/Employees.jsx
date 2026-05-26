import { useState, useEffect } from 'react';

import { Plus, X, Search, Edit2, Trash2 } from 'lucide-react';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('id', { ascending: false });
      
      if (!error && data) {
        setEmployees(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);
  
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', role: '', telephone: '', email: '', password: '', avatar: '', color: '#7c3aed' });

  const filtered = employees.filter(e =>
    e.name && e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.role && e.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async () => {
    if (!form.name || !form.role) return;
    
    setIsSaving(true);
    try {
      const employeeData = {
        name: form.name,
        role: form.role,
        telephone: form.telephone,
        email: form.email,
        password: form.password,
        avatar: form.avatar || form.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
        color: form.color || '#7c3aed',
        joined: form.joined || new Date().toISOString().slice(0, 10)
      };

      if (editId) {
        await supabase.from('employees').update(employeeData).eq('id', editId);
        setEditId(null);
      } else {
        await supabase.from('employees').insert([employeeData]);
      }
      
      await fetchEmployees();
      setShowAdd(false);
      setForm({ name: '', role: '', telephone: '', email: '', password: '', avatar: '', color: '#7c3aed' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (emp) => {
    setForm({ ...emp });
    setEditId(emp.id);
    setShowAdd(true);
  };

  const handleDelete = async () => {
    if (!employeeToDelete) return;
    setIsDeleting(true);
    try {
      await supabase.from('employees').delete().eq('id', employeeToDelete.id);
      await fetchEmployees();
      setEmployeeToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

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
              {loading ? (
                <>
                  {[1, 2, 3, 4, 5].map(i => (
                    <tr key={`skel-${i}`}>
                      <td colSpan="6" style={{ padding: '6px 14px', border: 'none' }}>
                        <div className="skeleton skeleton-row"></div>
                      </td>
                    </tr>
                  ))}
                </>
              ) : (
                filtered.map(emp => (
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
                        <button className="btn btn-danger btn-sm" style={{ padding: '5px 9px' }} onClick={() => setEmployeeToDelete(emp)}><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
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
              <button className="btn btn-primary" style={{ flex: 1, opacity: isSaving ? 0.7 : 1 }} onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : `${editId ? 'Update' : 'Add'} Employee`}
              </button>
              <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {employeeToDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={() => !isDeleting && setEmployeeToDelete(null)}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, width: 400, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Trash2 size={32} color="#ef4444" />
              </div>
              <h3 style={{ margin: 0, fontSize: 20 }}>Delete Employee?</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: 12, fontSize: 14, lineHeight: 1.5 }}>
                Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>{employeeToDelete.name}</strong>? This action cannot be undone.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEmployeeToDelete(null)} disabled={isDeleting}>
                Cancel
              </button>
              <button className="btn btn-danger" style={{ flex: 1, opacity: isDeleting ? 0.7 : 1 }} onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
