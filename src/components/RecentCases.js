import React, { useState, useEffect } from 'react';
import './RecentCases.css';
import caseService from '../services/caseService';

const RecentCases = ({ isVisible, onClose }) => {
  const [cases, setCases] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCases, setFilteredCases] = useState([]);

  useEffect(() => {
    if (isVisible) {
      loadCases();
    }
  }, [isVisible]);

  useEffect(() => {
    filterCases();
  }, [cases, selectedStatus, searchTerm]);

  const loadCases = () => {
    const recentCases = caseService.getRecentCases(20);
    const caseStats = caseService.getStats();
    setCases(recentCases);
    setStats(caseStats);
  };

  const filterCases = () => {
    let filtered = cases;

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = caseService.getCasesByStatus(selectedStatus);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = caseService.searchCases(searchTerm);
    }

    setFilteredCases(filtered);
  };

  const handleShare = (caseData, platform) => {
    const shareUrls = caseService.getShareUrls(caseData);
    window.open(shareUrls[platform], '_blank');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'rescued': return '#10b981';
      case 'in_progress': return '#f59e0b';
      case 'pending': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return '#dc2626';
      case 'medium': return '#d97706';
      case 'low': return '#059669';
      default: return '#6b7280';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  if (!isVisible) return null;

  return (
    <div className="recent-cases-overlay">
      <div className="recent-cases-modal">
        <div className="recent-cases-header">
          <div className="header-title">
            <h2>📊 Recent Rescue Cases</h2>
            <button className="close-button" onClick={onClose}>✕</button>
          </div>
          
          <div className="stats-summary">
            <div className="stat-item">
              <span className="stat-number">{stats.totalCases}</span>
              <span className="stat-label">Total Cases</span>
            </div>
            <div className="stat-item rescued">
              <span className="stat-number">{stats.rescued}</span>
              <span className="stat-label">Rescued</span>
            </div>
            <div className="stat-item in-progress">
              <span className="stat-number">{stats.inProgress}</span>
              <span className="stat-label">In Progress</span>
            </div>
            <div className="stat-item pending">
              <span className="stat-number">{stats.pending}</span>
              <span className="stat-label">Pending</span>
            </div>
          </div>
        </div>

        <div className="cases-filters">
          <div className="filter-group">
            <input
              type="text"
              placeholder="Search cases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="status-filters">
            {['all', 'rescued', 'in_progress', 'pending'].map(status => (
              <button
                key={status}
                className={`status-filter ${selectedStatus === status ? 'active' : ''}`}
                onClick={() => setSelectedStatus(status)}
              >
                {status === 'all' ? 'All Cases' : status.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="cases-list">
          {filteredCases.length === 0 ? (
            <div className="no-cases">
              <span className="no-cases-icon">🔍</span>
              <p>No cases found matching your criteria</p>
            </div>
          ) : (
            filteredCases.map(caseItem => (
              <div key={caseItem.id} className="case-card">
                <div className="case-header">
                  <div className="case-title">
                    <span className="animal-icon">
                      {caseItem.animalType === 'Dog' ? '🐕' : 
                       caseItem.animalType === 'Cat' ? '🐱' : 
                       caseItem.animalType === 'Bird' ? '🐦' : '🐾'}
                    </span>
                    <span className="animal-type">{caseItem.animalType}</span>
                    <span 
                      className="urgency-badge"
                      style={{ backgroundColor: getUrgencyColor(caseItem.urgencyLevel) }}
                    >
                      {caseItem.urgencyLevel.toUpperCase()}
                    </span>
                  </div>
                  <div className="case-timestamp">
                    {formatTimestamp(caseItem.timestamp)}
                  </div>
                </div>

                <div className="case-location">
                  <span className="location-icon">📍</span>
                  {caseItem.location}
                </div>

                <div className="case-description">
                  {caseItem.description}
                </div>

                <div className="case-status">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(caseItem.status) }}
                  >
                    {caseItem.status === 'rescued' ? '✅' : 
                     caseItem.status === 'in_progress' ? '🔄' : '⏳'} 
                    {caseItem.status.replace('_', ' ').toUpperCase()}
                  </span>
                  {caseItem.rescuedBy && (
                    <span className="rescued-by">
                      Rescued by: {caseItem.rescuedBy}
                    </span>
                  )}
                </div>

                <div className="case-tags">
                  {caseItem.tags.map(tag => (
                    <span key={tag} className="tag">
                      #{tag.replace('_', ' ')}
                    </span>
                  ))}
                </div>

                <div className="case-actions">
                  <div className="share-buttons">
                    <button 
                      className="share-btn twitter"
                      onClick={() => handleShare(caseItem, 'twitter')}
                      title="Share on Twitter"
                    >
                      🐦 Share
                    </button>
                    <button 
                      className="share-btn whatsapp"
                      onClick={() => handleShare(caseItem, 'whatsapp')}
                      title="Share on WhatsApp"
                    >
                      💬 WhatsApp
                    </button>
                    <button 
                      className="share-btn facebook"
                      onClick={() => handleShare(caseItem, 'facebook')}
                      title="Share on Facebook"
                    >
                      📘 Facebook
                    </button>
                  </div>
                  
                  <div className="case-score">
                    <span className="score-label">Triage Score:</span>
                    <span className="score-value">{caseItem.triageScore}/10</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentCases; 