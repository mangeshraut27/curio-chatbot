/**
 * Curio App - Main Application Component
 * 
 * The root component for the Curio AI-powered animal rescue chatbot application.
 * Manages global application state, navigation, emergency contacts initialization,
 * and provides the main layout structure.
 * 
 * Features:
 * - Multi-page navigation (Chat, Reports, About, FAQ)
 * - Location-based emergency contacts auto-initialization
 * - Global state management for analysis and contacts
 * - Error boundary integration with Sentry
 * - Responsive layout with professional header
 * 
 * @author Curio Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import './App.css';
import ChatBot from './components/ChatBot';
import Reports from './pages/Reports';
import ErrorBoundary from './components/ErrorBoundary';
import { addBreadcrumb, logMessage } from './utils/sentry';
import emergencyContactsService from './services/emergencyContactsService';

/**
 * Main App Component
 * 
 * Central component that orchestrates the entire Curio application.
 * Handles navigation, emergency contacts initialization, and global state.
 * 
 * @returns {JSX.Element} Main application layout
 */
function App() {
  /** @type {[Object|null, Function]} Current analysis state from ChatBot */
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  
  /** @type {[string, Function]} Current view/page state for navigation */
  const [currentView, setCurrentView] = useState('chat'); // chat, reports, about, faq
  
  /** @type {[Object|null, Function]} Emergency contacts data state */
  const [emergencyContacts, setEmergencyContacts] = useState(null);
  
  /** @type {[string, Function]} Location detection status state */
  const [locationStatus, setLocationStatus] = useState('checking'); // checking, granted, denied, estimated, error

  /**
   * Initialize emergency contacts on app load
   * 
   * Effect hook that runs once when the app starts to automatically
   * detect user location and fetch relevant emergency contacts.
   */
  useEffect(() => {
    // Initialize emergency contacts on app load
    initializeEmergencyContacts();
  }, []);

  /**
   * Initialize emergency contacts with location detection
   * 
   * Attempts to get user's GPS location and fetch AI-generated emergency
   * contacts relevant to their area. Handles various location states and
   * provides appropriate fallbacks.
   * 
   * @async
   * @function
   */
  const initializeEmergencyContacts = async () => {
    try {
      addBreadcrumb(
        'App: Starting emergency contacts initialization',
        'app',
        'info'
      );

      setLocationStatus('checking');
      
      // Initialize emergency contacts (includes location check)
      const contactsData = await emergencyContactsService.initializeEmergencyContacts();
      
      setEmergencyContacts(contactsData);
      
      // Determine location status based on the result
      if (contactsData?.location?.accuracy === 'GPS') {
        setLocationStatus('granted');
        addBreadcrumb(
          'App: Emergency contacts initialized with GPS',
          'app',
          'info',
          { location: contactsData.location.detected }
        );
      } else {
        setLocationStatus('estimated');
        addBreadcrumb(
          'App: Emergency contacts initialized without GPS',
          'app',
          'info'
        );
      }

    } catch (error) {
      console.error('Failed to initialize emergency contacts:', error);
      setLocationStatus('error');
      
      // Set basic fallback contacts for critical situations
      setEmergencyContacts({
        emergencyContacts: [
          {
            name: 'National Animal Welfare Helpline',
            type: 'government',
            phone: '1962',
            description: 'Government emergency helpline for animal emergencies'
          }
        ]
      });
    }
  };

  /**
   * Handle emergency contacts refresh
   * 
   * Manually refreshes emergency contacts with current location data.
   * Useful when user changes location or wants updated contact information.
   * 
   * @async
   * @function
   */
  const refreshEmergencyContacts = async () => {
    try {
      setLocationStatus('checking');
      const refreshedContacts = await emergencyContactsService.refreshEmergencyContacts();
      setEmergencyContacts(refreshedContacts);
      
      // Update location status based on refresh results
      if (refreshedContacts?.location?.accuracy === 'GPS') {
        setLocationStatus('granted');
      } else {
        setLocationStatus('estimated');
      }
      
    } catch (error) {
      console.error('Failed to refresh emergency contacts:', error);
      setLocationStatus('error');
    }
  };

  /**
   * Handle analysis updates from ChatBot component
   * 
   * Receives analysis results from the ChatBot and updates global state.
   * Used for cross-component communication and state persistence.
   * 
   * @param {Object} analysis - Analysis result from ChatBot
   */
  const handleAnalysisUpdate = (analysis) => {
    setCurrentAnalysis(analysis);
  };

  /**
   * Handle triage updates from ChatBot component
   * 
   * Processes triage-specific updates for enhanced rescue coordination.
   * Can be extended for additional triage-specific functionality.
   * 
   * @param {Object} analysis - Triage analysis data
   */
  const handleTriageUpdate = (analysis) => {
    // Additional triage-specific updates can be handled here
    console.log('Triage Update:', analysis);
  };

  /**
   * Handle navigation between different app views
   * 
   * Updates the current view state and logs navigation events for monitoring.
   * Supports chat, reports, about, and FAQ pages.
   * 
   * @param {string} view - Target view name ('chat'|'reports'|'about'|'faq')
   */
  const handleNavigation = (view) => {
    // Add breadcrumb for navigation tracking
    addBreadcrumb(
      `Navigation: Switched to ${view}`,
      'navigation',
      'info',
      { from: currentView, to: view }
    );
    
    setCurrentView(view);
  };

  /**
   * Test Sentry integration (development only)
   * 
   * Utility function for testing error tracking and monitoring in development.
   * Helps verify that Sentry is properly configured and receiving events.
   */
  const testSentry = () => {
    if (process.env.NODE_ENV === 'development') {
      addBreadcrumb('Testing Sentry integration', 'test', 'info');
      logMessage('Sentry test message from Curio app', 'info', { feature: 'sentry_test' });
      console.log('Sentry test completed - check console for dev mode message');
    }
  };

  /**
   * Render the current view based on navigation state
   * 
   * Dynamic component rendering based on the current view state.
   * Each view provides different functionality within the app.
   * 
   * @returns {JSX.Element} Current view component
   */
  const renderCurrentView = () => {
    switch (currentView) {
      case 'reports':
        return <Reports />;
        
      case 'about':
        return (
          <div style={{ padding: '40px', textAlign: 'center', color: '#333' }}>
            <h2>🐾 About Curio</h2>
            <p style={{ maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
              Curio is an AI-powered animal rescue assistant designed to help identify, triage, and coordinate rescue efforts for stray and injured animals across India. 
              Our intelligent chatbot provides immediate guidance, connects you with local NGOs, and helps create detailed rescue reports.
            </p>
            
            {/* Location Status Display */}
            <div style={{ 
              marginTop: '20px', 
              padding: '15px', 
              background: '#f3f4f6', 
              borderRadius: '8px',
              maxWidth: '600px',
              margin: '20px auto'
            }}>
              <h4>📍 Location Status</h4>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                Status: <strong>
                  {locationStatus === 'checking' && '🔄 Checking location...'}
                  {locationStatus === 'granted' && '✅ GPS location enabled'}
                  {locationStatus === 'estimated' && '📍 Using estimated location'}
                  {locationStatus === 'error' && '❌ Location unavailable'}
                </strong>
              </p>
              {emergencyContacts?.location && (
                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                  Location: {emergencyContacts.location.detected}
                </p>
              )}
              <button
                onClick={refreshEmergencyContacts}
                style={{
                  marginTop: '10px',
                  padding: '8px 16px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                🔄 Refresh Location & Contacts
              </button>
            </div>

            {/* Development-only Sentry test button */}
            {process.env.NODE_ENV === 'development' && (
              <button 
                onClick={testSentry}
                style={{ 
                  marginTop: '20px', 
                  padding: '10px 20px', 
                  background: '#667eea', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                🔧 Test Sentry Integration
              </button>
            )}
          </div>
        );
        
      case 'faq':
        return (
          <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>❓ Frequently Asked Questions</h2>
            <div style={{ display: 'grid', gap: '20px' }}>
              {/* FAQ items with comprehensive information */}
              <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h4>How does Curio help with animal rescue?</h4>
                <p>Curio analyzes your situation description, determines urgency levels, provides immediate care guidance, and connects you with appropriate local NGOs and veterinarians.</p>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h4>Is the service available 24/7?</h4>
                <p>Yes! Our AI assistant is available round the clock to provide immediate guidance for animal rescue situations.</p>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h4>Can I generate rescue reports?</h4>
                <p>Absolutely! You can generate detailed rescue reports and use our AI to create additional realistic training data for rescue scenarios.</p>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h4>How does location-based emergency contacts work?</h4>
                <p>Curio automatically detects your location and fetches the nearest emergency contacts including veterinary hospitals, animal control, and rescue organizations. You can also manually update your location if needed.</p>
              </div>
            </div>
          </div>
        );
        
      case 'chat':
      default:
        return (
          <ChatBot 
            onAnalysisUpdate={handleAnalysisUpdate}
            onTriageUpdate={handleTriageUpdate}
            emergencyContacts={emergencyContacts}
            locationStatus={locationStatus}
            onRefreshContacts={refreshEmergencyContacts}
          />
        );
    }
  };

  return (
    <div className="App">
      {/* Professional Header with Navigation */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="app-title">
              <span className="app-icon">🐾</span>
              Curio
            </h1>
            <span className="app-subtitle">AI-Powered Animal Rescue Assistant</span>
          </div>
          
          {/* Navigation Menu */}
          <nav className="header-nav">
            <button 
              className={`nav-button ${currentView === 'chat' ? 'active' : ''}`}
              onClick={() => handleNavigation('chat')}
            >
              <span className="nav-icon">💬</span>
              Chat
            </button>
            <button 
              className={`nav-button ${currentView === 'reports' ? 'active' : ''}`}
              onClick={() => handleNavigation('reports')}
            >
              <span className="nav-icon">📊</span>
              Reports
            </button>
            <button 
              className={`nav-button ${currentView === 'about' ? 'active' : ''}`}
              onClick={() => handleNavigation('about')}
            >
              <span className="nav-icon">ℹ️</span>
              About Us
            </button>
            <button 
              className={`nav-button ${currentView === 'faq' ? 'active' : ''}`}
              onClick={() => handleNavigation('faq')}
            >
              <span className="nav-icon">❓</span>
              FAQ
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content with Error Boundary */}
      <main className="app-main">
        <ErrorBoundary>
          {renderCurrentView()}
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default App; 