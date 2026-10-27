import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import API from '../../api/axios';
import Spinner from '../../components/common/Spinner';
import { toast } from 'react-toastify';

const BookingForm = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const initialCheckIn = searchParams.get('checkIn') || '';
  const initialCheckOut = searchParams.get('checkOut') || '';
  const initialGuests = parseInt(searchParams.get('guests')) || 1;

  const [form, setForm] = useState({
    checkInDate: initialCheckIn,
    checkOutDate: initialCheckOut,
    guests: initialGuests,
  });

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  useEffect(() => {
    API.get(`/rooms/${roomId}`).then(r => setRoom(r.data.room)).catch(() => toast.error('Room not found')).finally(() => setLoading(false));
  }, [roomId]);

  const nights = form.checkInDate && form.checkOutDate
    ? Math.max(0, Math.round((new Date(form.checkOutDate) - new Date(form.checkInDate)) / 86400000))
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (nights < 1) return toast.error('Check-out must be after check-in');
    setSubmitting(true);
    try {
      const { data } = await API.post('/bookings', { roomId, ...form });
      toast.success('Booking created! Proceed to payment.');
      navigate(`/guest/payment/${data.booking._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    }
    setSubmitting(false);
  };

  if (loading) return <Spinner />;
  if (!room) return <div className="container py-4"><div className="alert alert-danger">Room not found.</div></div>;

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-7">
          <div className="card shadow">
            <div className="card-body">
              <h3 className="mb-4">Book Room {room.roomNumber}</h3>
              <div className="alert alert-info">
                <strong>{room.category?.name}</strong> — ₹{room.pricePerNight}/night • Capacity: {room.category?.capacity} guests
              </div>
              <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Check-in Date</label>
                    <input type="date" className="form-control" required min={todayStr} value={form.checkInDate} onChange={e => setForm({ ...form, checkInDate: e.target.value })} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Check-out Date</label>
                    <input type="date" className="form-control" required min={form.checkInDate || todayStr} value={form.checkOutDate} onChange={e => setForm({ ...form, checkOutDate: e.target.value })} />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Number of Guests</label>
                  <input type="number" className="form-control" min="1" max={room.category?.capacity || 10} required value={form.guests} onChange={e => setForm({ ...form, guests: parseInt(e.target.value) || 1 })} />
                </div>
                {nights > 0 && (
                  <div className="alert alert-success">
                    <strong>{nights} night(s)</strong> × ₹{room.pricePerNight} = <strong>₹{nights * room.pricePerNight}</strong>
                    <br /><small className="text-muted">Final price calculated by server</small>
                  </div>
                )}
                <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
                  {submitting ? 'Creating Booking...' : 'Confirm & Proceed to Payment'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
