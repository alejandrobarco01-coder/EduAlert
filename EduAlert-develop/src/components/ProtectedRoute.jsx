import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ALLOWED_ROLES = ['admin', 'tutor', 'coordinator', 'welfare'];

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user || !user.token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!ALLOWED_ROLES.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
