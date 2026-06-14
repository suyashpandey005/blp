// auth.js — BLP Construction Auth System
// Stores users in localStorage under blp_users
// Session stored under blp_session

const AUTH_KEYS = {
  USERS: 'blp_users',
  SESSION: 'blp_session',
};

const getItem = (key) => {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
};
const setItem = (key, val) => localStorage.setItem(key, JSON.stringify(val));

// Simple hash (for client-side only — not cryptographic)
const hashPassword = (password) => {
  let hash = 0;
  const str = password + 'blp_salt_2026';
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash |= 0;
  }
  return hash.toString(16);
};

// ── INIT ────────────────────────────────────────────────────────
export const initAuth = () => {
  const users = getItem(AUTH_KEYS.USERS);
  if (!users) {
    // Create default admin
    setItem(AUTH_KEYS.USERS, [
      {
        id: 1,
        user_id: 'admin',
        name: 'Administrator',
        phone: '9876543210',
        role: 'admin',
        is_active: true,
        password_hash: hashPassword('admin@123'),
        created_at: new Date().toISOString(),
        last_login: null,
      },
    ]);
  }
};

// ── AUTH ACTIONS ─────────────────────────────────────────────────
export const loginUser = (userId, password) => {
  const users = getItem(AUTH_KEYS.USERS) || [];
  const user = users.find(u => u.user_id === userId.trim());
  if (!user) return { success: false, error: 'User ID not found' };
  if (!user.is_active) return { success: false, error: 'Account is deactivated. Contact admin.' };
  if (user.password_hash !== hashPassword(password)) return { success: false, error: 'Incorrect password' };

  // Update last login
  const updated = users.map(u => u.id === user.id ? { ...u, last_login: new Date().toISOString() } : u);
  setItem(AUTH_KEYS.USERS, updated);

  const session = { userId: user.id, user_id: user.user_id, name: user.name, role: user.role, phone: user.phone, loginTime: Date.now() };
  setItem(AUTH_KEYS.SESSION, session);
  return { success: true, user: session };
};

export const logoutUser = () => {
  localStorage.removeItem(AUTH_KEYS.SESSION);
};

export const getSession = () => {
  const s = getItem(AUTH_KEYS.SESSION);
  if (!s) return null;
  // Session expires after 8 hours
  if (Date.now() - s.loginTime > 8 * 60 * 60 * 1000) {
    localStorage.removeItem(AUTH_KEYS.SESSION);
    return null;
  }
  return s;
};

export const isAdmin = () => {
  const s = getSession();
  return s?.role === 'admin';
};

// ── USER MANAGEMENT (admin only) ────────────────────────────────
export const getUsers = () => getItem(AUTH_KEYS.USERS) || [];

export const createUser = ({ name, user_id, phone, password, role }) => {
  const users = getUsers();
  if (users.find(u => u.user_id === user_id.trim())) return { success: false, error: 'User ID already exists' };
  if (users.find(u => u.phone === phone.trim())) return { success: false, error: 'Phone number already registered' };
  if (password.length < 6) return { success: false, error: 'Password must be at least 6 characters' };

  const newUser = {
    id: Date.now(),
    user_id: user_id.trim(),
    name: name.trim(),
    phone: phone.trim(),
    role: role || 'user',
    is_active: true,
    password_hash: hashPassword(password),
    created_at: new Date().toISOString(),
    last_login: null,
  };
  setItem(AUTH_KEYS.USERS, [...users, newUser]);
  return { success: true, user: newUser };
};

export const updateUser = (id, data) => {
  const users = getUsers();
  const updated = users.map(u => {
    if (u.id !== id) return u;
    const changes = { ...u, ...data };
    if (data.password) changes.password_hash = hashPassword(data.password);
    delete changes.password;
    return changes;
  });
  setItem(AUTH_KEYS.USERS, updated);
  return { success: true };
};

export const toggleUserStatus = (id) => {
  const users = getUsers();
  const updated = users.map(u => u.id === id ? { ...u, is_active: !u.is_active } : u);
  setItem(AUTH_KEYS.USERS, updated);
};

export const deleteUser = (id) => {
  const users = getUsers().filter(u => u.id !== id);
  setItem(AUTH_KEYS.USERS, users);
};

export const resetPassword = (id, newPassword) => {
  if (newPassword.length < 6) return { success: false, error: 'Password must be at least 6 characters' };
  updateUser(id, { password_hash: hashPassword(newPassword) });
  return { success: true };
};
