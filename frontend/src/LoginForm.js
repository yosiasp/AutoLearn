/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-no-comment-textnodes */
import React, { useState, useEffect } from 'react';
import './LoginForm.css';
import { login } from './services/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { checkToken } from './services/api'; 

const LoginForm = () => {
  // Title
  useEffect(() => {
    document.title = "Login";
  }, []);
  const navigate = useNavigate();
  
  // Checking for login status
  useEffect(() => {
    const verifyLogin = async () => {
      try {
        await checkToken(); 
        navigate('/home'); 
      } catch (err) {
        // Not logged in, stay on login page
      }
    };
    verifyLogin();
  }, );

  const [form, setForm] = useState({
    emailOrUsername: '',
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
        toast.success('Login successful', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        localStorage.setItem('user', JSON.stringify({
          _id: response.user._id,          
          name: response.user.name,
          username: response.user.username,
          email: response.user.email
        }));        
        setTimeout(() => {
          navigate('/home');
        }, 2000);
      } else {
        setError(response.message || 'Login failed');
        toast.error(response.message || 'Login failed', {
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
      toast.error('An error occurred during login', {
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
      {/* Logo */}
      <div className="logo-container">
        <img src="/logo.png" alt="Logo"/>
      </div>

      {/* Form card */}
      <div className="login-card">
        <h2>Welcome</h2>
        <p>Sign in to your account to continue</p>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>Username or Email address</label>
          <input name="emailOrUsername" type="text" placeholder="Enter your username or email" value={form.emailOrUsername} onChange={handleChange} required />
          <label>Password</label>
          <input name="password" type="password" placeholder="Enter your password" value={form.password} onChange={handleChange} required />
          <div className="forgot-password">
            <a href="#" onClick={() => navigate('/forgot-password')}>Forgot password?</a>
          </div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Sign In'}
          </button>
        </form>
        <p className="signup-link">Don't have an account? <a href="#" onClick={() => navigate('/register')}>Create account</a></p>
      </div>
      {/* Info Section */}
      <div className="info-section">
        <h3>Tentang AutoLearn</h3>
        <div className="info-grid">
          <div className="info-card">
            <h4>Pembelajaran Adaptif</h4>
            <p>Sistem pembelajaran yang menyesuaikan dengan kemampuan dan gaya belajar Anda</p>
          </div>
          <div className="info-card">
            <h4>AI Powered</h4>
            <p>Didukung oleh teknologi AI untuk pengalaman belajar yang lebih baik</p>
          </div>
          <div className="info-card">
            <h4>Progress Tracking</h4>
            <p>Pantau perkembangan belajar Anda dengan analisis detail dan rekomendasi</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm; 