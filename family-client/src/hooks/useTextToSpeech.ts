// src/hooks/useTextToSpeech.ts
import { useState, useEffect, useRef, useCallback } from 'react';

// Types
export type TTSStatus = 'idle' | 'speaking' | 'paused' | 'error';
export type Language = 'it' | 'en' | 'es' | 'ar';

interface TTSState {
  status: TTSStatus;
  currentText: string | null;
  isSupported: boolean;
  availableVoices: SpeechSynthesisVoice[];
  currentVoice: SpeechSynthesisVoice | null;
  error: string | null;
}

interface TTSOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  autoSelectVoice?: boolean;
}

interface UseTextToSpeechReturn {
  // Stato
  status: TTSStatus;
  isSupported: boolean;
  availableVoices: SpeechSynthesisVoice[];
  currentVoice: SpeechSynthesisVoice | null;
  currentText: string | null;
  error: string | null;
  
  // Controlli
  speak: (text: string, options?: TTSOptions) => Promise<boolean>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  
  // Configurazione
  setVoice: (voice: SpeechSynthesisVoice | null) => void;
  setLanguage: (language: Language) => void;
  
  // Utility
  getVoicesForLanguage: (language: Language) => SpeechSynthesisVoice[];
  getBestVoiceForLanguage: (language: Language) => SpeechSynthesisVoice | null;
}

// Mapping lingue a codici vocali
const LANGUAGE_VOICE_MAP: Record<Language, string[]> = {
  'it': ['it-IT', 'it'],
  'en': ['en-US', 'en-GB', 'en'],
  'es': ['es-ES', 'es-MX', 'es'],
  'ar': ['ar-SA', 'ar-EG', 'ar']
};

