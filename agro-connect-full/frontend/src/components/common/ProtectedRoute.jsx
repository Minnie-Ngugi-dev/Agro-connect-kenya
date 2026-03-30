import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
export default function ProtectedRoute({ children, roles = [] }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles.length && !roles.includes(user.role)) {
    const dash = user.role === 'farmer' ? '/farmer' : user.role === 'admin' ? '/admin' : user.role === 'hotel' ? '/hotel' : '/buyer';
    return <Navigate to={dash} replace />;
  }
  return children;
}
