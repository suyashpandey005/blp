// data.js - All data management with localStorage persistence

const KEYS = {
  CUSTOMERS: 'blp_customers',
  VEHICLES: 'blp_vehicles',
  TRIPS: 'blp_trips',
  INVOICES: 'blp_invoices',
  PAYMENTS: 'blp_payments',
  SETTINGS: 'blp_settings',
};

const get = (key) => {
  try { return JSON.parse(localStorage.getItem(key)) || null; }
  catch { return null; }
};
const set = (key, val) => localStorage.setItem(key, JSON.stringify(val));

// ── SEED DATA ──────────────────────────────────────────────
export const initData = () => {
  if (get(KEYS.CUSTOMERS)) return; // already seeded

  set(KEYS.SETTINGS, {
    company_name: 'BLP Construction',
    gst_number: '22ABCDE1234F1Z5',
    address: 'Near Industrial Area, Raipur, Chhattisgarh 492001',
    mobile: '+91 98765 43210',
    email: 'billing@blpconstruction.in',
    bank_name: 'State Bank of India',
    account_number: '12345678901234',
    ifsc_code: 'SBIN0001234',
    upi_id: 'blpconstruction@sbi',
    diesel_rate: 96,
    invoice_prefix: 'INV-2026-',
    next_invoice_number: 1,
    default_gst_type: 'CGST_SGST',
    default_payment_terms: 30,
  });

  set(KEYS.CUSTOMERS, [
    { id: 1, name: 'Bhilai Steel Corp', company_name: 'Bhilai Steel Corporation Ltd.', gst_number: '22XYZAB5678G1Z8', mobile: '98765 11111', email: 'billing@bhilaisteel.in', address: 'Bhilai, Chhattisgarh', payment_terms: 30, is_active: true, created_at: '2026-01-10' },
    { id: 2, name: 'Chhattisgarh Roads', company_name: 'CG Roads & Infrastructure', gst_number: '22PQRST9012H1Z2', mobile: '98765 22222', email: 'accounts@cgroads.in', address: 'Raipur, Chhattisgarh', payment_terms: 45, is_active: true, created_at: '2026-01-15' },
    { id: 3, name: 'Sunrise Infra', company_name: 'Sunrise Infrastructure Pvt. Ltd.', gst_number: '22LMNOP3456I1Z9', mobile: '98765 33333', email: 'finance@sunriseinfra.in', address: 'Durg, Chhattisgarh', payment_terms: 30, is_active: true, created_at: '2026-02-01' },
    { id: 4, name: 'Raipur Metro Corp', company_name: 'Raipur Metropolitan Corp', gst_number: '22FGHIJ7890J1Z4', mobile: '98765 44444', email: 'billing@raipurmetro.in', address: 'Raipur, Chhattisgarh', payment_terms: 60, is_active: true, created_at: '2026-02-10' },
    { id: 5, name: 'NTPC Sipat', company_name: 'NTPC Limited - Sipat Plant', gst_number: '22ABCDE5678K1Z6', mobile: '98765 55555', email: 'accounts@ntpcsipat.in', address: 'Sipat, Bilaspur', payment_terms: 30, is_active: true, created_at: '2026-03-01' },
    { id: 6, name: 'Nakoda Cement', company_name: 'Nakoda Cement Works', gst_number: '22VWXYZ1234L1Z7', mobile: '98765 66666', email: 'billing@nakoda.in', address: 'Korba, Chhattisgarh', payment_terms: 30, is_active: true, created_at: '2026-03-15' },
    { id: 7, name: 'Korba Power Ltd', company_name: 'Korba Power Limited', gst_number: '22KLMNO5678M1Z3', mobile: '98765 77777', email: 'finance@korbapower.in', address: 'Korba, Chhattisgarh', payment_terms: 45, is_active: true, created_at: '2026-04-01' },
  ]);

  set(KEYS.VEHICLES, [
    { id: 1, vehicle_number: 'CG04 AB 1234', vehicle_type: 'Tipper Truck', driver_name: 'Ramesh Kumar', driver_mobile: '98765 43210', capacity: '20T', fuel_efficiency: 4.5, status: 'active', created_at: '2026-01-01' },
    { id: 2, vehicle_number: 'CG04 CD 5678', vehicle_type: 'Tipper Truck', driver_name: 'Suresh Patel', driver_mobile: '98765 43211', capacity: '20T', fuel_efficiency: 4.2, status: 'active', created_at: '2026-01-01' },
    { id: 3, vehicle_number: 'CG04 EF 9012', vehicle_type: 'Dumper', driver_name: 'Mahesh Thakur', driver_mobile: '98765 43212', capacity: '25T', fuel_efficiency: 3.8, status: 'active', created_at: '2026-01-01' },
    { id: 4, vehicle_number: 'CG04 GH 3456', vehicle_type: 'Tipper Truck', driver_name: 'Dinesh Singh', driver_mobile: '98765 43213', capacity: '20T', fuel_efficiency: 4.4, status: 'active', created_at: '2026-01-01' },
    { id: 5, vehicle_number: 'CG04 IJ 7890', vehicle_type: 'Dumper', driver_name: 'Ganesh Rao', driver_mobile: '98765 43214', capacity: '25T', fuel_efficiency: 3.9, status: 'active', created_at: '2026-01-01' },
    { id: 6, vehicle_number: 'CG04 KL 1122', vehicle_type: 'Tipper Truck', driver_name: 'Nilesh Verma', driver_mobile: '98765 43215', capacity: '20T', fuel_efficiency: 4.3, status: 'active', created_at: '2026-01-01' },
    { id: 7, vehicle_number: 'CG04 MN 3344', vehicle_type: 'Dumper', driver_name: 'Rakesh Sharma', driver_mobile: '98765 43216', capacity: '25T', fuel_efficiency: 4.0, status: 'active', created_at: '2026-01-01' },
    { id: 8, vehicle_number: 'CG04 OP 5566', vehicle_type: 'Tipper Truck', driver_name: 'Vikash Jain', driver_mobile: '98765 43217', capacity: '20T', fuel_efficiency: 4.1, status: 'maintenance', created_at: '2026-01-01' },
  ]);

  const trips = [];
  const materials = ['Sand', 'Gravel', 'Coal', 'Cement', 'Fly Ash', 'Iron Ore', 'Stone Chips'];
  const routes = [
    { from: 'Raipur Yard', to: 'Bhilai Site' },
    { from: 'Korba Mine', to: 'Raipur Depot' },
    { from: 'Durg Quarry', to: 'Rajnandgaon' },
    { from: 'Raigarh', to: 'Bilaspur' },
    { from: 'Raipur', to: 'Dhamtari' },
    { from: 'Bilaspur', to: 'Korba' },
  ];
  let tripId = 1;
  for (let month = 1; month <= 6; month++) {
    for (let day = 1; day <= 25; day += 2) {
      const d = String(day).padStart(2, '0');
      const m = String(month).padStart(2, '0');
      const date = `2026-${m}-${d}`;
      const vId = ((tripId - 1) % 7) + 1;
      const route = routes[tripId % routes.length];
      const cId = (tripId % 7) + 1;
      const numTrips = 8 + (tripId % 20);
      const rate = 2000;
      const diesel = numTrips * 7 + (tripId % 10);
      trips.push({
        id: tripId++,
        date,
        vehicle_id: vId,
        customer_id: cId,
        driver_name: `Driver ${vId}`,
        material_type: materials[tripId % materials.length],
        loading_point: route.from,
        unloading_point: route.to,
        distance_km: 30 + (tripId % 50),
        number_of_trips: numTrips,
        rate_per_trip: rate,
        trip_amount: numTrips * rate,
        diesel_consumed: diesel,
        diesel_rate: 96,
        diesel_cost: diesel * 96,
        net_profit: (numTrips * rate) - (diesel * 96),
        remarks: '',
        invoice_id: null,
        created_at: date,
      });
    }
  }
  set(KEYS.TRIPS, trips);

  // Create a few invoices
  const invoices = [
    { id: 1, invoice_number: 'INV-2026-001', customer_id: 1, invoice_date: '2026-06-01', due_date: '2026-07-01', subtotal: 100000, gst_type: 'CGST_SGST', cgst_amount: 9000, sgst_amount: 9000, igst_amount: 0, total_gst: 18000, grand_total: 118000, sac_code: '9965', status: 'paid', notes: '', created_at: '2026-06-01' },
    { id: 2, invoice_number: 'INV-2026-002', customer_id: 3, invoice_date: '2026-06-05', due_date: '2026-07-05', subtotal: 114000, gst_type: 'CGST_SGST', cgst_amount: 10260, sgst_amount: 10260, igst_amount: 0, total_gst: 20520, grand_total: 134520, sac_code: '9965', status: 'overdue', notes: '', created_at: '2026-06-05' },
    { id: 3, invoice_number: 'INV-2026-003', customer_id: 6, invoice_date: '2026-06-10', due_date: '2026-07-10', subtotal: 47593, gst_type: 'CGST_SGST', cgst_amount: 4284, sgst_amount: 4284, igst_amount: 0, total_gst: 8568, grand_total: 56161, sac_code: '9965', status: 'unpaid', notes: '', created_at: '2026-06-10' },
    { id: 4, invoice_number: 'INV-2026-004', customer_id: 2, invoice_date: '2026-06-12', due_date: '2026-07-12', subtotal: 190000, gst_type: 'CGST_SGST', cgst_amount: 17100, sgst_amount: 17100, igst_amount: 0, total_gst: 34200, grand_total: 224200, sac_code: '9965', status: 'paid', notes: '', created_at: '2026-06-12' },
  ];
  set(KEYS.INVOICES, invoices);

  const invoiceItems = {
    1: [{ id: 1, invoice_id: 1, description: 'Sand Transport', material_type: 'Sand', route: 'Raipur → Bhilai', number_of_trips: 25, rate_per_trip: 2000, amount: 50000 }, { id: 2, invoice_id: 1, description: 'Gravel Transport', material_type: 'Gravel', route: 'Durg → Rajnandgaon', number_of_trips: 25, rate_per_trip: 2000, amount: 50000 }],
    2: [{ id: 3, invoice_id: 2, description: 'Coal Transport', material_type: 'Coal', route: 'Korba → Raipur', number_of_trips: 57, rate_per_trip: 2000, amount: 114000 }],
    3: [{ id: 4, invoice_id: 3, description: 'Fly Ash Transport', material_type: 'Fly Ash', route: 'Bilaspur → Korba', number_of_trips: 23, rate_per_trip: 2000, amount: 46000 }, { id: 5, invoice_id: 3, description: 'Cement Transport', material_type: 'Cement', route: 'Raipur → Dhamtari', number_of_trips: 0, rate_per_trip: 2000, amount: 1593 }],
    4: [{ id: 6, invoice_id: 4, description: 'Sand Transport', material_type: 'Sand', route: 'Raipur → Bhilai', number_of_trips: 50, rate_per_trip: 2000, amount: 100000 }, { id: 7, invoice_id: 4, description: 'Gravel Transport', material_type: 'Gravel', route: 'Durg → Rajnandgaon', number_of_trips: 45, rate_per_trip: 2000, amount: 90000 }],
  };
  localStorage.setItem('blp_invoice_items', JSON.stringify(invoiceItems));

  set(KEYS.PAYMENTS, [
    { id: 1, invoice_id: 1, customer_id: 1, amount: 118000, payment_method: 'net_banking', payment_date: '2026-06-15', transaction_ref: 'UTR123456', remarks: 'Full payment', created_at: '2026-06-15' },
    { id: 2, invoice_id: 4, customer_id: 2, amount: 224200, payment_method: 'bank_transfer', payment_date: '2026-06-13', transaction_ref: 'NEFT789012', remarks: 'Full payment', created_at: '2026-06-13' },
  ]);
};

