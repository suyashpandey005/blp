import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { getInvoices, getCustomers, fmtFull, fmt } from '../data';

export default function GSTReport() {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()+1);

  useEffect(()=>{ setInvoices(getInvoices()); setCustomers(getCustomers()); },[]);

  const customerMap = Object.fromEntries(customers.map(c=>[c.id,c]));

  const filtered = invoices.filter(i => {
    const d = new Date(i.invoice_date);
    return d.getFullYear()===year && d.getMonth()+1===month;
  });

  const summary = {
    taxable: filtered.reduce((s,i)=>s+parseFloat(i.subtotal),0),
    cgst: filtered.reduce((s,i)=>s+parseFloat(i.cgst_amount),0),
    sgst: filtered.reduce((s,i)=>s+parseFloat(i.sgst_amount),0),
    igst: filtered.reduce((s,i)=>s+parseFloat(i.igst_amount),0),
    totalGst: filtered.reduce((s,i)=>s+parseFloat(i.total_gst),0),
    total: filtered.reduce((s,i)=>s+parseFloat(i.grand_total),0),
  };

  const exportCSV = () => {
    const headers = ['Invoice No','Date','Customer','GSTIN','SAC','Taxable Value','CGST','SGST','IGST','Total GST','Grand Total','Status'];
    const rows = filtered.map(i => [
      i.invoice_number, i.invoice_date, customerMap[i.customer_id]?.name, customerMap[i.customer_id]?.gst_number||'',
      i.sac_code, i.subtotal, i.cgst_amount, i.sgst_amount, i.igst_amount, i.total_gst, i.grand_total, i.status
    ]);
    const csv = [headers,...rows].map(r=>r.map(c=>`"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv],{type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download=`GSTR1_BLP_${year}_${String(month).padStart(2,'0')}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  return (
    <div>
      <div className="card mb-6">
        <div className="card-header">
          <span className="card-title">GST Report Filters</span>
          <button className="btn btn-sm" onClick={exportCSV}><Download size={14}/> Export CSV</button>
        </div>
        <div className="card-body" style={{ display:'flex', gap:12 }}>
          <div className="form-group" style={{ width:160 }}>
            <label>Month</label>
            <select value={month} onChange={e=>setMonth(parseInt(e.target.value))}>
              {monthNames.map((m,i)=><option key={m} value={i+1}>{m}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ width:120 }}>
            <label>Year</label>
            <select value={year} onChange={e=>setYear(parseInt(e.target.value))}>
              {[2024,2025,2026,2027].map(y=><option key={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        {[
          { label:'Total Taxable Value', value: fmt(summary.taxable) },
          { label:'CGST Collected', value: fmt(summary.cgst) },
          { label:'SGST Collected', value: fmt(summary.sgst) },
          { label:'Total GST', value: fmt(summary.totalGst), color:'var(--blue)' },
        ].map(s=>(
          <div className="card" key={s.label} style={{ padding:'14px 18px' }}>
            <div style={{ fontSize:11, color:'var(--gray-500)', marginBottom:4 }}>{s.label}</div>
            <div style={{ fontSize:20, fontWeight:700, color:s.color||'var(--gray-800)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">GSTR-1 Summary — {monthNames[month-1]} {year}</span></div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Invoice No.</th><th>Date</th><th>Customer</th><th>GSTIN</th><th>SAC</th><th>Taxable</th><th>CGST</th><th>SGST</th><th>IGST</th><th>Grand Total</th></tr>
            </thead>
            <tbody>
              {filtered.map(i=>(
                <tr key={i.id}>
                  <td className="fw text-blue">{i.invoice_number}</td>
                  <td>{new Date(i.invoice_date).toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}</td>
                  <td>{customerMap[i.customer_id]?.name}</td>
                  <td style={{ fontSize:11 }}>{customerMap[i.customer_id]?.gst_number}</td>
                  <td>{i.sac_code}</td>
                  <td>{fmtFull(i.subtotal)}</td>
                  <td className="text-blue">{i.cgst_amount > 0 ? fmtFull(i.cgst_amount) : '—'}</td>
                  <td className="text-blue">{i.sgst_amount > 0 ? fmtFull(i.sgst_amount) : '—'}</td>
                  <td>{i.igst_amount > 0 ? fmtFull(i.igst_amount) : '—'}</td>
                  <td className="fw">{fmtFull(i.grand_total)}</td>
                </tr>
              ))}
              {filtered.length===0 && <tr><td colSpan={10} style={{textAlign:'center',padding:30,color:'var(--gray-400)'}}>No invoices for this period</td></tr>}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr style={{ background:'var(--gray-50)', fontWeight:700 }}>
                  <td colSpan={5}>Total</td>
                  <td>{fmtFull(summary.taxable)}</td>
                  <td>{fmtFull(summary.cgst)}</td>
                  <td>{fmtFull(summary.sgst)}</td>
                  <td>{fmtFull(summary.igst)}</td>
                  <td>{fmtFull(summary.total)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
