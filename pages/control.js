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
  const [organisationData, setOrganisationData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [serviceActive, setServiceActive] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [noChurchProfile, setNoChurchProfile] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch church data when user is authenticated
  useEffect(() => {
    if (user && session) {
      fetchOrganisationData();
    }
  }, [user, session]);

  const fetchOrganisationData = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_NAME}/api/organisation/profile`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Organisation data loaded:', data);
        setOrganisationData(data.data);
        // Generate QR code after fetching church data
        if (data.data) {
          generateQRCode(data.data.church_key, data.data.default_service_id);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Failed to fetch organisation data:', response.status, errorData);

        if (response.status === 404) {
          // User doesn't have an organisation profile yet
          setNoChurchProfile(true);
        } else {
          alert(`Failed to load church data: ${errorData.message || errorData.error || 'Unknown error'}\n\nStatus: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching church data:', error);
      alert(`Error loading organisation data: ${error.message}\n\nPlease check that you're logged in and have an organisation profile.`);
    } finally {
      setLoadingData(false);
    }
  };

  const generateQRCode = async (churchKey, serviceId) => {
    setLoadingQr(true);
    console.log('🔍 Generating QR code with:', { churchKey, serviceId });
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_NAME}/qrcode/generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            organisationKey: organisationKey,
            serviceId: serviceId,
            format: 'png'
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('✅ QR code generated successfully');
        setQrCodeUrl(data.responseObject.qrCode);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Failed to generate QR code:', errorData);
        alert(`Failed to generate QR code: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error generating QR code:', error);
      alert(`Error generating QR code: ${error.message}`);
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
      const serviceId = organisationData?.default_service_id || '1234';
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_NAME}/api/service/${serviceId}/start`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            languages: organisationData?.translation_languages || []
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
      const serviceId = organisationData?.default_service_id || '1234';
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

  // Show setup message if no church profile
  if (noChurchProfile) {
    return (
      <>
        <Head>
          <title>Setup Required - OpenWord</title>
        </Head>

        <div className={styles.container}>
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

          <main className={styles.main}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Church Profile Setup Required</h2>
              <p style={{marginBottom: '20px'}}>
                Your account doesn't have an organisation profile yet. To use the OpenWord translation service,
                you need to complete your organisation setup.
              </p>

              <h3 style={{fontSize: '16px', marginBottom: '12px'}}>Next Steps:</h3>
              <ol style={{lineHeight: '1.8', paddingLeft: '20px'}}>
                <li>Contact your administrator or support team</li>
                <li>They will create an organisation profile for your organization in the database</li>
                <li>Once setup is complete, refresh this page to access the control panel</li>
              </ol>

              <div style={{marginTop: '24px', padding: '16px', background: '#f7fafc', borderRadius: '8px', border: '1px solid #e2e8f0'}}>
                <p style={{margin: '0', fontSize: '14px', color: '#4a5568'}}>
                  <strong>For Administrators:</strong> Create an organisation profile using the Supabase database
                  or the registration endpoint. See <code>MIGRATION-GUIDE-EXISTING-TABLES.md</code> for instructions.
                </p>
              </div>

              <button
                onClick={() => window.location.reload()}
                className={styles.button}
                style={{marginTop: '24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}
              >
                Refresh Page
              </button>
            </div>
          </main>
        </div>
      </>
    );
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
          {organisationData && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Church Information</h2>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Name:</span>
                  <span className={styles.infoValue}>{organisationData.name}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Organization Key:</span>
                  <span className={styles.infoValue} style={{fontWeight: 'bold', color: '#007bff'}}>{organisationData.organisation_key}</span>
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

            {serviceActive && organisationData && (
              <div className={styles.activeInfo}>
                <p>Translation service is running</p>
                <p className={styles.clientUrl}>
                  Participant URL: <a href={`${process.env.NEXT_PUBLIC_CLIENT_URL || window.location.origin}?church=${organisationData.organisation_key}&serviceId=${churchData.default_service_id}`} target="_blank" rel="noopener noreferrer">
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
          {organisationData && (
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
                      Scan to access: {organisationData.name}
                    </p>
                    <div className={styles.qrUrlDisplay}>
                      <small>QR Code URL:</small>
                      <code>
                        {typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_CLIENT_URL || ''}
                        ?church={organisationData.organisation_key}&serviceId={churchData.default_service_id}
                      </code>
                    </div>
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = qrCodeUrl;
                        link.download = `${organisationData.organisation_key}-qr-code.png`;
                        link.click();
                      }}
                      className={styles.downloadButton}
                    >
                      Download QR Code
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => generateQRCode(organisationData.organisation_key, churchData.default_service_id)}
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
                      value={`${process.env.NEXT_PUBLIC_CLIENT_URL || (typeof window !== 'undefined' ? window.location.origin : '')}?church=${organisationData.organisation_key}&serviceId=${churchData.default_service_id}`}
                      readOnly
                      className={styles.urlInput}
                    />
                    <button
                      onClick={() => {
                        const url = `${typeof window !== 'undefined' ? window.location.origin : ''}?church=${organisationData.organisation_key}&serviceId=${churchData.default_service_id}`;
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
              <h3 className={styles.statValue}>{organisationData?.translation_languages?.length || 0}</h3>
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
