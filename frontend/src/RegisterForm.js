import React, { useState, useEffect } from 'react';
import './RegisterForm.css';
import { register } from './services/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const RegisterForm = () => {
  // Title
  useEffect(() => {
    document.title = "Login";
  }, []);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await register(form);
      if (response.message === 'User created successfully') {
        toast.success('Registrasi berhasil! Silakan login', {
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
        setError(response.message || 'Registration failed');
        toast.error(response.message || 'Registrasi gagal!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (err) {
      setError('An error occurred during registration');
      toast.error('Terjadi kesalahan saat registrasi!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <ToastContainer />
      {/* Logo */}
      <div className="logo-container">
        <img src="/logo.png" alt="Logo"/>
      </div>

      {/* Form card */}
      <div className="register-card">
        <h2>Create your account</h2>
        <p>Join Autolearn and start chatting with our AI assistant</p>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>Full Name</label>
          <input name="name" type="text" placeholder="Enter your full name" value={form.name} onChange={handleChange} required />
          <label>Email address</label>
          <input name="email" type="email" placeholder="Enter your email" value={form.email} onChange={handleChange} required />
          <label>Password</label>
          <input name="password" type="password" placeholder="Create a password" value={form.password} onChange={handleChange} required />
          <label>Confirm Password</label>
          <input name="confirmPassword" type="password" placeholder="Confirm your password" value={form.confirmPassword} onChange={handleChange} required />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Create Account'}
          </button>
        </form>
        <p className="signin-link">Already have an account? <a href="#" onClick={() => navigate('/login')}>Sign in</a></p>
      </div>
    </div>
  );
};

export default RegisterForm;