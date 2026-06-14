import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Calculator } from 'lucide-react';
import { getTrips, addTrip, updateTrip, deleteTrip, getVehicles, getCustomers, getSettings, fmt, fmtFull, today } from '../data';

const emptyForm = {
  date: today(), vehicle_id: '', customer_id: '', material_type: '', loading_point: '',
  unloading_point: '', distance_km: '', number_of_trips: '', rate_per_trip: 2000,
  diesel_consumed: '', diesel_rate: '', remarks: '',
};

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [filterVehicle, setFilterVehicle] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [msg, setMsg] = useState('');

  const reload = () => { setTrips(getTrips()); };
  useEffect(() => {
    reload();
    setVehicles(getVehicles());
    setCustomers(getCustomers());
    const s = getSettings();
    setForm(f => ({ ...f, diesel_rate: s.diesel_rate || 96 }));
  }, []);

  const vehicleMap = Object.fromEntries(vehicles.map(v => [v.id, v]));
  const customerMap = Object.fromEntries(customers.map(c => [c.id, c.name]));

  const numTrips = parseInt(form.number_of_trips) || 0;
  const rate = parseFloat(form.rate_per_trip) || 0;
  const diesel = parseFloat(form.diesel_consumed) || 0;
  const dieselRate = parseFloat(form.diesel_rate) || 96;
  const tripAmt = numTrips * rate;
  const dieselCost = diesel * dieselRate;
  const netProfit = tripAmt - dieselCost;

  const filteredTrips = trips.filter(t => {
    const matchSearch = !search || t.material_type?.toLowerCase().includes(search.toLowerCase()) || t.loading_point?.toLowerCase().includes(search.toLowerCase()) || t.unloading_point?.toLowerCase().includes(search.toLowerCase()) || customerMap[t.customer_id]?.toLowerCase().includes(search.toLowerCase());
    const matchVehicle = !filterVehicle || String(t.vehicle_id) === filterVehicle;
    const matchMonth = !filterMonth || t.date?.startsWith(filterMonth);
    return matchSearch && matchVehicle && matchMonth;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalRevenue = filteredTrips.reduce((s, t) => s + parseFloat(t.trip_amount), 0);
  const totalProfit = filteredTrips.reduce((s, t) => s + parseFloat(t.net_profit), 0);
  const totalTripsCount = filteredTrips.reduce((s, t) => s + t.number_of_trips, 0);

  const openAdd = () => {
    const s = getSettings();
    setForm({ ...emptyForm, diesel_rate: s.diesel_rate || 96 });
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (t) => {
    setForm({ ...t, vehicle_id: String(t.vehicle_id), customer_id: String(t.customer_id || '') });
    setEditId(t.id);
    setShowModal(true);
  };

  const handleVehicleChange = (vid) => {
    const v = vehicles.find(v => v.id === parseInt(vid));
    setForm(f => ({ ...f, vehicle_id: vid, driver_name: v?.driver_name || f.driver_name }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.date || !form.vehicle_id || !form.number_of_trips || !form.rate_per_trip) {
      setMsg('Please fill required fields: Date, Vehicle, Trips, Rate');
      return;
    }
    if (editId) updateTrip(editId, { ...form, vehicle_id: parseInt(form.vehicle_id), customer_id: form.customer_id ? parseInt(form.customer_id) : null });
    else addTrip({ ...form, vehicle_id: parseInt(form.vehicle_id), customer_id: form.customer_id ? parseInt(form.customer_id) : null });
    reload();
    setShowModal(false);
    setMsg('');
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this trip record?')) { deleteTrip(id); reload(); }
  };

  const inp = (field) => ({
    value: form[field] || '',
    onChange: e => setForm(f => ({ ...f, [field]: e.target.value })),
  });

  return (
    <div>
      {/* Summary bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Records', value: filteredTrips.length },
          { label: 'Total Trips', value: totalTripsCount.toLocaleString() },
          { label: 'Total Revenue', value: fmt(totalRevenue) },
          { label: 'Net Profit', value: fmt(totalProfit) },
        ].map(s => (
          <div className="card" key={s.label} style={{ padding: '14px 18px' }}>
            <div style={{ fontSize: 11, color: 'var(--gray-500)', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--gray-800)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Trip Records</span>
          <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add Trip</button>
        </div>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--gray-100)' }}>
          <div className="filter-bar">
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
              <input style={{ paddingLeft: 32 }} placeholder="Search material, route..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select value={filterVehicle} onChange={e => setFilterVehicle(e.target.value)}>
              <option value="">All Vehicles</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_number}</option>)}
            </select>
            <input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} />
            {(search || filterVehicle || filterMonth) && (
              <button className="btn btn-sm" onClick={() => { setSearch(''); setFilterVehicle(''); setFilterMonth(''); }}>Clear</button>
            )}
          </div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Vehicle</th>
                <th>Driver</th>
                <th>Customer</th>
                <th>Route</th>
                <th>Material</th>
                <th>Trips</th>
                <th>Rate</th>
                <th>Amount</th>
                <th>Diesel</th>
                <th>Diesel Cost</th>
                <th>Net Profit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrips.map(t => (
                <tr key={t.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}</td>
                  <td className="fw" style={{ whiteSpace: 'nowrap' }}>{vehicleMap[t.vehicle_id]?.vehicle_number || '-'}</td>
                  <td style={{ fontSize: 12 }}>{t.driver_name || '-'}</td>
                  <td style={{ fontSize: 12 }}>{customerMap[t.customer_id] || '-'}</td>
                  <td style={{ fontSize: 11, color: 'var(--gray-600)' }}>{t.loading_point} → {t.unloading_point}</td>
                  <td>{t.material_type}</td>
                  <td className="fw" style={{ textAlign: 'center' }}>{t.number_of_trips}</td>
                  <td>{fmtFull(t.rate_per_trip)}</td>
                  <td className="fw text-blue">{fmtFull(t.trip_amount)}</td>
                  <td style={{ fontSize: 12 }}>{t.diesel_consumed}L</td>
                  <td style={{ color: 'var(--red)', fontSize: 12 }}>{fmtFull(t.diesel_cost)}</td>
                  <td className={`fw ${t.net_profit >= 0 ? 'text-green' : 'text-red'}`}>{fmtFull(t.net_profit)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-sm btn-icon" onClick={() => openEdit(t)} title="Edit"><Edit size={13} /></button>
                      <button className="btn btn-sm btn-icon" onClick={() => handleDelete(t.id)} title="Delete" style={{ color: 'var(--red)' }}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTrips.length === 0 && (
                <tr><td colSpan={13} style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)' }}>No trips found. Click "Add Trip" to get started.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <div className="modal-header">
              <h3>{editId ? 'Edit Trip' : 'Add New Trip'}</h3>
              <button className="btn btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {msg && <div className="alert alert-error">{msg}</div>}
                <div className="form-grid-3" style={{ marginBottom: 16 }}>
                  <div className="form-group">
                    <label>Date *</label>
                    <input type="date" {...inp('date')} required />
                  </div>
                  <div className="form-group">
                    <label>Vehicle *</label>
                    <select value={form.vehicle_id} onChange={e => handleVehicleChange(e.target.value)} required>
                      <option value="">Select Vehicle</option>
                      {vehicles.filter(v => v.status !== 'inactive').map(v => (
                        <option key={v.id} value={v.id}>{v.vehicle_number} — {v.driver_name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Customer</label>
                    <select {...inp('customer_id')}>
                      <option value="">Select Customer</option>
                      {customers.filter(c => c.is_active).map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Loading Point (From) *</label>
                    <input placeholder="e.g. Raipur Yard" {...inp('loading_point')} />
                  </div>
                  <div className="form-group">
                    <label>Unloading Point (To) *</label>
                    <input placeholder="e.g. Bhilai Site" {...inp('unloading_point')} />
                  </div>
                  <div className="form-group">
                    <label>Material Type</label>
                    <select {...inp('material_type')}>
                      <option value="">Select Material</option>
                      {['Sand','Gravel','Coal','Cement','Fly Ash','Iron Ore','Stone Chips','Murram','Other'].map(m => (
                        <option key={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Number of Trips *</label>
                    <input type="number" min="1" placeholder="25" {...inp('number_of_trips')} required />
                  </div>
                  <div className="form-group">
                    <label>Rate Per Trip (₹) *</label>
                    <input type="number" min="0" step="0.01" placeholder="2000" {...inp('rate_per_trip')} required />
                  </div>
                  <div className="form-group">
                    <label>Distance (KM)</label>
                    <input type="number" min="0" placeholder="45" {...inp('distance_km')} />
                  </div>
                  <div className="form-group">
                    <label>Diesel Consumed (Litres)</label>
                    <input type="number" min="0" step="0.1" placeholder="180" {...inp('diesel_consumed')} />
                  </div>
                  <div className="form-group">
                    <label>Diesel Rate (₹/L)</label>
                    <input type="number" min="0" step="0.01" placeholder="96" {...inp('diesel_rate')} />
                  </div>
                  <div className="form-group">
                    <label>Remarks</label>
                    <input placeholder="Optional remarks" {...inp('remarks')} />
                  </div>
                </div>

                {/* Auto calculation box */}
                <div className="calc-box">
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calculator size={14} /> Auto Calculation
                  </div>
                  <div className="calc-row">
                    <span style={{ color: 'var(--gray-600)' }}>Trip Amount ({numTrips} trips × ₹{rate.toLocaleString()})</span>
                    <span style={{ fontWeight: 600 }}>{fmtFull(tripAmt)}</span>
                  </div>
                  <div className="calc-row">
                    <span style={{ color: 'var(--gray-600)' }}>Diesel Cost ({diesel}L × ₹{dieselRate})</span>
                    <span style={{ fontWeight: 600, color: 'var(--red)' }}>- {fmtFull(dieselCost)}</span>
                  </div>
                  <div className="calc-row total">
                    <span>Net Profit</span>
                    <span style={{ color: netProfit >= 0 ? 'var(--green)' : 'var(--red)' }}>{fmtFull(netProfit)}</span>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Update Trip' : 'Save Trip'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
