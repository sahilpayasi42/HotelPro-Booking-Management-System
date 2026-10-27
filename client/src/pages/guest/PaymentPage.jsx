import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import Spinner from '../../components/common/Spinner';
import { toast } from 'react-toastify';

const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    API.get(`/bookings/${bookingId}`)
      .then(r => setBooking(r.data.booking))
      .catch(() => toast.error('Booking not found'))
      .finally(() => setLoading(false));
  }, [bookingId]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.head.appendChild(s);
    });
  };

  const handlePayment = async () => {
    setPaying(true);
    try {
      const { data } = await API.post('/payments/order', { bookingId });
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) {
        toast.info('Razorpay SDK not available (test mode). Simulating payment...');
        toast.warning('In production, the Razorpay checkout popup would appear here.');
        setPaying(false);
        return;
      }
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_xxxxxxxxxxxx',
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'Awas360',
        description: `Booking ${bookingId}`,
        order_id: data.order.id,
        handler: async (response) => {
          try {
            await API.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId,
            });
            toast.success('Payment successful! Booking confirmed.');
            navigate('/guest/bookings');
          } catch (err) {
            toast.error(err.response?.data?.message || 'Payment verification failed');
          }
        },
        theme: { color: '#0d6efd' },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment initiation failed');
    }
    setPaying(false);
  };

  if (loading) return <Spinner />;
  if (!booking) return <div className="container py-4"><div className="alert alert-danger">Booking not found.</div></div>;

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body">
              <h3 className="mb-4">Payment</h3>
              <table className="table">
                <tbody>
                  <tr><td>Room</td><td><strong>{booking.room?.roomNumber}</strong></td></tr>
                  <tr><td>Check-in</td><td>{new Date(booking.checkInDate).toLocaleDateString()}</td></tr>
                  <tr><td>Check-out</td><td>{new Date(booking.checkOutDate).toLocaleDateString()}</td></tr>
                  <tr><td>Guests</td><td>{booking.guests}</td></tr>
                  <tr><td>Status</td><td>{booking.status}</td></tr>
                  <tr><td><strong>Total Amount</strong></td><td><strong className="text-primary fs-4">₹{booking.totalAmount}</strong></td></tr>
                </tbody>
              </table>
              {booking.status === 'pending' ? (
                <button className="btn btn-primary btn-lg w-100" onClick={handlePayment} disabled={paying}>
                  {paying ? 'Processing...' : 'Pay with Razorpay'}
                </button>
              ) : (
                <div className="alert alert-success">Booking is already {booking.status}.</div>
              )}
              <p className="text-muted small mt-2 text-center">Test mode — no real charges</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
