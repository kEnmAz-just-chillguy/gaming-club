import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { Save, User, CheckCircle, Eye, EyeOff, ChevronDown, Edit2 } from 'lucide-react';

const ROLES = ['Super Admin', 'Admin', 'Manager', 'Cashier', 'Operator'];

export default function Settings() {
  const defaults = {
    name: 'Alisher Nazarov',
    role: 'Super Admin',
    email: 'alisher@gamezone.uz',
    phone: '+998 90 123 45 67',
    password: 'admin1234',
  };

  const [profile, setProfile] = useState(defaults);
  const [profileId, setProfileId] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setProfile(data);
        setProfileId(data.id);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const profileData = {
        name: profile.name,
        role: profile.role,
        email: profile.email,
        phone: profile.phone,
        password: profile.password
      };

      if (profileId) {
        await supabase.from('settings').update(profileData).eq('id', profileId);
      } else {
        const { data, error } = await supabase.from('settings').insert([profileData]).select();
        if (!error && data && data.length > 0) {
          setProfileId(data[0].id);
        }
      }

      setSaved(true);
      setIsEditing(false);
      setShowSaveModal(false);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  const initials = profile.name
    ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="page-content fade-in">
      <div className="page-header-row mb-20">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 22 }}>Settings</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Manage your profile information</p>
        </div>
        {!isEditing ? (
          <button className="btn" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }} onClick={() => setIsEditing(true)}>
            <Edit2 size={14} /> Edit Profile
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary" onClick={() => { setIsEditing(false); fetchProfile(); }}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={() => setShowSaveModal(true)} disabled={isSaving} style={{ opacity: isSaving ? 0.7 : 1 }}>
              <Save size={14} /> Save Changes
            </button>
          </div>
        )}
      </div>

      {saved && (
        <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, padding: '12px 18px', marginBottom: 20, color: 'var(--green)', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle size={15} /> Profile saved successfully!
        </div>
      )}

      <div className="card">
        {loading ? (
          <div>
            {/* Skeleton Avatar row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
              <div className="skeleton" style={{ width: 64, height: 64, borderRadius: '50%' }}></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="skeleton" style={{ width: 150, height: 18, borderRadius: 4 }}></div>
                <div className="skeleton" style={{ width: 90, height: 12, borderRadius: 4 }}></div>
                <div className="skeleton" style={{ width: 130, height: 12, borderRadius: 4 }}></div>
              </div>
            </div>

            {/* Skeleton Form */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 28px' }}>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="form-group" style={{ marginBottom: 0 }}>
                  <div className="skeleton" style={{ width: 80, height: 13, borderRadius: 4, marginBottom: 6 }}></div>
                  <div className="skeleton" style={{ width: '100%', height: 40, borderRadius: 8 }}></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Avatar row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent), var(--cyan))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, fontWeight: 700, color: '#fff', flexShrink: 0,
                boxShadow: '0 0 20px var(--accent-glow)',
              }}>
                {initials || <User size={26} />}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--text-primary)' }}>{profile.name || 'Your Name'}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{profile.role}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{profile.email || 'your@email.com'}</div>
              </div>
            </div>

            {/* Form — two columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 28px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Full Name</label>
                <input
                  className="form-input"
                  placeholder="Enter your full name"
                  value={profile.name}
                  onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Role</label>
                <div style={{ position: 'relative' }}>
                  <select
                    className="form-input"
                    value={profile.role}
                    onChange={e => setProfile(p => ({ ...p, role: e.target.value }))}
                    style={{ paddingRight: 40, cursor: isEditing ? 'pointer' : 'default', appearance: 'none', WebkitAppearance: 'none', width: '100%', opacity: !isEditing ? 0.7 : 1 }}
                    disabled={!isEditing}
                  >
                    {ROLES.map(r => <option key={r}>{r}</option>)}
                  </select>
                  <ChevronDown size={16} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Email</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="example@mail.com"
                  value={profile.email}
                  onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Phone Number</label>
                <input
                  className="form-input"
                  type="tel"
                  placeholder="+998 90 123 45 67"
                  value={profile.phone}
                  onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="form-input"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={profile.password}
                    onChange={e => setProfile(p => ({ ...p, password: e.target.value }))}
                    style={{ paddingRight: 44, width: '100%' }}
                    disabled={!isEditing}
                  />
                  <button
                    onClick={() => setShowPassword(v => !v)}
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
                      padding: 0
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      {/* Save Confirmation Modal */}
      {showSaveModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={() => !isSaving && setShowSaveModal(false)}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, width: 400, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Save size={32} color="var(--green)" />
              </div>
              <h3 style={{ margin: 0, fontSize: 20 }}>Save Profile?</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: 12, fontSize: 14, lineHeight: 1.5 }}>
                Are you sure you want to update your profile settings?
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowSaveModal(false)} disabled={isSaving}>
                Cancel
              </button>
              <button className="btn btn-primary" style={{ flex: 1, opacity: isSaving ? 0.7 : 1 }} onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Yes, save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
