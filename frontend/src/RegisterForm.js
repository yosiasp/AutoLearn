import React, { useState } from 'react';
import './RegisterForm.css';
import { register } from './services/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const RegisterForm = () => {
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
      <div className="register-card">
        <div className="logo-container">
          <svg width="86" height="86" viewBox="0 0 86 86" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M51.7984 14.2016C63.3575 25.7607 63.3575 44.4393 51.7984 55.9984C40.2393 67.5575 21.5607 67.5575 10.0016 55.9984C-1.55755 44.4393 -1.55755 25.7607 10.0016 14.2016C21.5607 2.64245 40.2393 2.64245 51.7984 14.2016Z" fill="#FF5C00"/>
            <path d="M75.9984 14.2016C87.5575 25.7607 87.5575 44.4393 75.9984 55.9984C64.4393 67.5575 45.7607 67.5575 34.2016 55.9984C22.6424 44.4393 22.6424 25.7607 34.2016 14.2016C45.7607 2.64245 64.4393 2.64245 75.9984 14.2016Z" fill="#9747FF"/>
            <path d="M43 20V50M43 20L35 28M43 20L51 28M30 42.5H56" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
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