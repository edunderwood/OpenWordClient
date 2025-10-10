import { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

export default function Home() {
  // State for toggle
  const [showOriginal, setShowOriginal] = useState(true);
  
  // State for transcript data
  const [currentTranscript, setCurrentTranscript] = useState({
    original: '',
    translation: '',
    originalLanguage: 'English'
  });
  
  // State for connection and service
  const [isConnected, setIsConnected] = useState(false);
  const [serviceActive, setServiceActive] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('Spanish');
  
  // Church configuration (these would normally come from the server)
  const [churchConfig, setChurchConfig] = useState({
    greeting: '',
    message: [],
    logo: '',
    waitingMessage: ''
  });

  // Load toggle preference from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('showOriginal');
      if (saved !== null) {
        setShowOriginal(JSON.parse(saved));
      }
    }
  }, []);

  // Save toggle preference to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('showOriginal', JSON.stringify(showOriginal));
    }
  }, [showOriginal]);

  // WebSocket connection for real-time transcripts
  useEffect(() => {
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_NAME;
    if (!serverUrl) return;

    let ws;
    
    const connectWebSocket = () => {
      try {
        ws = new WebSocket(`${serverUrl.replace('http', 'ws')}/ws`);
        
        ws.onopen = () => {
          console.log('Connected to server');
          setIsConnected(true);
          // Send language preference
          ws.send(JSON.stringify({ 
            type: 'language', 
            language: selectedLanguage 
          }));
        };
        
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          
          if (data.type === 'config') {
            setChurchConfig(data.config);
          } else if (data.type === 'service_status') {
            setServiceActive(data.active);
          } else if (data.type === 'transcript') {
            setCurrentTranscript({
              original: data.original || '',
              translation: data.translation || '',
              originalLanguage: data.originalLanguage || 'English'
            });
          }
        };
        
        ws.onclose = () => {
          console.log('Disconnected from server');
          setIsConnected(false);
          // Attempt to reconnect after 3 seconds
          setTimeout(connectWebSocket, 3000);
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };
        
      } catch (error) {
        console.error('Failed to connect:', error);
        setTimeout(connectWebSocket, 3000);
      }
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [selectedLanguage]);

  // Handle toggle change
  const handleToggleChange = (e) => {
    setShowOriginal(e.target.checked);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Church Translation Service</title>
        <meta name="description" content="Live translation service" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {/* Church Logo and Greeting */}
        {churchConfig.logo && (
          <div className={styles.logoContainer}>
            <img src={churchConfig.logo} alt="Church Logo" className={styles.logo} />
          </div>
        )}
        
        {churchConfig.greeting && (
          <h1 className={styles.greeting}>{churchConfig.greeting}</h1>
        )}

        {/* Service Status */}
        {!serviceActive ? (
          <div className={styles.waitingScreen}>
            <div className={styles.waitingMessage}>
              {churchConfig.waitingMessage || 'Translation service will begin shortly...'}
            </div>
            {churchConfig.message && churchConfig.message.map((msg, index) => (
              <p key={index} className={styles.churchMessage}>{msg}</p>
            ))}
          </div>
        ) : (
          <>
            {/* Toggle Control */}
            <div className={styles.controls}>
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={showOriginal}
                  onChange={handleToggleChange}
                  className={styles.toggleCheckbox}
                  aria-label="Toggle original text display"
                />
                <span className={styles.toggleSwitch}>
                  <span className={styles.toggleSlider}></span>
                </span>
                <span className={styles.toggleText}>
                  Show Original Language
                </span>
              </label>
            </div>

            {/* Transcript Display */}
            <div className={styles.transcriptContainer}>
              {/* Original Text - Conditionally Rendered */}
              {showOriginal && currentTranscript.original && (
                <div className={styles.originalSection}>
                  <h2 className={styles.sectionTitle}>
                    {currentTranscript.originalLanguage}
                  </h2>
                  <div className={styles.textContent}>
                    {currentTranscript.original}
                  </div>
                </div>
              )}

              {/* Translated Text */}
              {currentTranscript.translation && (
                <div className={styles.translationSection}>
                  <h2 className={styles.sectionTitle}>
                    {selectedLanguage}
                  </h2>
                  <div className={styles.textContent}>
                    {currentTranscript.translation}
                  </div>
                </div>
              )}

              {/* No transcript message */}
              {!currentTranscript.original && !currentTranscript.translation && (
                <div className={styles.noTranscript}>
                  Waiting for transcript...
                </div>
              )}
            </div>

            {/* Connection Status Indicator */}
            <div className={styles.statusBar}>
              <span className={`${styles.statusIndicator} ${isConnected ? styles.connected : styles.disconnected}`}>
                {isConnected ? '● Connected' : '○ Disconnected'}
              </span>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
