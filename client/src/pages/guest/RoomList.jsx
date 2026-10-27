import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import API from '../../api/axios';
import Spinner from '../../components/common/Spinner';
import { Chip } from '@mui/material';
import { getRoomImage, handleImageError, getStatusBadgeClass } from '../../utils/roomAssets';
import StaySearchBox from '../../components/common/StaySearchBox';

const RoomList = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL search parameters
  const cityParam = searchParams.get('city') || '';
  const checkInParam = searchParams.get('checkIn') || '';
  const checkOutParam = searchParams.get('checkOut') || '';
  const guestsParam = parseInt(searchParams.get('guests'), 10) || 1;
  const categoryParam = searchParams.get('category') || '';
  const sortParam = searchParams.get('sort') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';

  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  // Load categories once on mount
  useEffect(() => {
    API.get('/rooms/categories')
      .then((r) => setCategories(r.data.categories || []))
      .catch(() => {});
  }, []);

  const isDateSearch = Boolean(checkInParam && checkOutParam);

  // Fetch rooms based on parameters
  const fetchStays = useCallback(async () => {
    setLoading(true);
    try {
      if (isDateSearch) {
        // Safe verified availability route
        const params = new URLSearchParams();
        params.append('checkIn', checkInParam);
        params.append('checkOut', checkOutParam);
        if (cityParam) params.append('city', cityParam);
        if (guestsParam > 1) params.append('guests', guestsParam);
        if (categoryParam) params.append('category', categoryParam);

        const { data } = await API.get(`/rooms/available?${params.toString()}`);
        let availableRooms = data.rooms || [];

        // Apply price filters locally if set on top of date search
        if (minPriceParam) {
          availableRooms = availableRooms.filter(
            (r) => r.pricePerNight >= parseFloat(minPriceParam)
          );
        }
        if (maxPriceParam) {
          availableRooms = availableRooms.filter(
            (r) => r.pricePerNight <= parseFloat(maxPriceParam)
          );
        }

        // Apply sort
        if (sortParam === 'price_asc') {
          availableRooms.sort((a, b) => a.pricePerNight - b.pricePerNight);
        } else if (sortParam === 'price_desc') {
          availableRooms.sort((a, b) => b.pricePerNight - a.pricePerNight);
        }

        setRooms(availableRooms);
        setPagination({ page: 1, pages: 1, total: availableRooms.length });
      } else {
        // Standard room catalogue route
        const params = new URLSearchParams();
        if (cityParam) params.append('city', cityParam);
        if (categoryParam) params.append('category', categoryParam);
        if (minPriceParam) params.append('minPrice', minPriceParam);
        if (maxPriceParam) params.append('maxPrice', maxPriceParam);
        if (sortParam) params.append('sort', sortParam);
        params.append('limit', '20');

        const { data } = await API.get(`/rooms?${params.toString()}`);
        setRooms(data.rooms || []);
        setPagination(data.pagination || { page: 1, pages: 1, total: (data.rooms || []).length });
      }
    } catch {
      setRooms([]);
      setPagination({ page: 1, pages: 0, total: 0 });
    }
    setLoading(false);
  }, [
    isDateSearch,
    checkInParam,
    checkOutParam,
    cityParam,
    guestsParam,
    categoryParam,
    minPriceParam,
    maxPriceParam,
    sortParam,
  ]);

  useEffect(() => {
    fetchStays();
  }, [fetchStays]);

  // Handler to update search from top bar
  const handleTopSearch = (newSearch) => {
    const updated = new URLSearchParams(searchParams);
    if (newSearch.city) updated.set('city', newSearch.city);
    else updated.delete('city');

    if (newSearch.checkIn) updated.set('checkIn', newSearch.checkIn);
    else updated.delete('checkIn');

    if (newSearch.checkOut) updated.set('checkOut', newSearch.checkOut);
    else updated.delete('checkOut');

    if (newSearch.guests > 1) updated.set('guests', newSearch.guests);
    else updated.delete('guests');

    setSearchParams(updated);
  };

  // Filter modifiers
  const setCategoryFilter = (catId) => {
    const updated = new URLSearchParams(searchParams);
    if (catId) updated.set('category', catId);
    else updated.delete('category');
    setSearchParams(updated);
  };

  const setSortOption = (sortVal) => {
    const updated = new URLSearchParams(searchParams);
    if (sortVal) updated.set('sort', sortVal);
    else updated.delete('sort');
    setSearchParams(updated);
  };

  const setPriceFilter = (min, max) => {
    const updated = new URLSearchParams(searchParams);
    if (min) updated.set('minPrice', min);
    else updated.delete('minPrice');

    if (max) updated.set('maxPrice', max);
    else updated.delete('maxPrice');
    setSearchParams(updated);
  };

  const resetAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const switchToCity = (cityName) => {
    const updated = new URLSearchParams(searchParams);
    updated.set('city', cityName);
    setSearchParams(updated);
  };

  // Build query string for booking navigation
  const bookingQueryString = useMemo(() => {
    const p = new URLSearchParams();
    if (checkInParam) p.set('checkIn', checkInParam);
    if (checkOutParam) p.set('checkOut', checkOutParam);
    if (guestsParam) p.set('guests', guestsParam);
    const qs = p.toString();
    return qs ? `?${qs}` : '';
  }, [checkInParam, checkOutParam, guestsParam]);

  return (
    <div className="container py-4">
      {/* ─── Top Search Bar (Trivago-style) ─────────────────── */}
      <div className="mb-4">
        <StaySearchBox
          compact={true}
          initialCity={cityParam}
          initialCheckIn={checkInParam}
          initialCheckOut={checkOutParam}
          initialGuests={guestsParam}
          onSearch={handleTopSearch}
        />
      </div>

      {/* ─── Horizontal Filter Row ──────────────────────────── */}
      <div
        className="card border-0 shadow-sm p-3 mb-4"
        style={{ backgroundColor: '#ffffff', borderRadius: '12px' }}
      >
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          {/* Category Filter Pills */}
          <div className="d-flex flex-wrap align-items-center gap-2">
            <span className="small fw-bold text-muted text-uppercase me-1" style={{ fontSize: '0.75rem' }}>
              Category:
            </span>
            <button
              type="button"
              className={`btn btn-sm ${
                !categoryParam ? 'btn-primary' : 'btn-outline-secondary'
              }`}
              onClick={() => setCategoryFilter('')}
            >
              All Types
            </button>
            {categories.map((c) => (
              <button
                key={c._id}
                type="button"
                className={`btn btn-sm ${
                  categoryParam === c._id ? 'btn-primary' : 'btn-outline-secondary'
                }`}
                onClick={() => setCategoryFilter(c._id)}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Price & Sort Controls */}
          <div className="d-flex flex-wrap align-items-center gap-2">
            {/* Quick Price Range */}
            <div className="btn-group btn-group-sm" role="group">
              <button
                type="button"
                className={`btn ${
                  !minPriceParam && !maxPriceParam
                    ? 'btn-dark'
                    : 'btn-outline-secondary'
                }`}
                onClick={() => setPriceFilter('', '')}
              >
                All Rates
              </button>
              <button
                type="button"
                className={`btn ${
                  maxPriceParam === '5000' ? 'btn-dark' : 'btn-outline-secondary'
                }`}
                onClick={() => setPriceFilter('', '5000')}
              >
                &lt; ₹5,000
              </button>
              <button
                type="button"
                className={`btn ${
                  minPriceParam === '5000' && maxPriceParam === '10000'
                    ? 'btn-dark'
                    : 'btn-outline-secondary'
                }`}
                onClick={() => setPriceFilter('5000', '10000')}
              >
                ₹5K - ₹10K
              </button>
              <button
                type="button"
                className={`btn ${
                  minPriceParam === '10000' ? 'btn-dark' : 'btn-outline-secondary'
                }`}
                onClick={() => setPriceFilter('10000', '')}
              >
                ₹10K+
              </button>
            </div>

            {/* Sort Select */}
            <select
              className="form-select form-select-sm"
              style={{ width: 'auto', minWidth: '150px' }}
              value={sortParam}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="">Sort: Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>

            {(cityParam || categoryParam || minPriceParam || maxPriceParam || sortParam) && (
              <button
                type="button"
                className="btn btn-sm btn-link text-danger text-decoration-none"
                onClick={resetAllFilters}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── Search Results Telemetry & Header ───────────────── */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold mb-1">
            {cityParam ? (
              <>
                {rooms.length} stay{rooms.length === 1 ? '' : 's'} found in{' '}
                <span className="text-primary">{cityParam}</span>
              </>
            ) : (
              <>{rooms.length} luxury stays across India</>
            )}
          </h4>
          <p className="text-muted small mb-0">
            {isDateSearch ? (
              <>
                Verified availability for <strong>{checkInParam}</strong> to{' '}
                <strong>{checkOutParam}</strong> • {guestsParam} guest
                {guestsParam > 1 ? 's' : ''}
              </>
            ) : (
              <>Showing real-time room listings from verified Awas360 properties</>
            )}
          </p>
        </div>

        {isDateSearch && (
          <span
            className="badge px-3 py-2 rounded-pill mt-2 mt-md-0"
            style={{
              backgroundColor: '#ecfdf5',
              color: '#065f46',
              border: '1px solid #a7f3d0',
              fontSize: '0.8rem',
            }}
          >
            ✓ Real-time availability verified
          </span>
        )}
      </div>

      {/* ─── Results Body / Horizontal Cards ─────────────────── */}
      {loading ? (
        <div className="py-5 text-center">
          <Spinner />
          <p className="text-muted small mt-2">Checking verified inventory...</p>
        </div>
      ) : rooms.length === 0 ? (
        /* Helpful Empty State (For Indore or cities without listings) */
        <div
          className="card border-0 shadow-sm p-5 text-center my-4"
          style={{ borderRadius: '16px', backgroundColor: '#ffffff' }}
        >
          <div
            className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
            style={{
              width: '64px',
              height: '64px',
              backgroundColor: '#fff7ed',
              color: '#ea580c',
              fontSize: '1.8rem',
            }}
          >
            📍
          </div>
          <h4 className="fw-bold mb-2">
            No stays found in &ldquo;{cityParam || 'selected filters'}&rdquo;
          </h4>
          <p
            className="text-muted mx-auto mb-4"
            style={{ maxWidth: '520px', lineHeight: 1.6 }}
          >
            {cityParam.toLowerCase().includes('indore') ? (
              <>
                We currently do not operate active Awas360 properties in <strong>Indore</strong>.
                Our premier luxury suites are currently situated in <strong>Mumbai</strong>.
              </>
            ) : (
              <>
                No properties matched your exact destination or date criteria. We never display
                fabricated or unrelated listings.
              </>
            )}
          </p>

          <div className="d-flex flex-wrap justify-content-center gap-3">
            <button
              type="button"
              className="btn btn-gold px-4"
              onClick={() => switchToCity('Mumbai')}
            >
              Explore Mumbai Stays (15 Suites)
            </button>
            <button
              type="button"
              className="btn btn-outline-primary px-4"
              onClick={resetAllFilters}
            >
              Show All Stays Across India
            </button>
          </div>
        </div>
      ) : (
        /* Trivago-Inspired Horizontal Room Cards */
        <div className="d-flex flex-column gap-4">
          {rooms.map((room) => (
            <div key={room._id} className="room-horizontal-card shadow-sm">
              <div className="row g-0">
                {/* Left Photo & Badges */}
                <div className="col-lg-4 col-md-5">
                  <div className="room-card-media h-100 position-relative">
                    <img
                      src={getRoomImage(room)}
                      alt={`Room ${room.roomNumber} - ${room.category?.name || 'Suite'}`}
                      loading="lazy"
                      onError={handleImageError}
                      style={{ height: '100%', minHeight: '230px' }}
                    />
                    <span className="room-category-tag">
                      {room.category?.name || 'Deluxe'}
                    </span>
                    <div className="room-status-badge">
                      <Chip
                        label={room.status}
                        size="small"
                        className={getStatusBadgeClass(room.status)}
                        sx={{ fontWeight: 600, textTransform: 'capitalize' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Center Details */}
                <div className="col-lg-5 col-md-4 p-3 p-md-4 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex align-items-center gap-1 text-muted small mb-1">
                      <span>📍</span>
                      <strong>{room.hotel?.name || 'Awas360 Grand Hotel'}</strong>
                      <span>•</span>
                      <span>{room.hotel?.city || 'Mumbai'}</span>
                    </div>

                    <h5 className="fw-bold text-dark mb-1">
                      Room {room.roomNumber} — {room.category?.name || 'Suite'}
                    </h5>

                    <p className="text-secondary small mb-2">
                      Floor {room.floor} • Capacity:{' '}
                      <strong>{room.category?.capacity || '-'}</strong> Guests
                    </p>

                    <div className="d-flex flex-wrap gap-1 mb-3">
                      {(room.category?.amenities || []).slice(0, 4).map((a, i) => (
                        <span
                          key={i}
                          className="badge text-secondary border bg-light small"
                          style={{ fontWeight: 500, fontSize: '0.74rem' }}
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border-top pt-2 mt-auto">
                    <div className="d-flex flex-wrap gap-2 text-muted small" style={{ fontSize: '0.78rem' }}>
                      <span className="text-success">✓ Free cancellation</span>
                      <span>•</span>
                      <span>High-speed Wi-Fi</span>
                      <span>•</span>
                      <span>24/7 Concierge</span>
                    </div>
                  </div>
                </div>

                {/* Right Rate & Action */}
                <div
                  className="col-lg-3 col-md-3 p-3 p-md-4 border-start d-flex flex-column justify-content-between text-center text-md-end"
                  style={{ backgroundColor: '#fcfcfd' }}
                >
                  <div className="mb-2">
                    <span className="text-muted small d-block">Nightly rate from</span>
                    <div className="h3 fw-bold text-dark mb-0">
                      ₹{room.pricePerNight.toLocaleString()}
                    </div>
                    <span className="text-muted small" style={{ fontSize: '0.76rem' }}>
                      Includes all taxes &amp; fees
                    </span>
                  </div>

                  <div className="d-flex flex-column gap-2 mt-3">
                    <Link
                      to={`/guest/book/${room._id}${bookingQueryString}`}
                      className="btn btn-gold btn-sm w-100 py-2"
                      style={{ fontWeight: 700 }}
                    >
                      Book Now
                    </Link>
                    <Link
                      to={`/rooms/${room._id}${bookingQueryString}`}
                      className="btn btn-outline-primary btn-sm w-100"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {pagination.pages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <span className="text-muted small">
                Page {pagination.page} of {pagination.pages} ({pagination.total} total suites)
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RoomList;
