import React from 'react';

function ChatInput({ value, onChange, onSend, disabled = false }) {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleSendClick = () => {
    onSend();
  };

  const charCount = value.length;
  const maxChars = 500;

  return (
    <div className="chat-input-container">
      <div className="input-wrapper">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about crops, diseases, weather, fertilizers..."
          className="chat-input"
          disabled={disabled}
          maxLength={maxChars}
          rows="2"
        />
        <button
          onClick={handleSendClick}
          disabled={disabled || value.trim().length === 0}
          className="send-button"
          title="Send message (Press Enter)"
        >
          {disabled ? '⏳' : '✈️ Send'}
        </button>
      </div>

      <div className="input-footer">
        <span className={`char-count ${charCount > maxChars * 0.8 ? 'warning' : ''}`}>
          {charCount}/{maxChars}
        </span>
      </div>
    </div>
  );
}

export default ChatInput;
