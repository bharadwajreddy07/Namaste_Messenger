import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { useChat } from '../contexts/ChatContext';

const Chat = () => {
  const { user, logout } = useAuth();
  const { socket, isConnected, onlineUsers } = useSocket();
  const { messages: contextMessages, sendMessage, loadMessages } = useChat();
  const [localMessages, setLocalMessages] = useState([]);
  
  const messages = [...contextMessages, ...localMessages].sort((a, b) => 
    new Date(a.timestamp || a.createdAt) - new Date(b.timestamp || b.createdAt)
  );
  
  const [activeChat, setActiveChat] = useState('general');
  useEffect(() => {
    if (!activeChat.startsWith('demo-') && activeChat !== 'general') {
      setLocalMessages([]);
    }
  }, [activeChat]);
  const [messageInput, setMessageInput] = useState('');
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const quickEmojis = ['😀', '😂', '😊', '😍', '🤔', '👍', '❤️', '🎉', '🔥', '💯', '😎', '🚀', '✨', '💪', '🎯'];

  const filteredMessages = messages.filter(message => {
    if (activeChat === 'general') {
      return message.type === 'general' || !message.recipientId;
    } else if (activeChat.startsWith('demo-')) {
      return (
        (message.senderId === user?.id && message.recipientId === activeChat) ||
        (message.senderId === activeChat && message.recipientId === user?.id)
      );
    } else {
      return (
        (message.senderId === user?.id && message.recipientId === activeChat) ||
        (message.senderId === activeChat && message.recipientId === user?.id)
      );
    }
  });

  useEffect(() => {
    scrollToBottom();
  }, [filteredMessages]);
  useEffect(() => {
    if (socket) {
      socket.on('userTyping', ({ userId, username, isTyping, chatType, chatId }) => {
        if (chatType === 'general' && activeChat === 'general') {
          setTypingUsers(prev => {
            if (isTyping) {
              return prev.includes(username) ? prev : [...prev, username];
            } else {
              return prev.filter(name => name !== username);
            }
          });
        } else if (chatType === 'direct' && chatId === activeChat) {
          setTypingUsers(prev => {
            if (isTyping) {
              return prev.includes(username) ? prev : [...prev, username];
            } else {
              return prev.filter(name => name !== username);
            }
          });
        }
      });

      return () => {
        socket.off('userTyping');
      };
    }
  }, [socket, activeChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    let recipientId = null;
    let type = 'general';

    if (activeChat !== 'general') {
      // Check if it's a demo user or real user
      if (activeChat.startsWith('demo-')) {
        // For demo users, add message locally and simulate reply
        const demoUsername = activeChat.replace('demo-', '');
        const demoMessage = {
          id: `demo-${Date.now()}`,
          content: messageInput,
          senderId: user.id,
          senderUsername: user.username,
          recipientId: activeChat,
          type: 'direct',
          timestamp: new Date().toISOString(),
          isDemoMessage: true,
          replyTo: replyToMessage ? {
            id: replyToMessage.id,
            content: replyToMessage.content,
            senderUsername: replyToMessage.senderUsername
          } : null
        };
        
        // Add demo message locally (check for duplicates)
        setLocalMessages(prev => {
          const exists = prev.find(msg => 
            msg.id === demoMessage.id ||
            (msg.content === demoMessage.content && 
             msg.senderId === demoMessage.senderId &&
             Math.abs(new Date(msg.timestamp) - new Date(demoMessage.timestamp)) < 1000)
          );
          if (exists) {
            return prev;
          }
          return [...prev, demoMessage];
        });
        setMessageInput('');
        setReplyToMessage(null);
        stopTyping();
        
        // Bot messages removed - now only human-to-human chat
        
        return;
      } else {
        // Real user message
        recipientId = activeChat;
        type = 'direct';
      }
    }

    const messageData = {
      content: messageInput,
      type: type,
      recipientId: recipientId,
      replyTo: replyToMessage ? {
        id: replyToMessage.id,
        content: replyToMessage.content,
        senderUsername: replyToMessage.senderUsername
      } : null
    };

    try {
      await sendMessage(messageData);
      setMessageInput('');
      setReplyToMessage(null);
      stopTyping();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleTyping = (e) => {
    setMessageInput(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      emitTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing after 2 seconds
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  };

  const stopTyping = () => {
    setIsTyping(false);
    emitTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const handleEmojiSelect = (emoji) => {
    setMessageInput(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const emitTyping = (typing) => {
    if (socket && user) {
      socket.emit('typing', {
        isTyping: typing,
        chatType: activeChat === 'general' ? 'general' : 'direct',
        chatId: activeChat === 'general' ? null : activeChat
      });
    }
  };

  // When selecting a member, set active chat and collapse sidebar to give more room
  const handleSelectMember = (id) => {
    if (activeChat === id) {
      // toggle collapse when clicking the same member again
      setSidebarCollapsed(prev => !prev);
    } else {
      setActiveChat(id);
      // collapse sidebar to show larger chat area
      setSidebarCollapsed(true);
    }
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return new Date().toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getActiveUserInfo = () => {
    if (activeChat === 'general') {
      const realOnlineCount = onlineUsers.length;
      return { name: 'General Chat', status: realOnlineCount > 0 ? `${realOnlineCount} online` : 'No users online' };
    } else if (activeChat.startsWith('demo-')) {
      const demoUsername = activeChat.replace('demo-', '');
      return { name: demoUsername, status: '' }; // No status for demo users
    } else {
      const user = onlineUsers.find(u => u.id === activeChat);
      if (user) {
        return { name: user.username, status: 'Online' };
      }
      return { name: 'User', status: 'Offline' };
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
          <span className="navbar-brand">
            <i className="bi bi-chat-dots-fill me-2"></i>
            Namaste Messenger
          </span>
          
          <div className="d-flex align-items-center text-white">
            <div className="me-3 d-flex align-items-center">
              <div className={`me-2 rounded-circle ${isConnected ? 'bg-success' : 'bg-danger'}`} 
                   style={{width: '8px', height: '8px'}}></div>
              <small>{isConnected ? 'Connected' : 'Disconnected'}</small>
            </div>
            <span className="me-3">
              <i className="bi bi-person-circle me-1"></i>
              {user?.username || 'User'}
            </span>
            <button 
              className="btn btn-outline-light btn-sm"
              onClick={logout}
            >
              <i className="bi bi-box-arrow-right me-1"></i>
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Chat Area */}
      <div className="container-fluid p-0" style={{height: 'calc(100vh - 56px)'}}>
        <div className="d-flex h-100">
          {/* Sidebar */}
          <div className={`${sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-normal'} bg-white border-end p-0 d-flex flex-column`}>
            {/* General Chat */}
            <div className="p-3 border-bottom">
              <h6 className="mb-2 text-muted">Channels</h6>
              <div 
                className={`list-group-item list-group-item-action cursor-pointer ${activeChat === 'general' ? 'active' : ''}`}
                onClick={() => setActiveChat('general')}
              >
                <div className="d-flex align-items-center">
                  <i className="bi bi-hash me-2"></i>
                  <span>General</span>
                </div>
              </div>
            </div>

            {/* Online Users / Direct Messages */}
            <div className="flex-grow-1 overflow-auto chat-sidebar-scroll">
              <div className="p-3 border-bottom">
                <h6 className="mb-2 text-muted">Direct Messages</h6>
              </div>
              <div className="list-group list-group-flush">
                {/* Real Online Users */}
                {onlineUsers.filter(u => u.id !== user?.id).map(onlineUser => (
                  <div 
                    key={onlineUser.id}
                    className={`list-group-item list-group-item-action cursor-pointer py-3 px-4 ${activeChat === onlineUser.id ? 'active' : ''}`}
                    onClick={() => handleSelectMember(onlineUser.id)}
                  >
                    <div className="d-flex align-items-center">
                      <div className="position-relative me-3">
                        <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white" 
                             style={{width: '40px', height: '40px', fontSize: '16px'}}>
                          {onlineUser.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="position-absolute bg-success rounded-circle border border-white" 
                             style={{width: '12px', height: '12px', bottom: '-2px', right: '-2px'}}></div>
                      </div>
                      <div>
                        <div className="fw-medium fs-6">{onlineUser.username}</div>
                        <small className="text-success">Online</small>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Demo Users - Normal Display */}
                {['Charan', 'Srishanth', 'Nikhil', 'Arjun', 'Hari', 'Priya', 'Rohan', 'Kavya', 'Aditya', 'Sneha', 'Rahul', 'Divya', 'Karthik', 'Ananya', 'Vijay']
                  .filter(demoUser => demoUser !== user?.username)
                  .filter(demoUser => !onlineUsers.some(onlineUser => onlineUser.username === demoUser))
                  .map(demoUser => (
                  <div 
                    key={`demo-${demoUser}`}
                    className={`list-group-item list-group-item-action cursor-pointer py-3 px-4 ${activeChat === `demo-${demoUser}` ? 'active' : ''}`}
                    onClick={() => handleSelectMember(`demo-${demoUser}`)}
                  >
                    <div className="d-flex align-items-center">
                      <div className="me-3">
                        <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white" 
                             style={{width: '40px', height: '40px', fontSize: '16px'}}>
                          {demoUser.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <div className="fw-medium fs-6">{demoUser}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-grow-1 d-flex flex-column p-0">
            {/* Chat Header */}
            <div className="bg-white border-bottom p-3">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <div className="me-3">
                    {activeChat === 'general' ? (
                      <i className="bi bi-hash fs-4 text-primary"></i>
                    ) : (
                      <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white" 
                           style={{width: '40px', height: '40px'}}>
                        {getActiveUserInfo().name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h5 className="mb-0">{getActiveUserInfo().name}</h5>
                    {getActiveUserInfo().status && (
                      <small className="text-muted">{getActiveUserInfo().status}</small>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-grow-1 overflow-auto p-3 chat-messages-scroll" style={{maxHeight: 'calc(100vh - 200px)'}}>
              <div className="d-flex flex-column">
                {filteredMessages.map((message, index) => {
                  const isOwnMessage = message.senderId === user?.id;
                  const senderName = message.senderUsername || 'Unknown';
                  
                  return (
                    <div key={message.id || message.msgId || index} className={`mb-3 d-flex ${isOwnMessage ? 'justify-content-end' : 'justify-content-start'}`}>
                      <div className={`max-width-75 position-relative ${isOwnMessage ? 'text-end' : 'text-start'} message-container`}>
                        {!isOwnMessage && (
                          <div className="small text-muted mb-1">
                            <strong>{senderName}</strong>
                          </div>
                        )}
                        
                        {/* Reply indicator - WhatsApp style */}
                        {message.replyTo && (
                          <div className="reply-indicator mb-2 p-2 rounded-2 bg-white border">
                            <div className="d-flex align-items-center">
                              <i className="bi bi-reply me-1 text-secondary" style={{fontSize: '0.75rem'}}></i>
                              <strong className="text-secondary" style={{fontSize: '0.75rem'}}>
                                {message.replyTo.senderUsername}
                              </strong>
                            </div>
                            <div className="text-muted text-truncate mt-1" style={{maxWidth: '200px', fontSize: '0.8rem'}}>
                              {message.replyTo.content}
                            </div>
                          </div>
                        )}
                        
                        <div className={`rounded-3 p-2 d-inline-block message-bubble ${
                          isOwnMessage 
                            ? 'bg-primary text-white' 
                            : 'bg-light border'
                        }`}>
                          <div>{message.content}</div>
                          <div className={`small mt-1 ${isOwnMessage ? 'text-light' : 'text-muted'}`}>
                            {formatMessageTime(message.createdAt || message.timestamp)}
                          </div>
                        </div>
                        
                        {/* Reply button - larger size */}
                        <div className="d-flex align-items-center mt-2">
                          <button
                            className="btn btn-light border me-2 reply-btn-visible-large"
                            onClick={() => setReplyToMessage(message)}
                            title="Reply to this message"
                            style={{
                              fontSize: '1rem',
                              padding: '8px 16px',
                              borderRadius: '20px',
                              opacity: 0.9,
                              transition: 'all 0.3s ease',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                              backgroundColor: 'white',
                              color: '#6c757d',
                              borderColor: '#dee2e6'
                            }}
                          >
                            <i className="bi bi-reply me-2" style={{fontSize: '1rem'}}></i>
                            <span style={{fontSize: '0.9rem', fontWeight: '500'}}>Reply</span>
                          </button>
                          
                          {/* Hidden hover button for better positioning */}
                          <button
                            className={`btn btn-sm btn-outline-secondary reply-btn position-absolute d-none ${
                              isOwnMessage ? 'reply-btn-right' : 'reply-btn-left'
                            }`}
                            onClick={() => setReplyToMessage(message)}
                            title="Reply to this message"
                            style={{
                              opacity: 0,
                              transition: 'opacity 0.2s ease',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              zIndex: 10
                            }}
                          >
                            <i className="bi bi-reply"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Typing Indicator */}
                {typingUsers.length > 0 && (
                  <div className="mb-3">
                    <div className="text-muted small">
                      <i>{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</i>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input Area */}
            <div className="border-top bg-white p-3">
              {/* Reply Preview */}
              {replyToMessage && (
                <div className="mb-3 p-3 bg-white border border-secondary rounded shadow-sm">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="text-muted mb-2" style={{fontSize: '0.9rem'}}>
                        <i className="bi bi-reply me-2" style={{fontSize: '1rem'}}></i>
                        Replying to <strong className="text-secondary">{replyToMessage.senderUsername}</strong>
                      </div>
                      <div className="text-truncate" style={{maxWidth: '400px', fontSize: '0.95rem'}}>
                        {replyToMessage.content}
                      </div>
                    </div>
                    <button 
                      type="button"
                      className="btn btn-outline-danger ms-3"
                      onClick={() => setReplyToMessage(null)}
                      title="Cancel reply"
                      style={{padding: '6px 12px'}}
                    >
                      <i className="bi bi-x" style={{fontSize: '1.1rem'}}></i>
                    </button>
                  </div>
                </div>
              )}
              
              {showEmojiPicker && (
                <div className="mb-3 p-3 bg-light rounded shadow-sm">
                  <div className="d-flex flex-wrap gap-2">
                    {quickEmojis.map((emoji, index) => (
                      <button
                        key={index}
                        type="button"
                        className="btn btn-outline-light border-0 fs-4 p-1"
                        onClick={() => handleEmojiSelect(emoji)}
                        style={{
                          fontSize: '1.2rem',
                          width: '40px',
                          height: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '8px'
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSendMessage}>
                <div className="input-group">
                  <button 
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    title="Add emoji"
                  >
                    <i className="bi bi-emoji-smile"></i>
                  </button>
                  
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder={
                      replyToMessage 
                        ? `Reply to ${replyToMessage.senderUsername}...`
                        : `Message ${activeChat === 'general' ? 'general chat' : getActiveUserInfo().name}...`
                    }
                    value={messageInput}
                    onChange={handleTyping}
                    disabled={!isConnected}
                  />
                  <button 
                    className="btn btn-primary" 
                    type="submit"
                    disabled={!messageInput.trim() || !isConnected}
                  >
                    <i className="bi bi-send-fill"></i>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;