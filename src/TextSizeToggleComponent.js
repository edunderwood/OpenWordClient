import React from "react";
import styles from '@/styles/TextSizeToggle.module.css'

const TextSizeToggleComponent = ({ textSize, onToggle }) => {

    // SVG Text Size Icon - shows A with size indicators
    const TextSizeIcon = () => (
        <svg
            width="120"
            height="120"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {/* Large A */}
            <path d="M4 20 L12 4 L20 20" strokeWidth={textSize === 'large' ? "3" : "2"} />
            <line x1="7" y1="15" x2="17" y2="15" strokeWidth={textSize === 'large' ? "3" : "2"} />

            {/* Size indicator dots */}
            {textSize === 'small' && (
                <circle cx="12" cy="22" r="1" fill="currentColor" />
            )}
            {textSize === 'medium' && (
                <>
                    <circle cx="10" cy="22" r="1" fill="currentColor" />
                    <circle cx="14" cy="22" r="1" fill="currentColor" />
                </>
            )}
            {textSize === 'large' && (
                <>
                    <circle cx="8" cy="22" r="1" fill="currentColor" />
                    <circle cx="12" cy="22" r="1" fill="currentColor" />
                    <circle cx="16" cy="22" r="1" fill="currentColor" />
                </>
            )}
        </svg>
    );

    return (
        <div className={styles.textSizeButton}>
            <button
                className={styles.textSizeToggle}
                onClick={onToggle}
                type="button"
                aria-label={`Text size: ${textSize}`}
            >
                <TextSizeIcon />
            </button>
        </div>
    )
}

export default TextSizeToggleComponent;
