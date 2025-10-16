import React, { useState, useEffect } from 'react';
import styles from '@/styles/Logo.module.css'


const LogoComponent = ({ serverName, churchKey }) => {
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Build URL with church parameter for multi-tenant support
                const churchParam = churchKey || '';

                console.log(`🖼️  LogoComponent Props:`, { serverName, churchKey });

                if (!churchParam) {
                    console.warn('⚠️  No church key provided to LogoComponent');
                    setLoading(false);
                    return;
                }

                const url = `${serverName}/church/info?church=${encodeURIComponent(churchParam)}`;
                console.log(`🖼️  Fetching logo from: ${url}`);

                const response = await fetch(url)

                console.log(`🖼️  Response status: ${response.status}`);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    console.error('❌ Error fetching church logo:', errorData);
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
                    console.warn('⚠️  No logo found in church data');
                    console.warn('⚠️  Available fields:', Object.keys(data));
                }

                setLoading(false);
            } catch (error) {
                console.error(`❌ Error getting church logo:`, error);
                setError(error.message);
                setLoading(false);
            }
        }

        if (serverName && churchKey) {
            fetchData();
        } else {
            console.warn('⚠️  LogoComponent missing required props:', { serverName, churchKey });
            setLoading(false);
        }
    }, [serverName, churchKey]);


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
                alt="Church Logo"
                onLoad={() => console.log('✅ Logo image loaded successfully')}
                onError={(e) => console.error('❌ Logo image failed to load:', e)}
            />
        </div>
    );
}

export default LogoComponent;