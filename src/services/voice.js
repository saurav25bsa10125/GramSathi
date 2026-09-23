// GramSathi Voice & Speech Service
// Implements Browser Web Speech API (STT & TTS) with Indian Language Support

window.GramVoice = (function() {
  let recognition = null;
  let isListening = false;
  let isSpeaking = false;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  function isSpeechRecognitionSupported() {
    return !!SpeechRecognition;
  }

  function isSpeechSynthesisSupported() {
    return 'speechSynthesis' in window;
  }

  function startListening(callbacks = {}) {
    if (!isSpeechRecognitionSupported()) {
      if (callbacks.onError) {
        callbacks.onError('Voice input is not supported in this browser. Please type your query.');
      }
      return false;
    }

    try {
      if (recognition) {
        recognition.abort();
      }

      recognition = new SpeechRecognition();
      const currentLang = localStorage.getItem('gramsathi_lang') || 'en';
      
      // Match regional language codes
      const langMap = {
        hi: 'hi-IN',
        ta: 'ta-IN',
        pa: 'pa-IN',
        te: 'te-IN',
        en: 'en-IN'
      };
      recognition.lang = langMap[currentLang] || 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        isListening = true;
        if (callbacks.onStart) callbacks.onStart();
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (callbacks.onResult) callbacks.onResult(transcript);
      };

      recognition.onerror = (event) => {
        isListening = false;
        console.warn('Speech recognition error:', event.error);
        if (callbacks.onError) {
          callbacks.onError(event.error === 'not-allowed' 
            ? 'Microphone permission denied. Please allow microphone access in browser settings.' 
            : `Voice recognition notice: ${event.error}`);
        }
      };

      recognition.onend = () => {
        isListening = false;
        if (callbacks.onEnd) callbacks.onEnd();
      };

      recognition.start();
      return true;
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
      if (callbacks.onError) callbacks.onError(e.message);
      return false;
    }
  }

  function stopListening() {
    if (recognition && isListening) {
      recognition.stop();
      isListening = false;
    }
  }

  function speak(text, onEndCallback) {
    if (!isSpeechSynthesisSupported() || !text) return false;

    try {
      stopSpeaking();

      // Clean markdown tags for clear speech synthesis
      const cleanText = text
        .replace(/<[^>]*>/g, ' ')
        .replace(/[*_~`#]/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/\s+/g, ' ')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      const currentLang = localStorage.getItem('gramsathi_lang') || 'en';

      const langMap = {
        hi: 'hi-IN',
        ta: 'ta-IN',
        pa: 'pa-IN',
        te: 'te-IN',
        en: 'en-IN'
      };
      utterance.lang = langMap[currentLang] || 'en-IN';
      utterance.rate = 0.95; // Slightly slower for clear rural acoustics
      utterance.pitch = 1.0;

      // Select natural voice if available
      const voices = window.speechSynthesis.getVoices();
      const matchVoice = voices.find(v => v.lang === utterance.lang || v.lang.startsWith(utterance.lang.slice(0, 2)));
      if (matchVoice) {
        utterance.voice = matchVoice;
      }

      utterance.onstart = () => { isSpeaking = true; };
      utterance.onend = () => {
        isSpeaking = false;
        if (onEndCallback) onEndCallback();
      };
      utterance.onerror = () => { isSpeaking = false; };

      window.speechSynthesis.speak(utterance);
      return true;
    } catch (e) {
      console.error('Speech synthesis error:', e);
      return false;
    }
  }

  function stopSpeaking() {
    if (isSpeechSynthesisSupported()) {
      window.speechSynthesis.cancel();
      isSpeaking = false;
    }
  }

  return {
    isSpeechRecognitionSupported,
    isSpeechSynthesisSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    isListening: () => isListening,
    isSpeaking: () => isSpeaking
  };
})();
