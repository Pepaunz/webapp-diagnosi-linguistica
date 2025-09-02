// src/components/accessibility/TTSFloatingButton.tsx
import React, { useState } from 'react';
import { Volume2, VolumeX, Pause, Play, AlertCircle } from 'lucide-react';
import { useTextToSpeech, TTSStatus, Language } from '../../hooks/useTextToSpeech';

interface TTSFloatingButtonProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  currentLanguage: Language;
  className?: string;
}

export const TTSFloatingButton: React.FC<TTSFloatingButtonProps> = ({
  isEnabled,
  onToggle,
  currentLanguage,
  className = ''
}) => {
  const {
    status,
    isSupported,
    error,
    pause,
    resume,
    stop,
    setLanguage
  } = useTextToSpeech(currentLanguage);

  // Stati del pulsante
  const [isExpanded, setIsExpanded] = useState(false);

  // Aggiorna lingua nel TTS quando cambia
  React.useEffect(() => {
    setLanguage(currentLanguage);
  }, [currentLanguage, setLanguage]);

  // Se TTS non è supportato, non mostrare il pulsante
  if (!isSupported) {
    return null;
  }

  // Gestione toggle principale
  const handleMainToggle = () => {
    if (isEnabled) {
      // Disattiva TTS e ferma tutto
      stop();
      onToggle(false);
    } else {
      // Attiva TTS
      onToggle(true);
    }
    setIsExpanded(false);
  };

  // Gestione controlli playback
  const handlePlaybackControl = () => {
    if (status === 'speaking') {
      pause();
    } else if (status === 'paused') {
      resume();
    } else {
      stop();
    }
  };

  // Icone in base allo stato
  const getMainIcon = () => {
    if (error) return <AlertCircle className="w-6 h-6" />;
    if (!isEnabled) return <VolumeX className="w-6 h-6" />;
    return <Volume2 className="w-6 h-6" />;
  };

  const getPlaybackIcon = () => {
    switch (status) {
      case 'speaking':
        return <Pause className="w-5 h-5" />;
      case 'paused':
        return <Play className="w-5 h-5" />;
      default:
        return <VolumeX className="w-5 h-5" />;
    }
  };

  // Colori in base allo stato
  const getButtonColors = () => {
    if (error) return 'bg-red-500 hover:bg-red-600 focus:ring-red-400';
    if (!isEnabled) return 'bg-gray-500 hover:bg-gray-600 focus:ring-gray-400';
    if (status === 'speaking') return 'bg-green-500 hover:bg-green-600 focus:ring-green-400';
    if (status === 'paused') return 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-400';
    return 'bg-family-input-focus hover:bg-blue-600 focus:ring-blue-400';
  };

  // Testi tooltip
  const getTooltipText = () => {
    if (error) return error;
    if (!isEnabled) return 'Attiva assistente vocale';
    if (status === 'speaking') return 'TTS attivo - Metti in pausa';
    if (status === 'paused') return 'TTS in pausa - Riprendi';
    return 'TTS attivo - Pronto per leggere';
  };

  return (
    <div className={`fixed bottom-20 right-4 z-40 ${className}`}>
      {/* Controlli Espansi */}
      {isEnabled && isExpanded && status !== 'idle' && (
        <div className="mb-3 bg-white rounded-lg shadow-lg border border-gray-200 p-3 animate-in slide-in-from-bottom-2">
          {/* Status Text */}
          <div className="text-center mb-3">
            <p className="text-mobile-xs text-gray-600 font-medium">
              {status === 'speaking' && 'Sto leggendo...'}
              {status === 'paused' && 'In pausa'}
              {status === 'error' && 'Errore TTS'}
            </p>
          </div>
          
          {/* Playback Controls */}
          <div className="flex gap-2 justify-center">
            <button
              onClick={handlePlaybackControl}
              disabled={true}
              className="
                flex items-center justify-center w-10 h-10 rounded-full
                bg-white border-2 border-gray-300 hover:border-gray-400
                focus:outline-none focus:ring-2 focus:ring-family-input-focus/80
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200 touch-target
              "
              aria-label={
                status === 'speaking' ? 'Metti in pausa lettura' :
                status === 'paused' ? 'Riprendi lettura' : 
                'Controlla riproduzione'
              }
            >
              {getPlaybackIcon()}
            </button>
            
            <button
              onClick={stop}
              disabled={true}
              className="
                flex items-center justify-center w-10 h-10 rounded-full
                bg-white border-2 border-red-300 hover:border-red-400 text-red-600
                focus:outline-none focus:ring-2 focus:ring-red-400
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200 touch-target
              "
              aria-label="Ferma lettura"
            >
              <VolumeX className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Pulsante Principale */}
      <button
        onClick={handleMainToggle}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        onFocus={() => setIsExpanded(true)}
        onBlur={() => setIsExpanded(false)}
        className={`
          flex items-center justify-center w-14 h-14 rounded-full
          text-white shadow-lg border-2 border-white
          focus:outline-none focus:ring-4 focus:ring-offset-2
          transition-all duration-300 touch-target
          ${getButtonColors()}
          ${status === 'speaking' ? 'animate-pulse' : ''}
        `}
        aria-label={getTooltipText()}
        aria-expanded={isExpanded}
        title={getTooltipText()}
      >
        {getMainIcon()}
      </button>

      {/* Tooltip/Status (visibile solo se supportato) */}
      {isExpanded && (
        <div className="absolute bottom-16 right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-mobile-xs rounded-lg shadow-lg max-w-48 text-center animate-in fade-in-50">
          <div className="absolute bottom-[-4px] right-6 w-2 h-2 bg-gray-900 rotate-45" />
          {getTooltipText()}
          
          {/* Language indicator */}
          <div className="text-gray-300 mt-1">
            Lingua: {currentLanguage.toUpperCase()}
          </div>
        </div>
      )}

      {/* Screen Reader Only Status */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {status === 'speaking' && `Assistente vocale attivo, sta leggendo in ${currentLanguage}`}
        {status === 'paused' && 'Assistente vocale in pausa'}
        {status === 'error' && `Errore assistente vocale: ${error}`}
        {!isEnabled && 'Assistente vocale disattivato'}
      </div>
    </div>
  );
};

export default TTSFloatingButton;