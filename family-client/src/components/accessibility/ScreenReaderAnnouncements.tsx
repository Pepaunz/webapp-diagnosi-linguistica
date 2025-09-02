// src/components/accessibility/ScreenReaderAnnouncements.tsx
import React, { useState, useCallback, createContext, useContext, useRef } from 'react';

// Types
type AnnouncementPriority = 'polite' | 'assertive';

interface AnnouncementContextType {
  announce: (message: string, priority?: AnnouncementPriority) => void;
}

// Context per gli annunci
const AnnouncementContext = createContext<AnnouncementContextType | null>(null);

// Provider Component
interface AnnouncementProviderProps {
  children: React.ReactNode;
}

export const AnnouncementProvider: React.FC<AnnouncementProviderProps> = ({ children }) => {
  const [politeAnnouncement, setPoliteAnnouncement] = useState('');
  const [assertiveAnnouncement, setAssertiveAnnouncement] = useState('');
  
  // Ref per gestire i timeout
  const politeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const assertiveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const announce = useCallback((message: string, priority: AnnouncementPriority = 'polite') => {
    if (!message.trim()) return;

    if (priority === 'assertive') {
      // Cancella timeout precedente se esiste
      if (assertiveTimeoutRef.current) {
        clearTimeout(assertiveTimeoutRef.current);
      }
      
      // Imposta il messaggio
      setAssertiveAnnouncement(message);
      
      // Pulisce dopo 5 secondi
      assertiveTimeoutRef.current = setTimeout(() => {
        setAssertiveAnnouncement('');
      }, 5000);
    } else {
      // Cancella timeout precedente se esiste
      if (politeTimeoutRef.current) {
        clearTimeout(politeTimeoutRef.current);
      }
      
      // Imposta il messaggio
      setPoliteAnnouncement(message);
      
      // Pulisce dopo 3 secondi
      politeTimeoutRef.current = setTimeout(() => {
        setPoliteAnnouncement('');
      }, 3000);
    }
  }, []);

  return (
    <AnnouncementContext.Provider value={{ announce }}>
      {children}
      
      {/* Live Regions per Screen Reader */}
      <div className="sr-only">
        {/* Polite announcements - per messaggi informativi */}
        <div 
          aria-live="polite" 
          aria-atomic="true"
          role="status"
          id="polite-announcements"
        >
          {politeAnnouncement}
        </div>
        
        {/* Assertive announcements - per errori e messaggi urgenti */}
        <div 
          aria-live="assertive" 
          aria-atomic="true"
          role="alert"
          id="assertive-announcements"
        >
          {assertiveAnnouncement}
        </div>
      </div>
    </AnnouncementContext.Provider>
  );
};

// Hook per utilizzare gli annunci
export const useScreenReaderAnnouncements = (): AnnouncementContextType => {
  const context = useContext(AnnouncementContext);
  if (!context) {
    throw new Error('useScreenReaderAnnouncements deve essere usato all\'interno di AnnouncementProvider');
  }
  return context;
};

// Componente semplice per le pagine che non hanno provider
export const ScreenReaderAnnouncements: React.FC = () => {
  const [politeAnnouncement, setPoliteAnnouncement] = useState('');
  const [assertiveAnnouncement, setAssertiveAnnouncement] = useState('');

  return (
    <div className="sr-only">
      {/* Polite announcements */}
      <div 
        aria-live="polite" 
        aria-atomic="true"
        role="status"
        id="polite-announcements"
      >
        {politeAnnouncement}
      </div>
      
      {/* Assertive announcements */}
      <div 
        aria-live="assertive" 
        aria-atomic="true"
        role="alert"
        id="assertive-announcements"
      >
        {assertiveAnnouncement}
      </div>
    </div>
  );
};

// Utility functions per annunci comuni
export const announceNavigation = (announce: (message: string, priority?: AnnouncementPriority) => void) => ({
  sectionChange: (sectionNumber: number, totalSections: number, sectionTitle: string) => {
    announce(`Sezione ${sectionNumber} di ${totalSections}: ${sectionTitle}`, 'polite');
  },
  
  pageLoad: (pageName: string) => {
    announce(`Pagina ${pageName} caricata`, 'polite');
  },
  
  validationError: (errorMessage: string) => {
    announce(`Errore di validazione: ${errorMessage}`, 'assertive');
  },
  
  formSuccess: (successMessage: string) => {
    announce(successMessage, 'polite');
  },
  
  loading: (action: string) => {
    announce(`${action} in corso...`, 'polite');
  },
  
  loadingComplete: (action: string) => {
    announce(`${action} completato`, 'polite');
  }
});

// Hook per annunci di navigazione predefiniti
export const useNavigationAnnouncements = () => {
  const { announce } = useScreenReaderAnnouncements();
  return announceNavigation(announce);
};

// Focus management utilities
export const focusManagement = {
  // Focus su un elemento con retry in caso di rendering asincrono
  focusElement: (selector: string, retries: number = 3, delay: number = 100) => {
    const attemptFocus = (attempts: number) => {
      const element = document.querySelector(selector);
      if (element instanceof HTMLElement) {
        element.focus();
        return true;
      }
      
      if (attempts > 0) {
        setTimeout(() => attemptFocus(attempts - 1), delay);
      }
      return false;
    };
    
    return attemptFocus(retries);
  },
  
  // Focus sul primo elemento con errore in un form
  focusFirstError: (formSelector: string = 'form') => {
    const form = document.querySelector(formSelector);
    if (!form) return false;
    
    const errorElement = form.querySelector('[aria-invalid="true"], [data-error="true"], .error');
    if (errorElement instanceof HTMLElement) {
      errorElement.focus();
      return true;
    }
    
    return false;
  },
  
  // Focus sul prossimo elemento focusable
  focusNext: (currentElement: HTMLElement) => {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const elementsArray = Array.from(focusableElements) as HTMLElement[];
    const currentIndex = elementsArray.indexOf(currentElement);
    
    if (currentIndex >= 0 && currentIndex < elementsArray.length - 1) {
      elementsArray[currentIndex + 1].focus();
      return true;
    }
    
    return false;
  },
  
  // Focus sull'elemento precedente focusable
  focusPrevious: (currentElement: HTMLElement) => {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const elementsArray = Array.from(focusableElements) as HTMLElement[];
    const currentIndex = elementsArray.indexOf(currentElement);
    
    if (currentIndex > 0) {
      elementsArray[currentIndex - 1].focus();
      return true;
    }
    
    return false;
  }
};

// Hook per focus management
export const useFocusManagement = () => {
  return {
    ...focusManagement,
    
    // Focus management specifico per questionario
    focusCurrentSection: useCallback((sectionIndex: number) => {
      return focusManagement.focusElement(`[data-section-index="${sectionIndex}"] h2`);
    }, []),
    
    focusQuestion: useCallback((questionId: string) => {
      return focusManagement.focusElement(`[data-question-id="${questionId}"]`);
    }, []),
    
    focusNavigation: useCallback(() => {
      return focusManagement.focusElement('#navigation');
    }, [])
  };
};