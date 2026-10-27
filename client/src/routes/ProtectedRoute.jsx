import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * Redirects to /login if user is not authenticated.
 */
const ProtectedRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
