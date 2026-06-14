import React, { useState, useEffect } from 'react';
import { getTrips, getVehicles, getCustomers, fmt, fmtFull, today } from '../data';

export default function DailyRegister() {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedDate, setSelectedDate] = useState(today());
  const [view, setView] = useState('daily'); // daily, weekly, monthly

  useEffect(() => {
    setTrips(getTrips());
    setVehicles(getVehicles());
    setCustomers(getCustomers());
  }, []);

  const vehicleMap = Object.fromEntries(vehicles.map(v => [v.id, v]));
  const customerMap = Object.fromEntries(customers.map(c => [c.id, c.name]));

  const dayTrips = trips.filter(t => t.date === selectedDate);
  const daySummary = {
    revenue: dayTrips.reduce((s,t)=>s+parseFloat(t.trip_amount),0),
    trips: dayTrips.reduce((s,t)=>s+t.number_of_trips,0),
    diesel: dayTrips.reduce((s,t)=>s+parseFloat(t.diesel_consumed),0),
    profit: dayTrips.reduce((s,t)=>s+parseFloat(t.net_profit),0),
  };

  // Weekly data - last 7 days from selected date
  const getWeekDates = () => {
    const dates = [];
    const base = new Date(selectedDate);
    for (let i = 6; i >= 0; i--) {
      const d = new Date(base);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };
  const weekDates = getWeekDates();
  const weeklyData = weekDates.map(date => {
    const dt = trips.filter(t => t.date === date);
    return {
      date,
      trips: dt.reduce((s,t)=>s+t.number_of_trips,0),
      revenue: dt.reduce((s,t)=>s+parseFloat(t.trip_amount),0),
      diesel: dt.reduce((s,t)=>s+parseFloat(t.diesel_consumed),0),
    };
  });
  const weekTotalTrips = weeklyData.reduce((s,d)=>s+d.trips,0);
  const weekTotalRevenue = weeklyData.reduce((s,d)=>s+d.revenue,0);

  // Monthly data
  const monthStr = selectedDate.slice(0,7);
  const monthTrips = trips.filter(t => t.date.startsWith(monthStr));
  const monthSummary = {
    revenue: monthTrips.reduce((s,t)=>s+parseFloat(t.trip_amount),0),
    trips: monthTrips.reduce((s,t)=>s+t.number_of_trips,0),
    diesel: monthTrips.reduce((s,t)=>s+parseFloat(t.diesel_consumed),0),
    profit: monthTrips.reduce((s,t)=>s+parseFloat(t.net_profit),0),
    records: monthTrips.length,
  };

  const exportCSV = () => {
    const data = view === 'daily' ? dayTrips : view === 'weekly' ? trips.filter(t=>weekDates.includes(t.date)) : monthTrips;
    const headers = ['Date','Vehicle','Driver','Customer','Material','Route','Trips','Rate','Amount','Diesel(L)','Diesel Cost','Net Profit'];
    const rows = data.map(t => [
      t.date, vehicleMap[t.vehicle_id]?.vehicle_number, t.driver_name, customerMap[t.customer_id]||'',
      t.material_type, `${t.loading_point} to ${t.unloading_point}`, t.number_of_trips, t.rate_per_trip,
      t.trip_amount, t.diesel_consumed, t.diesel_cost, t.net_profit
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `BLP_${view}_register_${selectedDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="card mb-6">
        <div className="card-header">
          <div className="tabs" style={{ border:'none', marginBottom:0 }}>
            {['daily','weekly','monthly'].map(v => (
              <button key={v} className={`tab-btn ${view===v?'active':''}`} onClick={()=>setView(v)} style={{ textTransform:'capitalize' }}>{v}</button>
            ))}
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <input type={view==='monthly'?'month':'date'} value={view==='monthly'?monthStr:selectedDate} onChange={e=>setSelectedDate(view==='monthly' ? e.target.value+'-01' : e.target.value)} />
            <button className="btn btn-sm" onClick={exportCSV}>Export CSV</button>
          </div>
        </div>
      </div>

      {view === 'daily' && (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
            {[
              { label:"Today's Revenue", value: fmtFull(daySummary.revenue), color:'var(--green)' },
              { label:'Total Trips', value: daySummary.trips },
              { label:'Diesel Consumed', value: `${daySummary.diesel.toFixed(0)} L` },
              { label:'Net Profit', value: fmtFull(daySummary.profit), color: daySummary.profit>=0?'var(--green)':'var(--red)' },
            ].map(s=>(
              <div className="card" key={s.label} style={{ padding:'14px 18px' }}>
                <div style={{ fontSize:11, color:'var(--gray-500)', marginBottom:4 }}>{s.label}</div>
                <div style={{ fontSize:18, fontWeight:700, color:s.color||'var(--gray-800)' }}>{s.value}</div>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">Daily Register — {new Date(selectedDate).toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'})}</span></div>
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Vehicle</th><th>Driver</th><th>Customer</th><th>Material</th><th>Route</th><th>Trips</th><th>Revenue</th><th>Diesel</th></tr></thead>
                <tbody>
                  {dayTrips.map(t=>(
                    <tr key={t.id}>
                      <td className="fw">{vehicleMap[t.vehicle_id]?.vehicle_number}</td>
                      <td>{t.driver_name}</td>
                      <td>{customerMap[t.customer_id]||'-'}</td>
                      <td>{t.material_type}</td>
                      <td style={{ fontSize:12 }}>{t.loading_point} → {t.unloading_point}</td>
                      <td className="fw">{t.number_of_trips}</td>
                      <td className="fw text-blue">{fmtFull(t.trip_amount)}</td>
                      <td>{t.diesel_consumed}L</td>
                    </tr>
                  ))}
                  {dayTrips.length===0 && <tr><td colSpan={8} style={{textAlign:'center',padding:30,color:'var(--gray-400)'}}>No trips recorded for this date</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {view === 'weekly' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Weekly Summary ({weekDates[0]} to {weekDates[6]})</span>
            <div style={{ fontSize:12, color:'var(--gray-500)' }}>Total: <strong style={{color:'var(--blue)'}}>{fmtFull(weekTotalRevenue)}</strong> • {weekTotalTrips} trips</div>
          </div>
          <div className="card-body">
            {weeklyData.map(d => (
              <div key={d.date} style={{ display:'flex', alignItems:'center', padding:'10px 0', borderBottom:'1px solid var(--gray-100)' }}>
                <div style={{ width:90, fontSize:12, color:'var(--gray-600)' }}>{new Date(d.date).toLocaleDateString('en-IN',{weekday:'short',day:'2-digit',month:'short'})}</div>
                <div style={{ flex:1, margin:'0 16px' }}>
                  <div className="progress-bar">
                    <div className="progress-fill blue" style={{ width: `${weekTotalRevenue ? (d.revenue/weekTotalRevenue*100*3) : 0}%`, maxWidth:'100%' }} />
                  </div>
                </div>
                <div style={{ width:160, textAlign:'right', fontSize:12 }}>
                  <span className="fw">{fmtFull(d.revenue)}</span> • {d.trips} trips • {d.diesel.toFixed(0)}L
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'monthly' && (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12, marginBottom:20 }}>
            {[
              { label:'Records', value: monthSummary.records },
              { label:'Total Trips', value: monthSummary.trips },
              { label:'Gross Revenue', value: fmt(monthSummary.revenue), color:'var(--blue)' },
              { label:'Diesel Used', value: `${monthSummary.diesel.toFixed(0)} L` },
              { label:'Net Profit', value: fmt(monthSummary.profit), color: monthSummary.profit>=0?'var(--green)':'var(--red)' },
            ].map(s=>(
              <div className="card" key={s.label} style={{ padding:'14px 18px' }}>
                <div style={{ fontSize:11, color:'var(--gray-500)', marginBottom:4 }}>{s.label}</div>
                <div style={{ fontSize:18, fontWeight:700, color:s.color||'var(--gray-800)' }}>{s.value}</div>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">Monthly Register — {new Date(monthStr+'-01').toLocaleDateString('en-IN',{month:'long',year:'numeric'})}</span></div>
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Date</th><th>Vehicle</th><th>Customer</th><th>Material</th><th>Trips</th><th>Revenue</th><th>Diesel Cost</th><th>Net Profit</th></tr></thead>
                <tbody>
                  {monthTrips.sort((a,b)=>new Date(a.date)-new Date(b.date)).map(t=>(
                    <tr key={t.id}>
                      <td>{new Date(t.date).toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}</td>
                      <td className="fw">{vehicleMap[t.vehicle_id]?.vehicle_number}</td>
                      <td>{customerMap[t.customer_id]||'-'}</td>
                      <td>{t.material_type}</td>
                      <td className="fw">{t.number_of_trips}</td>
                      <td className="fw text-blue">{fmtFull(t.trip_amount)}</td>
                      <td className="text-red">{fmtFull(t.diesel_cost)}</td>
                      <td className={`fw ${t.net_profit>=0?'text-green':'text-red'}`}>{fmtFull(t.net_profit)}</td>
                    </tr>
                  ))}
                  {monthTrips.length===0 && <tr><td colSpan={8} style={{textAlign:'center',padding:30,color:'var(--gray-400)'}}>No trips for this month</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
