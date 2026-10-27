import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import API from '../../api/axios';
import Spinner from '../../components/common/Spinner';
import { Rating, Chip } from '@mui/material';
import { getRoomImage, handleImageError } from '../../utils/roomAssets';

const RoomDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [room, setRoom] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);

  const querySuffix = searchParams.toString() ? `?${searchParams.toString()}` : '';

  useEffect(() => {
    const load = async () => {
      try {
        const [roomRes, reviewRes] = await Promise.all([
          API.get(`/rooms/${id}`),
          API.get(`/rooms/${id}/reviews`),
        ]);
        setRoom(roomRes.data.room);
        setReviews(reviewRes.data.reviews);
        setAvgRating(reviewRes.data.averageRating);
      } catch { /* handled by empty state */ }
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) return <Spinner />;
  if (!room) return <div className="container py-4"><div className="alert alert-danger">Room not found.</div></div>;

  return (
    <div className="container py-4">
      <Link to={`/rooms${querySuffix}`} className="btn btn-outline-secondary btn-sm mb-3">← Back to Rooms</Link>
      <div className="row">
        <div className="col-md-8">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h2>Room {room.roomNumber}</h2>
                  <p className="text-muted">{room.category?.name} • Floor {room.floor}</p>
                </div>
                <Chip label={room.status} color={room.status === 'available' ? 'success' : 'default'} />
              </div>
              <h3 className="text-primary mb-3">₹{room.pricePerNight} <small className="text-muted fs-6">/ night</small></h3>
              <h6>Amenities</h6>
              <div className="mb-3">
                {(room.category?.amenities || []).map((a, i) => (
                  <span key={i} className="badge bg-primary me-1 mb-1">{a}</span>
                ))}
              </div>
              <p><strong>Capacity:</strong> {room.category?.capacity} guests</p>
              <p><strong>Hotel:</strong> {room.hotel?.name}, {room.hotel?.city}</p>
              <div className="mb-4 rounded overflow-hidden" style={{ maxHeight: '420px' }}>
                <img
                  src={getRoomImage(room)}
                  alt={`Room ${room.roomNumber}`}
                  className="img-fluid w-100"
                  style={{ objectFit: 'cover', maxHeight: '420px' }}
                  onError={handleImageError}
                />
              </div>

              {room.images?.length > 1 && (
                <div className="row g-2 mb-4">
                  {room.images.slice(1).map((img, i) => (
                    <div key={i} className="col-4">
                      <img
                        src={img.startsWith('http') ? img : `http://localhost:5000${img}`}
                        alt=""
                        className="img-fluid rounded"
                        style={{ height: '100px', width: '100%', objectFit: 'cover' }}
                        onError={handleImageError}
                      />
                    </div>
                  ))}
                </div>
              )}
              <Link to={`/guest/book/${room._id}${querySuffix}`} className="btn btn-primary btn-lg px-4">Book Now</Link>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5>Reviews ({reviews.length})</h5>
              {avgRating > 0 && (
                <div className="d-flex align-items-center mb-3">
                  <Rating value={avgRating} precision={0.1} readOnly size="small" />
                  <span className="ms-2 text-muted">{avgRating} / 5</span>
                </div>
              )}
              {reviews.length === 0 ? <p className="text-muted">No reviews yet.</p> : (
                reviews.map(r => (
                  <div key={r._id} className="border-bottom pb-2 mb-2">
                    <div className="d-flex justify-content-between">
                      <strong>{r.guest?.name || 'Guest'}</strong>
                      <Rating value={r.rating} readOnly size="small" />
                    </div>
                    {r.comment && <p className="small text-muted mb-0">{r.comment}</p>}
                    <small className="text-muted">{new Date(r.createdAt).toLocaleDateString()}</small>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;
