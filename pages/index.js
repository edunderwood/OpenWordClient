import Head from 'next/head'
import styles from '@/styles/Home.module.css'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import socket from '../src/socket'
import { getLanguage } from '@/src/Utilities'

import AudioComponent from '@/src/AudioComponent'
import LogoComponent from '@/src/LogoComponent'
import LanguageButtonDropdownComponent from '@/src/LanguageButtonDropdownComponent'
import PageHeaderComponent from '@/src/PageHeaderComponent'
import WelcomeMessageComponent from '@/src/WelcomeMessageComponent'
import ServiceStatusComponent from '@/src/ServiceStatusComponent'
import TranslationBoxComponent from '@/src/TranslationBoxComponent'
import WaitingMessageComponent from '@/src/WaitingMessageComponent'
import StopTranslationButtonComponent from '@/src/StopTranslationButtonComponent'
import LivestreamComponent from '@/src/LivestreamComponent'
import SourceTextToggleComponent from '@/src/SourceTextToggleComponent'
import TextSizeToggleComponent from '@/src/TextSizeToggleComponent'

const Home = () => {
  const router = useRouter()

  // Get query parameters - church key and serviceId
  const { serviceId, organisation, church } = router.query;

  const [livestream, setLivestream] = useState("OFF");
  const [languageMap, setLanguageMap] = useState([]);
  const [defaultServiceId, setDefaultServiceId] = useState("");
  const [serviceCode, setServiceCode] = useState("")
  const [serviceReady, setServiceReady] = useState(false);
  const [rejoin, setRejoin] = useState(false);

  const [translationInProgress, setTranslationInProgress] = useState(false);
  const [translate, setTranslate] = useState()
  const [transcript, setTranscript] = useState()

  const [translationLanguage, setTranslationLanguage] = useState();
  const [translationLocale, setTranslationLocale] = useState();
  const [translationLanguageName, setTranslationLanguageName] = useState();

  const [includeSource, setIncludeSource] = useState(false);
  const [textSize, setTextSize] = useState('small'); // small, medium, large

  const translationRef = useRef(false);


  const [organisationWelcome, setOrganisationWelcome] = useState({
    greeting: "",
    messages: [],
    additionalMessage: "",
    waiting: ""
  });
  const [organisationName, setOrganisationName] = useState("");

  const serverName = process.env.NEXT_PUBLIC_SERVER_NAME;

  // Keep track of when things change
  useEffect(() => {
    console.log(`Updated Settings:\n\tLanguage: ${translationLanguage}\n\tLocale: ${translationLocale}\n\tService: ${serviceCode}\n\tTranslationInProgress: ${translationRef.current}`);
  }, [serviceCode, translationLanguage, translationLocale, rejoin]);

  useEffect(() => {

    // Get the specific organisation properties from the server
    const fetchData = async () => {
      try {
        // Don't fetch if no organisation parameter
        if (!organisation && !church) {
          console.warn('⚠️  No organisation parameter in URL, skipping church info fetch');
          setOrganisationWelcome({
            greeting: "Configuration Required",
            messages: ["Please add your organization key to the URL.", "Example: ?organisation=YOUR_ORGANISATION_KEY"],
            additionalMessage: "",
            waiting: "Waiting for configuration..."
          });
          return;
        }

        const url = `${serverName}/organisation/info?organisation=${encodeURIComponent(church)}`;

        console.log(`Fetching organisation info from: ${url}`);

        const response = await fetch(url)
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Error fetching church info:', errorData);
          throw new Error(errorData.message || "Network response was not OK");
        }

        const jsonResponse = await response.json();
        const data = jsonResponse.responseObject;
        if (data.translationLanguages != null) {
          setLanguageMap(JSON.parse(data.translationLanguages));
        }
        setDefaultServiceId(data.defaultServiceId);
        setOrganisationName(data.name || data.organisationName || "");
        const organisationMessages = JSON.parse(data.message);
        setOrganisationWelcome({
          greeting: data.greeting,
          messages: churchMessages,
          additionalMessage: data.additionalWelcome,
          waiting: data.waiting
        })
      } catch (error) {
        console.warn(`Error getting church info: ${error} `);
        // If organisation parameter is missing, show helpful message
        if (!organisation && !church) {
          setOrganisationWelcome({
            greeting: "Configuration Required",
            messages: ["Please add your organization key to the URL.", "Example: ?organisation=YOUR_ORGANISATION_KEY"],
            additionalMessage: "",
            waiting: "Waiting for configuration..."
          })
        }
      }
    }

    fetchData();
  }, [church])

  // When we have a valid service code and that service ID is actively being controlled
  // on the server side, then register the app.
