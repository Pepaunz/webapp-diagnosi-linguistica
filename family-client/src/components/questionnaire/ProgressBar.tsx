import React, { useState, useEffect, useRef } from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => {
  const [isSticky, setIsSticky] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progress = (currentStep / totalSteps) * 100;
  
  // Calcoli per accessibilità
  const safeCurrentStep = Math.max(1, Math.min(currentStep, totalSteps));
  const safePercentage = Math.max(0, Math.min(progress, 100));

  useEffect(() => {
    const handleScroll = () => {
      if (progressBarRef.current) {
        const rect = progressBarRef.current.getBoundingClientRect();
        // Diventa sticky quando il componente esce dalla vista
        setIsSticky(rect.bottom <= 0);
      }
    };

    // Throttle semplice per performance mobile
    let throttleTimer: number | null = null;
    const throttledScroll = () => {
      if (throttleTimer) return;
      throttleTimer = window.setTimeout(() => {
        handleScroll();
        throttleTimer = null;
      }, 100);
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, []);

  return (
    <>
      {/* Componente originale che rimane nel flusso del documento */}
      <div 
        ref={progressBarRef}
        className="px-mobile-md py-mobile-sm bg-white border-b border-gray-200"
      >
        <div className="text-center mb-2">
          <span 
            className="text-mobile-sm text-family-text-body font-medium"
            id="progress-label"
          >
            Passo {safeCurrentStep} di {totalSteps}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-family-header h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${safePercentage}%` }}
            role="progressbar"
            aria-valuenow={safeCurrentStep}
            aria-valuemin={1}
            aria-valuemax={totalSteps}
            aria-valuetext={`Passo ${safeCurrentStep} di ${totalSteps}, ${safePercentage}% completato`}
            aria-label="Progresso compilazione questionario"
            aria-describedby="progress-label"
          />
        </div>
        
        {/* Screen reader only: Detailed description */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {safeCurrentStep === 1 && 'Inizio questionario. '}
          {safeCurrentStep === totalSteps && 'Ultima sezione del questionario. '}
          Passo {safeCurrentStep} di {totalSteps}. 
          Progresso: {safePercentage}% completato.
        </div>
      </div>

      {/* Versione sticky che appare solo quando si scrolla */}
      {isSticky && (
        <div 
          className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm"
          aria-hidden="true"
        >
          <div className="w-full bg-gray-200 h-1">
            <div 
              className="bg-family-header/60 h-1 transition-all duration-300"
              style={{ width: `${safePercentage}%` }}
            />
          </div>
        </div>
      )}
    </>
  );
};