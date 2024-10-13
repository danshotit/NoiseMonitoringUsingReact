// src/components/NoiseMonitor.js
import React, { useState, useRef } from 'react';
import './NoiseMonitor.css'; // Import CSS for the NoiseMonitor component

const NoiseMonitor = () => {
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [microphoneStream, setMicrophoneStream] = useState(null);
  const [noiseLevel, setNoiseLevel] = useState(0);
  const [status, setStatus] = useState('Quiet');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const noiseLevelRef = useRef(null);

  // Function to calculate the average volume from frequency data
  const getAverageVolume = (dataArray) => {
    const sum = dataArray.reduce((acc, value) => acc + value, 0);
    return sum / dataArray.length;
  };

  // Function to determine status based on noise level
  const getStatus = (noiseLevel) => {
    if (noiseLevel < 40) return 'Quiet';
    if (noiseLevel < 70) return 'Moderate';
    return 'Noisy';
  };

  // Function to start monitoring noise levels
  const startMonitoring = async () => {
    try {
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicrophoneStream(micStream);

      const context = new (window.AudioContext || window.webkitAudioContext)();
      const analyserNode = context.createAnalyser();
      analyserNode.fftSize = 2048;

      const microphone = context.createMediaStreamSource(micStream);
      microphone.connect(analyserNode);

      setAudioContext(context);
      setAnalyser(analyserNode);
      setIsMonitoring(true);

      const dataArray = new Uint8Array(analyserNode.frequencyBinCount);

      const monitorNoiseLevels = () => {
        if (analyserNode) {
          analyserNode.getByteFrequencyData(dataArray);
          const average = getAverageVolume(dataArray);
          setNoiseLevel(Math.round(average));
          setStatus(getStatus(average));

          noiseLevelRef.current = requestAnimationFrame(monitorNoiseLevels);
        }
      };

      monitorNoiseLevels();
    } catch (error) {
      console.error('Error accessing microphone: ', error);
      setStatus('Error accessing microphone');
    }
  };

  // Function to stop monitoring
  const stopMonitoring = () => {
    if (microphoneStream) {
      microphoneStream.getTracks().forEach(track => track.stop());
    }
    if (audioContext) {
      audioContext.close();
    }
    cancelAnimationFrame(noiseLevelRef.current);
    setIsMonitoring(false);
    setAudioContext(null);
    setAnalyser(null);
  };

  return (
    <div className="monitor-container">
      <div className="display">
        <strong>Quick Noise Level:</strong> <span>{noiseLevel}</span>
      </div>
      <div className="display">
        <strong>Status:</strong> <span>{status}</span>
      </div>
      <div className="button-group">
        <button
          className="start-button"
          onClick={startMonitoring}
          disabled={isMonitoring}
        >
          Start Monitoring
        </button>
        <button
          className={`stop-button ${isMonitoring ? 'active' : ''}`}
          onClick={stopMonitoring}
          disabled={!isMonitoring}
        >
          Stop Monitoring
        </button>
      </div>
    </div>
  );
};

export default NoiseMonitor;
