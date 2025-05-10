import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import ProtectedResetRoute from '../ProtectedResetRoute';
import LoginForm from '../LoginForm';
import RegisterForm from '../RegisterForm';
import ForgotForm from '../ForgotForm';
import ResetPasswordForm from '../ResetPasswordForm';
import Home from '../Home';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
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
        <Route path="/reset-password" element={
            <ProtectedResetRoute>
              <ResetPasswordForm />
            </ProtectedResetRoute>
          } />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
