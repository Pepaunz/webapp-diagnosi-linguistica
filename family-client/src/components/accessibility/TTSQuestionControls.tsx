// src/components/accessibility/TTSQuestionControls.tsx
import React from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { TTSStatus } from '../../hooks/useTextToSpeech';

interface TTSQuestionControlsProps {
  questionId: string;
  questionText: string;
  options?: string[];
  isEnabled: boolean;
  onSpeak: (text: string, questionId: string) => void;
  currentSpeakingId: string | null;
  status: TTSStatus;
  className?: string;
}

export const TTSQuestionControls: React.FC<TTSQuestionControlsProps> = ({
  questionId,
  questionText,
  options = [],
  isEnabled,
  onSpeak,
  currentSpeakingId,
  status,
  className = ''
}) => {
  // Non mostrare se TTS disabilitato globalmente
  if (!isEnabled) return null;

  // Determina se questa domanda sta parlando
  const isSpeaking = currentSpeakingId === questionId && (status === 'speaking' || status === 'paused');
  const isLoading = false;

  // Prepara il testo completo da leggere
  const getFullText = () => {
    let fullText = questionText;
    
    // Aggiungi opzioni se presenti
    if (options.length > 0) {
      fullText += '. Opzioni di risposta: ' + options.join(', ');
    }
    
    return fullText;
  };

  // Gestione click
  const handleClick = () => {
    const textToSpeak = getFullText();
    onSpeak(textToSpeak, questionId);
  };

  // Determina l'icona da mostrare
  const getIcon = () => {
    
    
    if (isSpeaking) {
      return <Volume2 className="w-5 h-5" />;
    }
    
    return <Volume2 className="w-5 h-5" />;
  };

  // Colori del pulsante
  const getButtonColors = () => {
    if (isSpeaking) {
      return 'bg-green-500 hover:bg-green-600 text-white animate-pulse';
    }
    
    return 'bg-white hover:bg-blue-50 text-family-input-focus border border-family-input-focus/30';
  };

  // Testo aria-label
  const getAriaLabel = () => {
    if (isSpeaking) return 'Sto leggendo questa domanda';
    if (isLoading) return 'Preparazione lettura...';
    return 'Leggi questa domanda ad alta voce';
  };
  

  return (
    <div className={`inline-flex ${className}`}>
      <button
        onClick={handleClick}
        disabled={isLoading || (currentSpeakingId !== null && currentSpeakingId !== questionId)}
        className={`
          inline-flex items-center justify-center w-10 h-10 rounded-full
          focus:outline-none focus:ring-2 focus:ring-family-input-focus/80 focus:ring-offset-1
          transition-all duration-200 touch-target
          ${getButtonColors()}
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        aria-label={getAriaLabel()}
        title={getAriaLabel()}
        type="button"
      >
        {getIcon()}
      </button>
      
      {/* Indicatore visivo per screen reader */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isSpeaking && 'Lettura in corso per questa domanda'}
      </div>
    </div>
  );
};

export default TTSQuestionControls;