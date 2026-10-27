import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';

const StaffDashboard = () => {
  const [stats, setStats] = useState({ pendingCheckins: 0, activeStays: 0, pendingSR: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const [bConf, bIn, sr] = await Promise.all([
          API.get('/bookings?status=confirmed&limit=100'),
          API.get('/bookings?status=checked-in&limit=100'),
          API.get('/service-requests?status=pending'),
        ]);
        setStats({
          pendingCheckins: bConf.data.pagination?.total || bConf.data.bookings.length,
          activeStays: bIn.data.pagination?.total || bIn.data.bookings.length,
          pendingSR: sr.data.serviceRequests?.length || 0,
        });
      } catch { /* ok */ }
    };
    load();
  }, []);

  return (
    <div className="container py-4">
      <h2 className="mb-4">Staff Dashboard</h2>
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card bg-info text-white shadow"><div className="card-body text-center"><h1>{stats.pendingCheckins}</h1><p>Pending Check-ins</p></div></div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card bg-primary text-white shadow"><div className="card-body text-center"><h1>{stats.activeStays}</h1><p>Active Stays</p></div></div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card bg-warning text-dark shadow"><div className="card-body text-center"><h1>{stats.pendingSR}</h1><p>Pending Requests</p></div></div>
        </div>
      </div>
      <div className="row">
        <div className="col-md-4 mb-3"><Link to="/staff/checkinout" className="btn btn-outline-info w-100 py-3">🔑 Check-In / Check-Out</Link></div>
        <div className="col-md-4 mb-3"><Link to="/staff/rooms" className="btn btn-outline-primary w-100 py-3">🚪 Room Status</Link></div>
        <div className="col-md-4 mb-3"><Link to="/staff/services" className="btn btn-outline-warning w-100 py-3">🛎️ Service Requests</Link></div>
      </div>
    </div>
  );
};

export default StaffDashboard;
