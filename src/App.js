import React from 'react';
import ChatBot from './components/ChatBot';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>🐾 Curio</h1>
        <p>AI-Powered Stray Animal Rescue Assistant</p>
      </header>
      <main className="App-main">
        <ChatBot />
      </main>
    </div>
  );
}

export default App; 