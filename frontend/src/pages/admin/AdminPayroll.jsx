import { useEffect, useState } from 'react';
import AppLayout from '../../components/AppLayout';
import api from '../../api/axios';

const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const now = new Date();

function currency(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);
}

export default function AdminPayroll() {
  const [employees, setEmployees] = useState([]);
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({
    employeeId: '', month: now.getMonth() + 1, year: now.getFullYear(),
    basic: '', allowances: '', deductions: '',
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const loadAll = async () => {
    const [empRes, payRes] = await Promise.all([api.get('/employees'), api.get('/payroll')]);
    setEmployees(empRes.data);
    setRecords(payRes.data);
  };

  useEffect(() => { loadAll(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    try {
      await api.post('/payroll', {
        employeeId: form.employeeId,
        month: Number(form.month),
        year: Number(form.year),
        basic: Number(form.basic),
        allowances: Number(form.allowances) || 0,
        deductions: Number(form.deductions) || 0,
      });
      setMessage('Payroll saved.');
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save payroll');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div className="page-eyebrow">Admin</div>
        <h1 className="page-title">Payroll</h1>
        <p className="page-sub">Set or update an employee's salary for a given month.</p>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 className="card-title">Update payroll</h3>
          <p className="card-sub">Creates the record if it doesn't exist yet, or updates it if it does.</p>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Employee</label>
              <select name="employeeId" required value={form.employeeId} onChange={handleChange}>
                <option value="">Select employee…</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>{emp.fullName} — {emp.department}</option>
                ))}
              </select>
            </div>
            <div className="grid-2">
              <div className="field">
                <label>Month</label>
                <select name="month" value={form.month} onChange={handleChange}>
                  {MONTHS.slice(1).map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Year</label>
                <input type="number" name="year" value={form.year} onChange={handleChange} />
              </div>
            </div>
            <div className="field">
              <label>Basic</label>
              <input type="number" min="0" name="basic" required value={form.basic} onChange={handleChange} placeholder="e.g. 45000" />
            </div>
            <div className="grid-2">
              <div className="field">
                <label>Allowances</label>
                <input type="number" min="0" name="allowances" value={form.allowances} onChange={handleChange} placeholder="e.g. 8000" />
              </div>
              <div className="field">
                <label>Deductions</label>
                <input type="number" min="0" name="deductions" value={form.deductions} onChange={handleChange} placeholder="e.g. 3200" />
              </div>
            </div>
            {error && <p className="error-text">{error}</p>}
            {message && <p style={{ fontSize: 13, color: '#5f8f5b' }}>{message}</p>}
            <button type="submit" className="btn btn-bronze" disabled={saving}>{saving ? 'Saving…' : 'Save payroll'}</button>
          </form>
        </div>

        <div className="card">
          <h3 className="card-title">All payroll records</h3>
          <p className="card-sub">{records.length} entries</p>
          {records.length === 0 ? (
            <div className="empty-state"><h3>No payroll yet</h3><p>Use the form to publish the first payslip.</p></div>
          ) : (
            <table className="data-table">
              <thead><tr><th>Employee</th><th>Month</th><th>Net salary</th></tr></thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id}>
                    <td>{r.employee?.fullName}</td>
                    <td>{MONTHS[r.month]} {r.year}</td>
                    <td><strong>{currency(r.netSalary)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
