import { Navigate } from 'react-router-dom';
import { useWorkerAuth } from '../../context/WorkerAuthContext';

export default function WorkerProtectedRoute({ children }) {
  const { user, loading } = useWorkerAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/worker/login" replace />;
  return children;
}
