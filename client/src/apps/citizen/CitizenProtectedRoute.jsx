import { Navigate } from 'react-router-dom';
import { useCitizenAuth } from '../../context/CitizenAuthContext';

export default function CitizenProtectedRoute({ children }) {
  const { user, loading } = useCitizenAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
