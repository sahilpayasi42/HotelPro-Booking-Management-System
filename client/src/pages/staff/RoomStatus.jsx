import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Spinner from '../../components/common/Spinner';
import { toast } from 'react-toastify';

const colors = { available: '#198754', occupied: '#dc3545', cleaning: '#ffc107', maintenance: '#6c757d' };

const RoomStatus = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = async () => {
    try { const { data } = await API.get('/rooms?limit=100'); setRooms(data.rooms); }
    catch { toast.error('Failed'); }
    setLoading(false);
  };

  useEffect(() => { fetchRooms(); }, []);

  const changeStatus = async (id, status) => {
    try { await API.patch(`/rooms/${id}/status`, { status }); toast.success(`Status → ${status}`); fetchRooms(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <Spinner />;

  return (
    <div className="container py-4">
      <h2 className="mb-4">Room Status Board</h2>
      <div className="d-flex gap-3 mb-3">
        {Object.entries(colors).map(([s, c]) => <span key={s} className="badge" style={{ backgroundColor: c }}>{s}</span>)}
      </div>
      <div className="row">
        {rooms.map(r => (
          <div key={r._id} className="col-6 col-md-3 col-lg-2 mb-3">
            <div className="card text-center shadow-sm" style={{ borderTop: `4px solid ${colors[r.status]}` }}>
              <div className="card-body p-2">
                <h5 className="mb-1">{r.roomNumber}</h5>
                <small className="text-muted d-block mb-2">{r.category?.name}</small>
                <select className="form-select form-select-sm" value={r.status} onChange={e => changeStatus(r._id, e.target.value)}>
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomStatus;
