import React, { useState, useRef, useEffect } from 'react';
import './ChatBot.css';
import Message from './Message';
import Sidebar from './Sidebar';
import TriagePanel from './TriagePanel';
import NGOPanel from './NGOPanel';
import openaiService from '../services/openai';
import locationService from '../services/locationService';

const ChatBot = ({ 
  onAnalysisUpdate, 
  onTriageUpdate, 
  emergencyContacts, 
  locationStatus, 
  onRefreshContacts 
}) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm Curio 🐾, your AI assistant for animal rescue situations. I'm here to help you with stray animals in need. Please describe what you've encountered, and I'll provide guidance and connect you with the right resources.",
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermissionAsked, setLocationPermissionAsked] = useState(false);
  const messagesEndRef = useRef(null);

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

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Request location on first message (regardless of length)
  const requestLocationIfNeeded = async () => {
    console.log('requestLocationIfNeeded called', {
      locationPermissionAsked,
      hasUserLocation: !!userLocation
    });
    
    // If we already have location data, return it
    if (userLocation) {
      console.log('Returning cached location');
      return userLocation;
    }
    
    // Only request location if we haven't asked before
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

  const handleContactNGO = (ngo, method) => {
    if (method === 'call' && ngo.phone) {
      window.open(`tel:${ngo.phone}`);
    } else if (method === 'email' && ngo.email) {
      const subject = encodeURIComponent('Animal Rescue Assistance Needed');
      const body = encodeURIComponent(`Dear ${ngo.name},\n\nI need assistance with an animal rescue situation. Please contact me as soon as possible.\n\nBest regards`);
      window.open(`mailto:${ngo.email}?subject=${subject}&body=${body}`);
    }
  };

  const generateSmartFollowUp = (analysis) => {
    const followUps = [];

    // Phase 2: Smart location follow-up (only if no GPS location)
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

    // Phase 2: Urgency-based alerts
    if (analysis.urgencyLevel === 'high') {
      followUps.push({
        text: `⚠️ This appears to be a HIGH URGENCY situation. Time is critical - please contact the recommended NGO immediately if you haven't already.`,
        delay: 2500
      });
    }

    // Phase 2: Consistency checks
    if (!analysis.consistencyCheck?.isConsistent) {
      followUps.push({
        text: `I noticed some details that might need clarification: ${analysis.consistencyCheck.conflictingInfo.join(', ')}. Could you help me understand this better?`,
        delay: 3500
      });
    }

    // Phase 3: NGO availability reminder with distance info
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

      // Phase 2: Generate smart follow-ups
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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

  const handleNewConversation = () => {
    // Phase 2: Clear conversation history in OpenAI service
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
            {/* Phase 2: Smart Status Indicator */}
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
              
              <div className="messages-container">
                {messages.map((message) => (
                  <Message 
                    key={message.id} 
                    message={message} 
                    onContactNGO={handleContactNGO}
                  />
                ))}
                
                {/* Phase 2: Enhanced Triage Panel - Integrated seamlessly */}
                {currentAnalysis && currentAnalysis.isRescueSituation && (
                  <TriagePanel 
                    analysis={currentAnalysis} 
                    onLocationHelp={handleLocationHelp}
                  />
                )}
                
                {/* Phase 3: NGO Recommendations Panel - Moved to Message component */}
                
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
              
              {/* Phase 2: Discrete status indicator */}
              <div className="phase-status-discrete">
                <span className="phase-badge-small">
                  🧠 Phase 3: Smart Triage + NGO Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
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