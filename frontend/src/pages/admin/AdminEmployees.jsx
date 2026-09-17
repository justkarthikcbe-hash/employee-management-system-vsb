import { useEffect, useState } from 'react';
import AppLayout from '../../components/AppLayout';
import api from '../../api/axios';

const EMPTY_EDIT = { fullName: '', designation: '', department: '', phone: '', address: '' };

export default function AdminEmployees() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [edit, setEdit] = useState(EMPTY_EDIT);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const load = async (q) => {
    const { data } = await api.get('/employees', { params: q ? { search: q } : {} });
    setEmployees(data);
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load(search);
  };

  const openEmployee = (emp) => {
    setSelected(emp);
    setEdit({
      fullName: emp.fullName || '',
      designation: emp.designation || '',
      department: emp.department || '',
      phone: emp.phone || '',
      address: emp.address || '',
    });
    setMessage('');
  };

  const handleEditChange = (e) => setEdit({ ...edit, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    setMessage('');
    try {
      const { data } = await api.put(`/employees/${selected._id}`, edit);
      setEmployees((prev) => prev.map((emp) => (emp._id === data._id ? { ...emp, ...data } : emp)));
      setSelected(data);
      setMessage('Saved.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (emp) => {
    const isActive = !emp.user?.isActive;
    const { data } = await api.put(`/employees/${emp._id}/status`, { isActive });
    setEmployees((prev) => prev.map((e) => (e._id === emp._id ? { ...e, user: { ...e.user, isActive: data.user.isActive } } : e)));
    if (selected?._id === emp._id) setSelected((s) => ({ ...s, user: { ...s.user, isActive: data.user.isActive } }));
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div className="page-eyebrow">Admin</div>
        <h1 className="page-title">Employees</h1>
        <p className="page-sub">Search, review, and manage every employee's record.</p>
      </div>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name…"
          style={{ flex: 1, padding: '11px 14px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.14)' }}
        />
        <button type="submit" className="btn btn-ghost btn-sm">Search</button>
      </form>

      <div className="grid-2">
        <div className="card">
          <h3 className="card-title">All employees</h3>
          <p className="card-sub">{employees.length} total</p>
          <table className="data-table">
            <thead><tr><th>Name</th><th>Department</th><th>Status</th><th /></tr></thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp._id}>
                  <td>{emp.fullName}</td>
                  <td>{emp.department}</td>
                  <td>
                    <span className={`badge ${emp.user?.isActive ? 'badge-approved' : 'badge-rejected'}`}>
                      {emp.user?.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td><button className="btn btn-ghost btn-sm" onClick={() => openEmployee(emp)}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          {!selected ? (
            <div className="empty-state"><h3>Select an employee</h3><p>Choose someone from the list to view or edit their record.</p></div>
          ) : (
            <>
              <h3 className="card-title">{selected.fullName}</h3>
              <p className="card-sub">{selected.user?.employeeCode} · {selected.user?.email}</p>
              <form onSubmit={handleSave}>
                <div className="field"><label>Full name</label><input name="fullName" value={edit.fullName} onChange={handleEditChange} /></div>
                <div className="grid-2">
                  <div className="field"><label>Designation</label><input name="designation" value={edit.designation} onChange={handleEditChange} /></div>
                  <div className="field"><label>Department</label><input name="department" value={edit.department} onChange={handleEditChange} /></div>
                </div>
                <div className="field"><label>Phone</label><input name="phone" value={edit.phone} onChange={handleEditChange} /></div>
                <div className="field"><label>Address</label><textarea rows={2} name="address" value={edit.address} onChange={handleEditChange} /></div>
                {message && <p style={{ fontSize: 13, color: '#3a5a8c' }}>{message}</p>}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="submit" className="btn btn-bronze" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
                  <button type="button" className="btn btn-ghost" onClick={() => toggleActive(selected)}>
                    {selected.user?.isActive ? 'Disable account' : 'Enable account'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
