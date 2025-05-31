import React from 'react';
import './Sidebar.css';

const Sidebar = ({ reportData, onActionClick }) => {
  const careTips = [
    { icon: '⚠️', text: 'Approach with Caution', completed: false },
    { icon: '🛡️', text: 'Ensure Safety', completed: false },
    { icon: '💧', text: 'Offer Water (if safe)', completed: false },
    { icon: '📝', text: 'Document & Observe', completed: false }
  ];

  const actionButtons = [
    { 
      icon: '📞', 
      text: 'Find Nearby Vets', 
      color: '#ef4444',
      onClick: () => onActionClick('find-vets')
    },
    { 
      icon: '🏛️', 
      text: 'Contact Animal Control', 
      color: '#6366f1',
      onClick: () => onActionClick('contact-control')
    },
    { 
      icon: '📋', 
      text: 'Report Online', 
      color: '#ec4899',
      onClick: () => onActionClick('report-online')
    },
    { 
      icon: '📍', 
      text: 'Share Location', 
      color: '#8b5cf6',
      onClick: () => onActionClick('share-location')
    }
  ];

  const emergencyContacts = [
    { 
      label: 'Local Animal Control', 
      number: '555-0100',
      icon: '🏛️'
    },
    { 
      label: 'Emergency Vet Clinic', 
      number: '555-0101',
      icon: '🏥'
    },
    { 
      label: 'Wildlife Rescue Hotline', 
      number: '555-0102',
      icon: '🦎'
    }
  ];

  return (
    <div className="sidebar">
      {/* Report Summary */}
      {reportData && (
        <div className="sidebar-section report-summary">
          <div className="section-header">
            <span className="section-icon">📋</span>
            <h3>Report Summary</h3>
          </div>
          <p className="section-subtitle">Quick overview of the reported animal and issue.</p>
          
          <div className="report-details">
            <div className="report-item">
              <span className="report-label">🐕 Animal:</span>
              <span className="report-value">{reportData.animalType}</span>
            </div>
            <div className="report-item">
              <span className="report-label">❤️ Issue:</span>
              <span className="report-value">{reportData.issue}</span>
            </div>
            <div className="report-item">
              <span className="report-label">📍 Location:</span>
              <span className="report-value">{reportData.location}</span>
            </div>
          </div>
        </div>
      )}

      {/* Care Tips */}
      <div className="sidebar-section care-tips">
        <div className="section-header">
          <h3>Care Tips</h3>
        </div>
        <p className="section-subtitle">Immediate actions you can take while waiting for help.</p>
        
        <div className="tips-list">
          {careTips.map((tip, index) => (
            <div key={index} className="tip-item">
              <span className="tip-icon">{tip.icon}</span>
              <span className="tip-text">{tip.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="sidebar-section action-buttons">
        <div className="buttons-grid">
          {actionButtons.map((button, index) => (
            <button 
              key={index}
              className="action-button"
              onClick={button.onClick}
              style={{ borderLeftColor: button.color }}
            >
              <span className="button-icon">{button.icon}</span>
              <span className="button-text">{button.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="sidebar-section emergency-contacts">
        <div className="section-header">
          <span className="section-icon">📞</span>
          <h3>Emergency Contacts</h3>
        </div>
        <p className="section-subtitle">Important numbers for urgent animal care.</p>
        
        <div className="contacts-list">
          {emergencyContacts.map((contact, index) => (
            <div key={index} className="contact-item">
              <span className="contact-icon">{contact.icon}</span>
              <div className="contact-info">
                <span className="contact-label">{contact.label}:</span>
                <a href={`tel:${contact.number}`} className="contact-number">
                  {contact.number}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 