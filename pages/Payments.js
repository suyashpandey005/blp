import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle, Clock } from 'lucide-react';
import { getPayments, addPayment, deletePayment, getInvoices, getCustomers, getInvoiceBalance, fmt, fmtFull, today } from '../data';

const methodLabels = { cash: 'Cash', upi: 'UPI', net_banking: 'Net Banking', bank_transfer: 'Bank Transfer', cheque: 'Cheque', neft: 'NEFT', rtgs: 'RTGS' };

const empty = { invoice_id:'', amount:'', payment_method:'upi', payment_date: today(), transaction_ref:'', remarks:'' };

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterCustomer, setFilterCustomer] = useState('');

  const reload = () => { setPayments(getPayments()); setInvoices(getInvoices()); };
  useEffect(() => { reload(); setCustomers(getCustomers()); }, []);

  const customerMap = Object.fromEntries(customers.map(c => [c.id, c.name]));
  const invoiceMap = Object.fromEntries(invoices.map(i => [i.id, i]));

  const pendingInvoices = invoices.filter(i => ['unpaid','partial','overdue'].includes(i.status));

  const now = new Date();
  const filteredPayments = payments.filter(p => {
    const d = new Date(p.payment_date);
    let matchPeriod = true;
    if (filterPeriod === 'daily') matchPeriod = d.toDateString() === now.toDateString();
    else if (filterPeriod === 'weekly') { const diff = (now - d) / (1000*60*60*24); matchPeriod = diff <= 7; }
    else if (filterPeriod === 'monthly') matchPeriod = d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    const matchCustomer = !filterCustomer || String(p.customer_id) === filterCustomer;
    return matchPeriod && matchCustomer;
  }).sort((a,b) => new Date(b.payment_date) - new Date(a.payment_date));

  const totalReceived = filteredPayments.reduce((s,p)=>s+parseFloat(p.amount),0);
  const totalPendingAmount = pendingInvoices.reduce((s,i)=>s+getInvoiceBalance(i.id),0);

  const inp = (f) => ({ value: form[f]||'', onChange: e => setForm(p=>({...p,[f]:e.target.value})) });

  const handleInvoiceSelect = (id) => {
    const inv = invoices.find(i=>i.id===parseInt(id));
    setForm(f=>({...f, invoice_id:id, amount: inv ? getInvoiceBalance(inv.id) : ''}));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.invoice_id || !form.amount || !form.payment_method || !form.payment_date) {
      setMsg('Please fill all required fields'); return;
    }
    addPayment({ ...form, invoice_id: parseInt(form.invoice_id), amount: parseFloat(form.amount) });
    reload(); setShowModal(false); setMsg(''); setForm(empty);
  };

  const handleDelete = (id) => { if(window.confirm('Delete this payment record?')) { deletePayment(id); reload(); } };

  const daysOverdue = (dueDate) => {
    const diff = Math.floor((now - new Date(dueDate)) / (1000*60*60*24));
    return diff;
  };

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        {[
          { label:'Total Received', value: fmt(payments.reduce((s,p)=>s+parseFloat(p.amount),0)), color:'var(--green)', icon:CheckCircle },
          { label:'Outstanding', value: fmt(totalPendingAmount), color:'var(--red)', icon:Clock },
          { label:'Overdue Invoices', value: invoices.filter(i=>i.status==='overdue').length, color:'var(--red)' },
          { label:'This Month', value: fmt(payments.filter(p=>{const d=new Date(p.payment_date);return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear()}).reduce((s,p)=>s+parseFloat(p.amount),0)), color:'var(--blue)' },
        ].map(s => (
          <div className="card" key={s.label} style={{ padding:'14px 18px' }}>
            <div style={{ fontSize:11, color:'var(--gray-500)', marginBottom:4 }}>{s.label}</div>
            <div style={{ fontSize:20, fontWeight:700, color:s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid-2 mb-6">
        {/* Received Payments */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Received Payments</span>
            <button className="btn btn-primary btn-sm" onClick={()=>{setForm(empty);setShowModal(true)}}><Plus size={14}/> Record Payment</button>
          </div>
          <div style={{ padding:'10px 20px', borderBottom:'1px solid var(--gray-100)' }}>
            <div className="filter-bar" style={{ marginBottom:0 }}>
              <select value={filterPeriod} onChange={e=>setFilterPeriod(e.target.value)}>
                <option value="all">All Time</option>
                <option value="daily">Today</option>
                <option value="weekly">This Week</option>
                <option value="monthly">This Month</option>
              </select>
              <select value={filterCustomer} onChange={e=>setFilterCustomer(e.target.value)}>
                <option value="">All Customers</option>
                {customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div style={{ maxHeight: 380, overflowY:'auto' }}>
            {filteredPayments.map(p => (
              <div key={p.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 20px', borderBottom:'1px solid var(--gray-100)' }}>
                <div>
                  <div className="fw" style={{ fontSize:13 }}>{customerMap[p.customer_id]}</div>
                  <div style={{ fontSize:11, color:'var(--gray-500)' }}>{invoiceMap[p.invoice_id]?.invoice_number} • {methodLabels[p.payment_method]} • {new Date(p.payment_date).toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div className="fw text-green">{fmtFull(p.amount)}</div>
                  <button className="btn btn-sm btn-icon" style={{color:'var(--red)'}} onClick={()=>handleDelete(p.id)}><Trash2 size={13}/></button>
                </div>
              </div>
            ))}
            {filteredPayments.length===0 && <div className="empty-state"><p>No payments recorded for this period</p></div>}
          </div>
          <div style={{ padding:'12px 20px', borderTop:'1px solid var(--gray-100)', display:'flex', justifyContent:'space-between', fontWeight:700 }}>
            <span>Total</span><span className="text-green">{fmtFull(totalReceived)}</span>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="card">
          <div className="card-header"><span className="card-title">Pending Payments</span></div>
          <div style={{ maxHeight: 460, overflowY:'auto' }}>
            {pendingInvoices.sort((a,b)=>new Date(a.due_date)-new Date(b.due_date)).map(inv => {
              const overdue = daysOverdue(inv.due_date);
              const balance = getInvoiceBalance(inv.id);
              return (
                <div key={inv.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 20px', borderBottom:'1px solid var(--gray-100)' }}>
                  <div>
                    <div className="fw" style={{ fontSize:13 }}>{customerMap[inv.customer_id]}</div>
                    <div style={{ fontSize:11, color:'var(--gray-500)' }}>
                      {inv.invoice_number} • Due {new Date(inv.due_date).toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}
                      {overdue > 0 && <span style={{ color:'var(--red)', fontWeight:600 }}> • {overdue} days overdue</span>}
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div className="fw" style={{ color: overdue > 0 ? 'var(--red)' : 'var(--orange)' }}>{fmtFull(balance)}</div>
                    <button className="btn btn-sm" style={{ marginTop:4, fontSize:11 }} onClick={()=>{ setForm({...empty, invoice_id:String(inv.id), amount: balance}); setShowModal(true); }}>Record</button>
                  </div>
                </div>
              );
            })}
            {pendingInvoices.length===0 && <div className="empty-state"><p>All invoices are paid! 🎉</p></div>}
          </div>
        </div>
      </div>

      {/* Add Payment Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Record Payment</h3>
              <button className="btn btn-sm" onClick={()=>setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {msg && <div className="alert alert-error">{msg}</div>}
                <div className="form-grid">
                  <div className="form-group full">
                    <label>Invoice *</label>
                    <select value={form.invoice_id} onChange={e=>handleInvoiceSelect(e.target.value)} required>
                      <option value="">Select Invoice</option>
                      {pendingInvoices.map(i=>(
                        <option key={i.id} value={i.id}>{i.invoice_number} — {customerMap[i.customer_id]} — Balance: {fmtFull(getInvoiceBalance(i.id))}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group"><label>Amount (₹) *</label><input type="number" step="0.01" min="0" {...inp('amount')} required /></div>
                  <div className="form-group"><label>Payment Method *</label>
                    <select {...inp('payment_method')}>
                      {Object.entries(methodLabels).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Payment Date *</label><input type="date" {...inp('payment_date')} required /></div>
                  <div className="form-group"><label>Transaction Ref / UTR</label><input placeholder="UTR/Cheque No." {...inp('transaction_ref')} /></div>
                  <div className="form-group full"><label>Remarks</label><input placeholder="Full / Partial payment..." {...inp('remarks')} /></div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={()=>setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Record Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
