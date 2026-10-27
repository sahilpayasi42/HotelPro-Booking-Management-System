import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import Spinner from '../../components/common/Spinner';
import { Chip } from '@mui/material';
import { toast } from 'react-toastify';

const statusColors = {
  pending: 'warning', confirmed: 'info', 'checked-in': 'primary', 'checked-out': 'success',
  'cancel-requested': 'warning', cancelled: 'error', refunded: 'default',
};

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const { data } = await API.get('/bookings/my');
      setBookings(data.bookings);
    } catch { toast.error('Failed to load bookings'); }
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await API.patch(`/bookings/${id}/cancel`, { reason: 'Guest requested cancellation' });
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (err) { toast.error(err.response?.data?.message || 'Cancel failed'); }
  };

  if (loading) return <Spinner />;

  return (
    <div className="container py-4">
      <h2 className="mb-4">My Bookings</h2>
      {bookings.length === 0 ? (
        <div className="alert alert-info">No bookings yet. <Link to="/rooms">Browse rooms</Link></div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-dark">
              <tr><th>Room</th><th>Check-in</th><th>Check-out</th><th>Guests</th><th>Amount</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b._id}>
                  <td>{b.room?.roomNumber} <span className="text-muted small">({b.room?.category?.name})</span></td>
                  <td>{new Date(b.checkInDate).toLocaleDateString()}</td>
                  <td>{new Date(b.checkOutDate).toLocaleDateString()}</td>
                  <td>{b.guests}</td>
                  <td>₹{b.totalAmount}</td>
                  <td><Chip label={b.status} color={statusColors[b.status] || 'default'} size="small" /></td>
                  <td>
                    {b.status === 'pending' && (
                      <>
                        <Link to={`/guest/payment/${b._id}`} className="btn btn-sm btn-success me-1">Pay</Link>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleCancel(b._id)}>Cancel</button>
                      </>
                    )}
                    {b.status === 'confirmed' && (
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleCancel(b._id)}>Cancel</button>
                    )}
                    {b.status === 'checked-out' && (
                      <Link to={`/guest/review/${b._id}`} className="btn btn-sm btn-outline-primary">Review</Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BookingHistory;
