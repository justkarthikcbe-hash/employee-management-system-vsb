import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import api from '../api/axios';
import { leaveBadgeClass, formatDate } from '../utils/badges';

export default function Leave() {
  const [leaves, setLeaves] = useState([]);
  const [form, setForm] = useState({ leaveType: 'Paid', startDate: '', endDate: '', reason: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    const { data } = await api.get('/leaves/me');
    setLeaves(data);
  };

  useEffect(() => { load(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/leaves', form);
      setForm({ leaveType: 'Paid', startDate: '', endDate: '', reason: '' });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div className="page-eyebrow">Leave</div>
        <h1 className="page-title">Time off</h1>
        <p className="page-sub">Apply for leave and track its status through to a decision.</p>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 className="card-title">New request</h3>
          <p className="card-sub">Submitted requests start as Pending.</p>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="leaveType">Leave type</label>
              <select id="leaveType" name="leaveType" value={form.leaveType} onChange={handleChange}>
                <option value="Paid">Paid</option>
                <option value="Sick">Sick</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>
            <div className="grid-2">
              <div className="field">
                <label htmlFor="startDate">Start date</label>
                <input id="startDate" type="date" name="startDate" required value={form.startDate} onChange={handleChange} />
              </div>
              <div className="field">
                <label htmlFor="endDate">End date</label>
                <input id="endDate" type="date" name="endDate" required value={form.endDate} onChange={handleChange} />
              </div>
            </div>
            <div className="field">
              <label htmlFor="reason">Reason</label>
              <textarea id="reason" name="reason" rows={3} value={form.reason} onChange={handleChange} placeholder="Briefly describe why you're requesting leave" />
            </div>
            {error && <p className="error-text">{error}</p>}
            <button type="submit" className="btn btn-bronze" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit request'}</button>
          </form>
        </div>

        <div className="card">
          <h3 className="card-title">Your requests</h3>
          <p className="card-sub">Most recent first.</p>
          {leaves.length === 0 ? (
            <div className="empty-state"><h3>No requests yet</h3><p>Submit one using the form.</p></div>
          ) : (
            <table className="data-table">
              <thead><tr><th>Type</th><th>Dates</th><th>Status</th></tr></thead>
              <tbody>
                {leaves.map((l) => (
                  <tr key={l._id}>
                    <td>{l.leaveType}</td>
                    <td>{formatDate(l.startDate)} – {formatDate(l.endDate)}</td>
                    <td>
                      <span className={leaveBadgeClass(l.status)}>{l.status}</span>
                      {l.adminComment && <div style={{ fontSize: 12, color: '#6b6a63', marginTop: 4 }}>{l.adminComment}</div>}
                    </td>
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
