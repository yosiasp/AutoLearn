/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-no-comment-textnodes */
import React, { useState, useEffect } from 'react';
import './ResetPasswordForm.css';
import { resetPassword } from './services/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';

const ResetPasswordForm = () => {
  // Title
  useEffect(() => {
    document.title = "Reset Password";
  }, []);
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    password: '',
    confirmPassword: '',
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

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await resetPassword({
        password: form.password,
        confirmPassword: form.confirmPassword,
        token: token,
      });
      if (response.message === 'Password reset succesfull') {
        toast.success('Password reset succesfull', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setTimeout(() => {
          navigate('/login');
        }, 2000);
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
    <div className="reset-container">
      <ToastContainer />
      {/* Logo */}
      <div className="logo-container">
        <img src="/logo.png" alt="Logo"/>
      </div>

      {/* Form card */}
      <div className="reset-card">
        <h2>Reset Password</h2>
        <p>Enter your new password</p>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>Password</label>
          <input name="password" type="password" placeholder="Enter your password" value={form.password} onChange={handleChange} required />
          <label>Confirm Password</label>
          <input name="confirmPassword" type="password" placeholder="Confirm your password" value={form.confirmPassword} onChange={handleChange} required />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Reset password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordForm; 