import React from 'react';
import PlantAvatar from './PlantAvatar';

function ChatMessage({ message, isBot, onFeedback, chatId }) {
  const [feedbackGiven, setFeedbackGiven] = React.useState(false);
  const [showReasonModal, setShowReasonModal] = React.useState(false);
  const [reason, setReason] = React.useState('');

  const handleFeedback = (feedback) => {
    if (feedback === 'notHelpful') {
      setShowReasonModal(true);
    } else {
      onFeedback?.(chatId, feedback, '');
      setFeedbackGiven(true);
    }
  };

  const submitReason = () => {
    onFeedback?.(chatId, 'notHelpful', reason);
    setFeedbackGiven(true);
    setShowReasonModal(false);
    setReason('');
  };

  return (
    <div className={`chat-message ${isBot ? 'bot-message' : 'user-message'}`}>
      {isBot && <PlantAvatar />}

      <div className="message-content">
        <p className="message-text">{message}</p>

        {isBot && !feedbackGiven && (
          <div className="feedback-buttons">
            <span className="feedback-label">Was this helpful?</span>
            <button
              className="feedback-btn helpful"
              onClick={() => handleFeedback('helpful')}
              title="This was helpful"
            >
              👍 Yes
            </button>
            <button
              className="feedback-btn notHelpful"
              onClick={() => handleFeedback('notHelpful')}
              title="This was not helpful"
            >
              👎 No
            </button>
          </div>
        )}

        {feedbackGiven && <p className="feedback-thanks">Thank you for your feedback!</p>}
      </div>

      {showReasonModal && (
        <div className="feedback-modal">
          <div className="feedback-modal-content">
            <p>Could you help us improve? Why wasn't this helpful?</p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Let us know what went wrong..."
              rows="3"
            />
            <div className="modal-buttons">
              <button onClick={() => setShowReasonModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={submitReason} className="btn-primary">
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatMessage;
