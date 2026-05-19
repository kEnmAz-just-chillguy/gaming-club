import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Gamepad2, Mail, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const res = login(email, password);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.error);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0B0D14', padding: 20, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '10%', left: '20%', width: 400, height: 400, background: 'rgba(124,58,237,0.1)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '20%', width: 400, height: 400, background: 'rgba(6,182,212,0.08)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' }} />
      
      <div className="fade-in" style={{ width: '100%', maxWidth: 440, padding: '48px 40px', position: 'relative', zIndex: 10, border: '1px solid rgba(255,255,255,0.03)', background: '#1A1C23', borderRadius: 24, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg, #a855f7, #3b82f6)', color: 'white', marginBottom: 20, boxShadow: '0 12px 24px -6px rgba(168, 85, 247, 0.4)' }}>
            <Gamepad2 size={32} />
          </div>
          <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 26, fontWeight: 800, marginBottom: 8, color: '#fff', letterSpacing: '0.5px' }}>GameZone</h2>
          <p style={{ color: '#8b8d97', fontSize: 14 }}>Sign in to your admin panel</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', padding: '12px 16px', borderRadius: 12, marginBottom: 24, fontSize: 13, textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#8b8d97' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#6b6d7a" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="email" 
                placeholder="admin@gamezone.com" 
                style={{ width: '100%', height: 48, background: '#13141A', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 12, paddingLeft: 46, paddingRight: 16, color: '#fff', fontSize: 14, outline: 'none', transition: 'border 0.2s' }}
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={e => e.target.style.borderColor = '#8b5cf6'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.04)'}
                required
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#8b8d97' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#6b6d7a" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="password" 
                placeholder="••••••••" 
                style={{ width: '100%', height: 48, background: '#13141A', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 12, paddingLeft: 46, paddingRight: 16, color: '#fff', fontSize: 14, outline: 'none', transition: 'border 0.2s, letter-spacing 0.2s', letterSpacing: password ? '2px' : 'normal' }}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={e => e.target.style.borderColor = '#8b5cf6'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.04)'}
                required
              />
            </div>
          </div>
          
          <button type="submit" style={{ width: '100%', height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, marginTop: 12, cursor: 'pointer', boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)', transition: 'transform 0.1s, opacity 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            Sign In <ArrowRight size={18} style={{ marginLeft: 8 }} />
          </button>
        </form>
      </div>
    </div>
  );
}
