import React, { useState, useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { chatbotAPI } from '../../services/api';

function ChatWindow({ isOpen, onClose, userLocation }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history on mount
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadChatHistory();
    }
  }, [isOpen]);

  const loadChatHistory = async () => {
    try {
      const response = await chatbotAPI.getChatHistory();
      if (response.data && response.data.data) {
        const formattedMessages = [];
        response.data.data.forEach((chat) => {
          formattedMessages.push({
            id: chat._id,
            text: chat.message,
            isBot: false,
            chatId: chat._id,
          });
          formattedMessages.push({
            id: `${chat._id}-response`,
            text: chat.response,
            isBot: true,
            chatId: chat._id,
            feedback: chat.feedback,
          });
        });
        setMessages(formattedMessages);
      }
    } catch (err) {
      console.log('No previous chat history or error loading it');
    }
  };

  const handleSendMessage = async () => {
    if (input.trim().length === 0) return;

    const userMessage = input.trim();
    setInput('');
    setError('');

    // Add user message to display
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: userMessage,
        isBot: false,
      },
    ]);

    setLoading(true);

    try {
      // Send message to chatbot API
      const response = await chatbotAPI.sendMessage(userMessage, {
        location: userLocation,
      });

      const botResponse = response.data.response;
      const chatId = response.data.chatId;

      // Add bot response to display
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: botResponse,
          isBot: true,
          chatId,
          followUpQuestion: response.data.followUpQuestion,
        },
      ]);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to get response. Please try again or check your internet connection.'
      );
      console.error('Error sending message:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (chatId, feedback, reason) => {
    try {
      await chatbotAPI.submitFeedback(chatId, feedback, reason);
      // Optionally show toast notification
    } catch (err) {
      console.error('Error submitting feedback:', err);
    }
  };

  const clearChat = () => {
    if (window.confirm('Are you sure you want to clear this chat?')) {
      setMessages([]);
      setInput('');
      setError('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chatbot-window">
      {/* Header */}
      <div className="chatbot-header">
        <h3>🌾 Farm Assistant</h3>
        <div className="header-actions">
          <button
            onClick={clearChat}
            className="clear-btn"
            title="Clear chat"
            style={{ fontSize: '0.9rem', padding: '0.25rem 0.5rem' }}
          >
            🗑️
          </button>
          <button onClick={onClose} className="close-btn" title="Close chat">
            ✕
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="chat-messages-container">
        {messages.length === 0 && (
          <div className="empty-state">
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌱</div>
            <p>Hi! I'm your Farm Assistant. Ask me anything about:</p>
            <ul style={{ marginTop: '0.5rem', textAlign: 'left', fontSize: '0.9rem' }}>
              <li>✅ Crop selection and cultivation</li>
              <li>✅ Disease and pest management</li>
              <li>✅ Irrigation and water management</li>
              <li>✅ Fertilizers and soil health</li>
              <li>✅ Weather-based farming advice</li>
            </ul>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg.text}
            isBot={msg.isBot}
            chatId={msg.chatId}
            onFeedback={handleFeedback}
          />
        ))}

        {loading && (
          <div className="chat-message bot-message">
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        {error && <div className="alert alert-error" style={{ margin: '1rem' }}>{error}</div>}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <ChatInput
        value={input}
        onChange={setInput}
        onSend={handleSendMessage}
        disabled={loading}
      />
    </div>
  );
}

export default ChatWindow;
