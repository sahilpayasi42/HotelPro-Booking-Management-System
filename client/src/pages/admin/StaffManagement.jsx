import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Spinner from '../../components/common/Spinner';
import { toast } from 'react-toastify';

const StaffManagement = () => {
  const [staffList, setStaffList] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [hotelId, setHotelId] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', department: 'reception', shift: 'morning' });

  const fetchData = async () => {
    try {
      const [staffRes, hotelRes] = await Promise.all([
        API.get('/admin/staff'),
        API.get('/admin/hotels'),
      ]);
      setStaffList(staffRes.data.staff);
      const hList = hotelRes.data.hotels || [];
      setHotels(hList);
      if (hList.length > 0) {
        setHotelId(prev => prev || hList[0]._id);
      }
    } catch { toast.error('Failed to load data'); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!hotelId) {
      toast.error('No hotel found. Please ensure a hotel exists before adding staff.');
      return;
    }
    try {
      await API.post('/admin/staff', { ...form, hotel: hotelId });
      toast.success('Staff added');
      setShowForm(false);
      setForm({ name: '', email: '', password: '', phone: '', department: 'reception', shift: 'morning' });
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove staff member?')) return;
    try { await API.delete(`/admin/staff/${id}`); toast.success('Removed'); fetchData(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <Spinner />;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between mb-4">
        <h2>Staff Management</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ Add Staff'}</button>
      </div>
      {showForm && (
        <div className="card mb-4">
          <div className="card-body">
            {hotels.length === 0 ? (
              <div className="alert alert-warning mb-0">
                No hotels found in the system. A hotel must exist before staff can be added.
              </div>
            ) : (
              <form onSubmit={handleAdd} className="row g-3">
                <div className="col-md-3">
                  <label className="form-label">Hotel</label>
                  <select
                    className="form-select"
                    required
                    value={hotelId}
                    onChange={(e) => setHotelId(e.target.value)}
                  >
                    {hotels.map((h) => (
                      <option key={h._id} value={h._id}>
                        {h.name} {h.city ? `(${h.city})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Name</label>
                  <input className="form-control" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Password</label>
                  <input type="password" className="form-control" required minLength={6} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Phone</label>
                  <input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Department</label>
                  <select className="form-select" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                    <option value="reception">Reception</option>
                    <option value="housekeeping">Housekeeping</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Shift</label>
                  <select className="form-select" value={form.shift} onChange={e => setForm({ ...form, shift: e.target.value })}>
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="night">Night</option>
                  </select>
                </div>
                <div className="col-md-3 d-flex align-items-end">
                  <button type="submit" className="btn btn-success w-100">Add Staff</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      <div className="table-responsive"><table className="table table-hover align-middle">
        <thead className="table-dark"><tr><th>Name</th><th>Email</th><th>Department</th><th>Shift</th><th>Active</th><th>Actions</th></tr></thead>
        <tbody>{staffList.map(s => (
          <tr key={s._id}><td>{s.user?.name}</td><td>{s.user?.email}</td><td className="text-capitalize">{s.department}</td><td className="text-capitalize">{s.shift}</td>
            <td>{s.user?.isActive ? '✅' : '❌'}</td>
            <td><button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(s._id)}>Remove</button></td>
          </tr>
        ))}</tbody>
      </table></div>
    </div>
  );
};

export default StaffManagement;
