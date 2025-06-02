import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const API_URL = 'http://localhost:8000/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAuth = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/checkToken`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setAdminData(response.data.admin);
      setError(null);
    } catch (error) {
      setError('Authentication failed. Please login again.');
      localStorage.removeItem('admin');
      navigate('/admin/login');
    }
  }, [navigate]);

  const fetchAdmins = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/all`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setAdmins(response.data.admins);
      setError(null);
    } catch (error) {
      setError('Failed to fetch admin list');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const admin = localStorage.getItem('admin');
    if (!admin) {
      console.log('No admin data in localStorage, redirecting to login...'); // Debug log
      navigate('/admin/login');
      return;
    }
    checkAuth();
    fetchAdmins();
  }, [checkAuth, fetchAdmins, navigate]);

  const handleLogout = async () => {
    try {
      console.log('Logging out...'); // Debug log
      await axios.post(`${API_URL}/admin/logout`, {}, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      localStorage.removeItem('admin');
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error.response || error); // Debug log
      setError('Logout failed. Please try again.');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>AutoLearn</h2>
        </div>
        <div className="sidebar-menu">
          <div className="menu-item">
            <i className="fas fa-home"></i>
            Dashboard
          </div>
          <div className="menu-item">
            <i className="fas fa-users"></i>
            Admins
          </div>
          <div className="menu-item">
            <i className="fas fa-cog"></i>
            Settings
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="dashboard-header">
          <div className="welcome-text">
            Welcome, {adminData?.name || 'Admin'}
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="stats-container">
          <div className="stat-card">
            <h3>Total Admins</h3>
            <p>{admins.length}</p>
          </div>
          <div className="stat-card">
            <h3>Active Users</h3>
            <p>0</p>
          </div>
          <div className="stat-card">
            <h3>Total Courses</h3>
            <p>0</p>
          </div>
        </div>

        <div className="table-container">
          <h2>Admin List</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin._id}>
                  <td>{admin.name}</td>
                  <td>{admin.username}</td>
                  <td>{admin.email}</td>
                  <td>{admin.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
