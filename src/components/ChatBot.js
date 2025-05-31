/**
 * ChatBot Component - Main Chat Interface
 * 
 * Core component providing the intelligent chat interface for animal rescue assistance.
 * Integrates AI analysis, location services, emergency contacts, and triage functionality
 * to deliver comprehensive animal rescue support.
 * 
 * Key Features:
 * - Real-time AI-powered message analysis
 * - Automatic GPS location detection and integration
 * - Smart follow-up question generation
 * - Emergency contact display and management
 * - Triage panel with urgency indicators
 * - NGO recommendations with distance calculations
 * - Conversation history with context awareness
 * 
 * @author Curio Development Team
 * @version 1.0.0
 */

import React, { useState, useRef, useEffect } from 'react';
import './ChatBot.css';
import Message from './Message';
import Sidebar from './Sidebar';
import TriagePanel from './TriagePanel';
import NGOPanel from './NGOPanel';
import openaiService from '../services/openai';
import locationService from '../services/locationService';

/**
 * ChatBot Component Props
 * @typedef {Object} ChatBotProps
 * @property {Function} onAnalysisUpdate - Callback for analysis updates
 * @property {Function} onTriageUpdate - Callback for triage updates  
 * @property {Object|null} emergencyContacts - Emergency contacts data
 * @property {string} locationStatus - Location detection status
 * @property {Function} onRefreshContacts - Callback to refresh contacts
 */

/**
 * Main ChatBot Component
 * 
 * Provides the primary chat interface with AI-powered animal rescue assistance.
 * Manages conversation flow, location detection, and emergency response coordination.
 * 
 * @param {ChatBotProps} props - Component props
 * @returns {JSX.Element} ChatBot interface
 */
