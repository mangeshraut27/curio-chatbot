import React from 'react';
import './TriagePanel.css';

const TriagePanel = ({ analysis, onLocationHelp }) => {
  if (!analysis || !analysis.isRescueSituation) return null;

  const getUrgencyColor = (level) => {
    switch (level) {
      case 'high': return '#dc2626';
      case 'medium': return '#ea580c';
      case 'low': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const getUrgencyIcon = (level) => {
    switch (level) {
      case 'high': return '🚨';
      case 'medium': return '⚠️';
      case 'low': return '✅';
      default: return '❓';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'emergency': return '🆘';
      case 'urgent': return '🚨';
      case 'standard': return '📞';
      default: return '📞';
    }
  };

  return (
    <div className="triage-panel">
      {/* Urgency Assessment */}
      <div className="triage-section urgency-section">
        <div className="section-header">
          <span className="section-icon">🎯</span>
          <h3>Smart Triage Assessment</h3>
        </div>
        
        <div className="urgency-display">
          <div 
            className="urgency-badge"
            style={{ 
              backgroundColor: getUrgencyColor(analysis.urgencyLevel),
              color: 'white'
            }}
          >
            <span className="urgency-icon">{getUrgencyIcon(analysis.urgencyLevel)}</span>
            <span className="urgency-text">{analysis.urgencyLevel?.toUpperCase()} PRIORITY</span>
          </div>
          
          {analysis.rescueReport?.triageScore && (
            <div className="triage-score">
              <span className="score-label">Triage Score:</span>
              <span className="score-value">{analysis.rescueReport.triageScore}/10</span>
            </div>
          )}
        </div>

        <div className="urgency-reasoning">
          <strong>Assessment:</strong> {analysis.urgencyReasoning}
        </div>

        {analysis.rescueReport?.contactPriority && (
          <div className="contact-priority">
            <span className="priority-icon">{getPriorityIcon(analysis.rescueReport.contactPriority)}</span>
            <span>Contact Priority: {analysis.rescueReport.contactPriority.toUpperCase()}</span>
          </div>
        )}
      </div>

      {/* Triage Factors */}
      {analysis.triageFactors && (
        <div className="triage-section factors-section">
          <div className="section-header">
            <span className="section-icon">🔍</span>
            <h3>Situation Analysis</h3>
          </div>
          
          <div className="factors-grid">
            {analysis.triageFactors.immediateThreats?.length > 0 && (
              <div className="factor-item high-priority">
                <span className="factor-icon">⚡</span>
                <div className="factor-content">
                  <strong>Immediate Threats:</strong>
                  <ul>
                    {analysis.triageFactors.immediateThreats.map((threat, index) => (
                      <li key={index}>{threat}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {analysis.triageFactors.visibleInjuries?.length > 0 && (
              <div className="factor-item medium-priority">
                <span className="factor-icon">🩹</span>
                <div className="factor-content">
                  <strong>Visible Injuries:</strong>
                  <ul>
                    {analysis.triageFactors.visibleInjuries.map((injury, index) => (
                      <li key={index}>{injury}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {analysis.triageFactors.behaviorConcerns?.length > 0 && (
              <div className="factor-item medium-priority">
                <span className="factor-icon">🐕</span>
                <div className="factor-content">
                  <strong>Behavior Concerns:</strong>
                  <ul>
                    {analysis.triageFactors.behaviorConcerns.map((concern, index) => (
                      <li key={index}>{concern}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {analysis.triageFactors.environmentalRisks?.length > 0 && (
              <div className="factor-item low-priority">
                <span className="factor-icon">🌍</span>
                <div className="factor-content">
                  <strong>Environmental Risks:</strong>
                  <ul>
                    {analysis.triageFactors.environmentalRisks.map((risk, index) => (
                      <li key={index}>{risk}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Location Analysis */}
      {analysis.locationAnalysis && (
        <div className="triage-section location-section">
          <div className="section-header">
            <span className="section-icon">📍</span>
            <h3>Location Intelligence</h3>
          </div>
          
          <div className="location-specificity">
            <div className="specificity-meter">
              <span className="meter-label">Location Detail Level:</span>
              <div className="meter-bar">
                <div 
                  className="meter-fill"
                  style={{ 
                    width: `${(analysis.locationSpecificity || 1) * 20}%`,
                    backgroundColor: analysis.locationSpecificity >= 4 ? '#16a34a' : 
                                   analysis.locationSpecificity >= 3 ? '#ea580c' : '#dc2626'
                  }}
                ></div>
              </div>
              <span className="meter-value">{analysis.locationSpecificity || 1}/5</span>
            </div>
          </div>

          {analysis.locationAnalysis.needsMoreDetail && (
            <div className="location-help">
              <div className="help-header">
                <span className="help-icon">❓</span>
                <strong>More Location Details Needed</strong>
              </div>
              {analysis.locationAnalysis.suggestedQuestions?.length > 0 && (
                <div className="suggested-questions">
                  <p>Help us locate the animal more precisely:</p>
                  <ul>
                    {analysis.locationAnalysis.suggestedQuestions.map((question, index) => (
                      <li key={index}>{question}</li>
                    ))}
                  </ul>
                </div>
              )}
              <button 
                className="location-help-btn"
                onClick={() => onLocationHelp && onLocationHelp()}
              >
                Get Location Help
              </button>
            </div>
          )}

          {analysis.locationAnalysis.safetyConsiderations?.length > 0 && (
            <div className="safety-considerations">
              <strong>Safety Considerations:</strong>
              <ul>
                {analysis.locationAnalysis.safetyConsiderations.map((consideration, index) => (
                  <li key={index}>{consideration}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.locationAnalysis.accessibilityNotes && (
            <div className="accessibility-notes">
              <strong>Access Notes:</strong> {analysis.locationAnalysis.accessibilityNotes}
            </div>
          )}
        </div>
      )}

      {/* Immediate Actions */}
      {analysis.rescueReport?.immediateActions?.length > 0 && (
        <div className="triage-section actions-section">
          <div className="section-header">
            <span className="section-icon">⚡</span>
            <h3>Immediate Actions</h3>
          </div>
          
          <div className="action-checklist">
            {analysis.rescueReport.immediateActions.map((action, index) => (
              <div key={index} className="action-item">
                <input type="checkbox" id={`action-${index}`} />
                <label htmlFor={`action-${index}`}>{action}</label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Consistency Check */}
      {analysis.consistencyCheck && !analysis.consistencyCheck.isConsistent && (
        <div className="triage-section consistency-section">
          <div className="section-header">
            <span className="section-icon">🔄</span>
            <h3>Clarification Needed</h3>
          </div>
          
          {analysis.consistencyCheck.conflictingInfo?.length > 0 && (
            <div className="conflicting-info">
              <strong>Conflicting Information Detected:</strong>
              <ul>
                {analysis.consistencyCheck.conflictingInfo.map((conflict, index) => (
                  <li key={index}>{conflict}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.consistencyCheck.clarificationNeeded?.length > 0 && (
            <div className="clarification-needed">
              <strong>Please Clarify:</strong>
              <ul>
                {analysis.consistencyCheck.clarificationNeeded.map((clarification, index) => (
                  <li key={index}>{clarification}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TriagePanel; 