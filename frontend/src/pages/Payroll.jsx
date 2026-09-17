import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import api from '../api/axios';

const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function currency(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);
}

export default function Payroll() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    (async () => {
      const { data } = await api.get('/payroll/me');
      setRecords(data);
    })();
  }, []);

  const latest = records[0];

  return (
    <AppLayout>
      <div className="page-header">
        <div className="page-eyebrow">Payroll</div>
        <h1 className="page-title">Your payslips</h1>
        <p className="page-sub">Read-only salary details, month by month. Contact HR for corrections.</p>
      </div>

      {latest && (
        <div className="grid-3">
          <div className="stat-card">
            <div className="stat-label">Latest net salary</div>
            <div className="stat-value">{currency(latest.netSalary)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Basic</div>
            <div className="stat-value">{currency(latest.basic)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Allowances</div>
            <div className="stat-value">{currency(latest.allowances)}</div>
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="card-title">Payslip history</h3>
        {records.length === 0 ? (
          <div className="empty-state"><h3>No payslips yet</h3><p>HR hasn't published a payslip for you yet.</p></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Month</th><th>Basic</th><th>Allowances</th><th>Deductions</th><th>Net salary</th></tr></thead>
            <tbody>
              {records.map((r) => (
                <tr key={r._id}>
                  <td>{MONTHS[r.month]} {r.year}</td>
                  <td>{currency(r.basic)}</td>
                  <td>{currency(r.allowances)}</td>
                  <td>{currency(r.deductions)}</td>
                  <td><strong>{currency(r.netSalary)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppLayout>
  );
}
