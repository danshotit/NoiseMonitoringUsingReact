// src/App.js
import React from 'react';
import './App.css';  // Optional, if you want to add styles for the app
import NoiseMonitor from './components/NoiseMonitor.js'; // Import NoiseMonitor

function App() {
  return (
    <div className="App">
      <h1>Noise Monitor Application</h1>
      <NoiseMonitor />
    </div>
  );
}

export default App;
