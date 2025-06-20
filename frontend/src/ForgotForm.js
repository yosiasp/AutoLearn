/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-no-comment-textnodes */
import React, { useState, useEffect } from 'react';
import './ForgotForm.css';
import { forgotPassword } from './services/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { checkToken } from './services/api'; 

const ForgotForm = () => {
  // Title
  useEffect(() => {
    document.title = "Forgot Password";
  }, []);
  const navigate = useNavigate();
  
  // Checking for login status
  useEffect(() => {
    const verifyLogin = async () => {
      try {
        await checkToken(); 
        navigate('/home'); 
      } catch (err) {
        // Not logged in, stay on forgot password page
      }
    };
    verifyLogin();
  },);

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
      const response = await forgotPassword(form);
      if (response.message === 'Password reset email sent') {
        toast.success('Password reset email sent', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        setError(response.message || 'An error has occured');
        toast.error(response.message || 'An error has occured', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (err) {
      setError('An error has occurred');
      toast.error('An error has occurred', {
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
    <div className="forgot-container">
      <ToastContainer />
      {/* Logo */}
      <div className="logo-container">
        <img src="/logo.png" alt="Logo"/>
      </div>

      {/* Form card */}
      <div className="forgot-card">
        <h2>Forgot Password</h2>
        <p>Enter your email password to reset your password</p>
        <form onSubmit={handleSubmit}>
          <label>Email address</label>
          <input name="email" type="email" placeholder="Enter your email" value={form.email} onChange={handleChange} required />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Send Email'}
          </button>
        </form>
        <p className="signin-link"><a href="#" onClick={() => navigate('/login')}>Return to login </a></p>
      </div>
    </div>
  );
};

export default ForgotForm; 