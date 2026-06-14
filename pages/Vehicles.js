import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Truck } from 'lucide-react';
import { getVehicles, addVehicle, updateVehicle, deleteVehicle, getTrips, fmt } from '../data';

const statusBadge = (s) => {
  const map = { active: 'badge-green', inactive: 'badge-gray', maintenance: 'badge-amber' };
  return <span className={`badge ${map[s]||'badge-gray'}`}>{s}</span>;
};

const empty = { vehicle_number:'', vehicle_type:'Tipper Truck', driver_name:'', driver_mobile:'', capacity:'20T', fuel_efficiency:'', status:'active' };

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState('');

  const reload = () => { setVehicles(getVehicles()); setTrips(getTrips()); };
  useEffect(() => reload(), []);

  const vehicleStats = (vid) => {
    const vt = trips.filter(t => t.vehicle_id === vid);
    return {
      totalTrips: vt.reduce((s,t) => s + t.number_of_trips, 0),
      totalRevenue: vt.reduce((s,t) => s + parseFloat(t.trip_amount), 0),
      totalDiesel: vt.reduce((s,t) => s + parseFloat(t.diesel_consumed), 0),
      totalProfit: vt.reduce((s,t) => s + parseFloat(t.net_profit), 0),
    };
  };

  const inp = (f) => ({ value: form[f]||'', onChange: e => setForm(p=>({...p,[f]:e.target.value})) });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.vehicle_number || !form.driver_name) { setMsg('Vehicle number and driver name required'); return; }
    if (editId) updateVehicle(editId, form);
    else addVehicle(form);
    reload(); setShowModal(false); setMsg(''); setForm(empty);
  };

  const openEdit = (v) => { setForm({...v}); setEditId(v.id); setShowModal(true); };
  const handleDelete = (id) => { if(window.confirm('Remove this vehicle?')) { deleteVehicle(id); reload(); } };

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        {[
          { label:'Total Vehicles', value: vehicles.length },
          { label:'Active', value: vehicles.filter(v=>v.status==='active').length, color:'var(--green)' },
          { label:'In Maintenance', value: vehicles.filter(v=>v.status==='maintenance').length, color:'var(--amber)' },
          { label:'Inactive', value: vehicles.filter(v=>v.status==='inactive').length, color:'var(--gray-400)' },
        ].map(s => (
          <div className="card" key={s.label} style={{ padding:'14px 18px' }}>
            <div style={{ fontSize:11, color:'var(--gray-500)', marginBottom:4 }}>{s.label}</div>
            <div style={{ fontSize:22, fontWeight:700, color:s.color||'var(--gray-800)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:14 }}>
        <button className="btn btn-primary" onClick={()=>{setForm(empty);setEditId(null);setShowModal(true)}}><Plus size={16}/>Add Vehicle</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:16 }}>
        {vehicles.map(v => {
          const stats = vehicleStats(v.id);
          return (
            <div className="card" key={v.id}>
              <div className="card-header">
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:42, height:42, background:'var(--blue-pale)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--blue)' }}>
                    <Truck size={22}/>
                  </div>
                  <div>
                    <div style={{ fontWeight:700, color:'var(--gray-800)' }}>{v.vehicle_number}</div>
                    <div style={{ fontSize:12, color:'var(--gray-500)' }}>{v.vehicle_type} • {v.capacity}</div>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  {statusBadge(v.status)}
                  <button className="btn btn-sm btn-icon" onClick={()=>openEdit(v)}><Edit size={13}/></button>
                  <button className="btn btn-sm btn-icon" style={{color:'var(--red)'}} onClick={()=>handleDelete(v.id)}><Trash2 size={13}/></button>
                </div>
              </div>
              <div className="card-body" style={{ paddingTop:12 }}>
                <div style={{ display:'flex', gap:16, marginBottom:14, fontSize:12, color:'var(--gray-600)' }}>
                  <span>👤 {v.driver_name}</span>
                  <span>📞 {v.driver_mobile}</span>
                  {v.fuel_efficiency && <span>⛽ {v.fuel_efficiency} km/L</span>}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
                  {[
                    { label:'Total Trips', value: stats.totalTrips.toLocaleString() },
                    { label:'Revenue', value: fmt(stats.totalRevenue) },
                    { label:'Diesel', value: `${Math.round(stats.totalDiesel)}L` },
                    { label:'Net Profit', value: fmt(stats.totalProfit), color: stats.totalProfit >= 0 ? 'var(--green)' : 'var(--red)' },
                  ].map(s=>(
                    <div key={s.label} style={{ background:'var(--gray-50)', borderRadius:6, padding:'8px 10px', textAlign:'center' }}>
                      <div style={{ fontSize:16, fontWeight:700, color:s.color||'var(--gray-800)' }}>{s.value}</div>
                      <div style={{ fontSize:10, color:'var(--gray-500)', marginTop:2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editId?'Edit Vehicle':'Add Vehicle'}</h3>
              <button className="btn btn-sm" onClick={()=>setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {msg && <div className="alert alert-error">{msg}</div>}
                <div className="form-grid">
                  <div className="form-group"><label>Vehicle Number *</label><input placeholder="CG04 XX 0000" {...inp('vehicle_number')} required /></div>
                  <div className="form-group"><label>Vehicle Type</label>
                    <select {...inp('vehicle_type')}>
                      {['Tipper Truck','Dumper','Trailer','Transit Mixer','Other'].map(t=><option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Driver Name *</label><input placeholder="Driver Name" {...inp('driver_name')} required /></div>
                  <div className="form-group"><label>Driver Mobile</label><input placeholder="98765 43210" {...inp('driver_mobile')} /></div>
                  <div className="form-group"><label>Capacity</label>
                    <select {...inp('capacity')}>
                      {['10T','15T','20T','25T','30T','35T'].map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Fuel Efficiency (km/L)</label><input type="number" step="0.1" placeholder="4.5" {...inp('fuel_efficiency')} /></div>
                  <div className="form-group"><label>Status</label>
                    <select {...inp('status')}>
                      {['active','maintenance','inactive'].map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={()=>setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editId?'Update':'Add Vehicle'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
