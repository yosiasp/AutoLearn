/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-no-comment-textnodes */
import React, { useState, useEffect } from 'react';
import './AdminLogin.css';
import { loginAdmin } from './services/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  // Title
  useEffect(() => {
    document.title = "Admin Login";
  }, []);
  
  const navigate = useNavigate();
  
  // Check if already logged in
  useEffect(() => {
    const admin = localStorage.getItem('admin');
    if (admin) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const [form, setForm] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await loginAdmin(form);
      if (response.admin) {
        toast.success('Admin login successful', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        localStorage.setItem('admin', JSON.stringify(response.admin));
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 2000);
      }
    } catch (err) {
      const errorMessage = err.message || 'An error occurred during login';
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <ToastContainer />
      {/* Back Button */}
      <div className="back-button" onClick={() => navigate('/')}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#FAF9F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 22V12H15V22" stroke="#FAF9F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      {/* Logo */}
      <div className="logo-container">
        <img src="/logo.png" alt="Logo"/>
      </div>

      {/* Form card */}
      <div className="admin-login-card">
        <h2>Admin Portal</h2>
        <p>Sign in to access admin dashboard</p>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>Username</label>
          <input 
            name="username" 
            type="text" 
            placeholder="Enter username" 
            value={form.username} 
            onChange={handleChange} 
            required 
            disabled={isLoading}
          />
          <label>Password</label>
          <input 
            name="password" 
            type="password" 
            placeholder="Enter password" 
            value={form.password} 
            onChange={handleChange} 
            required 
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In as Admin'}
          </button>
        </form>
        <p className="signup-link">Are you a user? <a href="#" onClick={() => navigate('/login')}>Login</a></p>
        <p className="signup-link">Are you a new user? <a href="#" onClick={() => navigate('/register')}>Create account</a></p>
      </div>
    </div>
  );
};

export default AdminLogin;
