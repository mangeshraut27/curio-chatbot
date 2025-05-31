import React, { useState } from 'react';
import './Header.css';

const Header = () => {
  const [activeTab, setActiveTab] = useState('Home');

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">🐾</span>
            <span className="logo-text">Curio</span>
          </div>
          <nav className="navigation">
            <button 
              className={`nav-item ${activeTab === 'Home' ? 'active' : ''}`}
              onClick={() => setActiveTab('Home')}
            >
              Home
            </button>
            <button 
              className={`nav-item ${activeTab === 'About' ? 'active' : ''}`}
              onClick={() => setActiveTab('About')}
            >
              About Curio
            </button>
            <button 
              className={`nav-item ${activeTab === 'FAQ' ? 'active' : ''}`}
              onClick={() => setActiveTab('FAQ')}
            >
              FAQ
            </button>
          </nav>
        </div>
        
        <div className="header-right">
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Search Curio..." 
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          <button className="notification-btn">
            <span className="notification-icon">🔔</span>
          </button>
          <button className="settings-btn">
            <span className="settings-icon">⚙️</span>
          </button>
          <div className="user-profile">
            <img src="/api/placeholder/32/32" alt="User" className="user-avatar" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 