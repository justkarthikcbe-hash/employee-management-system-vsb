import { useEffect, useState } from 'react';
import AppLayout from '../../components/AppLayout';
import api from '../../api/axios';
import { attendanceBadgeClass } from '../../utils/badges';

export default function AdminAttendance() {
  const [records, setRecords] = useState([]);
  const [filters, setFilters] = useState({ from: '', to: '' });

  const load = async (f) => {
    const { data } = await api.get('/attendance', { params: f });
    setRecords(data);
  };

  useEffect(() => { load({}); }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    const params = {};
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;
    load(params);
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div className="page-eyebrow">Admin</div>
        <h1 className="page-title">Attendance records</h1>
        <p className="page-sub">Every check-in and check-out across the organization.</p>
      </div>

      <form onSubmit={handleFilter} className="card" style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>From</label>
          <input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>To</label>
          <input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
        </div>
        <button type="submit" className="btn btn-ghost btn-sm">Filter</button>
      </form>

      <div className="card">
        <h3 className="card-title">Records</h3>
        <p className="card-sub">{records.length} entries</p>
        {records.length === 0 ? (
          <div className="empty-state"><h3>No records</h3><p>Try widening the date range.</p></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Employee</th><th>Department</th><th>Date</th><th>Check-in</th><th>Check-out</th><th>Status</th></tr></thead>
            <tbody>
              {records.map((r) => (
                <tr key={r._id}>
                  <td>{r.employee?.fullName}</td>
                  <td>{r.employee?.department}</td>
                  <td>{r.date}</td>
                  <td>{r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : '—'}</td>
                  <td>{r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : '—'}</td>
                  <td><span className={attendanceBadgeClass(r.status)}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppLayout>
  );
}
