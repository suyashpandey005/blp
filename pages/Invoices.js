import React, { useState, useEffect, useRef } from 'react';
import { Plus, Printer, Trash2, Eye, Search, Download } from 'lucide-react';
import { getInvoices, addInvoice, deleteInvoice, updateInvoiceStatus, getInvoiceItems, getCustomers, getTrips, getSettings, fmt, fmtFull, today } from '../data';

const statusBadge = (s) => {
  const map = { paid: 'badge-green', unpaid: 'badge-amber', overdue: 'badge-red', partial: 'badge-blue', draft: 'badge-gray', cancelled: 'badge-gray' };
  return <span className={`badge ${map[s] || 'badge-gray'}`}>{s?.toUpperCase()}</span>;
};

const emptyForm = {
  customer_id: '', invoice_date: today(), due_date: '', gst_type: 'CGST_SGST', notes: '', sac_code: '9965',
  items: [{ description: '', material_type: '', route: '', number_of_trips: '', rate_per_trip: 2000 }],
};

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [viewInvoice, setViewInvoice] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [msg, setMsg] = useState('');
  const printRef = useRef();

  const reload = () => setInvoices(getInvoices());
  useEffect(() => { reload(); setCustomers(getCustomers()); setTrips(getTrips()); }, []);

  const customerMap = Object.fromEntries(customers.map(c => [c.id, c]));
  const settings = getSettings();

  const filtered = invoices.filter(i => {
    const cName = customerMap[i.customer_id]?.name || '';
    const matchS = !search || i.invoice_number.toLowerCase().includes(search.toLowerCase()) || cName.toLowerCase().includes(search.toLowerCase());
    const matchSt = !filterStatus || i.status === filterStatus;
    return matchS && matchSt;
  }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // Calc subtotal
  const calcSubtotal = (items) => items.reduce((s, i) => s + ((parseInt(i.number_of_trips) || 0) * (parseFloat(i.rate_per_trip) || 0)), 0);
  const subtotal = calcSubtotal(form.items);
  const cgst = form.gst_type === 'CGST_SGST' ? subtotal * 0.09 : 0;
  const sgst = form.gst_type === 'CGST_SGST' ? subtotal * 0.09 : 0;
  const igst = form.gst_type === 'IGST' ? subtotal * 0.18 : 0;
  const grandTotal = subtotal + cgst + sgst + igst;

  const setItem = (idx, field, val) => {
    setForm(f => {
      const items = [...f.items];
      items[idx] = { ...items[idx], [field]: val };
      return { ...f, items };
    });
  };

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { description: '', material_type: '', route: '', number_of_trips: '', rate_per_trip: 2000 }] }));
  const removeItem = (idx) => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

  const handleDueDateFromDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    d.setDate(d.getDate() + (parseInt(customerMap[form.customer_id]?.payment_terms) || 30));
    return d.toISOString().split('T')[0];
  };

  const handleCustomerChange = (cid) => {
    const d = handleDueDateFromDate(form.invoice_date);
    setForm(f => ({ ...f, customer_id: cid, due_date: d }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.customer_id || !form.invoice_date || form.items.some(i => !i.number_of_trips || !i.rate_per_trip)) {
      setMsg('Please fill all required fields including item trips and rates.');
      return;
    }
    addInvoice({ ...form, customer_id: parseInt(form.customer_id) });
    reload();
    setShowForm(false);
    setMsg('');
    setForm(emptyForm);
  };

  const handlePrint = () => {
    const win = window.open('', '_blank');
    win.document.write('<html><head><title>Invoice</title>');
    win.document.write('<style>body{font-family:Arial,sans-serif;font-size:12px;padding:30px;} table{width:100%;border-collapse:collapse;} th{background:#1e3a5f;color:white;padding:8px;text-align:left;font-size:11px;} td{padding:8px;border-bottom:1px solid #e2e8f0;font-size:12px;} .tr{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e2e8f0;} .grand{font-weight:700;font-size:14px;border-top:2px solid #1e3a5f;padding-top:8px;color:#1e3a5f;}</style>');
    win.document.write('</head><body>');
    win.document.write(printRef.current.innerHTML);
    win.document.write('</body></html>');
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  const inv = viewInvoice;
  const invCustomer = inv ? customerMap[inv.customer_id] : null;
  const invItems = inv ? getInvoiceItems(inv.id) : [];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Invoiced', value: fmt(invoices.reduce((s,i)=>s+i.grand_total,0)), color: 'var(--blue)' },
          { label: 'Paid', value: fmt(invoices.filter(i=>i.status==='paid').reduce((s,i)=>s+i.grand_total,0)), color: 'var(--green)' },
          { label: 'Pending', value: fmt(invoices.filter(i=>['unpaid','partial','overdue'].includes(i.status)).reduce((s,i)=>s+i.grand_total,0)), color: 'var(--orange)' },
          { label: 'Overdue', value: invoices.filter(i=>i.status==='overdue').length + ' invoices', color: 'var(--red)' },
        ].map(s => (
          <div className="card" key={s.label} style={{ padding: '14px 18px' }}>
            <div style={{ fontSize: 11, color: 'var(--gray-500)', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {!showForm ? (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Invoices</span>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={16} /> New Invoice</button>
          </div>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--gray-100)' }}>
            <div className="filter-bar">
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                <input style={{ paddingLeft: 32 }} placeholder="Search invoice / customer..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="">All Status</option>
                {['paid','unpaid','partial','overdue','draft','cancelled'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice No.</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Due Date</th>
                  <th>Subtotal</th>
                  <th>GST</th>
                  <th>Grand Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(inv => (
                  <tr key={inv.id}>
                    <td className="fw text-blue">{inv.invoice_number}</td>
                    <td>{customerMap[inv.customer_id]?.name || '-'}</td>
                    <td>{new Date(inv.invoice_date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</td>
                    <td style={{ color: new Date(inv.due_date) < new Date() && inv.status !== 'paid' ? 'var(--red)' : 'inherit' }}>
                      {new Date(inv.due_date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                    </td>
                    <td>{fmtFull(inv.subtotal)}</td>
                    <td style={{ fontSize: 12 }}>{fmtFull(inv.total_gst)}</td>
                    <td className="fw">{fmtFull(inv.grand_total)}</td>
                    <td>{statusBadge(inv.status)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-sm btn-icon" onClick={() => setViewInvoice(inv)} title="View"><Eye size={13} /></button>
                        <button className="btn btn-sm btn-icon" onClick={() => { setViewInvoice(inv); setTimeout(handlePrint, 200); }} title="Print"><Printer size={13} /></button>
                        <button className="btn btn-sm btn-icon" style={{ color: 'var(--red)' }} onClick={() => { if(window.confirm('Delete invoice?')) { deleteInvoice(inv.id); reload(); } }} title="Delete"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={9} style={{ textAlign:'center', padding:40, color:'var(--gray-400)' }}>No invoices found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Invoice Generator */
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <button className="btn" onClick={() => { setShowForm(false); setMsg(''); setForm(emptyForm); }}>← Back</button>
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>Generate New Invoice</h3>
          </div>
          {msg && <div className="alert alert-error">{msg}</div>}
          <div className="grid-2-1">
            <div className="card">
              <div className="card-header"><span className="card-title">Invoice Details</span></div>
              <form onSubmit={handleSubmit}>
                <div className="card-body">
                  <div className="form-grid" style={{ marginBottom: 20 }}>
                    <div className="form-group">
                      <label>Customer *</label>
                      <select value={form.customer_id} onChange={e => handleCustomerChange(e.target.value)} required>
                        <option value="">Select Customer</option>
                        {customers.filter(c=>c.is_active).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>GST Type</label>
                      <select value={form.gst_type} onChange={e => setForm(f=>({...f,gst_type:e.target.value}))}>
                        <option value="CGST_SGST">CGST + SGST (Intra-state)</option>
                        <option value="IGST">IGST (Inter-state)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Invoice Date *</label>
                      <input type="date" value={form.invoice_date} onChange={e => setForm(f=>({...f,invoice_date:e.target.value,due_date:handleDueDateFromDate(e.target.value)}))} required />
                    </div>
                    <div className="form-group">
                      <label>Due Date</label>
                      <input type="date" value={form.due_date} onChange={e => setForm(f=>({...f,due_date:e.target.value}))} />
                    </div>
                    <div className="form-group">
                      <label>SAC Code</label>
                      <input value={form.sac_code} onChange={e => setForm(f=>({...f,sac_code:e.target.value}))} />
                    </div>
                    <div className="form-group">
                      <label>Notes</label>
                      <input placeholder="Optional notes..." value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))} />
                    </div>
                  </div>

                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12, color: 'var(--gray-700)' }}>Bill Items</div>
                  {form.items.map((item, idx) => (
                    <div key={idx} style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 8, padding: 14, marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                        <span style={{ fontWeight: 600, fontSize: 12, color: 'var(--gray-600)' }}>Item {idx + 1}</span>
                        {form.items.length > 1 && <button type="button" className="btn btn-sm" style={{ color:'var(--red)' }} onClick={() => removeItem(idx)}>Remove</button>}
                      </div>
                      <div className="form-grid-3">
                        <div className="form-group">
                          <label>Material</label>
                          <select value={item.material_type} onChange={e => setItem(idx, 'material_type', e.target.value)}>
                            <option value="">Select</option>
                            {['Sand','Gravel','Coal','Cement','Fly Ash','Iron Ore','Stone Chips','Murram','Other'].map(m=><option key={m}>{m}</option>)}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Route</label>
                          <input placeholder="Raipur → Bhilai" value={item.route} onChange={e => setItem(idx,'route',e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Description</label>
                          <input placeholder="Transport service..." value={item.description} onChange={e => setItem(idx,'description',e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>No. of Trips *</label>
                          <input type="number" min="1" placeholder="25" value={item.number_of_trips} onChange={e => setItem(idx,'number_of_trips',e.target.value)} required />
                        </div>
                        <div className="form-group">
                          <label>Rate / Trip (₹) *</label>
                          <input type="number" min="0" step="0.01" placeholder="2000" value={item.rate_per_trip} onChange={e => setItem(idx,'rate_per_trip',e.target.value)} required />
                        </div>
                        <div className="form-group">
                          <label>Amount</label>
                          <input readOnly value={fmtFull((parseInt(item.number_of_trips)||0)*(parseFloat(item.rate_per_trip)||0))} style={{ background:'var(--blue-pale)', fontWeight:600, color:'var(--blue)' }} />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button type="button" className="btn" onClick={addItem} style={{ marginBottom: 20, width: '100%' }}>+ Add Item</button>

                  {/* GST Summary */}
                  <div className="calc-box">
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--blue)', marginBottom: 10 }}>GST Summary</div>
                    <div className="calc-row"><span>Subtotal</span><span style={{fontWeight:600}}>{fmtFull(subtotal)}</span></div>
                    {cgst > 0 && <div className="calc-row"><span>CGST @ 9%</span><span>{fmtFull(cgst)}</span></div>}
                    {sgst > 0 && <div className="calc-row"><span>SGST @ 9%</span><span>{fmtFull(sgst)}</span></div>}
                    {igst > 0 && <div className="calc-row"><span>IGST @ 18%</span><span>{fmtFull(igst)}</span></div>}
                    <div className="calc-row total"><span>Grand Total</span><span>{fmtFull(grandTotal)}</span></div>
                  </div>

                  <div style={{ display:'flex', gap:10, marginTop:16 }}>
                    <button type="submit" className="btn btn-primary" style={{ flex:1 }}>Generate Invoice</button>
                    <button type="button" className="btn" onClick={() => { setShowForm(false); setForm(emptyForm); }}>Cancel</button>
                  </div>
                </div>
              </form>
            </div>

            {/* Preview */}
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--gray-700)', marginBottom: 12 }}>Preview</div>
              <div ref={printRef} style={{ background:'white', border:'1px solid var(--gray-200)', borderRadius:8, padding:20, fontSize:11 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16, paddingBottom:12, borderBottom:'2px solid var(--blue)' }}>
                  <div>
                    <div style={{ fontSize:16, fontWeight:800, color:'var(--blue)' }}>🚛 {settings.company_name}</div>
                    <div style={{ fontSize:10, color:'var(--gray-500)', marginTop:2 }}>{settings.address}</div>
                    <div style={{ fontSize:10, color:'var(--gray-500)' }}>GSTIN: {settings.gst_number}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:18, fontWeight:800 }}>TAX INVOICE</div>
                    <div style={{ fontSize:10, color:'var(--gray-500)' }}>Date: {form.invoice_date}</div>
                    <div style={{ fontSize:10, color:'var(--gray-500)' }}>Due: {form.due_date}</div>
                  </div>
                </div>
                {form.customer_id && (
                  <div style={{ background:'var(--gray-50)', borderRadius:6, padding:10, marginBottom:12, fontSize:11 }}>
                    <div style={{ fontWeight:700, marginBottom:3 }}>Bill To:</div>
                    <div style={{ fontWeight:600 }}>{customerMap[form.customer_id]?.company_name || customerMap[form.customer_id]?.name}</div>
                    <div style={{ color:'var(--gray-500)' }}>GST: {customerMap[form.customer_id]?.gst_number || 'N/A'}</div>
                    <div style={{ color:'var(--gray-500)' }}>{customerMap[form.customer_id]?.address}</div>
                  </div>
                )}
                <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:12 }}>
                  <thead>
                    <tr>
                      {['Description','SAC','Route','Trips','Rate','Amount'].map(h=>(
                        <th key={h} style={{ background:'var(--blue)', color:'white', padding:'6px 8px', textAlign:'left', fontSize:10 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {form.items.map((item,i)=>(
                      <tr key={i}>
                        <td style={{ padding:'6px 8px', borderBottom:'1px solid #e2e8f0' }}>{item.description || item.material_type || 'Transport'}</td>
                        <td style={{ padding:'6px 8px', borderBottom:'1px solid #e2e8f0' }}>{form.sac_code}</td>
                        <td style={{ padding:'6px 8px', borderBottom:'1px solid #e2e8f0', fontSize:10 }}>{item.route || '-'}</td>
                        <td style={{ padding:'6px 8px', borderBottom:'1px solid #e2e8f0', textAlign:'center' }}>{item.number_of_trips}</td>
                        <td style={{ padding:'6px 8px', borderBottom:'1px solid #e2e8f0' }}>{fmtFull(item.rate_per_trip)}</td>
                        <td style={{ padding:'6px 8px', borderBottom:'1px solid #e2e8f0', fontWeight:600 }}>{fmtFull((parseInt(item.number_of_trips)||0)*(parseFloat(item.rate_per_trip)||0))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ display:'flex', justifyContent:'flex-end' }}>
                  <div style={{ width:220, border:'1px solid var(--gray-200)', borderRadius:6, overflow:'hidden' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', padding:'6px 12px', borderBottom:'1px solid var(--gray-100)', fontSize:11 }}><span>Subtotal</span><span>{fmtFull(subtotal)}</span></div>
                    {cgst>0&&<div style={{ display:'flex', justifyContent:'space-between', padding:'6px 12px', borderBottom:'1px solid var(--gray-100)', fontSize:11 }}><span>CGST 9%</span><span>{fmtFull(cgst)}</span></div>}
                    {sgst>0&&<div style={{ display:'flex', justifyContent:'space-between', padding:'6px 12px', borderBottom:'1px solid var(--gray-100)', fontSize:11 }}><span>SGST 9%</span><span>{fmtFull(sgst)}</span></div>}
                    {igst>0&&<div style={{ display:'flex', justifyContent:'space-between', padding:'6px 12px', borderBottom:'1px solid var(--gray-100)', fontSize:11 }}><span>IGST 18%</span><span>{fmtFull(igst)}</span></div>}
                    <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 12px', background:'var(--blue)', color:'white', fontSize:13, fontWeight:700 }}><span>Grand Total</span><span>{fmtFull(grandTotal)}</span></div>
                  </div>
                </div>
                <div style={{ marginTop:16, display:'flex', justifyContent:'space-between', paddingTop:12, borderTop:'1px solid var(--gray-200)', fontSize:10, color:'var(--gray-500)' }}>
                  <div><div style={{ fontWeight:700, marginBottom:3 }}>Bank Details:</div><div>{settings.bank_name} | A/C: {settings.account_number} | IFSC: {settings.ifsc_code}</div><div>UPI: {settings.upi_id}</div></div>
                  <div style={{ textAlign:'center' }}><div style={{ borderTop:'1px solid #333', width:120, marginBottom:4, marginTop:32 }}></div><div style={{ fontWeight:600 }}>Authorized Signatory</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View modal */}
      {viewInvoice && (
        <div className="modal-overlay" onClick={() => setViewInvoice(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Invoice — {viewInvoice.invoice_number}</h3>
              <div style={{ display:'flex', gap:8 }}>
                <button className="btn btn-sm" onClick={handlePrint}><Printer size={14} /> Print</button>
                <button className="btn btn-sm" onClick={() => setViewInvoice(null)}>✕</button>
              </div>
            </div>
            <div ref={printRef} className="modal-body invoice-print">
              <div className="inv-header">
                <div>
                  <div className="company-name">🚛 {settings.company_name}</div>
                  <div style={{ fontSize:11, color:'var(--gray-500)', marginTop:3 }}>{settings.address}</div>
                  <div style={{ fontSize:11, color:'var(--gray-500)' }}>GSTIN: {settings.gst_number} | {settings.mobile}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div className="inv-title">TAX INVOICE</div>
                  <div style={{ fontSize:12, color:'var(--gray-500)' }}># {viewInvoice.invoice_number}</div>
                  <div style={{ fontSize:12, color:'var(--gray-500)' }}>Date: {new Date(viewInvoice.invoice_date).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</div>
                  <div style={{ fontSize:12, color:'var(--gray-500)' }}>Due: {new Date(viewInvoice.due_date).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</div>
                  <div style={{ marginTop:6 }}>{statusBadge(viewInvoice.status)}</div>
                </div>
              </div>
              <div className="parties-row">
                <div className="party-box">
                  <div className="party-label">From</div>
                  <div className="party-name">{settings.company_name}</div>
                  <div style={{ fontSize:11, color:'var(--gray-500)' }}>GSTIN: {settings.gst_number}</div>
                  <div style={{ fontSize:11, color:'var(--gray-500)' }}>{settings.address}</div>
                </div>
                <div className="party-box">
                  <div className="party-label">Bill To</div>
                  <div className="party-name">{invCustomer?.company_name || invCustomer?.name}</div>
                  <div style={{ fontSize:11, color:'var(--gray-500)' }}>GSTIN: {invCustomer?.gst_number || 'N/A'}</div>
                  <div style={{ fontSize:11, color:'var(--gray-500)' }}>{invCustomer?.address}</div>
                </div>
              </div>
              <table className="inv-table">
                <thead>
                  <tr><th>Description</th><th>SAC</th><th>Route</th><th style={{textAlign:'center'}}>Trips</th><th style={{textAlign:'right'}}>Rate/Trip</th><th style={{textAlign:'right'}}>Amount</th></tr>
                </thead>
                <tbody>
                  {invItems.map((item, i) => (
                    <tr key={i}>
                      <td>{item.description || item.material_type}</td>
                      <td>{viewInvoice.sac_code}</td>
                      <td>{item.route}</td>
                      <td style={{textAlign:'center'}}>{item.number_of_trips}</td>
                      <td style={{textAlign:'right'}}>{fmtFull(item.rate_per_trip)}</td>
                      <td style={{textAlign:'right', fontWeight:600}}>{fmtFull(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="totals-section">
                <div className="totals-box">
                  <div className="totals-row"><span>Subtotal</span><span>{fmtFull(viewInvoice.subtotal)}</span></div>
                  {viewInvoice.cgst_amount>0&&<div className="totals-row"><span>CGST @ 9%</span><span>{fmtFull(viewInvoice.cgst_amount)}</span></div>}
                  {viewInvoice.sgst_amount>0&&<div className="totals-row"><span>SGST @ 9%</span><span>{fmtFull(viewInvoice.sgst_amount)}</span></div>}
                  {viewInvoice.igst_amount>0&&<div className="totals-row"><span>IGST @ 18%</span><span>{fmtFull(viewInvoice.igst_amount)}</span></div>}
                  <div className="totals-row grand"><span>Grand Total</span><span>{fmtFull(viewInvoice.grand_total)}</span></div>
                </div>
              </div>
              {viewInvoice.notes && <div style={{ marginTop:14, padding:'10px 14px', background:'var(--gray-50)', borderRadius:6, fontSize:12, color:'var(--gray-600)' }}><strong>Notes:</strong> {viewInvoice.notes}</div>}
              <div style={{ marginTop:20, paddingTop:14, borderTop:'1px solid var(--gray-200)', display:'flex', justifyContent:'space-between', fontSize:11 }}>
                <div><div style={{ fontWeight:700, marginBottom:4 }}>Payment Details</div><div>{settings.bank_name}</div><div>A/C: {settings.account_number} | IFSC: {settings.ifsc_code}</div><div>UPI: {settings.upi_id}</div></div>
                <div style={{ textAlign:'center' }}><div style={{ width:140, borderTop:'1px solid #333', margin:'40px auto 6px' }}></div><div style={{ fontWeight:700 }}>Authorized Signatory</div></div>
              </div>
            </div>
            <div className="modal-footer no-print">
              <select value={viewInvoice.status} onChange={e => { updateInvoiceStatus(viewInvoice.id, e.target.value); reload(); setViewInvoice({...viewInvoice,status:e.target.value}); }} style={{ padding:'6px 10px', border:'1px solid var(--gray-200)', borderRadius:6, fontSize:13 }}>
                {['draft','unpaid','partial','paid','overdue','cancelled'].map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
              </select>
              <button className="btn" onClick={() => setViewInvoice(null)}>Close</button>
              <button className="btn btn-primary" onClick={handlePrint}><Printer size={14} /> Print / Save PDF</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
