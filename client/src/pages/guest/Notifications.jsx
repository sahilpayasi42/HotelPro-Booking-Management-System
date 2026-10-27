import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Spinner from '../../components/common/Spinner';
import { toast } from 'react-toastify';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    try {
      const { data } = await API.get('/notifications');
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch { toast.error('Failed to load notifications'); }
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const markRead = async (id) => {
    try {
      await API.patch(`/notifications/${id}/read`);
      fetch();
    } catch { toast.error('Failed'); }
  };

  const markAllRead = async () => {
    try {
      await API.patch('/notifications/read-all');
      toast.success('All marked as read');
      fetch();
    } catch { toast.error('Failed'); }
  };

  if (loading) return <Spinner />;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Notifications {unreadCount > 0 && <span className="badge bg-danger">{unreadCount}</span>}</h2>
        {unreadCount > 0 && <button className="btn btn-outline-primary btn-sm" onClick={markAllRead}>Mark All Read</button>}
      </div>
      {notifications.length === 0 ? <div className="alert alert-info">No notifications.</div> : (
        <div className="list-group">
          {notifications.map(n => (
            <div key={n._id} className={`list-group-item d-flex justify-content-between align-items-start ${!n.isRead ? 'list-group-item-primary' : ''}`}>
              <div>
                <p className="mb-1">{n.message}</p>
                <small className="text-muted">{new Date(n.createdAt).toLocaleString()} • {n.type}</small>
              </div>
              {!n.isRead && <button className="btn btn-sm btn-outline-secondary" onClick={() => markRead(n._id)}>Read</button>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
