import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * Redirects to / if user's role is not in the allowed list.
 * Must be used inside ProtectedRoute.
 *
 * Usage: <RoleRoute roles={['admin', 'staff']}><Component /></RoleRoute>
 */
const RoleRoute = ({ roles, children }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleRoute;
