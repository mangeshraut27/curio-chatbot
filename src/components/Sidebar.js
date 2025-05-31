import React from 'react';
import './Sidebar.css';

const Sidebar = ({ 
  reportData, 
  onActionClick, 
  phase, 
  analysis, 
  onResetConversation, 
  onLocationHelp,
  emergencyContacts,
  locationStatus 
}) => {
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

  // Use fetched emergency contacts or fallback to default ones
  const getEmergencyContactsData = () => {
    if (emergencyContacts?.emergencyContacts) {
      return emergencyContacts.emergencyContacts.slice(0, 3).map(contact => ({
        label: contact.name,
        number: contact.phone,
        icon: getContactIcon(contact.type),
        type: contact.type,
        availability: contact.availability,
        is24x7: contact.is24x7,
        urgencyLevel: contact.urgencyLevel,
        description: contact.description
      }));
    }
    
    // Fallback to default contacts
    return [
      { 
        label: 'Local Animal Control', 
        number: '555-0100',
        icon: '🏛️',
        type: 'animal_control',
        availability: '9 AM - 6 PM',
        is24x7: false,
        urgencyLevel: 'high',
        description: 'Local municipal animal control services'
      },
      { 
        label: 'Emergency Vet Clinic', 
        number: '555-0101',
        icon: '🏥',
        type: 'veterinary',
        availability: '24/7',
        is24x7: true,
        urgencyLevel: 'critical',
        description: 'Emergency veterinary medical services'
      },
      { 
        label: 'Wildlife Rescue Hotline', 
        number: '555-0102',
        icon: '🦎',
        type: 'rescue_service',
        availability: '10 AM - 8 PM',
        is24x7: false,
        urgencyLevel: 'medium',
        description: 'Wildlife and exotic animal rescue'
      }
    ];
  };

  const getContactIcon = (type) => {
    const icons = {
      'government': '🏛️',
      'animal_control': '🏛️',
      'veterinary': '🏥',
      'ngo': '🤝',
      'rescue_service': '🦎'
    };
    return icons[type] || '📞';
  };

  const emergencyContactsData = getEmergencyContactsData();

  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <div className="section-header">
          <h3>📊 Report Summary</h3>
          {(phase === "2" || phase === "3") && (
            <div className="phase-badge-sidebar">
              <span>Phase {phase}</span>
            </div>
          )}
        </div>
        
        {reportData || (analysis && analysis.isRescueSituation) ? (
          <div className="summary-content">
            {/* Phase 2: Enhanced Urgency Display */}
            {analysis && analysis.urgencyLevel && (
              <div className="urgency-header">
                <div className="urgency-indicator">
                  <span className={`urgency-dot ${analysis.urgencyLevel}`}></span>
                  <span className="urgency-text">
                    {analysis.urgencyLevel.toUpperCase()} PRIORITY
                  </span>
                </div>
                {analysis.rescueReport?.triageScore && (
                  <div className="triage-score-mini">
                    <span>{analysis.rescueReport.triageScore}/10</span>
                  </div>
                )}
              </div>
            )}

            <div className="summary-item">
              <span className="label">Animal:</span>
              <span className="value">{reportData?.animalType || analysis?.animalType || 'Unknown'}</span>
            </div>
            <div className="summary-item">
              <span className="label">Issue:</span>
              <span className="value">{reportData?.issue || analysis?.issue || 'Unknown'}</span>
            </div>
            <div className="summary-item">
              <span className="label">Location:</span>
              <span className="value">{reportData?.location || analysis?.location || 'Unknown'}</span>
              {analysis && analysis.locationSpecificity && (
                <div className="location-rating">
                  <span className="rating-label">Detail Level:</span>
                  <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span 
                        key={star} 
                        className={`star ${star <= analysis.locationSpecificity ? 'filled' : ''}`}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Phase 2: Contact Priority */}
            {analysis && analysis.rescueReport?.contactPriority && (
              <div className="summary-item priority-item">
                <span className="label">Contact Priority:</span>
                <span className={`priority-badge ${analysis.rescueReport.contactPriority}`}>
                  {analysis.rescueReport.contactPriority === 'emergency' && '🆘'}
                  {analysis.rescueReport.contactPriority === 'urgent' && '🚨'}
                  {analysis.rescueReport.contactPriority === 'standard' && '📞'}
                  {analysis.rescueReport.contactPriority.toUpperCase()}
                </span>
              </div>
            )}

            {/* Phase 2: Triage Factors Summary */}
            {analysis && analysis.triageFactors && (
              <div className="triage-factors-summary">
                <div className="factors-header">
                  <span className="factors-icon">🔍</span>
                  <span className="factors-title">Key Factors</span>
                </div>
                <div className="factors-list">
                  {analysis.triageFactors.immediateThreats?.length > 0 && (
                    <div className="factor-tag high">
                      ⚡ {analysis.triageFactors.immediateThreats.length} threats
                    </div>
                  )}
                  {analysis.triageFactors.visibleInjuries?.length > 0 && (
                    <div className="factor-tag medium">
                      🩹 {analysis.triageFactors.visibleInjuries.length} injuries
                    </div>
                  )}
                  {analysis.triageFactors.behaviorConcerns?.length > 0 && (
                    <div className="factor-tag medium">
                      🐕 {analysis.triageFactors.behaviorConcerns.length} behaviors
                    </div>
                  )}
                  {analysis.triageFactors.environmentalRisks?.length > 0 && (
                    <div className="factor-tag low">
                      🌍 {analysis.triageFactors.environmentalRisks.length} risks
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="no-report">
            <p>No active rescue situation detected. Share details about a stray animal for smart triage analysis.</p>
          </div>
        )}
      </div>

      {/* Enhanced Care Tips for Phase 2 */}
      <div className="sidebar-section">
        <h3>💡 Smart Care Tips</h3>
        <div className="care-tips">
          {analysis && analysis.isRescueSituation ? (
            <div className="contextual-tips">
              {analysis.urgencyLevel === 'high' && (
                <div className="tip-urgent">
                  <span className="tip-icon">🚨</span>
                  <div className="tip-content">
                    <strong>Emergency Action Required</strong>
                    <p>Contact emergency veterinary services immediately. Time is critical.</p>
                  </div>
                </div>
              )}
              {analysis.urgencyLevel === 'medium' && (
                <div className="tip-warning">
                  <span className="tip-icon">⚠️</span>
                  <div className="tip-content">
                    <strong>Moderate Priority</strong>
                    <p>Monitor closely and arrange veterinary care soon. Document condition changes.</p>
                  </div>
                </div>
              )}
              {analysis.urgencyLevel === 'low' && (
                <div className="tip-info">
                  <span className="tip-icon">✅</span>
                  <div className="tip-content">
                    <strong>Standard Care</strong>
                    <p>Provide basic comfort and safety while arranging appropriate assistance.</p>
                  </div>
                </div>
              )}
              {analysis.locationAnalysis?.needsMoreDetail && (
                <div className="tip-location">
                  <span className="tip-icon">📍</span>
                  <div className="tip-content">
                    <strong>Location Enhancement Needed</strong>
                    <p>More specific location details will help rescue teams respond faster.</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="general-tips">
              {careTips.map((tip, index) => (
                <div key={index} className="tip">
                  <span className="tip-icon">{tip.icon}</span>
                  <span>{tip.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Phase 2: Enhanced Action Buttons */}
      <div className="sidebar-section">
        <h3>⚡ Quick Actions</h3>
        <div className="action-grid">
          {actionButtons.map((button, index) => (
            <button
              key={index}
              className="action-btn"
              style={{ backgroundColor: button.color }}
              onClick={button.onClick}
            >
              <span className="action-icon">{button.icon}</span>
              <span className="action-text">{button.text}</span>
            </button>
          ))}
          
          {/* Phase 2: Location Help Button */}
          {analysis && analysis.locationAnalysis?.needsMoreDetail && onLocationHelp && (
            <button 
              className="action-btn location-help"
              onClick={onLocationHelp}
              style={{ backgroundColor: '#f59e0b' }}
            >
              <span className="action-icon">📍</span>
              <span className="action-text">Location Help</span>
            </button>
          )}
          
          {/* Phase 2 & 3: New Conversation Button */}
          <button 
            className="action-btn new-chat"
            onClick={onResetConversation}
          >
            <span className="action-icon">🔄</span>
            <span className="action-text">New Conversation</span>
          </button>
        </div>
      </div>

      {/* Phase 2: Enhanced Emergency Contacts */}
      <div className="sidebar-section">
        <h3>🆘 Emergency Contacts</h3>
        
        {/* Location Status Indicator */}
        {locationStatus && (
          <div className="location-status-indicator">
            <div className="status-row">
              <span className="status-icon">
                {locationStatus === 'checking' && '🔄'}
                {locationStatus === 'granted' && '✅'}
                {locationStatus === 'estimated' && '📍'}
                {locationStatus === 'error' && '❌'}
              </span>
              <span className="status-text">
                {locationStatus === 'checking' && 'Detecting location...'}
                {locationStatus === 'granted' && 'GPS location enabled'}
                {locationStatus === 'estimated' && 'Using estimated location'}
                {locationStatus === 'error' && 'Location unavailable'}
              </span>
            </div>
            {emergencyContacts?.location && (
              <div className="location-info">
                📍 {emergencyContacts.location.detected}
              </div>
            )}
          </div>
        )}

        <div className="emergency-contacts">
          {emergencyContactsData.map((contact, index) => (
            <div key={index} className="contact-item">
              <div className="contact-header">
                <span className="contact-icon">{contact.icon}</span>
                <div className="contact-title-group">
                  <span className="contact-title">{contact.label}</span>
                  {contact.is24x7 && (
                    <span className="availability-badge emergency">24/7</span>
                  )}
                  {contact.urgencyLevel === 'critical' && (
                    <span className="urgency-badge critical">CRITICAL</span>
                  )}
                </div>
              </div>
              <div className="contact-details">
                <div className="contact-number">{contact.number}</div>
                {contact.availability && !contact.is24x7 && (
                  <div className="contact-hours">⏰ {contact.availability}</div>
                )}
                {contact.description && (
                  <div className="contact-description">{contact.description}</div>
                )}
              </div>
              <div className="contact-actions">
                <button 
                  className="contact-action-btn call"
                  onClick={() => window.open(`tel:${contact.number}`, '_self')}
                  title="Call this number"
                >
                  📞 Call
                </button>
              </div>
            </div>
          ))}

          {/* AI Generation Status */}
          {emergencyContacts && (
            <div className="contacts-source">
              <span className="source-icon">🤖</span>
              <span className="source-text">
                Contacts generated by AI for your location
              </span>
            </div>
          )}

          {/* Phase 2: Smart Priority Indicator */}
          {analysis && analysis.rescueReport?.contactPriority && (
            <div className="priority-indicator">
              <div className="indicator-header">
                <span className="indicator-icon">🎯</span>
                <span>Recommended Priority</span>
              </div>
              <div className={`priority-recommendation ${analysis.rescueReport.contactPriority}`}>
                {analysis.rescueReport.contactPriority === 'emergency' && 
                  'Contact Emergency Vet immediately'}
                {analysis.rescueReport.contactPriority === 'urgent' && 
                  'Contact Animal Control within 1-2 hours'}
                {analysis.rescueReport.contactPriority === 'standard' && 
                  'Contact when convenient'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Phase 3: NGO Information */}
      {analysis && analysis.ngoRecommendations && (
        <div className="ngo-info-section">
          <div className="section-header">
            <span className="section-icon">🏛️</span>
            <h3>NGO Coverage</h3>
          </div>
          
          {analysis.ngoRecommendations.found ? (
            <div className="ngo-summary">
              <div className="ngo-coverage-item">
                <div className="coverage-label">City Coverage</div>
                <div className="coverage-value">
                  📍 {analysis.ngoRecommendations.city?.charAt(0).toUpperCase() + 
                       analysis.ngoRecommendations.city?.slice(1)}
                </div>
              </div>
              
              <div className="ngo-coverage-item">
                <div className="coverage-label">NGOs Found</div>
                <div className="coverage-value">
                  🏛️ {analysis.ngoRecommendations.ngos?.length || 0} Organizations
                </div>
              </div>
              
              <div className="ngo-coverage-item">
                <div className="coverage-label">Top NGO Rating</div>
                <div className="coverage-value">
                  ⭐ {analysis.ngoRecommendations.ngos?.[0]?.rating || 'N/A'}/5.0
                </div>
              </div>
              
              {analysis.ngoRecommendations.urgencyLevel === 'high' && (
                <div className="ngo-coverage-item emergency">
                  <div className="coverage-label">Emergency Status</div>
                  <div className="coverage-value urgent">
                    🚨 Priority Contacts Ready
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="ngo-fallback">
              <div className="fallback-info">
                <span className="fallback-icon">🏛️</span>
                <div className="fallback-text">
                  <div className="fallback-title">National Coverage</div>
                  <div className="fallback-subtitle">Emergency helpline available</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Sidebar; 