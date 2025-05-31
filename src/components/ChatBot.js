import React, { useState, useRef, useEffect } from 'react';
import OpenAIService from '../services/openai';
import Message from './Message';
import RescueReport from './RescueReport';
import Sidebar from './Sidebar';
import './ChatBot.css';

const ChatBot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hello! I'm Curio, your kind-hearted companion for reporting stray animals. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rescueReport, setRescueReport] = useState(null);
  const [reportData, setReportData] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Analyze the message using OpenAI
      const analysis = await OpenAIService.analyzeMessage(inputValue);
      
      // Generate a response based on the analysis
      const botResponse = await OpenAIService.generateResponse(analysis, inputValue);

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: botResponse,
        timestamp: new Date(),
        analysis: analysis
      };

      setMessages(prev => [...prev, botMessage]);

      // If it's a rescue situation, update the report data for sidebar
      if (analysis.isRescueSituation) {
        setReportData({
          animalType: analysis.animalType || 'Unknown',
          issue: analysis.issue || 'Unknown',
          location: analysis.location || 'Unknown'
        });
      }

      // If it's a rescue situation, generate and show the report
      if (analysis.isRescueSituation && analysis.rescueReport) {
        setRescueReport(analysis.rescueReport);
      }

    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "I'm sorry, I encountered an error while processing your message. Please try again.",
        timestamp: new Date()
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
        if (rescueReport) {
          setRescueReport(rescueReport);
        } else {
          alert('Please report an animal situation first to generate a report.');
        }
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
      default:
        break;
    }
  };

  return (
    <div className="chat-layout">
      <div className="chat-main">
        <div className="chat-container">
          <div className="chat-header">
            <h1>Curio Chat Assistant</h1>
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
                  <span>Hello.</span>
                </div>
              </div>
              
              <div className="messages-container">
                {messages.map((message) => (
                  <Message key={message.id} message={message} />
                ))}
                {isLoading && (
                  <div className="loading-message">
                    <span>Curio is typing...</span>
                    <div className="loading-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="input-section">
              <div className="input-container">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message here..."
                  className="message-input"
                  disabled={isLoading}
                />
                <button 
                  onClick={handleSendMessage}
                  className="send-button"
                  disabled={!inputValue.trim() || isLoading}
                >
                  ➤
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Sidebar 
        reportData={reportData} 
        onActionClick={handleActionClick}
      />

      {rescueReport && (
        <RescueReport 
          report={rescueReport} 
          onClose={() => setRescueReport(null)}
        />
      )}
    </div>
  );
};

export default ChatBot; 