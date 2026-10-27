import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Spinner from '../../components/common/Spinner';
import { toast } from 'react-toastify';
import { Chip } from '@mui/material';

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: '', roomNumber: '', floor: 1, pricePerNight: '', status: 'available' });
  const [editId, setEditId] = useState(null);

  const fetchData = async () => {
    try {
      const [r, c] = await Promise.all([API.get('/rooms?limit=100'), API.get('/rooms/categories')]);
      setRooms(r.data.rooms);
      setCategories(c.data.categories);
    } catch { toast.error('Failed'); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await API.put(`/rooms/${editId}`, form);
        toast.success('Room updated');
      } else {
        await API.post('/rooms', form);
        toast.success('Room created');
      }
      setShowForm(false); setEditId(null);
      setForm({ category: '', roomNumber: '', floor: 1, pricePerNight: '', status: 'available' });
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const startEdit = (r) => {
    setForm({ category: r.category?._id || r.category, roomNumber: r.roomNumber, floor: r.floor, pricePerNight: r.pricePerNight, status: r.status });
    setEditId(r._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this room?')) return;
    try { await API.delete(`/rooms/${id}`); toast.success('Deleted'); fetchData(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <Spinner />;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between mb-4">
        <h2>Room Management</h2>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ category: '', roomNumber: '', floor: 1, pricePerNight: '', status: 'available' }); }}>
          {showForm ? 'Cancel' : '+ Add Room'}
        </button>
      </div>
      {showForm && (
        <div className="card mb-4"><div className="card-body">
          <h5>{editId ? 'Edit Room' : 'Add Room'}</h5>
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Category</label>
              <select className="form-select" required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="">Select</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div className="col-md-2"><label className="form-label">Room #</label><input className="form-control" required value={form.roomNumber} onChange={e => setForm({ ...form, roomNumber: e.target.value })} /></div>
            <div className="col-md-2"><label className="form-label">Floor</label><input type="number" className="form-control" required value={form.floor} onChange={e => setForm({ ...form, floor: parseInt(e.target.value) })} /></div>
            <div className="col-md-2"><label className="form-label">Price/Night</label><input type="number" className="form-control" value={form.pricePerNight} onChange={e => setForm({ ...form, pricePerNight: e.target.value })} placeholder="Category default" /></div>
            <div className="col-md-2"><label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="available">Available</option><option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div className="col-md-1 d-flex align-items-end"><button type="submit" className="btn btn-success w-100">Save</button></div>
          </form>
        </div></div>
      )}
      <div className="table-responsive"><table className="table table-hover align-middle">
        <thead className="table-dark"><tr><th>Room #</th><th>Category</th><th>Floor</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>{rooms.map(r => (
          <tr key={r._id}>
            <td><strong>{r.roomNumber}</strong></td>
            <td>{r.category?.name}</td>
            <td>{r.floor}</td>
            <td>₹{r.pricePerNight}</td>
            <td><Chip label={r.status} size="small" color={r.status === 'available' ? 'success' : 'default'} /></td>
            <td>
              <button className="btn btn-sm btn-outline-primary me-1" onClick={() => startEdit(r)}>Edit</button>
              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(r._id)}>Delete</button>
            </td>
          </tr>
        ))}</tbody>
      </table></div>
    </div>
  );
};

export default RoomManagement;
