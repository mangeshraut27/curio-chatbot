import React from 'react';
import Header from './components/Header';
import ChatBot from './components/ChatBot';
import './App.css';

function App() {
  return (
    <div className="App">
      <Header />
      <main className="App-main">
        <ChatBot />
      </main>
    </div>
  );
}

export default App; 