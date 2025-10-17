import React, { useEffect, useState, useRef } from "react";
import styles from '@/styles/Audio.module.css'

const AudioComponent = ({ locale, translate }) => {
    const [audio, setAudio] = useState(false)
    const [isSupported, setIsSupported] = useState(true)
    const [voices, setVoices] = useState([])
    const utteranceRef = useRef(null)

    // Check if browser supports Speech Synthesis
    useEffect(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            setIsSupported(true)
            
            // Load voices
            const loadVoices = () => {
                const availableVoices = speechSynthesis.getVoices()
                setVoices(availableVoices)
                console.log(`Loaded ${availableVoices.length} voices`)
            }
            
            loadVoices()
            
            // Some browsers load voices asynchronously
            if (speechSynthesis.onvoiceschanged !== undefined) {
                speechSynthesis.onvoiceschanged = loadVoices
            }
        } else {
            setIsSupported(false)
            console.warn('Speech Synthesis not supported in this browser')
        }
    }, [])

    const handleAudioChange = () => {
        const newAudioState = !audio
        setAudio(newAudioState)
        console.log(`Audio toggled: ${newAudioState}`)
        
        // If turning off, cancel any ongoing speech
        if (!newAudioState && speechSynthesis.speaking) {
            speechSynthesis.cancel()
        }
    }

    useEffect(() => {
        const speak = () => {
            if (audio === true && translate && translate.length > 0 && isSupported) {
                // Cancel any ongoing speech first
                if (speechSynthesis.speaking) {
                    speechSynthesis.cancel()
                }

                console.log(`Speaking: "${translate}" in ${locale}`)
                
                const utterance = new SpeechSynthesisUtterance(translate)
                utterance.lang = locale
                utterance.rate = 1.0
                utterance.pitch = 1.0
                utterance.volume = 1.0
                
                // Try to find a voice for the locale
                const voice = voices.find(v => v.lang.startsWith(locale.split('-')[0]))
                if (voice) {
                    utterance.voice = voice
                    console.log(`Using voice: ${voice.name}`)
                } else {
                    console.log(`No specific voice found for ${locale}, using default`)
                }
                
                utterance.onstart = () => console.log('Speech started')
                utterance.onend = () => console.log('Speech ended')
                utterance.onerror = (event) => console.error('Speech error:', event.error)
                
                utteranceRef.current = utterance
                
                try {
                    speechSynthesis.speak(utterance)
                } catch (error) {
                    console.error('Error speaking:', error)
                }
            }
        }
        
        speak()
    }, [translate, audio, locale, voices, isSupported])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (speechSynthesis.speaking) {
                speechSynthesis.cancel()
            }
        }
    }, [])

    if (!isSupported) {
        return (
            <div className={styles.audioButton}>
                <p style={{ color: 'red' }}>Audio not supported on this device</p>
            </div>
        )
    }

    // SVG Speaker Icon
    const SpeakerIcon = () => (
        <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {/* Speaker cone */}
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="currentColor"/>

            {audio ? (
                // Sound waves when audio is ON
                <>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </>
            ) : (
                // Diagonal line through speaker when audio is OFF
                <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" strokeWidth="2.5"/>
            )}
        </svg>
    );

    return (
        <div className={styles.audioButton}>
            <button className={styles.audioToggle} onClick={handleAudioChange} type="button">
                <SpeakerIcon />
            </button>
        </div>
    )
}

export default AudioComponent;