// ── CRUD HELPERS ──────────────────────────────────────────────

export const getSettings = () => get(KEYS.SETTINGS) || {};
export const saveSettings = (data) => set(KEYS.SETTINGS, { ...getSettings(), ...data });

// Customers
export const getCustomers = () => get(KEYS.CUSTOMERS) || [];
export const addCustomer = (data) => {
  const list = getCustomers();
  const newItem = { ...data, id: Date.now(), is_active: true, created_at: new Date().toISOString().split('T')[0] };
  set(KEYS.CUSTOMERS, [...list, newItem]);
  return newItem;
};
export const updateCustomer = (id, data) => {
  const list = getCustomers().map(c => c.id === id ? { ...c, ...data } : c);
  set(KEYS.CUSTOMERS, list);
};
export const deleteCustomer = (id) => {
  set(KEYS.CUSTOMERS, getCustomers().map(c => c.id === id ? { ...c, is_active: false } : c));
};

// Vehicles
export const getVehicles = () => get(KEYS.VEHICLES) || [];
export const addVehicle = (data) => {
  const list = getVehicles();
  const newItem = { ...data, id: Date.now(), status: 'active', created_at: new Date().toISOString().split('T')[0] };
  set(KEYS.VEHICLES, [...list, newItem]);
  return newItem;
};
export const updateVehicle = (id, data) => {
  set(KEYS.VEHICLES, getVehicles().map(v => v.id === id ? { ...v, ...data } : v));
};
export const deleteVehicle = (id) => {
  set(KEYS.VEHICLES, getVehicles().map(v => v.id === id ? { ...v, status: 'inactive' } : v));
};

