import React, { useState, useRef, useEffect } from 'react';
import OpenAIService from '../services/openai';
import Message from './Message';
import RescueReport from './RescueReport';
import './ChatBot.css';

const ChatBot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hi there! I'm Curio 🐾, your AI assistant for stray animal rescue. I'm here to help if you've encountered a stray animal that needs assistance. Please describe the situation and I'll guide you through the next steps.",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rescueReport, setRescueReport] = useState(null);
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

  return (
    <div className="chatbot-container">
      <div className="chat-header">
        <h2>🐾 Chat with Curio</h2>
        <p>Describe any stray animal situation and I'll help you</p>
      </div>
      
      <div className="messages-container">
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className="loading-message">
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span>Curio is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Describe the stray animal situation..."
          className="message-input"
          rows={2}
          disabled={isLoading}
        />
        <button 
          onClick={handleSendMessage}
          className="send-button"
          disabled={!inputValue.trim() || isLoading}
        >
          Send
        </button>
      </div>

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