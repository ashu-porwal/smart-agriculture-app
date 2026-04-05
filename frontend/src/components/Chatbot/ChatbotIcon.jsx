import React from 'react';

function ChatbotIcon({ isOpen, onClick, unreadCount = 0 }) {
  return (
    <div className="chatbot-icon-container">
      <button
        className={`chatbot-icon-button ${isOpen ? 'active' : ''}`}
        onClick={onClick}
        title={isOpen ? 'Close chat' : 'Open chat assistant'}
        aria-label="Chat assistant"
      >
        {isOpen ? (
          <span style={{ fontSize: '1.5rem' }}>✕</span>
        ) : (
          <>
            <span className="icon-plant">🌱</span>
            {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
          </>
        )}
      </button>
    </div>
  );
}

export default ChatbotIcon;