// Trips
export const getTrips = () => get(KEYS.TRIPS) || [];
export const addTrip = (data) => {
  const settings = getSettings();
  const dieselRate = parseFloat(data.diesel_rate || settings.diesel_rate || 96);
  const numTrips = parseInt(data.number_of_trips);
  const ratePerTrip = parseFloat(data.rate_per_trip);
  const dieselConsumed = parseFloat(data.diesel_consumed || 0);
  const tripAmount = numTrips * ratePerTrip;
  const dieselCost = dieselConsumed * dieselRate;
  const vehicle = getVehicles().find(v => v.id === parseInt(data.vehicle_id));
  const newTrip = {
    ...data,
    id: Date.now(),
    number_of_trips: numTrips,
    rate_per_trip: ratePerTrip,
    trip_amount: tripAmount,
    diesel_consumed: dieselConsumed,
    diesel_rate: dieselRate,
    diesel_cost: dieselCost,
    net_profit: tripAmount - dieselCost,
    driver_name: data.driver_name || vehicle?.driver_name || '',
    invoice_id: null,
    created_at: new Date().toISOString(),
  };
  set(KEYS.TRIPS, [...getTrips(), newTrip]);
  return newTrip;
};
export const updateTrip = (id, data) => {
  const dieselRate = parseFloat(data.diesel_rate || 96);
  const numTrips = parseInt(data.number_of_trips);
  const ratePerTrip = parseFloat(data.rate_per_trip);
  const dieselConsumed = parseFloat(data.diesel_consumed || 0);
  const tripAmount = numTrips * ratePerTrip;
  const dieselCost = dieselConsumed * dieselRate;
  set(KEYS.TRIPS, getTrips().map(t => t.id === id ? { ...t, ...data, trip_amount: tripAmount, diesel_cost: dieselCost, net_profit: tripAmount - dieselCost } : t));
};
export const deleteTrip = (id) => { set(KEYS.TRIPS, getTrips().filter(t => t.id !== id)); };

