import React, { useState, useRef, useEffect } from 'react';
import { 
  PaperAirplaneIcon,
  FaceSmileIcon,
  PhotoIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline';

const MessageInput = ({ 
  onSendMessage, 
  onTyping, 
  disabled = false,
  placeholder = "Type a message..." 
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  // Common emojis for quick access
  const quickEmojis = ['😀', '😂', '😊', '😍', '🤔', '👍', '❤️', '🎉', '🔥', '💯'];

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 120; // Max height for 5 lines approximately
      textarea.style.height = Math.min(scrollHeight, maxHeight) + 'px';
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    // Handle typing indicator
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      onTyping?.(true);
    } else if (!value.trim() && isTyping) {
      setIsTyping(false);
      onTyping?.(false);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    if (value.trim()) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        onTyping?.(false);
      }, 1000);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSendMessage(trimmedMessage);
      setMessage('');
      
      // Stop typing indicator
      setIsTyping(false);
      onTyping?.(false);
      
      // Clear timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleEmojiSelect = (emoji) => {
    const textarea = textareaRef.current;
    const cursorPosition = textarea.selectionStart;
    const newMessage = message.slice(0, cursorPosition) + emoji + message.slice(cursorPosition);
    
    setMessage(newMessage);
    setShowEmojiPicker(false);
    
    // Focus back to textarea and set cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPosition + emoji.length, cursorPosition + emoji.length);
    }, 0);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Handle file upload logic here
      console.log('Files selected:', files);
      // You can implement file upload functionality
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="border-t border-gray-700 bg-chat-input">
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="px-4 py-2 border-b border-gray-700">
          <div className="flex flex-wrap gap-2">
            {quickEmojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleEmojiSelect(emoji)}
                className="text-xl hover:bg-gray-700 rounded p-1 transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex items-end space-x-2">
          {/* File Upload Button */}
          <button
            type="button"
            onClick={openFileDialog}
            disabled={disabled}
            className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PaperClipIcon className="h-5 w-5" />
          </button>

          {/* Photo Upload Button */}
          <button
            type="button"
            onClick={openFileDialog}
            disabled={disabled}
            className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PhotoIcon className="h-5 w-5" />
          </button>

          {/* Message Input Container */}
          <div className="flex-1 relative">
            <div className="flex items-end bg-gray-700 rounded-2xl overflow-hidden">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                disabled={disabled}
                rows={1}
                className="flex-1 bg-transparent text-white placeholder-gray-400 px-4 py-3 resize-none outline-none disabled:cursor-not-allowed"
                style={{
                  minHeight: '48px',
                  maxHeight: '120px'
                }}
              />
              
              {/* Emoji Button */}
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                disabled={disabled}
                className="flex-shrink-0 p-3 text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaceSmileIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={disabled || !message.trim()}
            className="flex-shrink-0 p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Character count and tips */}
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <span>Press Enter to send, Shift+Enter for new line</span>
          </div>
          <div className="flex items-center space-x-2">
            {message.length > 0 && (
              <span className={message.length > 1000 ? 'text-red-400' : ''}>
                {message.length}/1000
              </span>
            )}
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />
      </form>
    </div>
  );
};

export default MessageInput;