/**
 * Control Panel Page for OpenWord
 * 
 * Protected page where authenticated users can manage their translation service.
 * Includes authentication check and redirects to login if not authenticated.
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from '../styles/Control.module.css';

export default function ControlPanel() {
  const { user, session, loading, signOut } = useAuth();
  const router = useRouter();
  const [churchData, setChurchData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [serviceActive, setServiceActive] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [loadingQr, setLoadingQr] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch church data when user is authenticated
  useEffect(() => {
    if (user && session) {
      fetchChurchData();
    }
  }, [user, session]);

  const fetchChurchData = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_NAME}/api/church/profile`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setChurchData(data.data);
        // Generate QR code after fetching church data
        if (data.data) {
          generateQRCode(data.data.church_key, data.data.default_service_id);
        }
      } else {
        console.error('Failed to fetch church data');
      }
    } catch (error) {
      console.error('Error fetching church data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const generateQRCode = async (churchKey, serviceId) => {
    setLoadingQr(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_NAME}/qrcode/generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            churchKey: churchKey,
            serviceId: serviceId,
            format: 'png'
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        setQrCodeUrl(data.responseObject.qrCode);
      } else {
        console.error('Failed to generate QR code');
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setLoadingQr(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const handleStartService = async () => {
    try {
      const serviceId = churchData?.default_service_id || '1234';
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_NAME}/api/service/${serviceId}/start`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            languages: churchData?.translation_languages || []
          })
        }
      );

      if (response.ok) {
        setServiceActive(true);
        alert('Service started successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to start service: ${error.message}`);
      }
    } catch (error) {
      console.error('Error starting service:', error);
      alert('Failed to start service');
    }
  };

  const handleStopService = async () => {
    try {
      const serviceId = churchData?.default_service_id || '1234';
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_NAME}/api/service/${serviceId}/stop`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        setServiceActive(false);
        alert('Service stopped successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to stop service: ${error.message}`);
      }
    } catch (error) {
      console.error('Error stopping service:', error);
      alert('Failed to stop service');
    }
  };

  // Show loading state
  if (loading || loadingData) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading control panel...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Control Panel - OpenWord</title>
        <meta name="description" content="Manage your translation service" />
      </Head>
      
      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.logo}>OpenWord Control Panel</h1>
            <div className={styles.userInfo}>
              <span className={styles.userEmail}>{user.email}</span>
              <button onClick={handleSignOut} className={styles.signOutButton}>
                Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className={styles.main}>
          {/* Church Info Card */}
          {churchData && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Church Information</h2>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Name:</span>
                  <span className={styles.infoValue}>{churchData.name}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Organization Key:</span>
                  <span className={styles.infoValue} style={{fontWeight: 'bold', color: '#007bff'}}>{churchData.church_key}</span>
                  <small style={{display: 'block', marginTop: '4px', color: '#666'}}>
                    Use this key in participant URLs
                  </small>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Default Service ID:</span>
                  <span className={styles.infoValue}>{churchData.default_service_id}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Host Language:</span>
                  <span className={styles.infoValue}>{churchData.host_language}</span>
                </div>
              </div>
            </div>
          )}

          {/* Service Control Card */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Translation Service</h2>
            
            <div className={styles.serviceStatus}>
              <div className={styles.statusIndicator}>
                <div className={`${styles.statusDot} ${serviceActive ? styles.active : styles.inactive}`}></div>
                <span className={styles.statusText}>
                  {serviceActive ? 'Service Active' : 'Service Inactive'}
                </span>
              </div>
            </div>

            <div className={styles.controlButtons}>
              {!serviceActive ? (
                <button
                  onClick={handleStartService}
                  className={`${styles.button} ${styles.startButton}`}
                >
                  Start Translation Service
                </button>
              ) : (
                <button
                  onClick={handleStopService}
                  className={`${styles.button} ${styles.stopButton}`}
                >
                  Stop Translation Service
                </button>
              )}
            </div>

            {serviceActive && churchData && (
              <div className={styles.activeInfo}>
                <p>Translation service is running</p>
                <p className={styles.clientUrl}>
                  Participant URL: <a href={`${process.env.NEXT_PUBLIC_CLIENT_URL || window.location.origin}?church=${churchData.church_key}&serviceId=${churchData.default_service_id}`} target="_blank" rel="noopener noreferrer">
                    Open Translation View
                  </a>
                </p>
                <p className={styles.helpText}>
                  Share this URL or QR code with participants to access translations
                </p>
              </div>
            )}
          </div>

          {/* QR Code Card */}
          {churchData && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Participant Access</h2>

              <div className={styles.qrSection}>
                <p className={styles.qrDescription}>
                  Share this QR code or URL with participants to access the translation service
                </p>

                {loadingQr ? (
                  <div className={styles.qrLoading}>
                    <div className={styles.spinner}></div>
                    <p>Generating QR code...</p>
                  </div>
                ) : qrCodeUrl ? (
                  <div className={styles.qrCodeContainer}>
                    <img
                      src={qrCodeUrl}
                      alt="QR Code for Translation Service"
                      className={styles.qrCodeImage}
                    />
                    <p className={styles.qrCodeInfo}>
                      Scan to access: {churchData.name}
                    </p>
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = qrCodeUrl;
                        link.download = `${churchData.church_key}-qr-code.png`;
                        link.click();
                      }}
                      className={styles.downloadButton}
                    >
                      Download QR Code
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => generateQRCode(churchData.church_key, churchData.default_service_id)}
                    className={styles.button}
                  >
                    Generate QR Code
                  </button>
                )}

                <div className={styles.urlDisplay}>
                  <label className={styles.urlLabel}>Participant URL:</label>
                  <div className={styles.urlBox}>
                    <input
                      type="text"
                      value={`${process.env.NEXT_PUBLIC_CLIENT_URL || (typeof window !== 'undefined' ? window.location.origin : '')}?church=${churchData.church_key}&serviceId=${churchData.default_service_id}`}
                      readOnly
                      className={styles.urlInput}
                    />
                    <button
                      onClick={() => {
                        const url = `${typeof window !== 'undefined' ? window.location.origin : ''}?church=${churchData.church_key}&serviceId=${churchData.default_service_id}`;
                        navigator.clipboard.writeText(url);
                        alert('URL copied to clipboard!');
                      }}
                      className={styles.copyButton}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats Grid - Moved after QR Code */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <h3 className={styles.statValue}>0</h3>
              <p className={styles.statLabel}>Active Viewers</p>
            </div>
            <div className={styles.statCard}>
              <h3 className={styles.statValue}>{churchData?.translation_languages?.length || 0}</h3>
              <p className={styles.statLabel}>Available Languages</p>
            </div>
            <div className={styles.statCard}>
              <h3 className={styles.statValue}>0</h3>
              <p className={styles.statLabel}>Total Services Today</p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
