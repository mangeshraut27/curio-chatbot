import React, { useState } from 'react';
import './App.css';
import ChatBot from './components/ChatBot';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [currentAnalysis, setCurrentAnalysis] = useState(null);

  const handleAnalysisUpdate = (analysis) => {
    setCurrentAnalysis(analysis);
  };

  const handleTriageUpdate = (analysis) => {
    // Additional triage-specific updates can be handled here
    console.log('Triage Update:', analysis);
  };

  return (
    <div className="App">
      {/* Professional Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="app-title">
              <span className="app-icon">🐾</span>
              Curio
            </h1>
            <span className="app-subtitle">AI-Powered Animal Rescue Assistant</span>
          </div>
          
          <nav className="header-nav">
            <button className="nav-button active">
              <span className="nav-icon">💬</span>
              Chat
            </button>
            <button className="nav-button">
              <span className="nav-icon">📊</span>
              Reports
            </button>
            <button className="nav-button">
              <span className="nav-icon">ℹ️</span>
              About Us
            </button>
            <button className="nav-button">
              <span className="nav-icon">❓</span>
              FAQ
            </button>
          </nav>
          
          <div className="header-right">
            <div className="user-actions">
              <button className="action-button">
                <span className="action-icon">🔔</span>
                <span className="action-text">Notifications</span>
              </button>
              <button className="action-button">
                <span className="action-icon">⚙️</span>
                <span className="action-text">Settings</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Error Boundary */}
      <main className="app-main">
        <ErrorBoundary>
          <ChatBot 
            onAnalysisUpdate={handleAnalysisUpdate}
            onTriageUpdate={handleTriageUpdate}
          />
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default App; 