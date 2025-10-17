import React, { useState, useEffect } from 'react';
import styles from '@/styles/Logo.module.css'


const LogoComponent = ({ serverName, organisationKey }) => {
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Build URL with organisation parameter for multi-tenant support
                const organisationParam = organisationKey || '';

                console.log(`🖼️  LogoComponent Props:`, { serverName, organisationKey });

                if (!organisationParam) {
                    console.warn('⚠️  No organisation key provided to LogoComponent');
                    setLoading(false);
                    return;
                }

                const url = `${serverName}/organisation/info?organisation=${encodeURIComponent(organisationParam)}`;
                console.log(`🖼️  Fetching logo from: ${url}`);

                const response = await fetch(url)

                console.log(`🖼️  Response status: ${response.status}`);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    console.error('❌ Error fetching organisation logo:', errorData);
                    setError(errorData.message || 'Failed to load logo');
                    setLoading(false);
                    return;
                }

                const jsonResponse = await response.json();
                console.log(`🖼️  Response data:`, jsonResponse);

                const data = jsonResponse.responseObject;

                if (data.base64Logo) {
                    console.log('✅ Logo found in response');
                    console.log(`🖼️  Logo data length: ${data.base64Logo.length}`);
                    console.log(`🖼️  Logo preview: ${data.base64Logo.substring(0, 50)}...`);
                    setImageUrl(data.base64Logo);
                } else {
                    console.warn('⚠️  No logo found in organisation data');
                    console.warn('⚠️  Available fields:', Object.keys(data));
                }

                setLoading(false);
            } catch (error) {
                console.error(`❌ Error getting organisation logo:`, error);
                setError(error.message);
                setLoading(false);
            }
        }

        if (serverName && organisationKey) {
            fetchData();
        } else {
            console.warn('⚠️  LogoComponent missing required props:', { serverName, organisationKey });
            setLoading(false);
        }
    }, [serverName, organisationKey]);


    if (loading) {
        return (
            <div className={styles.logo} style={{ textAlign: 'center', padding: '20px' }}>
                <p style={{ fontSize: '12px', color: '#666' }}>Loading logo...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.logo} style={{ textAlign: 'center', padding: '20px' }}>
                <p style={{ fontSize: '12px', color: '#f00' }}>Logo error: {error}</p>
            </div>
        );
    }

    if (!imageUrl) {
        console.log('🖼️  No imageUrl, not rendering logo');
        return null;
    }

    console.log('🖼️  Rendering logo with URL:', imageUrl.substring(0, 50) + '...');

    return (
        <div className={styles.logo}>
            <img
                src={imageUrl}
                alt="Organisation Logo"
                onLoad={() => console.log('✅ Logo image loaded successfully')}
                onError={(e) => console.error('❌ Logo image failed to load:', e)}
            />
        </div>
    );
}

export default LogoComponent;