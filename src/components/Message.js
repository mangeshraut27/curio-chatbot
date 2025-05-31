import React from 'react';
import NGOPanel from './NGOPanel';
import './Message.css';

const Message = ({ message, onContactNGO }) => {
  const { text, sender, timestamp, isSpecial, isFollowUp, analysis } = message;
  
  // Determine message type for styling
  const getMessageClass = () => {
    let baseClass = `message ${sender}`;
    
    // Phase 2: Special styling for enhanced messages
    if (isSpecial) baseClass += ' special-message';
    if (isFollowUp) baseClass += ' follow-up-message';
    
    // GPS location message styling
    if (message.isLocationRequest) baseClass += ' location-request';
    if (message.isLocationConfirm) baseClass += ' location-confirm';
    if (message.isLocationFallback) baseClass += ' location-fallback';
    
    return baseClass;
  };

  const formatTime = (timestamp) => {
    // Handle invalid or missing timestamps
    if (!timestamp) {
      return new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    // Try to create a valid date
    const date = new Date(timestamp);
    
    // Check if the date is valid
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

  return (
    <div className={getMessageClass()}>
      <div className="message-content">
        {sender === 'bot' && <span className="bot-icon">🐾</span>}
        <div className="message-text">
          {text}
        </div>
        
        {/* Location request additional info */}
        {message.isLocationRequest && (
          <div className="location-features">
            <p className="features-title">This will help me:</p>
            <ul>
              <li>🎯 Find the nearest rescue organizations</li>
              <li>📍 Provide precise location to rescue teams</li>
              <li>⚡ Get faster emergency response</li>
            </ul>
          </div>
        )}
        
        {/* GPS accuracy indicator */}
        {message.isLocationConfirm && (
          <div className="location-accuracy">
            <span className="accuracy-badge">✅ High Precision GPS</span>
          </div>
        )}
        
        {/* Phase 3: NGO Recommendations Display */}
        {analysis?.ngoRecommendations?.found && (
          <NGOPanel 
            analysis={analysis}
            onContactNGO={onContactNGO} 
          />
        )}
      </div>
      <div className="message-meta">
        <span className="message-time">{formatTime(timestamp)}</span>
        {sender === 'bot' && (
          <span className="message-sender">Curio</span>
        )}
      </div>
    </div>
  );
};

export default Message; 