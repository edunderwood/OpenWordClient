import React, { useEffect, useState } from "react";
import styles from '@/styles/TranslationBox.module.css'

const TranslationBoxComponent = ({ translate, transcript, language, includeSource, textSize = 'medium' }) => {
    const [churchProperties, setChurchProperties] = useState({
        hostLanguage: "en"
    });

    // Get the Server name from environment variable
    const serverName = process.env.NEXT_PUBLIC_SERVER_NAME;

    // Get the host language of the church service
    useEffect(() => {
        const fetchData = async () => {

            const response = await fetch(`${serverName}/church/info`)
                .catch((error) => {
                    console.error(`Warning: unable to get language: ${error}`);
                    return;
                });
            const jsonResponse = await response.json();
            const data = jsonResponse.responseObject;
            setChurchProperties({
                hostLanguage: data.language
            })
        };
        fetchData();
    }, []);

    // Runs anytime translate changes
    useEffect(() => {
        // Don't add anything if translate is empty/null/undefined
        if (!translate) {
            return;
        }

        const addTranslate = () => {
            console.log(`Translate: ${translate}, transcript: ${transcript}, hostLang: ${churchProperties.hostLanguage}, language: ${language}`);
            const div = document.getElementById('translationBox')

            if (!div) {
                console.error('Translation box div not found!');
                return;
            }

            const textPair = document.createElement('div');
            const translateP = document.createElement('p')
            const transcriptP = document.createElement('p')

            // Apply size-specific CSS classes
            const sizeClass = textSize === 'small' ? styles.textSmall :
                             textSize === 'large' ? styles.textLarge :
                             styles.textMedium;

            textPair.className = styles.translationTranscriptPair
            translateP.className = `${styles.translatedText} ${sizeClass}`
            transcriptP.className = `${styles.transcriptText} ${sizeClass}`

            translateP.textContent = translate
            transcriptP.textContent = transcript
            textPair.appendChild(translateP)

            // Only append transcript if includeSource is true
            if (includeSource && transcript) {
                textPair.appendChild(transcriptP)
            }

            div.appendChild(textPair)
            div.scrollTo(0, div.scrollHeight)
        }

        addTranslate()
    }, [translate, includeSource])

    // Determine if language is RTL
    const isRTL = (lang) => {
        const rtlLanguages = ['ar', 'he', 'fa', 'ur', 'yi', 'ps', 'sd'];
        return rtlLanguages.includes(lang);
    };

    return (
        <div className={styles.outer} id='translationOuterBox' dir={isRTL(language) ? 'rtl' : 'ltr'}>
            <div id='translationBox' className={styles.translationBox}>
            </div>
        </div>
    )
}

export default TranslationBoxComponent;