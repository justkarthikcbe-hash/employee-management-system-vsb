import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { attendanceBadgeClass } from '../utils/badges';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [profileRes, attRes, leaveRes] = await Promise.all([
          api.get('/employees/me'),
          api.get('/attendance/me'),
          api.get('/leaves/me'),
        ]);
        setProfile(profileRes.data);
        setAttendance(attRes.data);
        setLeaves(leaveRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load dashboard');
      }
    })();
  }, []);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayRecord = attendance.find((a) => a.date === todayStr);
  const pendingLeaves = leaves.filter((l) => l.status === 'Pending');

  return (
    <AppLayout>
      <div className="page-header">
        <div className="page-eyebrow">Employee</div>
        <h1 className="page-title">Welcome{profile ? `, ${profile.fullName.split(' ')[0]}` : ''}</h1>
        <p className="page-sub">Here's where your day stands — attendance, leave, and payroll in one place.</p>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="grid-3">
        <div className="stat-card">
          <div className="stat-label">Today's status</div>
          <div className="stat-value">{todayRecord ? todayRecord.status : 'Not marked'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending leave requests</div>
          <div className="stat-value">{pendingLeaves.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Paid leave balance</div>
          <div className="stat-value">{profile?.leaveBalance?.paid ?? '—'}</div>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Recent attendance</h3>
        <p className="card-sub">Your last few check-ins.</p>
        {attendance.length === 0 ? (
          <div className="empty-state"><h3>Nothing marked yet</h3><p>Check in from the Attendance page to get started.</p></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Date</th><th>Check-in</th><th>Check-out</th><th>Status</th></tr></thead>
            <tbody>
              {attendance.slice(0, 5).map((a) => (
                <tr key={a._id}>
                  <td>{a.date}</td>
                  <td>{a.checkIn ? new Date(a.checkIn).toLocaleTimeString() : '—'}</td>
                  <td>{a.checkOut ? new Date(a.checkOut).toLocaleTimeString() : '—'}</td>
                  <td><span className={attendanceBadgeClass(a.status)}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppLayout>
  );
}
