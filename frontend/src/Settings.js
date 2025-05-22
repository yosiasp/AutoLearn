import React, { useEffect, useState, useRef } from 'react';
import { logout, updateUser } from './services/api';
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
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('basic'); // default menu
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

    try {
      const response = await updateUser({ name, username });

      if (response.success) {
        localStorage.setItem('user', JSON.stringify(response.user));
        alert("Basic info updated successfully.");
      } else {
        alert("Failed to update user");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while updating");
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
          <button type="submit">Save</button>
        </form>
      );
      case 'account':
        return (
          <form className="form-settings">
            <h2>Account Info</h2>
            <label>
              Email:
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label>
              Password:
              <input type="text" value={''} onChange={(e) => setName(e.target.value)} />
            </label>
            <button type="submit">Update</button>
          </form>
        );
      case 'delete':
        return (
          <div className="form-settings">
            <h2>Delete Account</h2>
            <p id ="deleteWarning">Warning: This action cannot be undone. All your data will be permanently deleted.</p>
            <button className="delete-btn">Delete My Account</button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="settings-root">
      <aside className="sidebar">
        <div className="logo">
          <img src="/logo.png" alt="Logo"/>
        </div>
        <button className={`sidebar-btn ${selectedMenu === 'basic' ? 'active' : ''}`} onClick={() => setSelectedMenu('basic')}>Basic Info</button>
        <button className={`sidebar-btn ${selectedMenu === 'account' ? 'active' : ''}`} onClick={() => setSelectedMenu('account')}>Account Info</button>
        <button className={`sidebar-btn ${selectedMenu === 'delete' ? 'active' : ''}`} onClick={() => setSelectedMenu('delete')}>Delete Account</button>
      </aside>
      <main className="main-content">
        <header className="content-header">
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