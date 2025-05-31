import React from 'react';
import './Message.css';

const Message = ({ message }) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`message ${message.type}`}>
      <div className="message-content">
        {message.type === 'bot' && <span className="bot-icon">🐾</span>}
        <div className="message-text">
          {message.content}
        </div>
        {message.analysis && message.analysis.isRescueSituation && (
          <div className="analysis-summary">
            <strong>Detected:</strong> {message.analysis.animalType} - {message.analysis.issue}
            {message.analysis.location !== 'unknown' && (
              <span> at {message.analysis.location}</span>
            )}
          </div>
        )}
      </div>
      <div className="message-time">
        {formatTime(message.timestamp)}
      </div>
    </div>
  );
};

export default Message; 