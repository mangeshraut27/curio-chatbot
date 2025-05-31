import React from 'react';
import './NGOPanel.css';

const NGOPanel = ({ analysis, onContactNGO }) => {
  if (!analysis?.ngoRecommendations?.found) {
    return (
      <div className="ngo-panel">
        <div className="panel-header">
          <h3>🏥 NGO Assistance</h3>
        </div>
        <div className="panel-content">
          <div className="no-ngos">
            <p>No local NGOs found for this area.</p>
            {analysis?.ngoRecommendations?.fallbackContacts?.length > 0 && (
              <div className="fallback-contact">
                <h4>Emergency Contact:</h4>
                <div className="ngo-card emergency">
                  <div className="ngo-info">
                    <h4>{analysis.ngoRecommendations.fallbackContacts[0].name}</h4>
                    <p className="ngo-phone">📞 {analysis.ngoRecommendations.fallbackContacts[0].phone}</p>
                    <p className="ngo-description">{analysis.ngoRecommendations.fallbackContacts[0].description}</p>
                  </div>
                  <div className="ngo-actions">
                    <button 
                      className="contact-btn call"
                      onClick={() => onContactNGO(analysis.ngoRecommendations.fallbackContacts[0], 'call')}
                    >
                      📞 Call
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const { ngoRecommendations } = analysis;
  const hasGPSLocation = ngoRecommendations.hasDistance && ngoRecommendations.userLocation;

  return (
    <div className="ngo-panel">
      <div className="panel-header">
        <h3>🏥 Recommended NGOs</h3>
        {hasGPSLocation && (
          <div className="location-info">
            <span className="location-badge">
              📍 GPS: {ngoRecommendations.userLocation.accuracy}m accuracy
            </span>
          </div>
        )}
      </div>
      
      <div className="panel-content">
        <div className="ngo-context">
          <p className="city-info">
            📍 <strong>{ngoRecommendations.city}</strong>
            {hasGPSLocation && <span className="distance-note"> • Sorted by distance</span>}
          </p>
          <p className="recommendation-reason">
            {ngoRecommendations.reasoning}
          </p>
          {ngoRecommendations.urgencyBased && (
            <div className="urgency-notice">
              ⚠️ Emergency priority contacts shown first
            </div>
          )}
        </div>

        <div className="ngos-list">
          {ngoRecommendations.ngos.map((ngo, index) => (
            <div key={index} className={`ngo-card ${ngo.availability24x7 ? 'emergency-available' : ''}`}>
              <div className="ngo-header">
                <h4>{ngo.name}</h4>
                {ngo.distanceText && (
                  <span className="distance-badge">
                    🗺️ {ngo.distanceText}
                  </span>
                )}
                {ngo.availability24x7 && (
                  <span className="availability-badge emergency">24/7</span>
                )}
              </div>

              <div className="ngo-details">
                <div className="specializations">
                  {ngo.specialization.map((spec, i) => (
                    <span key={i} className="spec-tag">{spec}</span>
                  ))}
                </div>

                <div className="contact-info">
                  <p className="ngo-phone">📞 {ngo.phone}</p>
                  {ngo.email && <p className="ngo-email">✉️ {ngo.email}</p>}
                  {ngo.address && <p className="ngo-address">📍 {ngo.address}</p>}
                </div>

                {ngo.availability && !ngo.availability24x7 && (
                  <div className="availability">
                    <span className="availability-label">Hours:</span>
                    <span className="availability-hours">{ngo.availability}</span>
                  </div>
                )}

                {ngo.rating && (
                  <div className="rating">
                    <span className="stars">{'⭐'.repeat(ngo.rating)}</span>
                    <span className="rating-text">({ngo.rating}/5)</span>
                  </div>
                )}
              </div>

              <div className="ngo-actions">
                <button 
                  className="contact-btn call"
                  onClick={() => onContactNGO(ngo, 'call')}
                >
                  📞 Call Now
                </button>
                {ngo.email && (
                  <button 
                    className="contact-btn email"
                    onClick={() => onContactNGO(ngo, 'email')}
                  >
                    ✉️ Email
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {hasGPSLocation && (
          <div className="gps-footer">
            <p className="gps-note">
              📍 Distances calculated from your current GPS location
            </p>
            <p className="location-details">
              Current location: {ngoRecommendations.userLocation.address.formatted}
            </p>
          </div>
        )}

        {analysis.urgencyAnalysis?.level === 'high' && (
          <div className="emergency-footer">
            <p className="emergency-note">
              🚨 For immediate emergencies, call the first NGO listed or contact local emergency services
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NGOPanel; 