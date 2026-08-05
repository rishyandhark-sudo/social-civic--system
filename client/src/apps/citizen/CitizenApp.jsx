import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CitizenAuthProvider } from '../../context/CitizenAuthContext';
import CitizenProtectedRoute from './CitizenProtectedRoute';
import BottomNav from './BottomNav';
import Login from './pages/Login';
import ReportIssue from './pages/ReportIssue';
import MyComplaints from './pages/MyComplaints';
import ComplaintDetail from './pages/ComplaintDetail';
import PublicDashboard from './pages/PublicDashboard';

export default function CitizenApp() {
  return (
    <CitizenAuthProvider>
      <div className="pb-16">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/report"
            element={
              <CitizenProtectedRoute>
                <ReportIssue />
              </CitizenProtectedRoute>
            }
          />
          <Route
            path="/my-complaints"
            element={
              <CitizenProtectedRoute>
                <MyComplaints />
              </CitizenProtectedRoute>
            }
          />
          <Route
            path="/complaints/:id"
            element={
              <CitizenProtectedRoute>
                <ComplaintDetail />
              </CitizenProtectedRoute>
            }
          />
          <Route path="/dashboard" element={<PublicDashboard />} />
          <Route path="*" element={<Navigate to="/report" replace />} />
        </Routes>
      </div>
      <CitizenNavGate />
    </CitizenAuthProvider>
  );
}

// Only shows the bottom nav once a citizen is logged in — the login
// screen itself stays clean and full-focus.
function CitizenNavGate() {
  const location = useLocation();
  if (location.pathname === '/login') return null;
  return <BottomNav />;
}
