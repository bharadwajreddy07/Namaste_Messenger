import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();

  // Load initial messages
  useEffect(() => {
    if (user) {
      loadMessages();
    }
  }, [user]);

  // Listen for new messages from socket
  useEffect(() => {
    if (socket) {
      socket.on('newMessage', (message) => {
        // Add message only if it doesn't already exist (prevent duplicates)
        setMessages(prev => {
          const exists = prev.find(msg => 
            (msg.id === message.id || msg.msgId === message.msgId) ||
            (msg.content === message.content && 
             msg.senderId === message.senderId && 
             Math.abs(new Date(msg.timestamp || msg.createdAt) - new Date(message.timestamp || message.createdAt)) < 5000)
          );
          if (exists) {
            console.log('Duplicate message blocked:', message);
            return prev; // Don't add duplicate
          }
          return [...prev, message];
        });
      });

      socket.on('messageDelivered', (data) => {
        // Message delivered confirmation (not needed for display)
        console.log('Message delivered:', data);
      });

      return () => {
        socket.off('newMessage');
        socket.off('messageDelivered');
      };
    }
  }, [socket]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/messages/history');
      if (response.data.success) {
        setMessages(response.data.messages || []);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (messageData) => {
    if (!messageData.content?.trim()) return;

    try {
      // Send ONLY via socket for real-time delivery
      if (socket && isConnected) {
        socket.emit('newMessage', {
          content: messageData.content.trim(),
          recipientId: messageData.recipientId,
          type: messageData.type || 'general'
        });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message');
    }
  };

  const retryMessage = async (message) => {
    if (message.tempId) {
      // Update status to sending
      setMessages(prev =>
        prev.map(msg =>
          msg.tempId === message.tempId
            ? { ...msg, status: 'sending', error: null }
            : msg
        )
      );

      // Retry sending
      await sendMessage(message.content, message.recipientId);
    }
  };

  const deleteMessage = (messageId) => {
    setMessages(prev => prev.filter(msg => 
      msg.id !== messageId && msg.tempId !== messageId
    ));
  };

  const markAsRead = async (messageId) => {
    try {
      await axios.post(`/messages/read/${messageId}`);
      
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId
            ? { ...msg, read: true }
            : msg
        )
      );
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const getMessagesForUser = (userId) => {
    return messages.filter(msg =>
      (msg.senderId === userId && msg.recipientId === user.id) ||
      (msg.senderId === user.id && msg.recipientId === userId)
    ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  };

  const getGeneralMessages = () => {
    return messages.filter(msg => !msg.recipientId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  };

  const addDemoMessage = (message) => {
    setMessages(prev => [...prev, message]);
  };

  const value = {
    messages,
    loading,
    error,
    sendMessage,
    retryMessage,
    deleteMessage,
    markAsRead,
    clearMessages,
    loadMessages,
    getMessagesForUser,
    getGeneralMessages,
    addDemoMessage,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};