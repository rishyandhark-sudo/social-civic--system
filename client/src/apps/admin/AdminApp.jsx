import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from '../../context/AdminAuthContext';
import AdminProtectedRoute from './AdminProtectedRoute';
import Sidebar from './Sidebar';
import Login from './pages/Login';
import ComplaintQueue from './pages/ComplaintQueue';
import AdminComplaintDetail from './pages/AdminComplaintDetail';
import Analytics from './pages/Analytics';

function AdminLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route
          path="queue"
          element={
            <AdminProtectedRoute>
              <AdminLayout>
                <ComplaintQueue />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />
        <Route
          path="complaints/:id"
          element={
            <AdminProtectedRoute>
              <AdminLayout>
                <AdminComplaintDetail />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />
        <Route
          path="analytics"
          element={
            <AdminProtectedRoute>
              <AdminLayout>
                <Analytics />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/admin/queue" replace />} />
      </Routes>
    </AdminAuthProvider>
  );
}
