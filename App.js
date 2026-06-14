import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { initData } from './data';
import { initAuth, getSession, logoutUser } from './auth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Trips from './pages/Trips';
import Vehicles from './pages/Vehicles';
import Customers from './pages/Customers';
import Invoices from './pages/Invoices';
import Payments from './pages/Payments';
import GSTReport from './pages/GSTReport';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import DailyRegister from './pages/DailyRegister';
import AdminUsers from './pages/AdminUsers';

export default function App() {
  const [session, setSession] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    initAuth();
    initData();
    const s = getSession();
    setSession(s);
    setChecked(true);
  }, []);

  const handleLogin = (user) => setSession(user);
  const handleLogout = () => { logoutUser(); setSession(null); };

  if (!checked) return null; // avoid flicker

  if (!session) return <Login onLogin={handleLogin} />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout session={session} onLogout={handleLogout} />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="trips" element={<Trips />} />
          <Route path="vehicles" element={<Vehicles />} />
          <Route path="customers" element={<Customers />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="payments" element={<Payments />} />
          <Route path="daily" element={<DailyRegister />} />
          <Route path="gst" element={<GSTReport />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          {/* Admin-only route */}
          <Route
            path="admin/users"
            element={session.role === 'admin' ? <AdminUsers /> : <Navigate to="/dashboard" replace />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
