import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Rating } from '@mui/material';
import API from '../../api/axios';
import { toast } from 'react-toastify';

const ReviewForm = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/reviews', { bookingId, rating, comment });
      toast.success('Review submitted!');
      navigate('/guest/bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
    setSubmitting(false);
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body">
              <h3 className="mb-4">Leave a Review</h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Rating</label>
                  <div><Rating value={rating} onChange={(e, v) => setRating(v)} size="large" /></div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Comment</label>
                  <textarea className="form-control" rows="4" value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your experience..." maxLength={1000} />
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewForm;