export const useTextToSpeech = (
  initialLanguage: Language = 'it',
  defaultOptions: TTSOptions = {}
): UseTextToSpeechReturn => {
  
  // State
  const [state, setState] = useState<TTSState>({
    status: 'idle',
    currentText: null,
    isSupported: false,
    availableVoices: [],
    currentVoice: null,
    error: null
  });
  
  // Refs
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const currentLanguageRef = useRef<Language>(initialLanguage);
  const isInitializedRef = useRef(false);
  
  // Default options
  const optionsRef = useRef<Required<TTSOptions>>({
    rate: 0.9,        // Leggermente più lento per comprensibilità
    pitch: 1.0,       // Pitch normale
    volume: 1.0,      // Volume massimo
    autoSelectVoice: true,
    ...defaultOptions
  });

  // Inizializzazione Web Speech API
  useEffect(() => {
    const initializeTTS = () => {
      const isSupported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
      
      setState(prev => ({
        ...prev,
        isSupported
      }));
      
      if (!isSupported) {
        setState(prev => ({
          ...prev,
          error: 'Text-to-Speech non supportato in questo browser'
        }));
        return;
      }
      
      // Carica le voci disponibili
      const loadVoices = () => {
        const voices = speechSynthesis.getVoices();
        setState(prev => ({
          ...prev,
          availableVoices: voices
        }));
        
        // Auto-seleziona la voce migliore per la lingua corrente
        if (optionsRef.current.autoSelectVoice && voices.length > 0) {
          const bestVoice = getBestVoiceForLanguage(currentLanguageRef.current, voices);
          setState(prev => ({
            ...prev,
            currentVoice: bestVoice
          }));
        }
        
        isInitializedRef.current = true;
      };
      
      // Le voci potrebbero non essere immediatamente disponibili
      if (speechSynthesis.getVoices().length > 0) {
        loadVoices();
      } else {
        speechSynthesis.addEventListener('voiceschanged', loadVoices);
      }
    };
    
    // Delay l'inizializzazione per evitare problemi su mobile
    const timer = setTimeout(initializeTTS, 100);
    
    return () => {
      clearTimeout(timer);
      speechSynthesis.removeEventListener('voiceschanged', initializeTTS);
    };
  }, []);

  // Trova la migliore voce per una lingua
  const getBestVoiceForLanguage = useCallback((language: Language, voices?: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
    const voiceList = voices || state.availableVoices;
    const languageCodes = LANGUAGE_VOICE_MAP[language];
    
    for (const langCode of languageCodes) {
      // Prima cerca voci locali (più qualità)
      const localVoice = voiceList.find(voice => 
        voice.lang.startsWith(langCode) && voice.localService
      );
      if (localVoice) return localVoice;
      
      // Poi cerca voci remote
      const remoteVoice = voiceList.find(voice => 
        voice.lang.startsWith(langCode)
      );
      if (remoteVoice) return remoteVoice;
    }
    
    // Fallback: prima voce disponibile
    return voiceList[0] || null;
  }, [state.availableVoices]);

  // Ottieni voci per lingua specifica
  const getVoicesForLanguage = useCallback((language: Language): SpeechSynthesisVoice[] => {
    const languageCodes = LANGUAGE_VOICE_MAP[language];
    return state.availableVoices.filter(voice =>
      languageCodes.some(code => voice.lang.startsWith(code))
    );
  }, [state.availableVoices]);

  // Funzione principale speak
  const speak = useCallback(async (text: string, options: TTSOptions = {}): Promise<boolean> => {
    if (!state.isSupported) {
      setState(prev => ({ ...prev, error: 'TTS non supportato' }));
      return false;
    }
    
    if (!text.trim()) {
      setState(prev => ({ ...prev, error: 'Nessun testo da leggere' }));
      return false;
    }
    
    // Stop precedente utterance
    speechSynthesis.cancel();
    
    // Merge options
    const finalOptions = { ...optionsRef.current, ...options };
    
    // Crea nuova utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = finalOptions.rate;
    utterance.pitch = finalOptions.pitch;
    utterance.volume = finalOptions.volume;
    utterance.voice = state.currentVoice;
    utterance.lang = state.currentVoice?.lang || currentLanguageRef.current;
    
    // Event handlers
    utterance.onstart = () => {
      setState(prev => ({
        ...prev,
        status: 'speaking',
        currentText: text,
        error: null
      }));
    };
    
    utterance.onend = () => {
      setState(prev => ({
        ...prev,
        status: 'idle',
        currentText: null
      }));
    };
    
    utterance.onerror = (event) => {
      const errorMsg = `Errore TTS: ${event.error}`;
      setState(prev => ({
        ...prev,
        status: 'error',
        error: errorMsg
      }));
    };
    
    utterance.onpause = () => {
      setState(prev => ({ ...prev, status: 'paused' }));
    };
    
    utterance.onresume = () => {
      setState(prev => ({ ...prev, status: 'speaking' }));
    };
    
    utteranceRef.current = utterance;
    
    try {
      speechSynthesis.speak(utterance);
      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: 'Impossibile avviare la sintesi vocale'
      }));
      return false;
    }
  }, [state.isSupported, state.currentVoice]);

  // Controlli playback
  const pause = useCallback(() => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
    }
  }, []);

  const stop = useCallback(() => {
    speechSynthesis.cancel();
    setState(prev => ({
      ...prev,
      status: 'idle',
      currentText: null
    }));
  }, []);

  // Cambia voce
  const setVoice = useCallback((voice: SpeechSynthesisVoice | null) => {
    setState(prev => ({ ...prev, currentVoice: voice }));
  }, []);

  // Cambia lingua e auto-seleziona voce
  const setLanguage = useCallback((language: Language) => {
    currentLanguageRef.current = language;
    
    if (optionsRef.current.autoSelectVoice && state.availableVoices.length > 0) {
      const bestVoice = getBestVoiceForLanguage(language);
      setState(prev => ({
        ...prev,
        currentVoice: bestVoice
      }));
    }
  }, [state.availableVoices, getBestVoiceForLanguage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      speechSynthesis.cancel();
    };
  }, []);

  return {
    // State
    status: state.status,
    isSupported: state.isSupported,
    availableVoices: state.availableVoices,
    currentVoice: state.currentVoice,
    currentText: state.currentText,
    error: state.error,
    
    // Controls
    speak,
    pause,
    resume,
    stop,
    
    // Configuration
    setVoice,
    setLanguage,
    
    // Utilities
    getVoicesForLanguage,
    getBestVoiceForLanguage: (lang: Language) => getBestVoiceForLanguage(lang, state.availableVoices)
  };
};