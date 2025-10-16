import React from "react";
import styles from '@/styles/StopButton.module.css'

const StopTranslationButtonComponent = ({ onClick }) => {

    // SVG Stop Icon (square)
    const StopIcon = () => (
        <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="white"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={styles.stopIcon}
        >
            <rect x="6" y="6" width="12" height="12" rx="2" fill="white"/>
        </svg>
    );

    return (
        <div className={styles.stopButton}>
            <button className={styles.stopButtonInner} onClick={onClick}>
                <StopIcon />
                <span className={styles.stopLabel}>Stop</span>
            </button>
        </div>
    )
}

export default StopTranslationButtonComponent;