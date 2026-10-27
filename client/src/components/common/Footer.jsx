import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer-awas py-5 mt-auto">
      <div className="container">
        <div className="row gy-4">
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span style={{ color: '#d4af37', fontSize: '1.2rem' }}>◆</span>
              <span className="brand-title fs-4 text-white">Awas360</span>
            </div>
            <p className="text-secondary small mb-3" style={{ maxWidth: '320px' }}>
              World-class hotel suites, refined modern hospitality, and serene coastal accommodations crafted for exceptional stays.
            </p>
            <div className="text-secondary small">
              24/7 Concierge: <strong className="text-light">+91 (022) 555-0199</strong>
            </div>
          </div>

          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="text-white text-uppercase small fw-bold mb-3" style={{ letterSpacing: '0.06em' }}>
              Explore
            </h6>
            <ul className="list-unstyled small mb-0 d-flex flex-column gap-2">
              <li><Link to="/" className="text-secondary text-decoration-none">Home</Link></li>
              <li><Link to="/rooms" className="text-secondary text-decoration-none">Suites &amp; Rooms</Link></li>
              <li><Link to="/login" className="text-secondary text-decoration-none">Guest Portal</Link></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="text-white text-uppercase small fw-bold mb-3" style={{ letterSpacing: '0.06em' }}>
              Management
            </h6>
            <ul className="list-unstyled small mb-0 d-flex flex-column gap-2">
              <li><Link to="/admin/dashboard" className="text-secondary text-decoration-none">Admin Suite</Link></li>
              <li><Link to="/staff/dashboard" className="text-secondary text-decoration-none">Staff Desk</Link></li>
              <li><Link to="/guest/bookings" className="text-secondary text-decoration-none">Reservations</Link></li>
            </ul>
          </div>

          <div className="col-lg-4 col-md-6">
            <h6 className="text-white text-uppercase small fw-bold mb-3" style={{ letterSpacing: '0.06em' }}>
              Excellence in Hospitality
            </h6>
            <p className="text-secondary small mb-0">
              Designed with bespoke craftsmanship, ambient lighting, and dedicated guest management services.
            </p>
          </div>
        </div>

        <hr className="my-4" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />

        <div className="d-flex flex-wrap justify-content-between align-items-center small text-secondary">
          <div>
            &copy; {new Date().getFullYear()} Awas360 Hospitality Group. All rights reserved.
          </div>
          <div className="d-flex gap-3 mt-2 mt-sm-0">
            <span>Terms of Service</span>
            <span>•</span>
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Guest Safety</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
