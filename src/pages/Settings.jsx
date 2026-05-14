import { useState } from 'react';
import { Save, Bell, Shield, Globe, Clock, Wifi, Server, RefreshCw } from 'lucide-react';

const Section = ({ icon: Icon, title, children }) => (
  <div className="card">
    <div className="card-header" style={{ marginBottom: 20 }}>
      <div className="flex-gap">
        <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} color="var(--accent-light)" />
        </div>
        <div className="card-title">{title}</div>
      </div>
    </div>
    {children}
  </div>
);

export default function Settings() {
  const [saved, setSaved] = useState(false);
  const [club, setClub] = useState({ name: 'GameZone Club', address: '123 Gaming Street, Tech City', phone: '+1 555 0123', email: 'admin@gamezone.com', currency: 'USD', timezone: 'UTC+5', openTime: '09:00', closeTime: '02:00', capacity: 120, sessionRate: 5 });
  const [notifs, setNotifs] = useState({ emailAlerts: true, lowStock: true, maintenanceAlerts: true, dailyReport: true, newSession: false, revenueAlerts: true });
  const [security, setSecurity] = useState({ twoFactor: false, sessionTimeout: '30', autoLogout: true, activityLog: true });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="page-content fade-in">
      <div className="page-header-row mb-20">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 22 }}>Settings</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Configure your gaming club preferences</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave}>
          {saved ? <><RefreshCw size={14} /> Saved!</> : <><Save size={14} /> Save Changes</>}
        </button>
      </div>

      {saved && (
        <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, padding: '12px 18px', marginBottom: 20, color: 'var(--green)', fontSize: 13, fontWeight: 500 }}>
          ✅ Settings saved successfully!
        </div>
      )}

      <div className="section-gap">
        {/* Club Info */}
        <Section icon={Globe} title="Club Information">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              ['Club Name', 'name', 'text', 'GameZone Club'],
              ['Address', 'address', 'text', '123 Gaming St'],
              ['Phone', 'phone', 'tel', '+1 555 0123'],
              ['Email', 'email', 'email', 'admin@gamezone.com'],
              ['Currency', 'currency', null, null, ['USD', 'EUR', 'GBP', 'AED', 'RUB']],
              ['Timezone', 'timezone', null, null, ['UTC+0', 'UTC+1', 'UTC+3', 'UTC+5', 'UTC+8']],
            ].map(([label, key, type, ph, opts]) => (
              <div key={key} className="form-group">
                <label className="form-label">{label}</label>
                {opts ? (
                  <select className="form-input" value={club[key]} onChange={e => setClub(p => ({ ...p, [key]: e.target.value }))}>
                    {opts.map(o => <option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <input className="form-input" type={type} placeholder={ph} value={club[key]} onChange={e => setClub(p => ({ ...p, [key]: e.target.value }))} />
                )}
              </div>
            ))}
          </div>
        </Section>

        {/* Operating Hours & Pricing */}
        <Section icon={Clock} title="Operating Hours & Pricing">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
            {[
              ['Opening Time', 'openTime', 'time'],
              ['Closing Time', 'closeTime', 'time'],
              ['Total Capacity', 'capacity', 'number'],
              ['Session Rate ($/hr)', 'sessionRate', 'number'],
            ].map(([label, key, type]) => (
              <div key={key} className="form-group">
                <label className="form-label">{label}</label>
                <input className="form-input" type={type} value={club[key]} onChange={e => setClub(p => ({ ...p, [key]: e.target.value }))} />
              </div>
            ))}
          </div>
        </Section>

        {/* Notifications */}
        <Section icon={Bell} title="Notifications">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
            {[
              ['Email Alerts', 'emailAlerts', 'Get email notifications for critical events'],
              ['Low Stock Alerts', 'lowStock', 'Alert when bar items run below threshold'],
              ['Maintenance Alerts', 'maintenanceAlerts', 'Notify when rooms need maintenance'],
              ['Daily Report', 'dailyReport', 'Receive daily revenue and activity summary'],
              ['New Session Alerts', 'newSession', 'Ping when a new gaming session starts'],
              ['Revenue Alerts', 'revenueAlerts', 'Alert on significant revenue milestones'],
            ].map(([label, key, sub], i) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border)', paddingRight: i % 2 === 0 ? 20 : 0 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>
                </div>
                <label className="toggle" style={{ marginLeft: 16 }}>
                  <input type="checkbox" checked={notifs[key]} onChange={() => setNotifs(p => ({ ...p, [key]: !p[key] }))} />
                  <span className="toggle-slider" />
                </label>
              </div>
            ))}
          </div>
        </Section>

        {/* Security */}
        <Section icon={Shield} title="Security">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              ['Two-Factor Authentication', 'twoFactor', 'Require 2FA for all admin logins', true],
              ['Auto Logout', 'autoLogout', 'Automatically log out after inactivity', true],
              ['Activity Log', 'activityLog', 'Keep detailed logs of all admin actions', true],
            ].map(([label, key, sub]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={security[key]} onChange={() => setSecurity(p => ({ ...p, [key]: !p[key] }))} />
                  <span className="toggle-slider" />
                </label>
              </div>
            ))}
            <div style={{ padding: '14px 0' }}>
              <div className="form-group">
                <label className="form-label">Session Timeout (minutes)</label>
                <input className="form-input" type="number" style={{ maxWidth: 160 }} value={security.sessionTimeout} onChange={e => setSecurity(p => ({ ...p, sessionTimeout: e.target.value }))} />
              </div>
            </div>
          </div>
        </Section>

        {/* System Info */}
        <Section icon={Server} title="System Info">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              ['Version', 'v1.0.0'],
              ['Build', '2025.05.14'],
              ['Environment', 'Production'],
              ['Data Storage', 'Local (Frontend)'],
              ['Last Backup', 'N/A'],
              ['Status', '🟢 Operational'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{k}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{v}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Danger Zone */}
        <div className="card" style={{ borderColor: 'rgba(239,68,68,0.3)' }}>
          <div className="card-header" style={{ marginBottom: 16 }}>
            <div className="flex-gap">
              <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={16} color="var(--red)" />
              </div>
              <div className="card-title" style={{ color: 'var(--red)' }}>Danger Zone</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn btn-danger">Reset All Data</button>
            <button className="btn btn-danger">Clear History</button>
            <button className="btn btn-danger">Factory Reset</button>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>⚠️ These actions cannot be undone. This is a frontend-only demo — no real data will be deleted.</p>
        </div>
      </div>
    </div>
  );
}
