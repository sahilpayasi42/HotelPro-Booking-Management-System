import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';

const POPULAR_INDIAN_CITIES = ['Mumbai', 'Indore', 'Delhi NCR', 'Bengaluru', 'Goa', 'Jaipur', 'Hyderabad'];

const getTodayStr = () => new Date().toISOString().split('T')[0];

const StaySearchBox = ({
  initialCity = '',
  initialCheckIn = '',
  initialCheckOut = '',
  initialGuests = 1,
  compact = false,
  onSearch = null,
}) => {
  const navigate = useNavigate();
  const [city, setCity] = useState(initialCity);
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guests, setGuests] = useState(initialGuests);
  const [activeCities, setActiveCities] = useState([]);
  const [dateError, setDateError] = useState('');

  const todayStr = getTodayStr();

  useEffect(() => {
    API.get('/rooms/locations')
      .then((res) => {
        if (res.data.cities) setActiveCities(res.data.cities);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setCity(initialCity);
    setCheckIn(initialCheckIn);
    setCheckOut(initialCheckOut);
    setGuests(initialGuests);
  }, [initialCity, initialCheckIn, initialCheckOut, initialGuests]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setDateError('');

    if (checkIn && checkOut && checkOut <= checkIn) {
      setDateError('Check-out must be at least one day after check-in.');
      return;
    }

    const params = new URLSearchParams();
    if (city.trim()) params.append('city', city.trim());
    if (checkIn) params.append('checkIn', checkIn);
    if (checkOut) params.append('checkOut', checkOut);
    if (guests && Number(guests) > 1) params.append('guests', guests);

    if (onSearch) {
      onSearch({
        city: city.trim(),
        checkIn,
        checkOut,
        guests: Number(guests) || 1,
      });
    } else {
      navigate(`/rooms?${params.toString()}`);
    }
  };

  return (
    <div
      className={`card border-0 shadow-lg ${
        compact ? 'p-3' : 'p-4 p-md-4'
      }`}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 12px 36px -4px rgba(15, 23, 42, 0.16)',
      }}
    >
      <form onSubmit={handleSearchSubmit}>
        <div className="row g-2 g-md-3 align-items-end">
          {/* Destination City Input */}
          <div className={compact ? 'col-12 col-md-4' : 'col-12 col-lg-4'}>
            <label className="form-label small fw-bold text-secondary mb-1">
              <span className="me-1">📍</span> Destination / City
            </label>
            <div className="position-relative">
              <input
                type="text"
                list="indian-cities-list"
                className="form-control"
                placeholder="Where do you want to stay? (e.g. Mumbai, Indore)"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={{
                  height: '48px',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                }}
              />
              <datalist id="indian-cities-list">
                {activeCities.map((c) => (
                  <option key={c} value={c}>
                    {c} (Active Awas360 Suites)
                  </option>
                ))}
                {POPULAR_INDIAN_CITIES.filter((c) => !activeCities.includes(c)).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </datalist>
            </div>
          </div>

          {/* Check-In Date */}
          <div className={compact ? 'col-6 col-md-2' : 'col-6 col-lg-2'}>
            <label className="form-label small fw-bold text-secondary mb-1">
              <span className="me-1">📅</span> Check-in
            </label>
            <input
              type="date"
              className="form-control"
              min={todayStr}
              value={checkIn}
              onChange={(e) => {
                setCheckIn(e.target.value);
                if (checkOut && e.target.value >= checkOut) {
                  setCheckOut('');
                }
              }}
              style={{ height: '48px', fontSize: '0.9rem' }}
            />
          </div>

          {/* Check-Out Date */}
          <div className={compact ? 'col-6 col-md-2' : 'col-6 col-lg-2'}>
            <label className="form-label small fw-bold text-secondary mb-1">
              <span className="me-1">📅</span> Check-out
            </label>
            <input
              type="date"
              className="form-control"
              min={checkIn || todayStr}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              style={{ height: '48px', fontSize: '0.9rem' }}
            />
          </div>

          {/* Guests Count */}
          <div className={compact ? 'col-6 col-md-2' : 'col-6 col-lg-2'}>
            <label className="form-label small fw-bold text-secondary mb-1">
              <span className="me-1">👥</span> Guests
            </label>
            <select
              className="form-select"
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value, 10))}
              style={{ height: '48px', fontSize: '0.92rem' }}
            >
              <option value={1}>1 Guest</option>
              <option value={2}>2 Guests</option>
              <option value={3}>3 Guests</option>
              <option value={4}>4 Guests</option>
              <option value={5}>5 Guests</option>
              <option value={6}>6+ Guests</option>
            </select>
          </div>

          {/* Search Button */}
          <div className={compact ? 'col-6 col-md-2' : 'col-12 col-lg-2'}>
            <button
              type="submit"
              className="btn btn-gold w-100 d-flex align-items-center justify-content-center gap-2"
              style={{ height: '48px', fontWeight: 700 }}
            >
              <span>🔍</span>
              <span>Search Stays</span>
            </button>
          </div>
        </div>

        {dateError && (
          <div className="alert alert-danger py-2 px-3 small mt-2 mb-0" role="alert">
            {dateError}
          </div>
        )}
      </form>
    </div>
  );
};

export default StaySearchBox;