const ChatBot = ({ 
  onAnalysisUpdate, 
  onTriageUpdate, 
  emergencyContacts, 
  locationStatus, 
  onRefreshContacts 
}) => {
  /** @type {[Array, Function]} Chat messages array state */
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm Curio 🐾, your AI assistant for animal rescue situations. I'm here to help you with stray animals in need. Please describe what you've encountered, and I'll provide guidance and connect you with the right resources.",
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  
  /** @type {[string, Function]} Current input text state */
  const [inputText, setInputText] = useState('');
  
  /** @type {[boolean, Function]} Loading state for API calls */
  const [isLoading, setIsLoading] = useState(false);
  
  /** @type {[Object|null, Function]} Current AI analysis result */
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  
  /** @type {[boolean, Function]} Typing indicator state */
  const [isTyping, setIsTyping] = useState(false);
  
  /** @type {[Object|null, Function]} Report data state (legacy) */
  const [reportData, setReportData] = useState(null);
  
  /** @type {[Object|null, Function]} User location data */
  const [userLocation, setUserLocation] = useState(null);
  
  /** @type {[boolean, Function]} Location permission request state */
  const [locationPermissionAsked, setLocationPermissionAsked] = useState(false);
  
  /** @type {React.RefObject} Reference to messages container end for auto-scroll */
  const messagesEndRef = useRef(null);

  /**
   * Scroll to bottom of messages container
   * 
   * Provides smooth scrolling to the latest message with fallback for test environments.
   * Handles cases where smooth scrolling is not supported.
   */
  const scrollToBottom = () => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      try {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      } catch (error) {
        // Fallback for test environment or if smooth scrolling is not supported
        messagesEndRef.current.scrollIntoView();
      }
    }
  };

  /**
   * Auto-scroll effect
   * 
   * Automatically scrolls to bottom when new messages are added or typing indicator changes.
   */
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  /**
   * Request location permission and data if needed
   * 
   * Handles location permission requests with user-friendly messaging.
   * Only requests location once per session to avoid annoying users.
   * Provides fallback messaging for denied permissions.
   * 
   * @returns {Promise<Object|null>} Location data or null if unavailable
   */
  const requestLocationIfNeeded = async () => {
    console.log('requestLocationIfNeeded called', {
      locationPermissionAsked,
      hasUserLocation: !!userLocation
    });
    
    // Return cached location if available
    if (userLocation) {
      console.log('Returning cached location');
      return userLocation;
    }
    
    // Skip if permission already requested this session
    if (locationPermissionAsked) {
      console.log('Location permission already asked, returning null');
      return null;
    }

    try {
      console.log('Requesting location permission...');
      setLocationPermissionAsked(true);
      
      // Show location request message
      const locationRequestMessage = {
        id: Date.now() - 1,
        text: "🌍 To provide the most accurate help and find nearby rescue organizations, I'd like to access your current location. This will help me:",
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString(),
        isLocationRequest: true
      };
      
      setMessages(prev => [...prev, locationRequestMessage]);

      const location = await locationService.getLocationForAnalysis();
      
      if (location) {
        setUserLocation(location);
        
        // Show location confirmation message
        const locationConfirmMessage = {
          id: Date.now(),
          text: `✅ Location detected: ${location.address.formatted} (${location.accuracy}m accuracy). I'll use this to find the best local rescue resources for you.`,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString(),
          isLocationConfirm: true
        };
        
        setTimeout(() => {
          setMessages(prev => [...prev, locationConfirmMessage]);
        }, 1000);

        return location;
      }
    } catch (error) {
      // Show fallback message if location denied
      const locationDeniedMessage = {
        id: Date.now(),
        text: "📍 No worries! Please mention your location (city, area, or landmarks) in your message so I can still help you find local rescue resources.",
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString(),
        isLocationFallback: true
      };
      
      setTimeout(() => {
        setMessages(prev => [...prev, locationDeniedMessage]);
      }, 1000);
    }
    
    return null;
  };

  /**
   * Handle NGO contact interactions
   * 
   * Provides one-click calling and emailing functionality for NGO contacts.
   * Formats contact information appropriately for different contact methods.
   * 
   * @param {Object} ngo - NGO contact information
   * @param {string} method - Contact method ('call' or 'email')
   */
  const handleContactNGO = (ngo, method) => {
    if (method === 'call' && ngo.phone) {
      window.open(`tel:${ngo.phone}`);
    } else if (method === 'email' && ngo.email) {
      const subject = encodeURIComponent('Animal Rescue Assistance Needed');
      const body = encodeURIComponent(`Dear ${ngo.name},\n\nI need assistance with an animal rescue situation. Please contact me as soon as possible.\n\nBest regards`);
      window.open(`mailto:${ngo.email}?subject=${subject}&body=${body}`);
    }
  };

  /**
   * Generate smart follow-up messages based on analysis
   * 
   * Creates contextual follow-up messages based on the AI analysis results.
   * Provides additional guidance, clarifications, and reminders as needed.
   * 
   * @param {Object} analysis - AI analysis results
   * @returns {Array<Object>} Array of follow-up message objects with delays
   */
  const generateSmartFollowUp = (analysis) => {
    const followUps = [];

    // Smart location follow-up (only if no GPS location)
    if (analysis.locationAnalysis?.needsMoreDetail && !userLocation) {
      followUps.push({
        text: `Could you provide more specific location details? ${analysis.locationAnalysis.suggestedQuestions[0] || 'What landmarks or cross streets are nearby?'}`,
        delay: 1500
      });
    }

    // GPS location enhancement suggestions
    if (userLocation && userLocation.accuracy > 100) {
      followUps.push({
        text: `💡 Your location accuracy is ${userLocation.accuracy}m. For better NGO matching, try moving to an open area or providing specific landmarks nearby.`,
        delay: 2000
      });
    }

    // Urgency-based alerts
    if (analysis.urgencyLevel === 'high') {
      followUps.push({
        text: `⚠️ This appears to be a HIGH URGENCY situation. Time is critical - please contact the recommended NGO immediately if you haven't already.`,
        delay: 2500
      });
    }

    // Consistency checks
    if (!analysis.consistencyCheck?.isConsistent) {
      followUps.push({
        text: `I noticed some details that might need clarification: ${analysis.consistencyCheck.conflictingInfo.join(', ')}. Could you help me understand this better?`,
        delay: 3500
      });
    }

    // NGO availability reminder with distance info
    if (analysis.ngoRecommendations?.found && analysis.urgencyLevel !== 'high') {
      const nearestNGO = analysis.ngoRecommendations.ngos[0];
      const distanceInfo = nearestNGO?.distanceText ? ` The nearest one is ${nearestNGO.distanceText}.` : '';
      
      followUps.push({
        text: `💡 I've found local NGOs that can help.${distanceInfo} Please note their availability hours before calling.`,
        delay: 4000
      });
    }

    return followUps;
  };

  /**
   * Handle message sending and AI analysis
   * 
   * Main message processing function that handles user input, location detection,
   * AI analysis, and response generation. Orchestrates the entire conversation flow.
   * 
   * @async
   * @function
   */
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Request location for first message (will return cached location if available)
      const detectedLocation = await requestLocationIfNeeded();
      const locationToUse = detectedLocation || userLocation;

      console.log('Location debug:', {
        detectedLocation: !!detectedLocation,
        userLocation: !!userLocation,
        locationToUse: !!locationToUse,
        hasLocationData: !!locationToUse?.coordinates
      });

      // Enhanced message with location details for OpenAI
      let enhancedMessage = inputText;
      
      if (locationToUse) {
        const sourceType = detectedLocation ? "GPS DATA AVAILABLE" : "CACHED GPS DATA";
        const locationContext = `

[LOCATION CONTEXT - ${sourceType}]
- User's current location: ${locationToUse.address.formatted}
- GPS coordinates: ${locationToUse.coordinates.lat}, ${locationToUse.coordinates.lng}
- Location accuracy: ${locationToUse.accuracy}m
- City: ${locationToUse.address.city}
- State: ${locationToUse.address.state || 'N/A'}
- Source: GPS geolocation

Original user message: "${inputText}"`;
        
        enhancedMessage = locationContext;
        console.log('Enhanced message with location:', enhancedMessage.substring(0, 200) + '...');
      } else {
        console.log('No location data available, sending original message only');
      }

      // Enhanced analysis with location data
      const analysisInput = {
        message: enhancedMessage, // Send enhanced message with location details
        locationData: locationToUse,
        hasGPS: !!locationToUse,
        previousAnalysis: currentAnalysis
      };

      const analysis = await openaiService.analyzeMessage(analysisInput);
      
      // If we have GPS location, enhance NGO recommendations with distance
      if (locationToUse && analysis.ngoRecommendations?.ngos) {
        const enhancedNGOs = locationService.findNearestNGOs(
          analysis.ngoRecommendations.ngos, 
          50 // 50km radius
        );
        
        analysis.ngoRecommendations.ngos = enhancedNGOs;
        analysis.ngoRecommendations.hasDistance = true;
        analysis.ngoRecommendations.userLocation = locationToUse;
      }

      // Generate response using original user message for context
      const response = await openaiService.generateResponse(analysis, inputText);

      setIsTyping(false);
      
      const botMessage = {
        id: Date.now() + 1,
        text: response,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString(),
        analysis: analysis,
        isSpecial: analysis.isRescueSituation
      };

      setMessages(prev => [...prev, botMessage]);
      setCurrentAnalysis(analysis);
      
      // Update parent components
      if (onAnalysisUpdate) {
        onAnalysisUpdate(analysis);
      }
      if (onTriageUpdate && analysis.isRescueSituation) {
        onTriageUpdate(analysis);
      }

      // Generate smart follow-ups
      const followUps = generateSmartFollowUp(analysis);
      followUps.forEach(({ text, delay }) => {
        setTimeout(() => {
          const followUpMessage = {
            id: Date.now() + Math.random(),
            text: text,
            sender: 'bot',
            timestamp: new Date().toLocaleTimeString(),
            isFollowUp: true
          };
          setMessages(prev => [...prev, followUpMessage]);
        }, delay);
      });

    } catch (error) {
      setIsTyping(false);
      console.error('Error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment.",
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle Enter key press for message sending
   * 
   * Allows users to send messages by pressing Enter (without Shift).
   * Shift+Enter creates new lines for multi-line messages.
   * 
   * @param {KeyboardEvent} e - Keyboard event
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * Handle quick action button clicks
   * 
   * Processes various quick action buttons from the sidebar.
   * Provides shortcuts for common rescue-related actions.
   * 
   * @param {string} action - Action type identifier
   */
  const handleActionClick = (action) => {
    switch (action) {
      case 'find-vets':
        alert('Finding nearby veterinarians...');
        break;
      case 'contact-control':
        alert('Contacting animal control...');
        break;
      case 'report-online':
        alert('Generating detailed rescue report...');
        break;
      case 'share-location':
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              alert(`Location shared: ${position.coords.latitude}, ${position.coords.longitude}`);
            },
            () => alert('Unable to get location')
          );
        } else {
          alert('Geolocation not supported');
        }
        break;
      case 'emergency-vet':
        alert('Calling emergency veterinary services...');
        break;
      case 'local-rescues':
        alert('Finding local rescue organizations...');
        break;
      default:
        break;
    }
  };

  /**
   * Handle location help requests
   * 
   * Provides additional guidance when users need help with location specification.
   * Generates helpful tips for providing better location information.
   */
  const handleLocationHelp = () => {
    const locationHelpMessage = {
      id: Date.now(),
      text: "To help rescuers find the animal quickly, please provide: street address, nearby landmarks, cross streets, or distinctive buildings. The more specific, the better!",
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString(),
      isFollowUp: true
    };

    setMessages(prev => [...prev, locationHelpMessage]);
  };

  /**
   * Handle new conversation reset
   * 
   * Resets the entire conversation state and clears AI service history.
   * Useful for starting fresh rescue consultations.
   */
  const handleNewConversation = () => {
    // Clear conversation history in OpenAI service
    openaiService.clearHistory();
    setCurrentAnalysis(null);
    setReportData(null);
    setMessages([
      {
        id: 1,
        text: "Hello! I'm Curio 🐾, your AI assistant for animal rescue situations. I'm here to help you with stray animals in need. Please describe what you've encountered, and I'll provide guidance and connect you with the right resources.",
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  };

  return (
    <div className="chat-layout">
      <div className="chat-main">
        <div className="chat-container">
          <div className="chat-header">
            <h1>Curio Chat Assistant</h1>
            {/* Smart Status Indicator */}
            {currentAnalysis && currentAnalysis.isRescueSituation && (
              <div className="triage-status-header">
                <span className={`urgency-indicator-small ${currentAnalysis.urgencyLevel}`}>
                  {currentAnalysis.urgencyLevel === 'high' ? '🚨' : 
                   currentAnalysis.urgencyLevel === 'medium' ? '⚠️' : '✅'}
                </span>
                <span className="urgency-text-small">
                  {currentAnalysis.urgencyLevel?.toUpperCase()} Priority
                </span>
                {currentAnalysis.rescueReport?.triageScore && (
                  <span className="triage-score-header">
                    Score: {currentAnalysis.rescueReport.triageScore}/10
                  </span>
                )}
              </div>
            )}
          </div>
          
          <div className="chat-content">
            <div className="messages-area">
              {/* Animated Robot Illustration */}
              <div className="robot-illustration">
                <div className="robot">
                  <div className="robot-head">
                    <div className="robot-eyes">
                      <div className="eye left-eye"></div>
                      <div className="eye right-eye"></div>
                    </div>
                    <div className="robot-mouth"></div>
                  </div>
                  <div className="robot-body">
                    <div className="robot-arms">
                      <div className="arm left-arm"></div>
                      <div className="arm right-arm"></div>
                    </div>
                    <div className="robot-chest"></div>
                  </div>
                  <div className="robot-legs">
                    <div className="leg left-leg"></div>
                    <div className="leg right-leg"></div>
                  </div>
                </div>
                <div className="speech-bubble">
                  <span>
                    {currentAnalysis && currentAnalysis.isRescueSituation ? 
                      `${currentAnalysis.urgencyLevel?.toUpperCase()} Priority` : 
                      'Hello!'
                    }
                  </span>
                </div>
              </div>
              
              {/* Messages Container */}
              <div className="messages-container">
                {messages.map((message) => (
                  <Message 
                    key={message.id} 
                    message={message} 
                    onContactNGO={handleContactNGO}
                  />
                ))}
                
                {/* Integrated Triage Panel */}
                {currentAnalysis && currentAnalysis.isRescueSituation && (
                  <TriagePanel 
                    analysis={currentAnalysis} 
                    onLocationHelp={handleLocationHelp}
                  />
                )}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <div className="typing-indicator">
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <span>Curio is analyzing...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            {/* Input Section */}
            <div className="input-section">
              <div className="input-container">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Describe the animal situation you've encountered..."
                  className="message-input"
                  rows="2"
                  disabled={isLoading}
                />
                <button 
                  onClick={handleSendMessage}
                  className="send-button"
                  disabled={isLoading || !inputText.trim()}
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <div className="loading-spinner"></div>
                  ) : (
                    <span className="send-icon">➤</span>
                  )}
                </button>
              </div>
              
              {/* Phase Status Indicator */}
              <div className="phase-status-discrete">
                <span className="phase-badge-small">
                  🧠 Phase 3: Smart Triage + NGO Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sidebar with Emergency Contacts and Actions */}
      <Sidebar 
        reportData={reportData} 
        analysis={currentAnalysis}
        onActionClick={handleActionClick}
        onLocationHelp={handleLocationHelp}
        onResetConversation={handleNewConversation}
        emergencyContacts={emergencyContacts}
        locationStatus={locationStatus}
        phase="3"
      />
    </div>
  );
};

export default ChatBot; 