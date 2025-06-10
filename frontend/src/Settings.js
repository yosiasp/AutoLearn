import React, { useEffect, useState, useRef } from 'react';
import { logout, updateBasicInfo, updatePassword, updateEmail, deleteAccount } from './services/api';
import { ToastContainer, toast } from 'react-toastify';
import './Settings.css';

const Settings = () => {
  // Title
  useEffect(() => {
    document.title = "Settings";
  }, []);
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const [name, setName] = useState(user.name || '');
  const [username, setUsername] = useState(user.username || '');
  const [email, setEmail] = useState(user.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('basic'); // default menu
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [, setError] = useState('');
  const dropdownRef = useRef(null);

  const handleReturnHome = async () => {
    try {
      window.location.href = '/home';
    } catch(err) {
      alert("An error occured")
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('user');
    try {
      await logout();
      window.location.href = '/login';
    } catch(err) {
      alert("Logout error")
    }
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };
  
  const handleSaveBasicInfo = async (e) => {
    e.preventDefault();
    const id = user._id;

    try {
      const response = await updateBasicInfo({ id, name, username });
      if (response.message === 'Basic info updated successfully') {
        toast.success('Basic info updated successfully', {
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
      } else {
        setError(response.message || 'Update failed');
        toast.error(response.message || 'Update failed', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while updating");
    }
  };

   const handleUpdateEmail = async (e) => {
    e.preventDefault();
    const id = user._id;
    try {
      const response = await updateEmail({ id, email });

      if (response.message === 'Email updated successfully') {
        toast.success('Email updated successfully', {
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
      } else {
        toast.error(response.message || 'Update failed', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while updating the email");
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    const id = user._id;

    try {
      const response = await updatePassword({ id, currentPassword, newPassword, confirmPassword });
      if (response.message === 'Password updated successfully') {
        // Clear sensitive data
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        toast.success('Password updated successfully', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        setError(response.message || 'Update failed');
        toast.error(response.message || 'Update failed', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while updating password", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const response = await deleteAccount(user._id);
        if (response.message === 'User deleted successfully') {
          localStorage.removeItem('user');
          toast.success('Account deleted successfully', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        }
      } catch (err) {
        console.error(err);
        toast.error(err.message || 'Failed to delete account', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    }
  };

   const selectedContent = () => {
    switch (selectedMenu) {
    case 'basic':
      return (
        <form className="form-settings" onSubmit={handleSaveBasicInfo}>
          <h2>Basic Info</h2>
          <label>
            Full Name:
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            Username:
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
          </label>
          <button type="submit">Update Info</button>
        </form>
      );
    case 'account':
      return (
        <form className="form-settings" onSubmit={handleUpdateEmail}>
          <h2>Account Info</h2>
          <label>
            Email Address:
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}/>
          </label>
          <button type="submit">Update Email</button>
        </form>
      );
    case 'password':
      return (
        <form className="form-settings" onSubmit={handleUpdatePassword}>
          <h2>Change Password</h2>
          <label>
            Current Password:
            <input
              type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </label>
          <label>
            New Password:
            <input
              type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </label>
          <label>
            Confirm Password:
            <input
              type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </label>
          <button type="submit">Update Password</button>
        </form>
      );
      case 'delete':
        return (
          <div className="form-settings">
            <h2>Delete Account</h2>
            <p id="deleteWarning">Warning: This action cannot be undone. All your data will be permanently deleted.</p>
            <button className="delete-btn" onClick={handleDeleteAccount}>Delete My Account</button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="settings-root">
      <ToastContainer />
      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="logo">
          <img src="/logo.png" alt="Logo"/>
        </div>
        <button className={`sidebar-btn ${selectedMenu === 'basic' ? 'active' : ''}`} onClick={() => setSelectedMenu('basic')}>Basic Info</button>
        <button className={`sidebar-btn ${selectedMenu === 'account' ? 'active' : ''}`} onClick={() => setSelectedMenu('account')}>Account Info</button>
        <button className={`sidebar-btn ${selectedMenu === 'password' ? 'active' : ''}`} onClick={() => setSelectedMenu('password')}>Change Password</button>
        <button className={`sidebar-btn ${selectedMenu === 'delete' ? 'active' : ''}`} onClick={() => setSelectedMenu('delete')}>Delete Account</button>
      </aside>
      <main className={`main-content ${isSidebarOpen ? '' : 'full-width'}`}>
        <header className="content-header">
          <button 
            className="toggle-sidebar-btn"
            onClick={() => setIsSidebarOpen(prev => !prev)}
            aria-label="Toggle sidebar"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              {isSidebarOpen ? (
                <>
                  <path d="M18 17L13 12L18 7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M11 17L6 12L11 7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </>
              ) : (
                <>
                  <path d="M6 17L11 12L6 7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M13 17L18 12L13 7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </>
              )}
            </svg>
          </button>
          <span>{selectedMenu === 'basic' ? 'Basic Info' : selectedMenu === 'account' ? 'Account Info' : 'Delete Account'}</span> 
          <div className="user-profile" ref={dropdownRef} onClick={toggleDropdown}>
            <div className="user-info">
              <span className="user-avatar">
                {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
              </span>
              <span className="user-name">{user.username || 'Unknown User'}</span>
              <span className="dropdown-arrow">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M7,10L12,15L17,10H7Z" />
                </svg>
              </span>
            </div>
            {showDropdown && (
              <div className="dropdown-menu">
                <div className="dropdown-item" onClick={handleReturnHome}>
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path fill="currentColor" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                  </svg>
                  <span>Home</span>
                </div>
                <div className="dropdown-item" onClick={handleLogout}>
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path fill="currentColor" d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z" />
                  </svg>
                  <span>Logout</span>
                </div>
              </div>
            )}
          </div>
        </header>
        <section className="content-body">
          {selectedContent()}
        </section>
      </main>
    </div>
  );
};

export default Settings;