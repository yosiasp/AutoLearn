import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAdminToken, logoutAdmin, createAdmin } from './services/api';
import AddAdminPopup from './components/AddAdminPopup';
import StatsPopup from './components/StatsPopup';
import './Dashboard.css';

const API_URL = 'http://localhost:8000/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isStatsPopupOpen, setIsStatsPopupOpen] = useState(false);
  const [statsType, setStatsType] = useState(null);

  const checkAuth = useCallback(async () => {
    try {
      const response = await checkAdminToken();
      setAdminData(response.admin);
      setError(null);
    } catch (error) {
      setError('Authentication failed. Please login again.');
      localStorage.removeItem('admin');
      navigate('/admin/login');
    }
  }, [navigate]);

  const fetchAdmins = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/admin/all`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch admins');
      }
      setAdmins(data.admins);
      setError(null);
    } catch (error) {
      setError('Failed to fetch admin list');
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch users');
      }
      setUsers(data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  }, []);

  const fetchChats = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/chats`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch chats');
      }
      setChats(data.chats);
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    }
  }, []);

  useEffect(() => {
    const admin = localStorage.getItem('admin');
    if (!admin) {
      navigate('/admin/login');
      return;
    }
    checkAuth();
    fetchAdmins();
    fetchUsers();
    fetchChats();
    setLoading(false);
  }, [checkAuth, fetchAdmins, fetchUsers, fetchChats, navigate]);

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      localStorage.removeItem('admin');
      navigate('/admin/login');
    } catch (error) {
      setError('Logout failed. Please try again.');
    }
  };

  const handleCreateAdmin = async (adminData) => {
    try {
      await createAdmin(adminData);
      await fetchAdmins();
      setIsPopupOpen(false);
    } catch (error) {
      throw error;
    }
  };

  const handleStatsClick = (type) => {
    setStatsType(type);
    setIsStatsPopupOpen(true);
  };

  const getStatsData = () => {
    switch (statsType) {
      case 'users':
        return users;
      case 'chats':
        return chats;
      default:
        return [];
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      // Refresh user list
      await fetchUsers();
    } catch (error) {
      console.error('Delete user error:', error);
      setError('Failed to delete user');
    }
  };

  const handleEditUser = async (userId, userData) => {
    try {
      const response = await fetch(`${API_URL}/update/${userId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      // Refresh user list
      await fetchUsers();
    } catch (error) {
      console.error('Update user error:', error);
      setError('Failed to update user');
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
          <div className="stat-card" onClick={() => handleStatsClick('users')}>
            <h3>Total Users</h3>
            <p>{users.length}</p>
          </div>
          <div className="stat-card" onClick={() => handleStatsClick('chats')}>
            <h3>Total Chats</h3>
            <p>{chats.length}</p>
          </div>
          <div className="stat-card">
            <h3>Total Admins</h3>
            <p>{admins.length}</p>
          </div>
        </div>

        <div className="table-container">
          <div className="table-header">
            <h2>Admin List</h2>
            {adminData?.role === 'super_admin' && (
              <button 
                className="add-admin-btn"
                onClick={() => setIsPopupOpen(true)}
              >
                Add New Admin
              </button>
            )}
          </div>
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

      <AddAdminPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onSubmit={handleCreateAdmin}
      />

      <StatsPopup
        isOpen={isStatsPopupOpen}
        onClose={() => setIsStatsPopupOpen(false)}
        type={statsType}
        data={getStatsData()}
        onDelete={handleDeleteUser}
        onEdit={handleEditUser}
      />
    </div>
  );
};

export default Dashboard;