// Invoices
export const getInvoices = () => get(KEYS.INVOICES) || [];
export const getInvoiceItems = (invoiceId) => {
  const all = JSON.parse(localStorage.getItem('blp_invoice_items') || '{}');
  return all[invoiceId] || [];
};
export const addInvoice = (data) => {
  const settings = getSettings();
  const subtotal = data.items.reduce((s, i) => s + (i.number_of_trips * i.rate_per_trip), 0);
  const gstType = data.gst_type || settings.default_gst_type || 'CGST_SGST';
  let cgst = 0, sgst = 0, igst = 0;
  if (gstType === 'CGST_SGST') { cgst = subtotal * 0.09; sgst = subtotal * 0.09; }
  else { igst = subtotal * 0.18; }
  const totalGst = cgst + sgst + igst;
  const grandTotal = subtotal + totalGst;
  const num = settings.next_invoice_number || 1;
  const invoiceNumber = `${settings.invoice_prefix || 'INV-2026-'}${String(num).padStart(3, '0')}`;

  const newInvoice = {
    ...data,
    id: Date.now(),
    invoice_number: invoiceNumber,
    subtotal,
    cgst_amount: cgst,
    sgst_amount: sgst,
    igst_amount: igst,
    total_gst: totalGst,
    grand_total: grandTotal,
    sac_code: data.sac_code || '9965',
    status: 'unpaid',
    created_at: new Date().toISOString().split('T')[0],
  };

  const list = getInvoices();
  set(KEYS.INVOICES, [...list, newInvoice]);

  // Save items
  const allItems = JSON.parse(localStorage.getItem('blp_invoice_items') || '{}');
  allItems[newInvoice.id] = data.items.map((item, i) => ({
    ...item,
    id: Date.now() + i,
    invoice_id: newInvoice.id,
    amount: item.number_of_trips * item.rate_per_trip,
  }));
  localStorage.setItem('blp_invoice_items', JSON.stringify(allItems));

  // Update trip links
  if (data.trip_ids?.length) {
    set(KEYS.TRIPS, getTrips().map(t => data.trip_ids.includes(t.id) ? { ...t, invoice_id: newInvoice.id } : t));
  }

  // Increment invoice number
  saveSettings({ next_invoice_number: num + 1 });
  return newInvoice;
};
export const updateInvoiceStatus = (id, status) => {
  set(KEYS.INVOICES, getInvoices().map(i => i.id === id ? { ...i, status } : i));
};
export const deleteInvoice = (id) => { set(KEYS.INVOICES, getInvoices().filter(i => i.id !== id)); };

