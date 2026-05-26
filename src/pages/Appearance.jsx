import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const themes = [
  { id: 'purple', name: 'Cosmic Purple', primary: '#7c3aed', secondary: '#06b6d4' },
  { id: 'blue', name: 'Ocean Blue', primary: '#2563eb', secondary: '#06b6d4' },
  { id: 'green', name: 'Matrix Green', primary: '#10b981', secondary: '#06b6d4' },
  { id: 'orange', name: 'Neon Orange', primary: '#f59e0b', secondary: '#ef4444' },
  { id: 'pink', name: 'Cyber Pink', primary: '#ec4899', secondary: '#8b5cf6' },
  { id: 'red', name: 'Fire Red', primary: '#ef4444', secondary: '#f59e0b' },
];

const fonts = ['Inter', 'Roboto', 'Outfit', 'Poppins', 'DM Sans'];
const borderRadii = [{ label: 'Sharp', value: '4px' }, { label: 'Normal', value: '14px' }, { label: 'Rounded', value: '20px' }];

export default function Appearance() {
  const { isDark, toggleTheme } = useTheme();
  const [activeTheme, setActiveTheme] = useState('purple');
  const [activeFont, setActiveFont] = useState('Inter');
  const [activeRadius, setActiveRadius] = useState('Normal');
  const [sidebarCompact, setSidebarCompact] = useState(false);
  const [animationsOn, setAnimationsOn] = useState(true);
  const [glowEffects, setGlowEffects] = useState(true);

  const applyTheme = (theme) => {
    setActiveTheme(theme.id);
    document.documentElement.style.setProperty('--accent', theme.primary);
    document.documentElement.style.setProperty('--accent-light', theme.primary + 'cc');
    document.documentElement.style.setProperty('--accent-glow', theme.primary + '44');
    document.documentElement.style.setProperty('--cyan', theme.secondary);
  };

  const applyRadius = (r) => {
    setActiveRadius(r.label);
    document.documentElement.style.setProperty('--radius', r.value);
  };



  const toggles = [
    { label: 'Dark Mode', sub: 'Switch between dark and light interface', value: isDark, set: toggleTheme },
    { label: 'Compact Sidebar', sub: 'Reduce sidebar width for more content space', value: sidebarCompact, set: setSidebarCompact },
    { label: 'Animations', sub: 'Enable smooth page and element transitions', value: animationsOn, set: setAnimationsOn },
    { label: 'Glow Effects', sub: 'Add neon glow to active elements and cards', value: glowEffects, set: setGlowEffects },
  ];

  return (
    <div className="page-content fade-in">
      <div className="page-header mb-20">
        <h1 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 22 }}>Appearance</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Customize the look and feel of your admin panel</p>
      </div>

      <div className="grid-2" style={{ gap: 24 }}>
        {/* Left Column */}
        <div className="section-gap">
          {/* Color Theme */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Color Theme</div>
                <div className="card-subtitle">Choose your accent color palette</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {themes.map(theme => (
                <div key={theme.id}
                  onClick={() => applyTheme(theme)}
                  style={{
                    border: `2px solid ${activeTheme === theme.id ? theme.primary : 'var(--border)'}`,
                    borderRadius: 12,
                    padding: '14px 12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: activeTheme === theme.id ? theme.primary + '15' : 'var(--bg-secondary)',
                    textAlign: 'center',
                  }}>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 8 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: theme.primary }} />
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: theme.secondary }} />
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: activeTheme === theme.id ? theme.primary : 'var(--text-muted)' }}>{theme.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Font */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Font Family</div>
                <div className="card-subtitle">Select your preferred typeface</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {fonts.map(font => (
                <div key={font}
                  onClick={() => setActiveFont(font)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', borderRadius: 10, cursor: 'pointer',
                    border: `1px solid ${activeFont === font ? 'var(--accent)' : 'var(--border)'}`,
                    background: activeFont === font ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                    transition: 'all 0.2s',
                  }}>
                  <span style={{ fontFamily: font, fontSize: 15, fontWeight: 500 }}>{font}</span>
                  {activeFont === font && <span style={{ fontSize: 10, background: 'var(--accent)', color: '#fff', padding: '2px 8px', borderRadius: 999, fontWeight: 600 }}>Active</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="section-gap">
          {/* Border Radius */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Corner Style</div>
                <div className="card-subtitle">Adjust element border radius</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              {borderRadii.map(r => (
                <div key={r.label} onClick={() => applyRadius(r)} style={{
                  flex: 1, padding: '18px 12px', textAlign: 'center', cursor: 'pointer',
                  border: `2px solid ${activeRadius === r.label ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: r.value, background: activeRadius === r.label ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                  transition: 'all 0.2s',
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: r.value, background: activeRadius === r.label ? 'var(--accent)' : 'var(--border)', margin: '0 auto 10px' }} />
                  <div style={{ fontSize: 12, fontWeight: 600, color: activeRadius === r.label ? 'var(--accent-light)' : 'var(--text-muted)' }}>{r.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Toggle Options */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Display Options</div>
                <div className="card-subtitle">Toggle visual features</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {toggles.map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: i < toggles.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{t.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{t.sub}</div>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" checked={t.value} onChange={() => t.set(!t.value)} />
                    <span className="toggle-slider" />
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Preview Card */}
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.08))', borderColor: 'var(--border-accent)' }}>
            <div className="card-title" style={{ marginBottom: 12 }}>🎨 Theme Preview</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-sm">Primary</button>
              <button className="btn btn-secondary btn-sm">Secondary</button>
              <span className="badge badge-green">Active</span>
              <span className="badge badge-purple">VIP</span>
              <span className="badge badge-orange">Warning</span>
            </div>
            <div style={{ marginTop: 14 }}>
              <div className="progress-bar" style={{ height: 8 }}>
                <div className="progress-fill" style={{ width: '68%', background: 'linear-gradient(90deg, var(--accent), var(--cyan))' }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>Progress indicator (68%)</div>
            </div>
            <div style={{ marginTop: 14, padding: 12, background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sample metric</div>
              <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Orbitron,sans-serif', color: 'var(--accent-light)', marginTop: 4 }}>$12,450</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
