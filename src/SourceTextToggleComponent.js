import React from "react";
import styles from '@/styles/SourceTextToggle.module.css'

const SourceTextToggleComponent = ({ includeSource, onToggle }) => {

    // SVG Check Icon (green tick)
    const CheckIcon = () => (
        <svg 
            width="40" 
            height="40" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3"
            strokeLinecap="round" 
            strokeLinejoin="round"
        >
            <polyline points="20 6 9 17 4 12" stroke="#22c55e" fill="none"/>
        </svg>
    );

    // SVG X Icon (red X)
    const XIcon = () => (
        <svg 
            width="40" 
            height="40" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3"
            strokeLinecap="round" 
            strokeLinejoin="round"
        >
            <line x1="18" y1="6" x2="6" y2="18" stroke="#ef4444"/>
            <line x1="6" y1="6" x2="18" y2="18" stroke="#ef4444"/>
        </svg>
    );

    return (
        <div className={styles.sourceTextButton}>
            <label className={styles.sourceTextToggle} onClick={onToggle}>
                {includeSource ? <CheckIcon /> : <XIcon />}
                <span className={styles.sourceTextLabel}>
                    Include Source Text
                </span>
            </label>
        </div>
    )
}

export default SourceTextToggleComponent;
