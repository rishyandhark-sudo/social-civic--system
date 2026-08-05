import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { WorkerAuthProvider } from '../../context/WorkerAuthContext';
import WorkerProtectedRoute from './WorkerProtectedRoute';
import WorkerNav from './WorkerNav';
import Login from './pages/Login';
import TaskList from './pages/TaskList';
import TaskDetail from './pages/TaskDetail';

export default function WorkerApp() {
  return (
    <WorkerAuthProvider>
      <div className="pb-16">
        <Routes>
          <Route path="login" element={<Login />} />
          <Route
            path="tasks"
            element={
              <WorkerProtectedRoute>
                <TaskList />
              </WorkerProtectedRoute>
            }
          />
          <Route
            path="tasks/:id"
            element={
              <WorkerProtectedRoute>
                <TaskDetail />
              </WorkerProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/worker/tasks" replace />} />
        </Routes>
      </div>
      <WorkerNavGate />
    </WorkerAuthProvider>
  );
}

function WorkerNavGate() {
  const location = useLocation();
  if (location.pathname === '/worker/login') return null;
  return <WorkerNav />;
}
