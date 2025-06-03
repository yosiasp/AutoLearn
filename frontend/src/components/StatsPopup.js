import React, { useState } from 'react';
import Swal from 'sweetalert2';
import './StatsPopup.css';

const StatsPopup = ({ isOpen, onClose, type, data, onDelete, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    username: '',
    email: ''
  });

  if (!isOpen) return null;

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      username: user.username,
      email: user.email
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await onEdit(editingUser._id, editForm);
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'User updated successfully',
        timer: 2000,
        showConfirmButton: false
      });
      setEditingUser(null);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to update user',
        confirmButtonColor: '#3085d6'
      });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await onDelete(id);
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'User has been deleted.',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to delete user',
          confirmButtonColor: '#3085d6'
        });
      }
    }
  };

  const filteredData = data.filter(item => {
    if (type === 'users') {
      return item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
             item.email.toLowerCase().includes(searchTerm.toLowerCase());
    } else if (type === 'chats') {
      return item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
             item.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const renderContent = () => {
    switch (type) {
      case 'users':
        return (
          <div className="stats-content">
            <h3>User Management</h3>
            <div className="search-bar">
              <input 
                type="text" 
                placeholder="Search users..." 
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            {editingUser ? (
              <form onSubmit={handleEditSubmit} className="edit-form">
                <div className="form-group">
                  <label>Name:</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Username:</label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="action-btn edit">Save</button>
                  <button 
                    type="button" 
                    className="action-btn delete"
                    onClick={() => setEditingUser(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>
                        <button 
                          className="action-btn edit"
                          onClick={() => handleEdit(user)}
                        >
                          Edit
                        </button>
                        <button 
                          className="action-btn delete"
                          onClick={() => handleDelete(user._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );
      case 'courses':
        return (
          <div className="stats-content">
            <h3>Course Management</h3>
            <div className="search-bar">
              <input type="text" placeholder="Search courses..." />
            </div>
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((course) => (
                  <tr key={course._id}>
                    <td>{course.title}</td>
                    <td>{course.description}</td>
                    <td>{course.status}</td>
                    <td>
                      <button className="action-btn edit">Edit</button>
                      <button className="action-btn delete">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'chats':
        return (
          <div className="stats-content">
            <h3>Chat Management</h3>
            <div className="search-bar">
              <input 
                type="text" 
                placeholder="Search chats..." 
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Last Message</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((chat) => (
                  <tr key={chat._id}>
                    <td>{chat.username}</td>
                    <td>{chat.lastMessage}</td>
                    <td>{new Date(chat.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="action-btn view">View</button>
                      <button 
                        className="action-btn delete"
                        onClick={() => handleDelete(chat._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="stats-popup-overlay">
      <div className="stats-popup-content">
        <div className="stats-popup-header">
          <h2>{type === 'users' ? 'User Management' : 
               type === 'courses' ? 'Course Management' : 
               'Chat Management'}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default StatsPopup; 