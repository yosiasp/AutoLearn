import React, { useState, useEffect } from 'react';
import './RegisterForm.css';
import { register } from './services/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { checkToken } from './services/api'; 

const RegisterForm = () => {
  // Title
  useEffect(() => {
    document.title = "Register";

    const params = new URLSearchParams(window.location.search);
    const name = params.get('name');
    const email = params.get('email');

    if (name || email) {
      setForm((prev) => ({
        ...prev,
        name: name || '',
        email: email || '',
      }));
      setGoogleLoginUsed(true); 
    }

    // Checking for google authentication error parameter
    const error = params.get("error");
    if (error === "google_auth_failed") {
      toast.error("Google authentication failed. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
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
  }, );


  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoginUsed, setGoogleLoginUsed] = useState(false);

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
        toast.success('Account created successfully', {
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
        toast.error(response.message || 'Registration failed', {
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
      toast.error('An error occurred during registration', {
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
      <div className="register-card">
        <h2>Create your account</h2>
        <p>Join Autolearn and start chatting with our AI assistant</p>
        {!googleLoginUsed && (
          <>
            <div className="login-method-icon">
              <div
                className="google-icon-wrapper"
                onClick={() => window.location.href = 'http://localhost:8000/auth/google'}
                style={{ cursor: 'pointer' }}
              >
                <img src="/google-icon.png" alt="Google Login" />
              </div>
            </div>
            <div className="separator">
              <span>or</span>
            </div>
          </>
        )}
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>Full Name</label>
          <input name="name" type="text" placeholder="Enter your full name" value={form.name} onChange={handleChange} required />
          <label>Username</label>
          <input name="username" type="text" placeholder="Enter your desired username" value={form.username} onChange={handleChange} required />
          <label>Email Address</label>
          <input name="email" type="email" placeholder="Enter your email" value={form.email} onChange={handleChange} required />
          <label>Password</label>
          <label style={{ display: 'none' }}>Confirm Password</label>
          <div className="password-row">
            <input
              name="password"
              type="password"
              placeholder="Create a password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

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