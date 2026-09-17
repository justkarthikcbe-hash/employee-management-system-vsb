import { useEffect, useState } from 'react';
import AppLayout from '../../components/AppLayout';
import api from '../../api/axios';
import { leaveBadgeClass, formatDate } from '../../utils/badges';

export default function AdminLeave() {
  const [leaves, setLeaves] = useState([]);
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [comments, setComments] = useState({});
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  const load = async (status) => {
    const params = status ? { status } : {};
    const { data } = await api.get('/leaves', { params });
    setLeaves(data);
  };

  useEffect(() => { load(statusFilter); }, [statusFilter]);

  const handleComment = (id, value) => setComments({ ...comments, [id]: value });

  const decide = async (id, decision) => {
    setBusyId(id);
    setError('');
    try {
      await api.put(`/leaves/${id}/decision`, { decision, adminComment: comments[id] || '' });
      await load(statusFilter);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not record decision');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div className="page-eyebrow">Admin</div>
        <h1 className="page-title">Leave requests</h1>
        <p className="page-sub">Review and decide on time-off requests across the team.</p>
      </div>

      <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#6b6a63', textTransform: 'uppercase', letterSpacing: 0.4 }}>Status</label>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.14)' }}>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="">All</option>
        </select>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="card">
        <h3 className="card-title">Requests</h3>
        <p className="card-sub">{leaves.length} shown</p>
        {leaves.length === 0 ? (
          <div className="empty-state"><h3>Nothing here</h3><p>No requests match this filter.</p></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Employee</th><th>Type</th><th>Dates</th><th>Reason</th><th>Status</th><th>Decision</th></tr></thead>
            <tbody>
              {leaves.map((l) => (
                <tr key={l._id}>
                  <td>{l.employee?.fullName}<div style={{ fontSize: 12, color: '#6b6a63' }}>{l.employee?.department}</div></td>
                  <td>{l.leaveType}</td>
                  <td>{formatDate(l.startDate)} – {formatDate(l.endDate)}</td>
                  <td style={{ maxWidth: 220 }}>{l.reason || '—'}</td>
                  <td>
                    <span className={leaveBadgeClass(l.status)}>{l.status}</span>
                    {l.adminComment && <div style={{ fontSize: 12, color: '#6b6a63', marginTop: 4 }}>{l.adminComment}</div>}
                  </td>
                  <td>
                    {l.status === 'Pending' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 180 }}>
                        <input
                          placeholder="Optional comment"
                          value={comments[l._id] || ''}
                          onChange={(e) => handleComment(l._id, e.target.value)}
                          style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.14)', fontSize: 12 }}
                        />
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-bronze btn-sm" disabled={busyId === l._id} onClick={() => decide(l._id, 'Approved')}>Approve</button>
                          <button className="btn btn-ghost btn-sm" disabled={busyId === l._id} onClick={() => decide(l._id, 'Rejected')}>Reject</button>
                        </div>
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: '#6b6a63' }}>{formatDate(l.decidedAt)}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppLayout>
  );
}
