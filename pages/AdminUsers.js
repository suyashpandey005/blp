import React, { useState, useEffect } from 'react';
import { getUsers, createUser, toggleUserStatus, deleteUser, resetPassword, getSession } from '../auth';

const F = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const FT = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Never';

const emptyForm = { name: '', user_id: '', phone: '', password: '', confirmPassword: '', role: 'user' };

export default function AdminUsers() {
  const session = getSession();
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetModal, setResetModal] = useState(null); // user object
  const [newPass, setNewPass] = useState('');
  const [showPass, setShowPass] = useState(false);

  const load = () => setUsers(getUsers());
  useEffect(() => { load(); }, []);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.user_id || !form.phone || !form.password) {
      setError('All fields are required'); return;
    }
    if (!/^[0-9]{10}$/.test(form.phone)) {
      setError('Phone must be exactly 10 digits'); return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match'); return;
    }
    const res = createUser(form);
    if (!res.success) { setError(res.error); return; }
    setSuccess(`User "${form.name}" created successfully!`);
    setShowModal(false);
    setForm(emptyForm);
    load();
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleToggle = (u) => {
    if (u.user_id === 'admin' && u.is_active) {
      alert('Cannot deactivate the main admin account!'); return;
    }
    toggleUserStatus(u.id);
    load();
  };

  const handleDelete = (u) => {
    if (u.user_id === 'admin') { alert('Cannot delete the main admin account!'); return; }
    if (!window.confirm(`Delete user "${u.name}"? This cannot be undone.`)) return;
    deleteUser(u.id);
    load();
  };

  const submitReset = (e) => {
    e.preventDefault();
    const res = resetPassword(resetModal.id, newPass);
    if (!res.success) { alert(res.error); return; }
    setSuccess(`Password reset for "${resetModal.name}"`);
    setResetModal(null);
    setNewPass('');
    setTimeout(() => setSuccess(''), 3000);
  };

  const inputStyle = {
    width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0',
    borderRadius: 8, fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>👥 User Management</h2>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
            Manage who can access BLP Construction ERP · Logged in as <strong>{session?.name}</strong>
          </p>
        </div>
        <button onClick={() => { setShowModal(true); setError(''); setForm(emptyForm); }} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px',
          background: '#1e3a5f', color: 'white', border: 'none', borderRadius: 8,
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>
          ＋ Create New User
        </button>
      </div>

      {success && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', borderRadius: 8, padding: '10px 16px', fontSize: 13, marginBottom: 16 }}>
          ✅ {success}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Users', value: users.length, color: '#3b82f6', bg: '#eff6ff' },
          { label: 'Active Users', value: users.filter(u => u.is_active).length, color: '#16a34a', bg: '#f0fdf4' },
          { label: 'Admins', value: users.filter(u => u.role === 'admin').length, color: '#f97316', bg: '#fff7ed' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: 12, padding: '18px 20px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
            <p style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: s.color, marginTop: 4 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>All Users</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Name', 'User ID', 'Phone', 'Role', 'Status', 'Created', 'Last Login', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', borderBottom: '1px solid #f1f5f9' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: '#1e293b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: u.role === 'admin' ? '#f97316' : '#1e3a5f',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: 12, fontWeight: 700, flexShrink: 0,
                      }}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      {u.name}
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', color: '#475569', fontFamily: 'monospace' }}>{u.user_id}</td>
                  <td style={{ padding: '12px 14px', color: '#475569' }}>📱 {u.phone}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 99,
                      fontSize: 11, fontWeight: 600,
                      background: u.role === 'admin' ? '#fff7ed' : '#eff6ff',
                      color: u.role === 'admin' ? '#f97316' : '#2563a8',
                    }}>
                      {u.role === 'admin' ? '👑 Admin' : '👤 User'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 99,
                      fontSize: 11, fontWeight: 600,
                      background: u.is_active ? '#f0fdf4' : '#fef2f2',
                      color: u.is_active ? '#16a34a' : '#dc2626',
                    }}>
                      {u.is_active ? '● Active' : '● Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', color: '#64748b', fontSize: 12 }}>{F(u.created_at)}</td>
                  <td style={{ padding: '12px 14px', color: '#64748b', fontSize: 12 }}>{FT(u.last_login)}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => { setResetModal(u); setNewPass(''); }} title="Reset Password" style={{
                        padding: '5px 10px', fontSize: 12, background: '#eff6ff', color: '#2563a8',
                        border: '1px solid #bfdbfe', borderRadius: 6, cursor: 'pointer', fontWeight: 500,
                      }}>🔑 Reset</button>
                      <button onClick={() => handleToggle(u)} title={u.is_active ? 'Deactivate' : 'Activate'} style={{
                        padding: '5px 10px', fontSize: 12,
                        background: u.is_active ? '#fffbeb' : '#f0fdf4',
                        color: u.is_active ? '#d97706' : '#16a34a',
                        border: `1px solid ${u.is_active ? '#fde68a' : '#bbf7d0'}`,
                        borderRadius: 6, cursor: 'pointer', fontWeight: 500,
                      }}>{u.is_active ? '⏸ Disable' : '▶ Enable'}</button>
                      {u.user_id !== 'admin' && (
                        <button onClick={() => handleDelete(u)} title="Delete User" style={{
                          padding: '5px 10px', fontSize: 12, background: '#fef2f2', color: '#dc2626',
                          border: '1px solid #fecaca', borderRadius: 6, cursor: 'pointer', fontWeight: 500,
                        }}>🗑 Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>➕ Create New User</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>
            <div style={{ padding: 24 }}>
              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
                  ⚠️ {error}
                </div>
              )}
              <form onSubmit={submit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {[
                    { label: 'Full Name', name: 'name', placeholder: 'e.g. Rajesh Kumar', type: 'text' },
                    { label: 'User ID', name: 'user_id', placeholder: 'e.g. rajesh01', type: 'text' },
                    { label: 'Phone Number', name: 'phone', placeholder: '10-digit mobile number', type: 'tel' },
                    { label: 'Role', name: 'role', type: 'select' },
                    { label: 'Password', name: 'password', placeholder: 'Min 6 characters', type: 'password' },
                    { label: 'Confirm Password', name: 'confirmPassword', placeholder: 'Re-enter password', type: 'password' },
                  ].map(f => (
                    <div key={f.name} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>{f.label}</label>
                      {f.type === 'select' ? (
                        <select name={f.name} value={form[f.name]} onChange={handle} style={inputStyle}>
                          <option value="user">👤 User (View & Edit)</option>
                          <option value="admin">👑 Admin (Full Access)</option>
                        </select>
                      ) : (
                        <input name={f.name} value={form[f.name]} onChange={handle} type={f.type} placeholder={f.placeholder} style={inputStyle} />
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '12px 14px', fontSize: 12, color: '#1e40af', marginTop: 16 }}>
                  ℹ️ <strong>Phone number</strong> is used for account identification and recovery. Must be unique for each user.
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                  <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', border: '1.5px solid #e2e8f0', borderRadius: 8, background: 'white', fontSize: 13, fontWeight: 500, cursor: 'pointer', color: '#475569' }}>
                    Cancel
                  </button>
                  <button type="submit" style={{ padding: '10px 24px', background: '#1e3a5f', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    ✅ Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 380, boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>🔑 Reset Password</h3>
              <button onClick={() => setResetModal(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>
            <div style={{ padding: 24 }}>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
                Setting new password for <strong style={{ color: '#1e293b' }}>{resetModal.name}</strong> ({resetModal.user_id})
              </p>
              <form onSubmit={submitReset}>
                <div style={{ position: 'relative', marginBottom: 16 }}>
                  <input
                    value={newPass} onChange={e => setNewPass(e.target.value)}
                    type={showPass ? 'text' : 'password'}
                    placeholder="New password (min 6 chars)"
                    style={{ ...inputStyle, paddingRight: 40 }}
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setResetModal(null)} style={{ padding: '10px 16px', border: '1.5px solid #e2e8f0', borderRadius: 8, background: 'white', fontSize: 13, fontWeight: 500, cursor: 'pointer', color: '#475569' }}>Cancel</button>
                  <button type="submit" style={{ padding: '10px 20px', background: '#dc2626', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Reset Password</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
