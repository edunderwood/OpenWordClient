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
            // Only speak if:
            // 1. Audio is enabled
            // 2. We have text to speak
            // 3. Speech synthesis is supported
            if (audio === true && translate && translate.length > 0 && isSupported) {
                // Cancel any ongoing speech first
                if (speechSynthesis.speaking) {
                    speechSynthesis.cancel()
                }

                console.log(`Speaking: "${translate}" in ${locale}`)
                
                // Create new utterance
                const utterance = new SpeechSynthesisUtterance(translate)
                utterance.lang = locale
                utterance.rate = 1.0  // Normal speed
                utterance.pitch = 1.0  // Normal pitch
                utterance.volume = 1.0  // Full volume
                
                // Try to find a voice for the locale
                const voice = voices.find(v => v.lang.startsWith(locale.split('-')[0]))
                if (voice) {
                    utterance.voice = voice
                    console.log(`Using voice: ${voice.name}`)
                } else {
                    console.log(`No specific voice found for ${locale}, using default`)
                }
                
                // Event handlers for debugging
                utterance.onstart = () => {
                    console.log('Speech started')
                }
                
                utterance.onend = () => {
                    console.log('Speech ended')
                }
                
                utterance.onerror = (event) => {
                    console.error('Speech error:', event.error)
                }
                
                // Store reference
                utteranceRef.current = utterance
                
                // Speak
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

    return (
        <>
            <div className={styles.audioButton}>
                <label className={styles.switch}>
                    <input 
                        id='audio-toggle' 
                        type="checkbox" 
                        checked={audio}
                        onChange={handleAudioChange} 
                    />
                    <span className={styles.slider}></span>
                </label>
                <p>Audio {audio ? '🔊' : '🔇'}</p>
            </div>
        </>
    )
}

export default AudioComponent;
