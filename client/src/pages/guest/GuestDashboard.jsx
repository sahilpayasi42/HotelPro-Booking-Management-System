import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { useSelector } from 'react-redux';

const GuestDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({ bookings: 0, upcoming: 0, unread: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const [bookRes, notifRes] = await Promise.all([
          API.get('/bookings/my'),
          API.get('/notifications'),
        ]);
        const upcoming = bookRes.data.bookings.filter(b => ['confirmed', 'pending'].includes(b.status)).length;
        setStats({ bookings: bookRes.data.bookings.length, upcoming, unread: notifRes.data.unreadCount });
      } catch { /* ok */ }
    };
    load();
  }, []);

  return (
    <div className="container py-4">
      <h2 className="mb-4">Welcome, {user?.name}!</h2>
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card bg-primary text-white shadow">
            <div className="card-body text-center">
              <h1>{stats.bookings}</h1>
              <p className="mb-0">Total Bookings</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card bg-success text-white shadow">
            <div className="card-body text-center">
              <h1>{stats.upcoming}</h1>
              <p className="mb-0">Upcoming Stays</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card bg-warning text-dark shadow">
            <div className="card-body text-center">
              <h1>{stats.unread}</h1>
              <p className="mb-0">Unread Notifications</p>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-md-4 mb-3"><Link to="/rooms" className="btn btn-outline-primary w-100 py-3">🏨 Browse Rooms</Link></div>
        <div className="col-md-4 mb-3"><Link to="/guest/bookings" className="btn btn-outline-success w-100 py-3">📋 My Bookings</Link></div>
        <div className="col-md-4 mb-3"><Link to="/guest/notifications" className="btn btn-outline-warning w-100 py-3">🔔 Notifications</Link></div>
      </div>
    </div>
  );
};

export default GuestDashboard;
