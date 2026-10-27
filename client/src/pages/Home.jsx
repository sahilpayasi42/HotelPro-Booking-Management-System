import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import API from '../api/axios';
import { getRoomImage, getStatusBadgeClass, handleImageError } from '../utils/roomAssets';
import StaySearchBox from '../components/common/StaySearchBox';

const Home = () => {
  const { user } = useSelector((state) => state.auth);
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const { data } = await API.get('/rooms?limit=3');
        setFeaturedRooms(data.rooms || []);
      } catch {
        setFeaturedRooms([]);
      }
      setLoadingRooms(false);
    };
    loadRooms();
  }, []);

  return (
    <div className="pb-5">
      {/* ─── Hero Section ───────────────────────────────────── */}
      <div className="container pt-4 pb-5">
        <div className="hero-wrapper p-4 p-md-5">
          <img
            src="/images/hero.jpg"
            alt="Awas360 Luxury Hotel"
            className="hero-img"
          />
          <div className="hero-gradient-overlay"></div>
          <div className="hero-content">
            <span
              className="badge px-3 py-2 rounded-pill mb-3"
              style={{
                background: 'rgba(212, 175, 55, 0.2)',
                color: '#f6d365',
                border: '1px solid rgba(212, 175, 55, 0.35)',
                letterSpacing: '0.06em',
                fontSize: '0.75rem',
              }}
            >
              PREMIER HOSPITALITY &amp; RESIDENCES
            </span>
            <h1 className="display-4 fw-bold text-white mb-3" style={{ lineHeight: 1.15 }}>
              Where Refined Luxury Meets Timeless Comfort
            </h1>
            <p className="lead text-light mb-4" style={{ opacity: 0.9, maxWidth: '580px' }}>
              Experience bespoke hospitality, panoramic suites, and seamless guest service tailored to create unforgettable stays.
            </p>

            <div className="d-flex flex-wrap gap-3 align-items-center">
              <Link to="/rooms" className="btn btn-gold btn-lg px-4">
                Explore Rooms
              </Link>

              {!user ? (
                <>
                  <Link to="/login" className="btn btn-outline-light btn-lg px-4">
                    Guest Login
                  </Link>
                  <Link to="/register" className="btn btn-link text-light text-decoration-none px-2">
                    Create Account →
                  </Link>
                </>
              ) : (
                <div className="d-flex align-items-center gap-2">
                  {user.role === 'admin' && (
                    <Link to="/admin/dashboard" className="btn btn-outline-light btn-lg px-4">
                      Admin Dashboard
                    </Link>
                  )}
                  {user.role === 'staff' && (
                    <Link to="/staff/dashboard" className="btn btn-outline-light btn-lg px-4">
                      Staff Dashboard
                    </Link>
                  )}
                  {user.role === 'guest' && (
                    <Link to="/guest/dashboard" className="btn btn-outline-light btn-lg px-4">
                      My Dashboard
                    </Link>
                  )}
                  <span className="text-light small ms-2" style={{ opacity: 0.9 }}>
                    Welcome back, <strong>{user.name}</strong> ({user.role === 'admin' ? 'Administrator' : user.role === 'staff' ? 'Hotel Staff' : 'Guest'})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Prominent Search Section ──────────────────────── */}
      <div className="container" style={{ marginTop: '-28px', position: 'relative', zIndex: 10 }}>
        <div className="mb-4">
          <div className="mb-2 px-2 d-flex flex-wrap align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <span
                className="badge rounded-pill px-3 py-1"
                style={{
                  backgroundColor: '#0f172a',
                  color: '#f6d365',
                  fontSize: '0.72rem',
                  letterSpacing: '0.04em',
                }}
              >
                STAY SEARCH
              </span>
              <h4 className="fw-bold text-dark mb-0">Find a Stay Across India</h4>
            </div>
            <span className="text-muted small d-none d-md-inline">
              Instant reservation • Real-time suite availability
            </span>
          </div>
          <StaySearchBox />
        </div>
      </div>

      {/* ─── Highlights / Value Pillars ─────────────────────── */}
      <div className="container py-3">
        <div className="row g-4 text-center">
          <div className="col-md-4">
            <div className="card h-100 p-4 border-0 shadow-sm" style={{ backgroundColor: '#ffffff' }}>
              <div
                className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                style={{ width: '56px', height: '56px', background: 'rgba(13, 148, 136, 0.1)', color: '#0d9488', fontSize: '1.5rem' }}
              >
                🌊
              </div>
              <h5 className="fw-bold mb-2">Prime Waterfront &amp; City Locations</h5>
              <p className="text-muted small mb-0">
                Centrally situated with breathtaking views, private balconies, and immediate access to culture and leisure.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 p-4 border-0 shadow-sm" style={{ backgroundColor: '#ffffff' }}>
              <div
                className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                style={{ width: '56px', height: '56px', background: 'rgba(197, 155, 39, 0.12)', color: '#c59b27', fontSize: '1.5rem' }}
              >
                ✨
              </div>
              <h5 className="fw-bold mb-2">Architectural Elegance</h5>
              <p className="text-muted small mb-0">
                Curated interiors with king mattresses, designer marble finishes, ambient climate control, and deluxe amenities.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 p-4 border-0 shadow-sm" style={{ backgroundColor: '#ffffff' }}>
              <div
                className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                style={{ width: '56px', height: '56px', background: 'rgba(15, 23, 42, 0.08)', color: '#0f172a', fontSize: '1.5rem' }}
              >
                🛎️
              </div>
              <h5 className="fw-bold mb-2">24/7 Dedicated Concierge</h5>
              <p className="text-muted small mb-0">
                Instant digital service requests, express check-in, and personalized assistance around the clock.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Featured Accommodations ───────────────────────── */}
      <div className="container py-5">
        <div className="d-flex flex-wrap justify-content-between align-items-end mb-4">
          <div>
            <span className="text-uppercase fw-bold small text-muted" style={{ letterSpacing: '0.08em' }}>
              Featured Accommodations
            </span>
            <h2 className="fw-bold mb-1">Curated Luxury Rooms &amp; Suites</h2>
            <p className="text-muted mb-0 small">
              Hand-selected spaces designed for relaxation, business, and celebrations.
            </p>
          </div>
          <Link to="/rooms" className="btn btn-outline-primary mt-3 mt-md-0">
            View All Rooms →
          </Link>
        </div>

        {loadingRooms ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading rooms...</span>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {featuredRooms.map((room) => (
              <div key={room._id} className="col-md-4">
                <div className="room-card">
                  <div className="room-thumb-wrapper">
                    <img
                      src={getRoomImage(room)}
                      alt={`Room ${room.roomNumber}`}
                      className="room-thumb"
                      loading="lazy"
                      onError={handleImageError}
                    />
                    <span className="room-category-tag">
                      {room.category?.name || 'Deluxe'}
                    </span>
                    <span className={`badge rounded-pill room-status-badge ${getStatusBadgeClass(room.status)}`}>
                      {room.status}
                    </span>
                  </div>

                  <div className="card-body p-4 d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-baseline mb-2">
                      <h5 className="fw-bold mb-0">Room {room.roomNumber}</h5>
                      <span className="text-muted small">Floor {room.floor}</span>
                    </div>

                    <div className="mb-3">
                      <span className="h4 fw-bold text-dark mb-0">₹{room.pricePerNight}</span>
                      <span className="text-muted small"> / night</span>
                    </div>

                    <div className="mb-3 flex-grow-1">
                      <div className="d-flex flex-wrap gap-1">
                        {(room.category?.amenities || []).slice(0, 3).map((amenity, idx) => (
                          <span
                            key={idx}
                            className="badge text-secondary border bg-light small"
                            style={{ fontWeight: 500 }}
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="d-grid mt-auto">
                      <Link
                        to={`/rooms/${room._id}`}
                        className="btn btn-primary"
                      >
                        Explore &amp; Book
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
