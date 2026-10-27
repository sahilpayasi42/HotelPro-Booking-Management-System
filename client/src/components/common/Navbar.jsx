import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-awas">
      <div className="container">
        <Link className="navbar-brand brand-title" to="/">
          <img src="/favicon.svg" alt="Awas360 Logo" width="28" height="28" className="rounded-1" />
          <span>Awas360</span>
          <span className="brand-badge">Luxury Stays</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/rooms">Rooms</Link>
            </li>

            {/* ── Guest links ─────────────────────── */}
            {user?.role === 'guest' && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/guest/dashboard">Dashboard</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/guest/bookings">My Bookings</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/guest/notifications">Notifications</Link>
                </li>
              </>
            )}

            {/* ── Staff links ─────────────────────── */}
            {user?.role === 'staff' && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/staff/dashboard">Dashboard</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/staff/checkinout">Check-In/Out</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/staff/rooms">Room Status</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/staff/services">Service Requests</Link>
                </li>
              </>
            )}

            {/* ── Admin links ─────────────────────── */}
            {user?.role === 'admin' && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/dashboard">Dashboard</Link>
                </li>
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                  >
                    Manage
                  </a>
                  <ul className="dropdown-menu dropdown-menu-dark">
                    <li><Link className="dropdown-item" to="/admin/rooms">Rooms</Link></li>
                    <li><Link className="dropdown-item" to="/admin/categories">Categories</Link></li>
                    <li><Link className="dropdown-item" to="/admin/bookings">Bookings</Link></li>
                    <li><Link className="dropdown-item" to="/admin/payments">Payments</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><Link className="dropdown-item" to="/admin/users">Users</Link></li>
                    <li><Link className="dropdown-item" to="/admin/staff">Staff</Link></li>
                    <li><Link className="dropdown-item" to="/admin/reports">Reports</Link></li>
                  </ul>
                </li>
              </>
            )}
          </ul>

          <ul className="navbar-nav">
            {user ? (
              <>
                {user.role === 'guest' && (
                  <li className="nav-item d-flex align-items-center">
                    <Link className="nav-link" to="/guest/profile">
                      👤 <strong>{user.name}</strong>
                    </Link>
                  </li>
                )}
                {user.role !== 'guest' && (
                  <li className="nav-item d-flex align-items-center me-2">
                    <span className="nav-link py-0 text-light">
                      <strong>{user.name}</strong>
                      <span
                        className="badge ms-2"
                        style={{
                          backgroundColor: 'rgba(212, 175, 55, 0.2)',
                          color: '#f6d365',
                          border: '1px solid rgba(212, 175, 55, 0.4)',
                          fontSize: '0.72rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {user.role === 'admin' ? 'Administrator' : 'Staff Member'}
                      </span>
                    </span>
                  </li>
                )}
                <li className="nav-item d-flex align-items-center">
                  <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">Register</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
