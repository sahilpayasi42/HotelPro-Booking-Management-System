import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Spinner from '../../components/common/Spinner';
import { toast } from 'react-toastify';
import { Chip } from '@mui/material';

const statusColors = { pending: 'warning', confirmed: 'info', 'checked-in': 'primary', 'checked-out': 'success', 'cancel-requested': 'warning', cancelled: 'error', refunded: 'default' };

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchBookings = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (statusFilter) params.append('status', statusFilter);
      const { data } = await API.get(`/bookings?${params}`);
      setBookings(data.bookings); setPagination(data.pagination);
    } catch { toast.error('Failed'); }
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, [statusFilter]);

  const handleAction = async (id, action) => {
    try { await API.patch(`/bookings/${id}/approve`, { action }); toast.success(`Booking ${action}ed`); fetchBookings(pagination.page); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Booking Management</h2>
      <div className="mb-3">
        {['', 'pending', 'confirmed', 'checked-in', 'checked-out', 'cancel-requested', 'cancelled', 'refunded'].map(s => (
          <button key={s} className={`btn btn-sm me-1 mb-1 ${statusFilter === s ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setStatusFilter(s)}>{s || 'All'}</button>
        ))}
      </div>
      {loading ? <Spinner /> : (
        <div className="table-responsive"><table className="table table-hover align-middle table-sm">
          <thead className="table-dark"><tr><th>Guest</th><th>Room</th><th>Check-in</th><th>Check-out</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{bookings.map(b => (
            <tr key={b._id}>
              <td>{b.guest?.name}<br /><small className="text-muted">{b.guest?.email}</small></td>
              <td>{b.room?.roomNumber}</td>
              <td>{new Date(b.checkInDate).toLocaleDateString()}</td><td>{new Date(b.checkOutDate).toLocaleDateString()}</td>
              <td>₹{b.totalAmount}</td>
              <td><Chip label={b.status} size="small" color={statusColors[b.status] || 'default'} /></td>
              <td>
                {b.status === 'pending' && <button className="btn btn-sm btn-success me-1" onClick={() => handleAction(b._id, 'confirm')}>Confirm</button>}
                {['pending', 'confirmed', 'cancel-requested'].includes(b.status) && <button className="btn btn-sm btn-outline-danger me-1" onClick={() => handleAction(b._id, 'cancel')}>Cancel</button>}
                {b.status === 'cancelled' && <button className="btn btn-sm btn-outline-info" onClick={() => handleAction(b._id, 'refund')}>Refund</button>}
              </td>
            </tr>
          ))}</tbody>
        </table></div>
      )}
      {pagination.pages > 1 && (
        <nav><ul className="pagination justify-content-center">{Array.from({ length: pagination.pages }, (_, i) => (
          <li key={i} className={`page-item ${pagination.page === i + 1 ? 'active' : ''}`}><button className="page-link" onClick={() => fetchBookings(i + 1)}>{i + 1}</button></li>
        ))}</ul></nav>
      )}
    </div>
  );
};

export default BookingManagement;
