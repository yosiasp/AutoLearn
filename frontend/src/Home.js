import React, { useEffect, useState, useRef } from 'react';
import './Home.css';

const Home = () => {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user._id) {
      fetch(`http://localhost:3000/api/${user._id}/ollama/history`)
        .then(res => res.json())
        .then(data => setHistory(data.history || []))
        .catch(err => setHistory([]));
    }
  }, [user._id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Create preview for image files
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setFilePreview(reader.result);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleSend = async () => {
    if (!message.trim() && !file) return;
    setIsSending(true);

    const tempMessage = {
      message: message || (file ? `[File: ${file.name}]` : ''),
      timestamp: new Date(),
      isUser: true,
      status: 'sending',
      file: file ? {
        name: file.name,
        type: file.type,
        preview: filePreview
      } : null
    };
    setHistory(prev => [...prev, tempMessage]);

    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      }
      formData.append('message', message);

      const res = await fetch(`http://localhost:3000/api/${user._id}/ollama/chat`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      
      // Update the message status
      setHistory(prev => prev.map(msg => 
        msg === tempMessage ? { ...msg, status: 'sent' } : msg
      ));

      // Add the response
      setHistory(prev => [...prev, {
        message: data.response,
        timestamp: new Date(),
        isUser: false,
        status: 'sent'
      }]);

      setMessage("");
      setFile(null);
      setFilePreview(null);
    } catch (err) {
      // Update the message status to error
      setHistory(prev => prev.map(msg => 
        msg === tempMessage ? { ...msg, status: 'error' } : msg
      ));
      alert("Gagal mengirim pesan");
    } finally {
      setIsSending(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const renderFilePreview = (file) => {
    if (!file) return null;
    
    if (file.type.startsWith('image/')) {
      return (
        <div className="file-preview">
          <img src={file.preview} alt={file.name} />
        </div>
      );
    }
    
    return (
      <div className="file-preview">
        <div className="file-icon">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        </div>
        <span>{file.name}</span>
      </div>
    );
  };

  return (
    <div className="home-root">
      <aside className="sidebar">
        <div className="logo">AutoLearn</div>
        <button className="new-chat-btn">New Chat</button>
      </aside>
      <main className="main-chat">
        <header className="chat-header">
          <span>Current Chat</span>
          <div className="user-profile" ref={dropdownRef} onClick={toggleDropdown}>
            <div className="user-info">
              <span className="user-avatar">
                {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
              </span>
              <span className="user-name">{user.name || 'Unknown User'}</span>
            </div>
            {showDropdown && (
              <div className="dropdown-menu">
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
        <section className="chat-body">
          {history.length === 0 ? (
            <div className="chat-empty">
              <p>No messages yet</p>
              <p>Start a conversation with AutoLearn AI</p>
            </div>
          ) : (
            <div className="chat-history">
              {history.map((item, idx) => (
                <div key={idx} className={`chat-bubble ${item.isUser ? 'user' : 'bot'}`}>
                  {item.file && renderFilePreview(item.file)}
                  <div className="bubble-content">
                    {item.isUser ? (
                      item.message
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: item.message }} />
                    )}
                  </div>
                  <div className="bubble-meta">
                    <span className="bubble-time">{formatTime(item.timestamp)}</span>
                    {item.status === 'sending' && <span className="bubble-status">Sending...</span>}
                    {item.status === 'error' && <span className="bubble-status error">Failed to send</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        <footer className="chat-footer">
          <input
            className="chat-input"
            placeholder="Type your message..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
            disabled={isSending}
          />
          <div className="file-upload-container">
            <label className="file-upload-label">
              <input
                type="file"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
              </svg>
            </label>
            {file && (
              <div className="file-info">
                <span>{file.name}</span>
                <button onClick={() => { setFile(null); setFilePreview(null); }}>×</button>
              </div>
            )}
          </div>
          <button
            className="send-btn"
            onClick={handleSend}
            disabled={isSending || (!message.trim() && !file)}
          >
            {isSending ? '...' : '➤'}
          </button>
        </footer>
      </main>
    </div>
  );
};

export default Home;