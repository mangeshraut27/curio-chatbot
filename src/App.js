import React, { useState, useEffect } from 'react';
import './App.css';
import ChatBot from './components/ChatBot';
import Reports from './pages/Reports';
import ErrorBoundary from './components/ErrorBoundary';
import { addBreadcrumb, logMessage } from './utils/sentry';
import emergencyContactsService from './services/emergencyContactsService';

function App() {
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [currentView, setCurrentView] = useState('chat'); // New state for navigation
  const [emergencyContacts, setEmergencyContacts] = useState(null);
  const [locationStatus, setLocationStatus] = useState('checking'); // checking, granted, denied, error

  useEffect(() => {
    // Initialize emergency contacts on app load
    initializeEmergencyContacts();
  }, []);

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
      
      // Set basic fallback
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

  // Handle emergency contacts refresh
  const refreshEmergencyContacts = async () => {
    try {
      setLocationStatus('checking');
      const refreshedContacts = await emergencyContactsService.refreshEmergencyContacts();
      setEmergencyContacts(refreshedContacts);
      
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

  const handleAnalysisUpdate = (analysis) => {
    setCurrentAnalysis(analysis);
  };

  const handleTriageUpdate = (analysis) => {
    // Additional triage-specific updates can be handled here
    console.log('Triage Update:', analysis);
  };

  const handleNavigation = (view) => {
    // Add breadcrumb for navigation
    addBreadcrumb(
      `Navigation: Switched to ${view}`,
      'navigation',
      'info',
      { from: currentView, to: view }
    );
    
    setCurrentView(view);
  };

  // Test Sentry integration (only in development)
  const testSentry = () => {
    if (process.env.NODE_ENV === 'development') {
      addBreadcrumb('Testing Sentry integration', 'test', 'info');
      logMessage('Sentry test message from Curio app', 'info', { feature: 'sentry_test' });
      console.log('Sentry test completed - check console for dev mode message');
    }
  };

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