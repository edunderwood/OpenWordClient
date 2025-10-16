import React, { useState, useEffect } from 'react';
import styles from '@/styles/Logo.module.css'


const LogoComponent = ({ serverName, churchKey }) => {
    const [imageUrl, setImageUrl] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Build URL with church parameter for multi-tenant support
                const churchParam = churchKey || '';
                const url = churchParam
                    ? `${serverName}/church/info?church=${encodeURIComponent(churchParam)}`
                    : `${serverName}/church/info`;

                console.log(`🖼️  Fetching logo from: ${url}`);

                const response = await fetch(url)
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    console.error('❌ Error fetching church logo:', errorData);
                    throw new Error(errorData.message || "Network response was not OK");
                }
                const jsonResponse = await response.json();
                const data = jsonResponse.responseObject;
                if (data.base64Logo) {
                    console.log('✅ Logo loaded from database');
                    setImageUrl(`${data.base64Logo}`);
                } else {
                    console.warn('⚠️  No logo found in church data');
                }
            } catch (error) {
                console.warn(`❌ Error getting church logo: ${error}`);
            }
        }
        fetchData();
    }, [serverName, churchKey]);


    return imageUrl ? (
        <div className={styles.logo}>
            <img src={imageUrl} alt="Church Logo"></img>
        </div>
    ) : null;
}

export default LogoComponent;