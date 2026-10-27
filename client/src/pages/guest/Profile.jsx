import { useSelector } from 'react-redux';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) return <div className="container py-4"><div className="alert alert-warning">Please log in.</div></div>;

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body text-center">
              <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 80, height: 80, fontSize: 32 }}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <h3>{user.name}</h3>
              <p className="text-muted">{user.email}</p>
              <table className="table text-start mt-3">
                <tbody>
                  <tr><td>Phone</td><td>{user.phone || 'Not provided'}</td></tr>
                  <tr><td>Role</td><td className="text-capitalize">{user.role}</td></tr>
                  <tr><td>Member since</td><td>{new Date(user.createdAt).toLocaleDateString()}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
