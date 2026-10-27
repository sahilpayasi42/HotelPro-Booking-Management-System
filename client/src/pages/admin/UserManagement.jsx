import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Spinner from '../../components/common/Spinner';
import { toast } from 'react-toastify';
import { Chip } from '@mui/material';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.append('search', search);
      if (roleFilter) params.append('role', roleFilter);
      const { data } = await API.get(`/admin/users?${params}`);
      setUsers(data.users); setPagination(data.pagination);
    } catch { toast.error('Failed'); }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, [roleFilter]);

  const toggleActive = async (id) => {
    try { await API.patch(`/admin/users/${id}/toggle`); toast.success('Updated'); fetchUsers(pagination.page); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">User Management</h2>
      <div className="row mb-3">
        <div className="col-md-4">
          <div className="input-group"><input className="form-control" placeholder="Search name or email..." value={search} onChange={e => setSearch(e.target.value)} />
            <button className="btn btn-primary" onClick={() => fetchUsers()}>Search</button></div>
        </div>
        <div className="col-md-3">
          <select className="form-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option><option value="guest">Guest</option><option value="staff">Staff</option><option value="admin">Admin</option>
          </select>
        </div>
      </div>
      {loading ? <Spinner /> : (
        <div className="table-responsive"><table className="table table-hover align-middle">
          <thead className="table-dark"><tr><th>Name</th><th>Email</th><th>Role</th><th>Active</th><th>Actions</th></tr></thead>
          <tbody>{users.map(u => (
            <tr key={u._id}><td>{u.name}</td><td>{u.email}</td>
              <td><Chip label={u.role} size="small" color={u.role === 'admin' ? 'error' : u.role === 'staff' ? 'primary' : 'default'} /></td>
              <td><Chip label={u.isActive ? 'Active' : 'Inactive'} size="small" color={u.isActive ? 'success' : 'default'} /></td>
              <td><button className={`btn btn-sm ${u.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`} onClick={() => toggleActive(u._id)}>{u.isActive ? 'Deactivate' : 'Activate'}</button></td>
            </tr>
          ))}</tbody>
        </table></div>
      )}
      {pagination.pages > 1 && (
        <nav><ul className="pagination justify-content-center">{Array.from({ length: pagination.pages }, (_, i) => (
          <li key={i} className={`page-item ${pagination.page === i + 1 ? 'active' : ''}`}>
            <button className="page-link" onClick={() => fetchUsers(i + 1)}>{i + 1}</button>
          </li>
        ))}</ul></nav>
      )}
    </div>
  );
};

export default UserManagement;