// Payments
export const getPayments = () => get(KEYS.PAYMENTS) || [];
export const addPayment = (data) => {
  const invoice = getInvoices().find(i => i.id === parseInt(data.invoice_id));
  if (!invoice) return null;
  const newPayment = { ...data, id: Date.now(), customer_id: invoice.customer_id, created_at: new Date().toISOString() };
  set(KEYS.PAYMENTS, [...getPayments(), newPayment]);

  // Update invoice status
  const totalPaid = getPayments().filter(p => p.invoice_id === invoice.id).reduce((s, p) => s + p.amount, 0) + parseFloat(data.amount);
  let status = 'unpaid';
  if (totalPaid >= invoice.grand_total) status = 'paid';
  else if (totalPaid > 0) status = 'partial';
  updateInvoiceStatus(invoice.id, status);
  return newPayment;
};
export const deletePayment = (id) => { set(KEYS.PAYMENTS, getPayments().filter(p => p.id !== id)); };

// ── COMPUTED ─────────────────────────────────────────────────
export const getInvoiceBalance = (invoiceId) => {
  const invoice = getInvoices().find(i => i.id === invoiceId);
  if (!invoice) return 0;
  const paid = getPayments().filter(p => p.invoice_id === invoiceId).reduce((s, p) => s + parseFloat(p.amount), 0);
  return invoice.grand_total - paid;
};

export const getCustomerOutstanding = (customerId) => {
  return getInvoices()
    .filter(i => i.customer_id === customerId && ['unpaid', 'partial', 'overdue'].includes(i.status))
    .reduce((s, inv) => s + getInvoiceBalance(inv.id), 0);
};

export const fmt = (n) => {
  const num = parseFloat(n) || 0;
  if (num >= 100000) return '₹' + (num / 100000).toFixed(1) + 'L';
  if (num >= 1000) return '₹' + (num / 1000).toFixed(0) + 'K';
  return '₹' + num.toLocaleString('en-IN');
};

export const fmtFull = (n) => {
  const num = parseFloat(n) || 0;
  return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const today = () => new Date().toISOString().split('T')[0];
