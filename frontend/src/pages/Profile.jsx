import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import api from '../api/axios';
import { formatDate } from '../utils/badges';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ address: '', phone: '', profilePicUrl: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const { data } = await api.get('/employees/me');
    setProfile(data);
    setForm({ address: data.address || '', phone: data.phone || '', profilePicUrl: data.profilePicUrl || '' });
  };

  useEffect(() => { load(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const { data } = await api.put('/employees/me', form);
      setProfile(data);
      setMessage('Profile updated.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save changes');
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return <AppLayout><p>Loading…</p></AppLayout>;

  return (
    <AppLayout>
      <div className="page-header">
        <div className="page-eyebrow">Your profile</div>
        <h1 className="page-title">{profile.fullName}</h1>
        <p className="page-sub">{profile.designation} · {profile.department}</p>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 className="card-title">Job details</h3>
          <p className="card-sub">Managed by HR — read-only.</p>
          <table className="data-table">
            <tbody>
              <tr><td>Employee ID</td><td>{profile.user?.employeeCode}</td></tr>
              <tr><td>Email</td><td>{profile.user?.email}</td></tr>
              <tr><td>Designation</td><td>{profile.designation}</td></tr>
              <tr><td>Department</td><td>{profile.department}</td></tr>
              <tr><td>Joining date</td><td>{formatDate(profile.joiningDate)}</td></tr>
              <tr><td>Date of birth</td><td>{formatDate(profile.dob)}</td></tr>
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3 className="card-title">Contact details</h3>
          <p className="card-sub">You can update these yourself.</p>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="phone">Phone</label>
              <input id="phone" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 90000 00000" />
            </div>
            <div className="field">
              <label htmlFor="address">Address</label>
              <textarea id="address" name="address" rows={3} value={form.address} onChange={handleChange} placeholder="Street, city, state" />
            </div>
            <div className="field">
              <label htmlFor="profilePicUrl">Profile picture URL</label>
              <input id="profilePicUrl" name="profilePicUrl" value={form.profilePicUrl} onChange={handleChange} placeholder="https://…" />
            </div>
            {error && <p className="error-text">{error}</p>}
            {message && <p style={{ color: '#5f8f5b', fontSize: 13 }}>{message}</p>}
            <button type="submit" className="btn btn-bronze" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
