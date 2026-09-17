import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import api from '../api/axios';
import { attendanceBadgeClass } from '../utils/badges';

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await api.get('/attendance/me');
    setRecords(data);
  };

  useEffect(() => { load(); }, []);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayRecord = records.find((r) => r.date === todayStr);

  const act = async (endpoint) => {
    setBusy(true);
    setError('');
    try {
      await api.post(`/attendance/${endpoint}`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div className="page-eyebrow">Attendance</div>
        <h1 className="page-title">Mark your day</h1>
        <p className="page-sub">Check in when you start, check out when you finish. Status is calculated from hours worked.</p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 className="card-title">Today · {todayStr}</h3>
            <p className="card-sub">
              {todayRecord?.checkIn ? `Checked in at ${new Date(todayRecord.checkIn).toLocaleTimeString()}` : 'Not checked in yet'}
              {todayRecord?.checkOut ? ` · Checked out at ${new Date(todayRecord.checkOut).toLocaleTimeString()}` : ''}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-bronze" disabled={busy || !!todayRecord?.checkIn} onClick={() => act('check-in')}>Check in</button>
            <button className="btn btn-primary" disabled={busy || !todayRecord?.checkIn || !!todayRecord?.checkOut} onClick={() => act('check-out')}>Check out</button>
          </div>
        </div>
        {error && <p className="error-text">{error}</p>}
      </div>

      <div className="card">
        <h3 className="card-title">History</h3>
        <p className="card-sub">Your attendance record, most recent first.</p>
        {records.length === 0 ? (
          <div className="empty-state"><h3>No records yet</h3><p>Check in above to start your history.</p></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Date</th><th>Check-in</th><th>Check-out</th><th>Status</th></tr></thead>
            <tbody>
              {records.map((r) => (
                <tr key={r._id}>
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
