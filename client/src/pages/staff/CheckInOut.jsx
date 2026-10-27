import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Spinner from '../../components/common/Spinner';
import { toast } from 'react-toastify';
import { Chip } from '@mui/material';

const CheckInOut = () => {
  const [confirmed, setConfirmed] = useState([]);
  const [checkedIn, setCheckedIn] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('checkin');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [c, ci] = await Promise.all([
        API.get('/bookings?status=confirmed&limit=50'),
        API.get('/bookings?status=checked-in&limit=50'),
      ]);
      setConfirmed(c.data.bookings);
      setCheckedIn(ci.data.bookings);
    } catch { toast.error('Failed to load bookings'); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCheckIn = async (id) => {
    try { await API.patch(`/bookings/${id}/check-in`); toast.success('Guest checked in!'); fetchData(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleCheckOut = async (id) => {
    try { await API.patch(`/bookings/${id}/check-out`); toast.success('Guest checked out!'); fetchData(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <Spinner />;

  return (
    <div className="container py-4">
      <h2 className="mb-4">Check-In / Check-Out</h2>
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item"><button className={`nav-link ${tab === 'checkin' ? 'active' : ''}`} onClick={() => setTab('checkin')}>Pending Check-ins ({confirmed.length})</button></li>
        <li className="nav-item"><button className={`nav-link ${tab === 'checkout' ? 'active' : ''}`} onClick={() => setTab('checkout')}>Active Stays ({checkedIn.length})</button></li>
      </ul>
      {tab === 'checkin' && (confirmed.length === 0 ? <div className="alert alert-info">No pending check-ins.</div> : (
        <div className="table-responsive"><table className="table table-hover align-middle">
          <thead className="table-dark"><tr><th>Guest</th><th>Room</th><th>Check-in</th><th>Check-out</th><th>Action</th></tr></thead>
          <tbody>{confirmed.map(b => (
            <tr key={b._id}>
              <td>{b.guest?.name}</td><td>{b.room?.roomNumber}</td>
              <td>{new Date(b.checkInDate).toLocaleDateString()}</td><td>{new Date(b.checkOutDate).toLocaleDateString()}</td>
              <td><button className="btn btn-sm btn-success" onClick={() => handleCheckIn(b._id)}>Check In</button></td>
            </tr>
          ))}</tbody>
        </table></div>
      ))}
      {tab === 'checkout' && (checkedIn.length === 0 ? <div className="alert alert-info">No active stays.</div> : (
        <div className="table-responsive"><table className="table table-hover align-middle">
          <thead className="table-dark"><tr><th>Guest</th><th>Room</th><th>Checked In</th><th>Check-out Due</th><th>Action</th></tr></thead>
          <tbody>{checkedIn.map(b => (
            <tr key={b._id}>
              <td>{b.guest?.name}</td><td>{b.room?.roomNumber}</td>
              <td>{b.checkedInAt ? new Date(b.checkedInAt).toLocaleString() : '-'}</td><td>{new Date(b.checkOutDate).toLocaleDateString()}</td>
              <td><button className="btn btn-sm btn-warning" onClick={() => handleCheckOut(b._id)}>Check Out</button></td>
            </tr>
          ))}</tbody>
        </table></div>
      ))}
    </div>
  );
};

export default CheckInOut;
