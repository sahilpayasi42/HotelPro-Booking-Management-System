import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Spinner from '../../components/common/Spinner';
import { toast } from 'react-toastify';
import { Chip } from '@mui/material';

const ServiceRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchData = async () => {
    try {
      const params = filter ? `?status=${filter}` : '';
      const { data } = await API.get(`/service-requests${params}`);
      setRequests(data.serviceRequests);
    } catch { toast.error('Failed to load'); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [filter]);

  const updateStatus = async (id, status) => {
    try { await API.patch(`/service-requests/${id}`, { status }); toast.success('Updated'); fetchData(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <Spinner />;

  return (
    <div className="container py-4">
      <h2 className="mb-4">Service Requests</h2>
      <div className="mb-3">
        {['', 'pending', 'in-progress', 'completed'].map(s => (
          <button key={s} className={`btn btn-sm me-2 ${filter === s ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setFilter(s)}>
            {s || 'All'}
          </button>
        ))}
      </div>
      {requests.length === 0 ? <div className="alert alert-info">No service requests.</div> : (
        <div className="table-responsive"><table className="table table-hover align-middle">
          <thead className="table-dark"><tr><th>Room</th><th>Guest</th><th>Type</th><th>Description</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>{requests.map(r => (
            <tr key={r._id}>
              <td>{r.booking?.room?.roomNumber || '-'}</td>
              <td>{r.guest?.name}</td>
              <td><Chip label={r.type} size="small" /></td>
              <td>{r.description || '-'}</td>
              <td><Chip label={r.status} color={r.status === 'completed' ? 'success' : r.status === 'in-progress' ? 'warning' : 'default'} size="small" /></td>
              <td>
                <select className="form-select form-select-sm" value={r.status} onChange={e => updateStatus(r._id, e.target.value)} style={{ width: 130 }}>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </td>
            </tr>
          ))}</tbody>
        </table></div>
      )}
    </div>
  );
};

export default ServiceRequests;
