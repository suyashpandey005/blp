import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Download, TrendingUp, Truck, Users, Fuel, FileText } from 'lucide-react';
import { getTrips, getVehicles, getCustomers, getInvoices, getPayments, getCustomerOutstanding, fmt, fmtFull } from '../data';

export default function Reports() {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [activeReport, setActiveReport] = useState('revenue');

  useEffect(()=>{
    setTrips(getTrips()); setVehicles(getVehicles()); setCustomers(getCustomers()); setInvoices(getInvoices());
  },[]);

  const customerMap = Object.fromEntries(customers.map(c=>[c.id,c]));
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const thisYear = new Date().getFullYear();

  // Revenue Report
  const monthlyRevenue = monthNames.map((name, idx) => {
    const mTrips = trips.filter(t => new Date(t.date).getMonth()===idx && new Date(t.date).getFullYear()===thisYear);
    return {
      name,
      revenue: Math.round(mTrips.reduce((s,t)=>s+t.trip_amount,0)/1000),
      diesel: Math.round(mTrips.reduce((s,t)=>s+t.diesel_cost,0)/1000),
      profit: Math.round(mTrips.reduce((s,t)=>s+t.net_profit,0)/1000),
    };
  }).filter(m=>m.revenue>0 || m.diesel>0);

  // Vehicle report
  const vehicleReport = vehicles.map(v => {
    const vt = trips.filter(t=>t.vehicle_id===v.id);
    return {
      vehicle: v.vehicle_number, type: v.vehicle_type, driver: v.driver_name,
      records: vt.length, trips: vt.reduce((s,t)=>s+t.number_of_trips,0),
      revenue: vt.reduce((s,t)=>s+t.trip_amount,0),
      diesel: vt.reduce((s,t)=>s+t.diesel_consumed,0),
      dieselCost: vt.reduce((s,t)=>s+t.diesel_cost,0),
      profit: vt.reduce((s,t)=>s+t.net_profit,0),
    };
  }).sort((a,b)=>b.revenue-a.revenue);

  // Customer ledger
  const customerLedger = customers.map(c => {
    const cInv = invoices.filter(i=>i.customer_id===c.id);
    const billed = cInv.reduce((s,i)=>s+i.grand_total,0);
    const outstanding = getCustomerOutstanding(c.id);
    return { name: c.name, company: c.company_name, billed, paid: billed-outstanding, outstanding, invoices: cInv.length };
  }).filter(c=>c.invoices>0).sort((a,b)=>b.billed-a.billed);

  // P&L
  const totalRevenue = trips.reduce((s,t)=>s+t.trip_amount,0);
  const totalDieselCost = trips.reduce((s,t)=>s+t.diesel_cost,0);
  const totalProfit = trips.reduce((s,t)=>s+t.net_profit,0);
  const totalGST = invoices.reduce((s,i)=>s+i.total_gst,0);

  const reports = [
    { id:'revenue', label:'Revenue Report', icon:TrendingUp, desc:'Monthly revenue, diesel cost & profit breakdown' },
    { id:'vehicle', label:'Vehicle Report', icon:Truck, desc:'Vehicle-wise trips, revenue & diesel consumption' },
    { id:'customer', label:'Customer Ledger', icon:Users, desc:'Customer-wise billing & outstanding summary' },
    { id:'pnl', label:'P&L Statement', icon:FileText, desc:'CA-ready profit & loss statement' },
  ];

  const exportCSV = (type) => {
    let headers, rows, filename;
    if (type==='vehicle') {
      headers = ['Vehicle','Type','Driver','Records','Trips','Revenue','Diesel(L)','Diesel Cost','Net Profit'];
      rows = vehicleReport.map(v=>[v.vehicle,v.type,v.driver,v.records,v.trips,v.revenue,v.diesel,v.dieselCost,v.profit]);
      filename = 'vehicle_report.csv';
    } else if (type==='customer') {
      headers = ['Customer','Company','Invoices','Total Billed','Total Paid','Outstanding'];
      rows = customerLedger.map(c=>[c.name,c.company,c.invoices,c.billed,c.paid,c.outstanding]);
      filename = 'customer_ledger.csv';
    } else {
      headers = ['Month','Revenue(K)','Diesel Cost(K)','Profit(K)'];
      rows = monthlyRevenue.map(m=>[m.name,m.revenue,m.diesel,m.profit]);
      filename = 'revenue_report.csv';
    }
    const csv = [headers,...rows].map(r=>r.map(c=>`"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv],{type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download=filename; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        {reports.map(r => (
          <div className="card" key={r.id} style={{ cursor:'pointer', border: activeReport===r.id ? '2px solid var(--blue-light)' : '1px solid var(--gray-100)' }} onClick={()=>setActiveReport(r.id)}>
            <div className="card-body">
              <div style={{ width:40, height:40, borderRadius:8, background:'var(--blue-pale)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--blue)', marginBottom:10 }}>
                <r.icon size={20}/>
              </div>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>{r.label}</div>
              <div style={{ fontSize:12, color:'var(--gray-500)' }}>{r.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {activeReport === 'revenue' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Revenue Report — {thisYear}</span>
            <button className="btn btn-sm" onClick={()=>exportCSV('revenue')}><Download size={14}/> Export</button>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{fontSize:11}} />
                <YAxis tick={{fontSize:11}} />
                <Tooltip formatter={(v)=>`₹${v}K`} />
                <Legend wrapperStyle={{fontSize:11}} />
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#2563a8" strokeWidth={2} />
                <Line type="monotone" dataKey="diesel" name="Diesel Cost" stroke="#dc2626" strokeWidth={2} />
                <Line type="monotone" dataKey="profit" name="Profit" stroke="#16a34a" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
            <div className="table-wrap mt-4">
              <table className="data-table">
                <thead><tr><th>Month</th><th>Revenue</th><th>Diesel Cost</th><th>Net Profit</th><th>Margin %</th></tr></thead>
                <tbody>
                  {monthlyRevenue.map(m=>(
                    <tr key={m.name}>
                      <td className="fw">{m.name} {thisYear}</td>
                      <td className="text-blue">₹{m.revenue}K</td>
                      <td className="text-red">₹{m.diesel}K</td>
                      <td className={m.profit>=0?'text-green fw':'text-red fw'}>₹{m.profit}K</td>
                      <td>{m.revenue ? ((m.profit/m.revenue)*100).toFixed(1) : 0}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeReport === 'vehicle' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Vehicle Performance Report</span>
            <button className="btn btn-sm" onClick={()=>exportCSV('vehicle')}><Download size={14}/> Export</button>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={vehicleReport.map(v=>({name:v.vehicle.split(' ').slice(-1)[0], trips:v.trips, revenue: Math.round(v.revenue/1000)}))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{fontSize:11}} />
                <YAxis tick={{fontSize:11}} />
                <Tooltip />
                <Legend wrapperStyle={{fontSize:11}} />
                <Bar dataKey="trips" name="Trips" fill="#2563a8" radius={[4,4,0,0]} />
                <Bar dataKey="revenue" name="Revenue (₹K)" fill="#f97316" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="table-wrap mt-4">
              <table className="data-table">
                <thead><tr><th>Vehicle</th><th>Type</th><th>Driver</th><th>Trips</th><th>Revenue</th><th>Diesel</th><th>Diesel Cost</th><th>Net Profit</th></tr></thead>
                <tbody>
                  {vehicleReport.map(v=>(
                    <tr key={v.vehicle}>
                      <td className="fw">{v.vehicle}</td>
                      <td>{v.type}</td>
                      <td>{v.driver}</td>
                      <td className="fw">{v.trips}</td>
                      <td className="text-blue">{fmtFull(v.revenue)}</td>
                      <td>{v.diesel.toFixed(0)}L</td>
                      <td className="text-red">{fmtFull(v.dieselCost)}</td>
                      <td className={v.profit>=0?'text-green fw':'text-red fw'}>{fmtFull(v.profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeReport === 'customer' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Customer Outstanding Summary</span>
            <button className="btn btn-sm" onClick={()=>exportCSV('customer')}><Download size={14}/> Export</button>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Customer</th><th>Company</th><th>Invoices</th><th>Total Billed</th><th>Total Paid</th><th>Outstanding</th></tr></thead>
              <tbody>
                {customerLedger.map(c=>(
                  <tr key={c.name}>
                    <td className="fw">{c.name}</td>
                    <td style={{fontSize:12}}>{c.company}</td>
                    <td>{c.invoices}</td>
                    <td className="text-blue">{fmtFull(c.billed)}</td>
                    <td className="text-green">{fmtFull(c.paid)}</td>
                    <td className={c.outstanding>0?'text-red fw':'text-green fw'}>{fmtFull(c.outstanding)}</td>
                  </tr>
                ))}
                {customerLedger.length===0 && <tr><td colSpan={6} style={{textAlign:'center',padding:30,color:'var(--gray-400)'}}>No data available</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReport === 'pnl' && (
        <div className="card">
          <div className="card-header"><span className="card-title">Profit & Loss Statement — {thisYear}</span></div>
          <div className="card-body">
            <div style={{ maxWidth:500, margin:'0 auto' }}>
              {[
                { label:'Gross Trip Revenue', value: totalRevenue, color:'var(--gray-800)', bold:true },
                { label:'Less: Diesel Cost', value: -totalDieselCost, color:'var(--red)' },
                { label:'Operating Profit', value: totalProfit, color:'var(--green)', bold:true, divider:true },
                { label:'GST Collected (Pass-through)', value: totalGST, color:'var(--blue)' },
                { label:'Total Invoiced Amount', value: totalRevenue + totalGST, color:'var(--gray-800)', bold:true, divider:true },
              ].map((row,i)=>(
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'12px 0', borderBottom: row.divider?'2px solid var(--gray-800)':'1px solid var(--gray-100)', fontWeight: row.bold?700:400, fontSize: row.bold?15:13 }}>
                  <span>{row.label}</span>
                  <span style={{ color: row.color }}>{row.value < 0 ? '−' : ''}{fmtFull(Math.abs(row.value))}</span>
                </div>
              ))}
              <div style={{ marginTop:20, padding:16, background:'var(--green-pale)', borderRadius:8, textAlign:'center' }}>
                <div style={{ fontSize:12, color:'var(--gray-600)' }}>Net Profit Margin</div>
                <div style={{ fontSize:24, fontWeight:800, color:'var(--green)' }}>{totalRevenue ? ((totalProfit/totalRevenue)*100).toFixed(1) : 0}%</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
