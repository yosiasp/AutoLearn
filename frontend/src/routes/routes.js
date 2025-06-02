import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import ProtectedResetRoute from '../ProtectedResetRoute';
import LoginForm from '../LoginForm';
import RegisterForm from '../RegisterForm';
import ForgotForm from '../ForgotForm';
import ResetPasswordForm from '../ResetPasswordForm';
import Home from '../Home';
import Settings from '../Settings';
import Overview from '../Overview';
import AdminLogin from '../AdminLogin';
import Dashboard from '../Dashboard';

// Protected Route untuk Admin
const ProtectedAdminRoute = ({ children }) => {
  const admin = localStorage.getItem('admin');
  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/forgot-password" element={<ForgotForm />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route path="/reset-password" element={
            <ProtectedResetRoute>
              <ResetPasswordForm />
            </ProtectedResetRoute>
          } />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedAdminRoute>
              <Dashboard />
            </ProtectedAdminRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
