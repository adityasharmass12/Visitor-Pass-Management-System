import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import VisitorRegisterPage from './pages/VisitorRegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import SecurityDashboard from './pages/SecurityDashboard';
import HostDashboard from './pages/HostDashboard';
import VisitorDashboard from './pages/VisitorDashboard';

const HomeRedirect = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'Admin') return <Navigate to="/admin" replace />;
  if (user.role === 'Security') return <Navigate to="/security" replace />;
  if (user.role === 'Employee') return <Navigate to="/host" replace />;
  return <Navigate to="/visitor" replace />;
};

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/visitor-register" element={<VisitorRegisterPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['Admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/security"
        element={
          <ProtectedRoute roles={['Admin', 'Security']}>
            <SecurityDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/host"
        element={
          <ProtectedRoute roles={['Admin', 'Employee']}>
            <HostDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/visitor"
        element={
          <ProtectedRoute roles={['Visitor']}>
            <VisitorDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
