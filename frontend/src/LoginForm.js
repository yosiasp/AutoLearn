/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-no-comment-textnodes */
import React, { useState, useEffect } from 'react';
import './LoginForm.css';
import { login } from './services/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const user = JSON.parse(localStorage.getItem('user')) || {};

  useEffect(() => {
    if (user._id) {
      fetch(`http://localhost:3000/api/${user._id}/ollama/history`)
        .then(res => res.json())
        .then(data => setHistory(data.history || []))
        .catch(err => setHistory([]));
    }
  }, [user._id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await login(form);
      if (response.message === 'Login successful') {
        toast.success('Login berhasil!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        localStorage.setItem('user', JSON.stringify(response.user));
        setTimeout(() => {
          navigate('/home');
        }, 2000);
      } else {
        setError(response.message || 'Login failed');
        toast.error(response.message || 'Login gagal!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (err) {
      setError('An error occurred during login');
      toast.error('Terjadi kesalahan saat login!', {
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
    <div className="login-container">
      <ToastContainer />
      <div className="login-card">
        <div className="logo-container">
          <svg width="86" height="86" viewBox="0 0 86 86" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M51.7984 14.2016C63.3575 25.7607 63.3575 44.4393 51.7984 55.9984C40.2393 67.5575 21.5607 67.5575 10.0016 55.9984C-1.55755 44.4393 -1.55755 25.7607 10.0016 14.2016C21.5607 2.64245 40.2393 2.64245 51.7984 14.2016Z" fill="#FF5C00"/>
            <path d="M75.9984 14.2016C87.5575 25.7607 87.5575 44.4393 75.9984 55.9984C64.4393 67.5575 45.7607 67.5575 34.2016 55.9984C22.6424 44.4393 22.6424 25.7607 34.2016 14.2016C45.7607 2.64245 64.4393 2.64245 75.9984 14.2016Z" fill="#9747FF"/>
            <path d="M43 20V50M43 20L35 28M43 20L51 28M30 42.5H56" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2>Login to your account</h2>
        <p>Welcome back to AutoLearn AI assistant</p>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>Email address</label>
          <input name="email" type="email" placeholder="Enter your email" value={form.email} onChange={handleChange} required />
          <label>Password</label>
          <input name="password" type="password" placeholder="Enter your password" value={form.password} onChange={handleChange} required />
          <div className="forgot-password">
            <a href="#">Forgot password?</a>
          </div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Sign In'}
          </button>
        </form>
        <p className="signup-link">Don't have an account? <a href="#" onClick={() => navigate('/register')}>Create account</a></p>
      </div>
    </div>
  );
};

export default LoginForm; 