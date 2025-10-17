import React from "react";
import styles from '@/styles/StopButton.module.css'

const StopTranslationButtonComponent = ({ onClick }) => {

    // SVG Stop Icon (square)
    const StopIcon = () => (
        <svg
            width="120"
            height="120"
            viewBox="0 0 24 24"
            fill="white"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect x="6" y="6" width="12" height="12" rx="1" fill="white"/>
        </svg>
    );

    return (
        <div className={styles.stopButton}>
            <button className={styles.stopButtonInner} onClick={onClick} type="button">
                <StopIcon />
            </button>
        </div>
    )
}

export default StopTranslationButtonComponent;