// ✅ FIX: Removed duplicate useEffect and cleaned up the logic
// When we have a valid service code and that service ID is actively being controlled
// on the server side, then join the heartbeat room to receive livestream status updates
useEffect(() => {
  console.log(`In useEffect, serviceCode: ${serviceCode}, serviceReady: ${serviceReady}`);
  if (serviceCode != null && serviceCode.length > 0 && serviceReady) {
    console.log(`Received Service ID: ${serviceCode}`);
    
    // Join the heartbeat room to receive livestream status updates
    const heartbeatRoom = `${serviceCode}:heartbeat`;
    socket.emit('join', heartbeatRoom);
    console.log(`Joined heartbeat room: ${heartbeatRoom}`);
    
    // Store service code for reconnection
    localStorage.setItem('serviceCode', serviceCode);
  }
}, [serviceCode, serviceReady])

  useEffect(() => {
    // Need to check if the router is ready before trying to get the serviceId
    // from the query parameter. Also the default needs to be received from
    // the server
    if (router.isReady && defaultServiceId.length > 0) {
      socketInitializer(), []
    }
  }, [router.isReady, defaultServiceId])


  // Make sure the server side has initialized this service before
  // trying to register
  const handleServiceStatusCallback = (serviceStatusData) => {
    const { active } = serviceStatusData;
    setServiceReady(active);
  }
  useEffect(() => {
    console.log(`The service status is now: ${serviceReady}`);
    if (translationRef.current && serviceReady) {
      const rejoinLang = localStorage.getItem('language');
      const rejoinService = localStorage.getItem('serviceCode');
      const rejoinLangName = localStorage.getItem('languageName');
      if (rejoinLangName) {
        setTranslationLanguageName(rejoinLangName);
      }
      joinRoom(rejoinService, rejoinLang);
    }
  }, [serviceReady]);

  const socketInitializer = () => {
    console.log(`In socketInitializer`);
    socket.connect();
    socket.on('connect', () => {
      console.log(`${socket.id} connected to the socket`);

      if (socket.recovered) {
        console.log(`Successfully recovered socket: ${socket.id}`);
      } else {
        // This means that all rooms, connections have been lost, so we need to re-establish
        console.log(`Unable to recover socket: ${socket.id}`);
        console.log(`Current Settings:\n\tLanguage: ${translationLanguage}\n\tLocale: ${translationLocale}\n\tService: ${serviceCode}\n\tTranslationInProgress: ${translationInProgress}`);

        // Rejoin if currently translating
        if (translationRef.current) {
          const rejoinLang = localStorage.getItem('language');
          const rejoinService = localStorage.getItem('serviceCode');
          const rejoinLangName = localStorage.getItem('languageName');
          setServiceCode(rejoinService);
          if (rejoinLangName) {
            setTranslationLanguageName(rejoinLangName);
          }
          // Attempt to trigger a re-render of the Service status check
          setRejoin(true);
          console.log(`Attempting to rejoin ${rejoinService}:${rejoinLang}`)
        }
      }

      if (serviceId == null || serviceId.length == 0 || serviceId == "") {
        console.log(`Service ID not defined so using default ID from server of: ${defaultServiceId}`);
        setServiceCode(defaultServiceId);
      } else {
        setServiceCode(serviceId);
      }
    })
    socket.on('transcript', (msg) => {
      console.log(`Transcript: ${msg}`)
      setTranscript(msg)
    })

    socket.on('translation', (msg) => {
      console.log(`Translation: ${msg}`)
      setTranslate(msg)
    })

    socket.on('disconnect', (reason) => {
      console.log(`${socket.id} in index disconnected from the socket.  Reason-> ${reason}`);
    })
  }

  const joinRoom = (id, language) => {
    const room = `${id}:${language}`;
    console.log(`Joining room: ${room}`)
    socket.emit('join', room)

    const transcriptRoom = `${id}:transcript`
    console.log(`Joining ${transcriptRoom}`)

    socket.emit('join', transcriptRoom)
    setTranslationInProgress(true);
    translationRef.current = true;
  }

  const handleLivestreamCallback = (status) => {
    setLivestream(status);
  }

  const handleStartButton = (chosenLang) => {
    const locale = JSON.parse(JSON.stringify(chosenLang)).value;
    const languageName = JSON.parse(JSON.stringify(chosenLang)).label;
    const language = getLanguage(locale);
    setTranslationLanguage(language);
    setTranslationLocale(locale);
    setTranslationLanguageName(languageName);
    localStorage.setItem('language', language);
    localStorage.setItem('languageName', languageName);
    console.log(`Setting the language to ${language} (${languageName}) and locale to ${locale}`);
    joinRoom(serviceCode, language);
  }

  const handleStopTranslationButton = () => {
    const room = `${serviceCode}:${translationLanguage}`;
    console.log(`Leaving room ${room}`);
    socket.emit('leave', room);

    // Also leave the transcript
    const transcriptRoom = `${serviceCode}:transcript`;
    socket.emit('leave', transcriptRoom);
    setTranslationInProgress(false);
    translationRef.current = false;

    // And clear out the translation/transcript
    setTranscript(null);
    setTranslate(null);
  }

  const handleSourceTextToggle = () => {
    setIncludeSource(!includeSource);
    console.log(`Source text toggle: ${!includeSource}`);
  }

  const handleTextSizeToggle = () => {
    // Cycle through: medium -> large -> small -> medium
    const sizes = ['medium', 'large', 'small'];
    const currentIndex = sizes.indexOf(textSize);
    const nextIndex = (currentIndex + 1) % sizes.length;
    const newSize = sizes[nextIndex];
    setTextSize(newSize);
    console.log(`Text size changed to: ${newSize}`);
  }

  return (
    <>
      <Head>
        <title>Open Word Translation App</title>
        <meta name="description" content="Open Word - Real-time translation for religious services" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </Head>
      <div className={styles.container}>
        <ServiceStatusComponent serviceId={serviceCode} parentCallback={handleServiceStatusCallback} />
        <LivestreamComponent socket={socket} parentCallback={handleLivestreamCallback} />
        <PageHeaderComponent organisationName={organisationName} sessionStatus={livestream} />
        {!translationRef.current &&
          <div className={styles.home}>
            <div className={styles.inputBox}>
              <LogoComponent serverName={serverName} organisationKey={organisation || church} />
              {/* */}
              <WelcomeMessageComponent organisationWelcome={organisationWelcome} />
              {serviceReady &&
                <LanguageButtonDropdownComponent languages={languageMap} onClick={handleStartButton} />
              }
              {!serviceReady &&
                <WaitingMessageComponent message={organisationWelcome.waiting} />
              }
            </div>
          </div>
        }
        {translationRef.current &&
          <div className={styles.translatePage}>
            {translationLanguageName && (
              <div className={styles.languageIndicator}>
                <span className={styles.languageLabel}>Translation Language:</span>
                <span className={styles.languageName}>{translationLanguageName}</span>
              </div>
            )}
            <TranslationBoxComponent translate={translate} transcript={transcript} language={translationLanguage} includeSource={includeSource} textSize={textSize} />
            <div className={styles.buttonContainer}>
              <AudioComponent locale={translationLocale} translate={translate} />
              <SourceTextToggleComponent includeSource={includeSource} onToggle={handleSourceTextToggle} />
              <TextSizeToggleComponent textSize={textSize} onToggle={handleTextSizeToggle} />
              <StopTranslationButtonComponent onClick={handleStopTranslationButton} />
            </div>
            {/* */}
          </div>
        }
      </div>
    </>
  )
}

export default Home;
