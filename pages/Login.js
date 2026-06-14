import React, { useState } from 'react';
import { loginUser } from '../auth';

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ user_id: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.user_id || !form.password) { setError('Please enter User ID and Password'); return; }
    setLoading(true);
    setTimeout(() => {
      const res = loginUser(form.user_id, form.password);
      setLoading(false);
      if (res.success) onLogin(res.user);
      else setError(res.error);
    }, 400);
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #1e3a5f 0%, #2563a8 60%, #f97316 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, background: '#f97316', borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30, margin: '0 auto 14px', boxShadow: '0 8px 24px rgba(249,115,22,0.4)',
          }}>🏗️</div>
          <h1 style={{ color: 'white', fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>BLP Construction</h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 4 }}>Fleet & Billing ERP — Secure Login</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'white', borderRadius: 16, padding: 32,
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Welcome back</h2>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>Sign in with your User ID and password</p>

          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b',
              borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>⚠️ {error}</div>
          )}

          <form onSubmit={submit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                User ID
              </label>
              <input
                name="user_id" value={form.user_id} onChange={handle}
                placeholder="Enter your User ID"
                style={{
                  width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0',
                  borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none',
                  boxSizing: 'border-box', color: '#1e293b',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  name="password" value={form.password} onChange={handle}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  style={{
                    width: '100%', padding: '10px 40px 10px 12px', border: '1.5px solid #e2e8f0',
                    borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none',
                    boxSizing: 'border-box', color: '#1e293b',
                  }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
                <button type="button" onClick={() => setShowPass(p => !p)} style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: 16,
                }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '12px', background: loading ? '#94a3b8' : '#1e3a5f',
              color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.15s',
            }}>
              {loading ? 'Signing in…' : '🔐 Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 20 }}>
            Default: <strong>admin</strong> / <strong>admin@123</strong> — Change in Admin Panel
          </p>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 20 }}>
          BLP Construction ERP v1.0 · Raipur, Chhattisgarh
        </p>
      </div>
    </div>
  );
}
