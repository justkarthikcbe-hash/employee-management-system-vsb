import { useEffect, useState } from 'react';
import AppLayout from '../../components/AppLayout';
import api from '../../api/axios';
import { leaveBadgeClass, formatDate } from '../../utils/badges';

export default function AdminDashboard() {
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [attendanceToday, setAttendanceToday] = useState([]);

  useEffect(() => {
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const [empRes, leaveRes, attRes] = await Promise.all([
        api.get('/employees'),
        api.get('/leaves', { params: { status: 'Pending' } }),
        api.get('/attendance', { params: { from: today, to: today } }),
      ]);
      setEmployees(empRes.data);
      setLeaves(leaveRes.data);
      setAttendanceToday(attRes.data);
    })();
  }, []);

  return (
    <AppLayout>
      <div className="page-header">
        <div className="page-eyebrow">Admin</div>
        <h1 className="page-title">Organization overview</h1>
        <p className="page-sub">A snapshot of your team, today.</p>
      </div>

      <div className="grid-3">
        <div className="stat-card">
          <div className="stat-label">Total employees</div>
          <div className="stat-value">{employees.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending leave requests</div>
          <div className="stat-value">{leaves.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Checked in today</div>
          <div className="stat-value">{attendanceToday.length}</div>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Pending leave requests</h3>
        <p className="card-sub">Needs a decision.</p>
        {leaves.length === 0 ? (
          <div className="empty-state"><h3>All caught up</h3><p>No pending leave requests right now.</p></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Employee</th><th>Type</th><th>Dates</th><th>Status</th></tr></thead>
            <tbody>
              {leaves.slice(0, 6).map((l) => (
                <tr key={l._id}>
                  <td>{l.employee?.fullName}</td>
                  <td>{l.leaveType}</td>
                  <td>{formatDate(l.startDate)} – {formatDate(l.endDate)}</td>
                  <td><span className={leaveBadgeClass(l.status)}>{l.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppLayout>
  );
}
