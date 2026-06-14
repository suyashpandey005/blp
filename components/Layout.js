import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Truck, Route, Users, FileText, CreditCard, Receipt, BarChart2, Settings, Calendar, Menu, ShieldCheck, LogOut } from 'lucide-react';

const navItems = [
  { group: 'Overview', items: [{ to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' }] },
  { group: 'Operations', items: [
    { to: '/trips', icon: Route, label: 'Trip Management' },
    { to: '/vehicles', icon: Truck, label: 'Vehicles' },
    { to: '/daily', icon: Calendar, label: 'Daily Register' },
  ]},
  { group: 'Finance', items: [
    { to: '/invoices', icon: FileText, label: 'Billing & Invoices' },
    { to: '/payments', icon: CreditCard, label: 'Payments' },
    { to: '/gst', icon: Receipt, label: 'GST Reports' },
  ]},
  { group: 'CRM & Reports', items: [
    { to: '/customers', icon: Users, label: 'Customers' },
    { to: '/reports', icon: BarChart2, label: 'Reports' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ]},
];

const pageTitles = {
  '/dashboard': { title: 'Dashboard', sub: 'BLP Construction ERP Overview' },
  '/trips': { title: 'Trip Management', sub: 'Record and manage all truck trips' },
  '/vehicles': { title: 'Fleet Management', sub: 'Manage vehicles and drivers' },
  '/daily': { title: 'Daily Register', sub: 'Day-wise operations log' },
  '/invoices': { title: 'Billing & Invoices', sub: 'Generate GST-compliant invoices' },
  '/payments': { title: 'Payment Tracking', sub: 'Monitor received and pending payments' },
  '/gst': { title: 'GST Reports', sub: 'GSTR-1 ready tax summary' },
  '/customers': { title: 'Customers', sub: 'Manage customer accounts and ledgers' },
  '/reports': { title: 'Reports & Analytics', sub: 'Financial and operational reports' },
  '/settings': { title: 'Settings', sub: 'Company profile and configuration' },
  '/admin/users': { title: 'User Management', sub: 'Admin panel — manage access & accounts' },
};

export default function Layout({ session, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const page = pageTitles[location.pathname] || { title: 'BLP Construction', sub: '' };

  const initials = session?.name
    ? session.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'AD';

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className="sidebar" style={{ position: window.innerWidth < 768 ? 'fixed' : 'relative', height: '100vh', left: sidebarOpen || window.innerWidth >= 768 ? 0 : -240, transition: 'left 0.25s', zIndex: 100 }}>
        <div className="sidebar-logo">
          <div className="logo-icon">🚛</div>
          <h1>BLP Construction</h1>
          <p>Fleet & Billing ERP</p>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }}>
          {navItems.map(group => (
            <div className="nav-group" key={group.group}>
              <div className="nav-group-label">{group.group}</div>
              {group.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon size={17} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}

          {/* Admin-only: User Management */}
          {session?.role === 'admin' && (
            <div className="nav-group">
              <div className="nav-group-label">Admin</div>
              <NavLink
                to="/admin/users"
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <ShieldCheck size={17} />
                User Management
              </NavLink>
            </div>
          )}
        </nav>

        {/* User info + logout */}
        <div className="sidebar-user">
          <div className="user-avatar">{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {session?.name || 'Admin User'}
            </div>
            <div className="user-role">
              {session?.role === 'admin' ? '👑 Admin' : '👤 User'}
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Logout"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: 6,
              padding: '6px 7px',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.75)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,38,38,0.55)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
              className="mobile-menu-btn"
            >
              <Menu size={22} />
            </button>
            <div>
              <h2>{page.title}</h2>
              <p>{page.sub}</p>
            </div>
          </div>
          <div className="topbar-actions">
            <div style={{ fontSize: 12, color: 'var(--gray-500)', textAlign: 'right' }}>
              <div style={{ fontWeight: 600, color: 'var(--gray-700)' }}>
                {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              <div>BLP Construction</div>
            </div>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: block !important; }
          .sidebar { position: fixed !important; }
        }
      `}</style>
    </div>
  );
}
