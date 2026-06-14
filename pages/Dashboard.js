import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Truck, Users, CreditCard, Fuel, Package, AlertCircle, CheckCircle } from 'lucide-react';
import { getTrips, getInvoices, getPayments, getCustomers, getVehicles, fmt } from '../data';

const COLORS = ['#2563a8', '#f97316', '#16a34a', '#dc2626', '#9333ea', '#0891b2', '#d97706'];

export default function Dashboard() {
  const [trips, setTrips] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    setTrips(getTrips());
    setInvoices(getInvoices());
    setPayments(getPayments());
    setCustomers(getCustomers());
    setVehicles(getVehicles());
  }, []);

  const thisMonth = new Date().getMonth() + 1;
  const thisYear = new Date().getFullYear();

  const monthTrips = trips.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() + 1 === thisMonth && d.getFullYear() === thisYear;
  });

  const totalRevenue = invoices.reduce((s, i) => s + parseFloat(i.grand_total), 0);
  const totalReceived = payments.reduce((s, p) => s + parseFloat(p.amount), 0);
  const totalPending = totalRevenue - totalReceived;
  const totalTrips = monthTrips.reduce((s, t) => s + t.number_of_trips, 0);
  const totalDiesel = monthTrips.reduce((s, t) => s + parseFloat(t.diesel_consumed), 0);
  const activeVehicles = vehicles.filter(v => v.status === 'active').length;
  const totalProfit = monthTrips.reduce((s, t) => s + parseFloat(t.net_profit), 0);
  const overdueInvoices = invoices.filter(i => i.status === 'overdue' || (i.status === 'unpaid' && new Date(i.due_date) < new Date()));

  // Monthly revenue chart
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyData = monthNames.map((name, idx) => {
    const monthTripsData = trips.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === idx && d.getFullYear() === thisYear;
    });
    const rev = monthTripsData.reduce((s, t) => s + t.trip_amount, 0);
    const profit = monthTripsData.reduce((s, t) => s + t.net_profit, 0);
    return { name, revenue: Math.round(rev / 1000), profit: Math.round(profit / 1000) };
  }).filter(m => m.revenue > 0);

  // Vehicle performance
  const vehicleData = vehicles.slice(0, 6).map(v => {
    const vTrips = trips.filter(t => t.vehicle_id === v.id);
    return {
      name: v.vehicle_number.split(' ').slice(-1)[0],
      trips: vTrips.reduce((s, t) => s + t.number_of_trips, 0),
      revenue: Math.round(vTrips.reduce((s, t) => s + t.trip_amount, 0) / 1000),
    };
  }).filter(v => v.trips > 0);

  // Payment status pie
  const paidAmt = payments.reduce((s, p) => s + parseFloat(p.amount), 0);
  const pieData = [
    { name: 'Received', value: Math.round(paidAmt / 1000) },
    { name: 'Pending', value: Math.round(totalPending / 1000) },
  ];

  // Recent trips
  const recentTrips = [...trips].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6);
  const vehicleMap = Object.fromEntries(vehicles.map(v => [v.id, v.vehicle_number]));
  const customerMap = Object.fromEntries(customers.map(c => [c.id, c.name]));

  const statCards = [
    { label: 'Total Revenue (YTD)', value: fmt(totalRevenue), sub: 'All invoices', icon: TrendingUp, color: 'blue' },
    { label: 'Received Payments', value: fmt(totalReceived), sub: `${invoices.filter(i=>i.status==='paid').length} invoices paid`, icon: CheckCircle, color: 'green' },
    { label: 'Pending Amount', value: fmt(totalPending), sub: `${overdueInvoices.length} overdue`, icon: AlertCircle, color: 'red' },
    { label: 'Trips This Month', value: totalTrips.toLocaleString(), sub: `${monthTrips.length} records`, icon: Package, color: 'orange' },
    { label: 'Diesel Consumed', value: `${Math.round(totalDiesel).toLocaleString()} L`, sub: 'This month', icon: Fuel, color: 'amber' },
    { label: 'Active Vehicles', value: activeVehicles, sub: `${vehicles.length - activeVehicles} offline`, icon: Truck, color: 'blue' },
    { label: 'Total Customers', value: customers.filter(c => c.is_active).length, sub: 'Active accounts', icon: Users, color: 'purple' },
    { label: 'Net Profit (Month)', value: fmt(totalProfit), sub: 'After diesel cost', icon: TrendingUp, color: 'green' },
  ];

  return (
    <div>
      {/* Overdue alert */}
      {overdueInvoices.length > 0 && (
        <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={16} />
          <strong>{overdueInvoices.length} invoice(s) are overdue.</strong> Total outstanding: {fmt(overdueInvoices.reduce((s, i) => s + i.grand_total, 0))}
        </div>
      )}

      {/* Stat cards */}
      <div className="stats-grid">
        {statCards.map((s, i) => (
          <div className="stat-card" key={i}>
            <div className={`stat-icon ${s.color}`}><s.icon size={22} /></div>
            <div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid-2 mb-6">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Monthly Revenue & Profit (₹ Thousands)</span>
          </div>
          <div className="card-body" style={{ paddingTop: 8 }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `₹${v}K`} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="revenue" name="Revenue" fill="#2563a8" radius={[4,4,0,0]} />
                <Bar dataKey="profit" name="Profit" fill="#16a34a" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Payment Status</span>
          </div>
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={i === 0 ? '#16a34a' : '#f97316'} />)}
                </Pie>
                <Tooltip formatter={(v) => `₹${v}K`} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: '#16a34a' }} />
                  <span style={{ fontSize: 12, color: 'var(--gray-600)' }}>Received</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--green)' }}>{fmt(paidAmt)}</div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: '#f97316' }} />
                  <span style={{ fontSize: 12, color: 'var(--gray-600)' }}>Pending</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--orange)' }}>{fmt(totalPending)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid-2-1 mb-6">
        <div className="card">
          <div className="card-header"><span className="card-title">Vehicle-wise Performance (Trips & Revenue ₹K)</span></div>
          <div className="card-body" style={{ paddingTop: 8 }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={vehicleData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={60} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="trips" name="Trips" fill="#2563a8" radius={[0,4,4,0]} />
                <Bar dataKey="revenue" name="₹K Revenue" fill="#f97316" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Invoice Status</span></div>
          <div className="card-body" style={{ padding: '12px 20px' }}>
            {[
              { label: 'Paid', count: invoices.filter(i=>i.status==='paid').length, color: '#16a34a' },
              { label: 'Unpaid', count: invoices.filter(i=>i.status==='unpaid').length, color: '#f97316' },
              { label: 'Overdue', count: invoices.filter(i=>i.status==='overdue').length, color: '#dc2626' },
              { label: 'Partial', count: invoices.filter(i=>i.status==='partial').length, color: '#2563a8' },
            ].map(s => (
              <div key={s.label} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: 'var(--gray-600)' }}>{s.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{s.count} invoices</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.min(100, (s.count / Math.max(invoices.length, 1)) * 100)}%`, background: s.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent trips table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Recent Trips</span>
          <a href="/trips" style={{ fontSize: 12, color: 'var(--blue-mid)', textDecoration: 'none', fontWeight: 500 }}>View all →</a>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Vehicle</th>
                <th>Customer</th>
                <th>Route</th>
                <th>Material</th>
                <th>Trips</th>
                <th>Amount</th>
                <th>Net Profit</th>
              </tr>
            </thead>
            <tbody>
              {recentTrips.map(t => (
                <tr key={t.id}>
                  <td>{new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                  <td className="fw">{vehicleMap[t.vehicle_id] || '-'}</td>
                  <td>{customerMap[t.customer_id] || '-'}</td>
                  <td style={{ fontSize: 12 }}>{t.loading_point} → {t.unloading_point}</td>
                  <td>{t.material_type}</td>
                  <td className="fw">{t.number_of_trips}</td>
                  <td className="fw text-blue">{fmt(t.trip_amount)}</td>
                  <td className={`fw ${t.net_profit >= 0 ? 'text-green' : 'text-red'}`}>{fmt(t.net_profit)}</td>
                </tr>
              ))}
              {recentTrips.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: 'var(--gray-400)' }}>No trips yet. Add your first trip!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
