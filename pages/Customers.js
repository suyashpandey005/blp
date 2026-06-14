import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, FileText } from 'lucide-react';
import { getCustomers, addCustomer, updateCustomer, deleteCustomer, getInvoices, getPayments, getCustomerOutstanding, fmt, fmtFull } from '../data';

const empty = { name:'', company_name:'', gst_number:'', mobile:'', email:'', address:'', payment_terms: 30 };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState('');
  const [ledgerCustomer, setLedgerCustomer] = useState(null);

  const reload = () => { setCustomers(getCustomers()); setInvoices(getInvoices()); setPayments(getPayments()); };
  useEffect(() => reload(), []);

  const inp = (f) => ({ value: form[f]||'', onChange: e => setForm(p=>({...p,[f]:e.target.value})) });

  const filtered = customers.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.gst_number?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name) { setMsg('Customer name is required'); return; }
    if (editId) updateCustomer(editId, form);
    else addCustomer(form);
    reload(); setShowModal(false); setMsg(''); setForm(empty);
  };

  const openEdit = (c) => { setForm({...c}); setEditId(c.id); setShowModal(true); };
  const handleDelete = (id) => { if (window.confirm('Deactivate this customer?')) { deleteCustomer(id); reload(); } };

  // Ledger data
  const ledgerInvoices = ledgerCustomer ? invoices.filter(i => i.customer_id === ledgerCustomer.id).sort((a,b)=>new Date(b.invoice_date)-new Date(a.invoice_date)) : [];
  const ledgerPayments = ledgerCustomer ? payments.filter(p => p.customer_id === ledgerCustomer.id).sort((a,b)=>new Date(b.payment_date)-new Date(a.payment_date)) : [];
  const totalBilled = ledgerInvoices.reduce((s,i)=>s+i.grand_total,0);
  const totalPaid = ledgerPayments.reduce((s,p)=>s+parseFloat(p.amount),0);

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <span className="card-title">Customers</span>
          <button className="btn btn-primary" onClick={()=>{setForm(empty);setEditId(null);setShowModal(true)}}><Plus size={16}/>Add Customer</button>
        </div>
        <div style={{ padding:'12px 20px', borderBottom:'1px solid var(--gray-100)' }}>
          <div className="filter-bar">
            <div style={{ position:'relative' }}>
              <Search size={14} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--gray-400)' }} />
              <input style={{ paddingLeft:32 }} placeholder="Search name, company, GST..." value={search} onChange={e=>setSearch(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Customer / Company</th><th>GST Number</th><th>Mobile</th><th>Email</th><th>Payment Terms</th><th>Outstanding</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const out = getCustomerOutstanding(c.id);
                return (
                  <tr key={c.id}>
                    <td>
                      <div className="fw">{c.name}</div>
                      <div style={{ fontSize:11, color:'var(--gray-500)' }}>{c.company_name}</div>
                    </td>
                    <td style={{ fontSize:12 }}>{c.gst_number || '-'}</td>
                    <td>{c.mobile}</td>
                    <td style={{ fontSize:12 }}>{c.email}</td>
                    <td>{c.payment_terms} days</td>
                    <td className="fw" style={{ color: out > 0 ? 'var(--red)' : 'var(--green)' }}>{fmtFull(out)}</td>
                    <td><span className={`badge ${c.is_active ? 'badge-green' : 'badge-gray'}`}>{c.is_active ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div style={{ display:'flex', gap:4 }}>
                        <button className="btn btn-sm btn-icon" onClick={()=>setLedgerCustomer(c)} title="Ledger"><FileText size={13}/></button>
                        <button className="btn btn-sm btn-icon" onClick={()=>openEdit(c)} title="Edit"><Edit size={13}/></button>
                        <button className="btn btn-sm btn-icon" style={{color:'var(--red)'}} onClick={()=>handleDelete(c.id)} title="Deactivate"><Trash2 size={13}/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length===0 && <tr><td colSpan={8} style={{textAlign:'center',padding:40,color:'var(--gray-400)'}}>No customers found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editId?'Edit Customer':'Add Customer'}</h3>
              <button className="btn btn-sm" onClick={()=>setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {msg && <div className="alert alert-error">{msg}</div>}
                <div className="form-grid">
                  <div className="form-group"><label>Customer Name *</label><input placeholder="John Doe" {...inp('name')} required /></div>
                  <div className="form-group"><label>Company Name</label><input placeholder="ABC Pvt. Ltd." {...inp('company_name')} /></div>
                  <div className="form-group"><label>GST Number</label><input placeholder="22ABCDE1234F1Z5" {...inp('gst_number')} /></div>
                  <div className="form-group"><label>Mobile Number</label><input placeholder="98765 43210" {...inp('mobile')} /></div>
                  <div className="form-group"><label>Email Address</label><input type="email" placeholder="email@example.com" {...inp('email')} /></div>
                  <div className="form-group"><label>Payment Terms (days)</label>
                    <select {...inp('payment_terms')}>
                      {[15,30,45,60,90].map(d=><option key={d} value={d}>{d} days</option>)}
                    </select>
                  </div>
                  <div className="form-group full"><label>Billing Address</label><textarea placeholder="Full address..." {...inp('address')} /></div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={()=>setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editId?'Update':'Add Customer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ledger Modal */}
      {ledgerCustomer && (
        <div className="modal-overlay" onClick={()=>setLedgerCustomer(null)}>
          <div className="modal modal-lg" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h3>Customer Ledger — {ledgerCustomer.name}</h3>
              <button className="btn btn-sm" onClick={()=>setLedgerCustomer(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
                <div style={{ background:'var(--blue-pale)', borderRadius:8, padding:14 }}>
                  <div style={{ fontSize:11, color:'var(--gray-500)' }}>Total Billed</div>
                  <div style={{ fontSize:18, fontWeight:700, color:'var(--blue)' }}>{fmtFull(totalBilled)}</div>
                </div>
                <div style={{ background:'var(--green-pale)', borderRadius:8, padding:14 }}>
                  <div style={{ fontSize:11, color:'var(--gray-500)' }}>Total Paid</div>
                  <div style={{ fontSize:18, fontWeight:700, color:'var(--green)' }}>{fmtFull(totalPaid)}</div>
                </div>
                <div style={{ background:'var(--red-pale)', borderRadius:8, padding:14 }}>
                  <div style={{ fontSize:11, color:'var(--gray-500)' }}>Outstanding Balance</div>
                  <div style={{ fontSize:18, fontWeight:700, color:'var(--red)' }}>{fmtFull(totalBilled - totalPaid)}</div>
                </div>
              </div>

              <div style={{ fontWeight:600, fontSize:13, marginBottom:8 }}>Invoice History</div>
              <div className="table-wrap" style={{ marginBottom:20 }}>
                <table className="data-table">
                  <thead><tr><th>Invoice No.</th><th>Date</th><th>Due Date</th><th>Amount</th><th>Status</th></tr></thead>
                  <tbody>
                    {ledgerInvoices.map(i=>(
                      <tr key={i.id}>
                        <td className="fw text-blue">{i.invoice_number}</td>
                        <td>{new Date(i.invoice_date).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</td>
                        <td>{new Date(i.due_date).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</td>
                        <td className="fw">{fmtFull(i.grand_total)}</td>
                        <td><span className={`badge ${i.status==='paid'?'badge-green':i.status==='overdue'?'badge-red':'badge-amber'}`}>{i.status}</span></td>
                      </tr>
                    ))}
                    {ledgerInvoices.length===0 && <tr><td colSpan={5} style={{textAlign:'center',padding:20,color:'var(--gray-400)'}}>No invoices</td></tr>}
                  </tbody>
                </table>
              </div>

              <div style={{ fontWeight:600, fontSize:13, marginBottom:8 }}>Payment History</div>
              <div className="table-wrap">
                <table className="data-table">
                  <thead><tr><th>Date</th><th>Invoice</th><th>Amount</th><th>Method</th><th>Reference</th></tr></thead>
                  <tbody>
                    {ledgerPayments.map(p=>{
                      const inv = invoices.find(i=>i.id===p.invoice_id);
                      return (
                        <tr key={p.id}>
                          <td>{new Date(p.payment_date).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</td>
                          <td className="text-blue">{inv?.invoice_number}</td>
                          <td className="fw text-green">{fmtFull(p.amount)}</td>
                          <td style={{ textTransform:'capitalize' }}>{p.payment_method?.replace('_',' ')}</td>
                          <td style={{ fontSize:12 }}>{p.transaction_ref || '-'}</td>
                        </tr>
                      );
                    })}
                    {ledgerPayments.length===0 && <tr><td colSpan={5} style={{textAlign:'center',padding:20,color:'var(--gray-400)'}}>No payments recorded</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={()=>setLedgerCustomer(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
