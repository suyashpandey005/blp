import React, { useState, useEffect } from 'react';
import { Save, Sun, Moon } from 'lucide-react';
import { getSettings, saveSettings } from '../data';

export default function Settings() {
  const [form, setForm] = useState({});
  const [saved, setSaved] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => { setForm(getSettings()); }, []);

  const inp = (f) => ({ value: form[f] ?? '', onChange: e => setForm(p=>({...p,[f]:e.target.value})) });

  const handleSave = (e) => {
    e.preventDefault();
    saveSettings(form);
    setSaved(true);
    setTimeout(()=>setSaved(false), 2500);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.style.filter = !darkMode ? 'invert(1) hue-rotate(180deg)' : 'none';
  };

  return (
    <div>
      {saved && <div className="alert alert-success">Settings saved successfully!</div>}

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><span className="card-title">Company Profile</span></div>
          <form onSubmit={handleSave}>
            <div className="card-body">
              <div className="form-grid">
                <div className="form-group full"><label>Company Name</label><input {...inp('company_name')} /></div>
                <div className="form-group full"><label>GST Number</label><input {...inp('gst_number')} /></div>
                <div className="form-group"><label>Mobile</label><input {...inp('mobile')} /></div>
                <div className="form-group"><label>Email</label><input type="email" {...inp('email')} /></div>
                <div className="form-group full"><label>Address</label><textarea {...inp('address')} /></div>
              </div>
            </div>
            <div className="modal-footer" style={{ borderTop:'1px solid var(--gray-100)' }}>
              <button type="submit" className="btn btn-primary"><Save size={14}/> Save Profile</button>
            </div>
          </form>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Bank & Payment Details</span></div>
          <form onSubmit={handleSave}>
            <div className="card-body">
              <div className="form-grid">
                <div className="form-group full"><label>Bank Name</label><input {...inp('bank_name')} /></div>
                <div className="form-group"><label>Account Number</label><input {...inp('account_number')} /></div>
                <div className="form-group"><label>IFSC Code</label><input {...inp('ifsc_code')} /></div>
                <div className="form-group full"><label>UPI ID</label><input {...inp('upi_id')} /></div>
                <div className="form-group full"><label>Diesel Rate (₹ per Litre)</label><input type="number" step="0.01" {...inp('diesel_rate')} /></div>
              </div>
            </div>
            <div className="modal-footer" style={{ borderTop:'1px solid var(--gray-100)' }}>
              <button type="submit" className="btn btn-primary"><Save size={14}/> Save Payment Info</button>
            </div>
          </form>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Invoice Settings</span></div>
          <form onSubmit={handleSave}>
            <div className="card-body">
              <div className="form-grid">
                <div className="form-group"><label>Invoice Prefix</label><input {...inp('invoice_prefix')} /></div>
                <div className="form-group"><label>Next Invoice Number</label><input type="number" {...inp('next_invoice_number')} /></div>
                <div className="form-group"><label>Default GST Type</label>
                  <select {...inp('default_gst_type')}>
                    <option value="CGST_SGST">CGST + SGST</option>
                    <option value="IGST">IGST</option>
                  </select>
                </div>
                <div className="form-group"><label>Default Payment Terms</label>
                  <select {...inp('default_payment_terms')}>
                    {[15,30,45,60,90].map(d=><option key={d} value={d}>{d} days</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{ borderTop:'1px solid var(--gray-100)' }}>
              <button type="submit" className="btn btn-primary"><Save size={14}/> Save Settings</button>
            </div>
          </form>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">App Preferences</span></div>
          <div className="card-body">
            <div className="flex-between" style={{ padding:'10px 0', borderBottom:'1px solid var(--gray-100)' }}>
              <div>
                <div style={{ fontWeight:600, fontSize:13 }}>Theme</div>
                <div style={{ fontSize:12, color:'var(--gray-500)' }}>Toggle between light and dark mode</div>
              </div>
              <button className="btn btn-sm" onClick={toggleDarkMode}>
                {darkMode ? <Sun size={14}/> : <Moon size={14}/>} {darkMode ? 'Light' : 'Dark'}
              </button>
            </div>
            <div style={{ padding:'14px 0' }}>
              <div style={{ fontWeight:600, fontSize:13, marginBottom:6 }}>About This System</div>
              <p style={{ fontSize:12, color:'var(--gray-500)', lineHeight:1.6 }}>
                BLP Construction ERP v1.0 — Fleet & Billing Management System.
                All data is stored locally in your browser. For multi-user access with a shared database,
                deploy the backend API included in this project (see README.md).
              </p>
            </div>
            <div style={{ padding:'14px 0', borderTop:'1px solid var(--gray-100)' }}>
              <div style={{ fontWeight:600, fontSize:13, marginBottom:6, color:'var(--red)' }}>Reset Data</div>
              <p style={{ fontSize:12, color:'var(--gray-500)', marginBottom:10 }}>This will permanently delete all data and restore demo data.</p>
              <button className="btn" style={{ color:'var(--red)', borderColor:'var(--red)' }} onClick={()=>{
                if (window.confirm('This will delete ALL data. Are you sure?')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}>Reset All Data</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
