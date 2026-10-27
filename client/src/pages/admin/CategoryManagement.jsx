import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Spinner from '../../components/common/Spinner';
import { toast } from 'react-toastify';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', basePrice: '', capacity: 1, amenities: '', hotel: '' });
  const [editId, setEditId] = useState(null);
  const [hotelId, setHotelId] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [catRes, hotelRes] = await Promise.all([
          API.get('/rooms/categories'),
          API.get('/admin/hotels'),
        ]);
        setCategories(catRes.data.categories);
        const hList = hotelRes.data.hotels || [];
        setHotels(hList);
        if (hList.length > 0) {
          setHotelId(prev => prev || hList[0]._id);
        }
      } catch { /* ok */ }
      setLoading(false);
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const selectedHotel = form.hotel || hotelId;
    if (!selectedHotel) {
      toast.error('No hotel found. Please ensure a hotel exists before adding categories.');
      return;
    }
    const payload = {
      ...form,
      amenities: form.amenities.split(',').map(a => a.trim()).filter(Boolean),
      hotel: selectedHotel,
    };
    try {
      if (editId) { await API.put(`/rooms/categories/${editId}`, payload); toast.success('Updated'); }
      else { await API.post('/rooms/categories', payload); toast.success('Created'); }
      setShowForm(false); setEditId(null); setForm({ name: '', basePrice: '', capacity: 1, amenities: '', hotel: '' });
      const { data } = await API.get('/rooms/categories'); setCategories(data.categories);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const startEdit = (c) => {
    const hId = c.hotel?._id || c.hotel || hotelId;
    setForm({
      name: c.name,
      basePrice: c.basePrice,
      capacity: c.capacity,
      amenities: (c.amenities || []).join(', '),
      hotel: hId,
    });
    setHotelId(hId);
    setEditId(c._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete category?')) return;
    try { await API.delete(`/rooms/categories/${id}`); toast.success('Deleted');
      const { data } = await API.get('/rooms/categories'); setCategories(data.categories);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <Spinner />;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between mb-4">
        <h2>Category Management</h2>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: '', basePrice: '', capacity: 1, amenities: '', hotel: '' }); }}>{showForm ? 'Cancel' : '+ Add Category'}</button>
      </div>
      {showForm && (
        <div className="card mb-4">
          <div className="card-body">
            {hotels.length === 0 ? (
              <div className="alert alert-warning mb-0">
                No hotels found in the system. A hotel must exist before categories can be added.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="row g-3">
                <div className="col-md-3">
                  <label className="form-label">Hotel</label>
                  <select
                    className="form-select"
                    required
                    value={form.hotel || hotelId}
                    onChange={(e) => {
                      setHotelId(e.target.value);
                      setForm({ ...form, hotel: e.target.value });
                    }}
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
                <div className="col-md-2">
                  <label className="form-label">Base Price</label>
                  <input type="number" className="form-control" required value={form.basePrice} onChange={e => setForm({ ...form, basePrice: e.target.value })} />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Capacity</label>
                  <input type="number" min="1" className="form-control" required value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} />
                </div>
                <div className="col-md-8">
                  <label className="form-label">Amenities (comma-separated)</label>
                  <input className="form-control" value={form.amenities} onChange={e => setForm({ ...form, amenities: e.target.value })} placeholder="WiFi, AC, TV, etc." />
                </div>
                <div className="col-md-4 d-flex align-items-end">
                  <button type="submit" className="btn btn-success w-100">Save Category</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      <div className="table-responsive"><table className="table table-hover">
        <thead className="table-dark"><tr><th>Name</th><th>Base Price</th><th>Capacity</th><th>Amenities</th><th>Actions</th></tr></thead>
        <tbody>{categories.map(c => (
          <tr key={c._id}><td><strong>{c.name}</strong></td><td>₹{c.basePrice}</td><td>{c.capacity}</td>
            <td>{(c.amenities || []).slice(0, 4).join(', ')}{c.amenities?.length > 4 ? '...' : ''}</td>
            <td><button className="btn btn-sm btn-outline-primary me-1" onClick={() => startEdit(c)}>Edit</button><button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(c._id)}>Delete</button></td>
          </tr>
        ))}</tbody>
      </table></div>
    </div>
  );
};

export default CategoryManagement;
