import React, { useEffect, useState, useRef } from 'react';
import { logout } from './services/api';
import './Home.css';

const Home = () => {
  // Title
  useEffect(() => {
    document.title = "Home";
  }, []);
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const [currentChatId, setCurrentChatId] = useState(null);
  const [history, setHistory] = useState([]);
  const [chatList, setChatList] = useState([]);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user._id) {
      fetchChatList();
    }
  }, [user._id]);

  const fetchChatList = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/${user._id}/ollama/chats`, {
        credentials: 'include'
      });
      const data = await res.json();
      setChatList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching chat list:', err);
      setChatList([]);
    }
  };

  const fetchHistory = async (chatId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/${user._id}/ollama/history/${chatId}`, {
        credentials: 'include'
      });
      const data = await res.json();
      const formattedHistory = Array.isArray(data) ? data.filter(item => item && typeof item === 'object').map(item => ({
        message: item.message || '',
        timestamp: item.timestamp || new Date(),
        isUser: item.isUser || false,
        status: item.status || 'sent',
        file: item.file || null
      })) : [];
      setHistory(formattedHistory);
    } catch (err) {
      console.error('Error fetching history:', err);
      setHistory([]);
    }
  };

  const handleNewChat = () => {
    const newChatId = `chat_${Date.now()}_${user._id}`; // Generate a unique chatId with user ID
    setCurrentChatId(newChatId);
    setHistory([]);
    setMessage("");
    setFile(null);
    setFilePreview(null);
    // Add the new chat to the chat list immediately
    setChatList(prev => [{
      _id: newChatId,
      title: 'New Chat',
      createdAt: new Date(),
      lastMessage: ''
    }, ...prev]);
  };

  const handleSelectChat = async (chatId) => {
    setCurrentChatId(chatId);
    await fetchHistory(chatId);
  };

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

    // Add temporary message to history
    setHistory(prev => [...prev, tempMessage]);

    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      }
      formData.append('message', message);
      
      // Use existing chatId or generate new one
      const chatIdToUse = currentChatId || `chat_${Date.now()}_${user._id}`;
      formData.append('chatId', chatIdToUse);

      const res = await fetch(`http://localhost:8000/api/${user._id}/ollama/chat`, {
        method: "POST",
        body: formData,
        credentials: 'include',
      });

      const data = await res.json();
      
      // Update currentChatId if it's a new chat
      if (data.chatId && !currentChatId) {
        setCurrentChatId(data.chatId);
        // Update chat list with the new chat
        setChatList(prev => [{
          _id: data.chatId,
          title: message.substring(0, 30) + (message.length > 30 ? '...' : ''),
          createdAt: new Date(),
          lastMessage: message
        }, ...prev]);
      } else {
        // Update existing chat in the list
        setChatList(prev => prev.map(chat => 
          chat._id === currentChatId 
            ? { ...chat, lastMessage: message }
            : chat
        ));
      }
      
      // Update the temporary message status and add AI response
      setHistory(prev => prev.map(msg => 
        msg === tempMessage ? { ...msg, status: 'sent' } : msg
      ).concat(data.aiResponse));

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

  const handleLogout = async () => {
    localStorage.removeItem('user');
    try {
      await logout();
      window.location.href = '/login';
    } catch(err) {
      alert("Logout error")
    }
  };

  const handleSettings = async () => {
    try {
      window.location.href = '/settings';
    } catch(err) {
      alert("An error occured")
    }
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
        <div className="logo">
          <img src="/logo.png" alt="Logo"/>
        </div>
        <button className="new-chat-btn" onClick={handleNewChat}>New Chat</button>
        <div className="chat-list">
          {Array.isArray(chatList) && chatList.map((chat) => (
            <div 
              key={chat._id} 
              className={`chat-item ${currentChatId === chat._id ? 'active' : ''}`}
              onClick={() => handleSelectChat(chat._id)}
            >
              <div className="chat-item-title">
                {chat.title || chat.lastMessage || 'New Chat'}
              </div>
              <div className="chat-item-date">
                {new Date(chat.createdAt).toLocaleDateString()} {new Date(chat.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      </aside>
      <main className="main-chat">
        <header className="chat-header">
          <span>Current Chat</span>
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
                <div className="dropdown-item" onClick={handleSettings}>
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path fill="currentColor" d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" />
                  </svg>
                  <span>Settings</span>
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
        <section className="chat-body">
          {history.length === 0 ? (
            <div className="chat-empty">
              <p>No messages yet</p>
              <p>Start a conversation with AutoLearn AI</p>
            </div>
          ) : (
            <div className="chat-history">
              {history.map((item, idx) => (
                item && (
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
                )
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
                accept=".docx, application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf,.txt"
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