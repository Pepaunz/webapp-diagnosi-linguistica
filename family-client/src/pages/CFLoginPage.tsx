// src/pages/CFLoginPage.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SimpleLayout from '../components/layout/SimpleLayout';
import { Button, Input, LoadingSpinner } from '../components/ui';
import LanguageSelector from '../components/ui/LanguageSelector';
import { Info } from 'lucide-react';
import { ScreenReaderAnnouncements, useScreenReaderAnnouncements } from '../components/accessibility/ScreenReaderAnnouncements';

import { z } from 'zod';
import { fiscalCodeSchema } from '../../../shared/src/schemas/common.schemas';

const CFLoginPage: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  
  // Refs for focus management
  const mainContentRef = useRef<HTMLDivElement>(null);
  const fiscalCodeInputRef = useRef<HTMLInputElement>(null);
  
  // Screen reader announcements
  const { announce } = useScreenReaderAnnouncements();
  
  // State
  const [fiscalCode, setFiscalCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('it');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Focus management on mount
  useEffect(() => {
    // Focus sul contenuto principale quando la pagina si carica
    if (mainContentRef.current) {
      mainContentRef.current.focus();
    }
  }, []);

  // Validazione base Codice Fiscale
  const validateFiscalCode = (cf: string): { isValid: boolean; error?: string } => {
    try {
      fiscalCodeSchema.parse(cf.toUpperCase());
      return { isValid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { 
          isValid: false, 
          error: error.issues[0]?.message || 'Codice fiscale non valido' 
        };
      }
      return { isValid: false, error: 'Errore di validazione' };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitted(true);
    
    if (!fiscalCode.trim()) {
      const errorMsg = 'Il codice fiscale è obbligatorio';
      setError(errorMsg);
      announce(errorMsg, 'assertive');
      // Focus sull'input con errore
      if (fiscalCodeInputRef.current) {
        fiscalCodeInputRef.current.focus();
      }
      return;
    }
    const validation = validateFiscalCode(fiscalCode);
    if (!validation.isValid) {
      const errorMsg = 'Codice fiscale non valido.';
      setError(validation.error || errorMsg);
      announce(validation.error || errorMsg, 'assertive');
      // Focus sull'input con errore
      if (fiscalCodeInputRef.current) {
        fiscalCodeInputRef.current.focus();
      }
      return;
    }
    
    setLoading(true);
    announce('Verifica codice fiscale in corso...', 'polite');
    
    try {
      // TODO: Chiamata API reale
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockSubmissionId = 'sub_' + Date.now();
      announce('Accesso effettuato con successo', 'polite');
      navigate(`/questionnaire/${templateId}/${mockSubmissionId}`, {state: {language: selectedLanguage}} );
    } catch (err) {
      const errorMsg = 'Errore durante l\'accesso. Riprova più tardi.';
      setError(errorMsg);
      announce(errorMsg, 'assertive');
    } finally {
      setLoading(false);
    }
  };

  const handleFiscalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setFiscalCode(value);
    
    // Rimuovi errore se l'utente sta digitando
    if (error && value.trim()) {
      setError('');
    }
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    document.documentElement.lang = language;
    announce(`Lingua cambiata in ${language}`, 'polite');
  };

  if (loading) {
    return (
      <SimpleLayout>
        <div 
          className="max-w-sm mx-auto text-center py-mobile-xl"
          role="status"
          aria-live="polite"
          aria-label="Accesso in corso"
        >
          <LoadingSpinner size="lg" text="Accesso in corso..." />
        </div>
      </SimpleLayout>
    );
  }

  return (
    <SimpleLayout>
      {/* Screen Reader Announcements */}
      <ScreenReaderAnnouncements />
      
      <main 
        role="main" 
        className="max-w-sm mx-auto px-mobile-md focus:outline-none"
        ref={mainContentRef}
        tabIndex={-1}
        aria-label="Pagina di accesso al questionario"
      >
        {/* Header Section */}
        <header className="text-center mb-mobile-xl">
          <h1 
            className="text-mobile-2xl font-bold text-family-text-primary mb-mobile-md"
            id="main-heading"
          >
            Benvenuto/a
          </h1>
          <p 
            className="text-mobile-md text-family-text-body leading-relaxed px-2"
            role="doc-subtitle"
            aria-describedby="main-heading"
          >
            Per iniziare o riprendere il questionario inserisci il codice fiscale del bambino/a
          </p>
        </header>

        {/* Main Form */}
        <form 
          onSubmit={handleSubmit} 
          className="space-y-mobile-lg"
          noValidate
          aria-describedby={error ? 'form-error' : undefined}
        >
          {/* Fiscal Code Input */}
          <div>
            <label 
              htmlFor="fiscal-code"
              className="block text-mobile-md font-medium text-family-text-primary mb-2"
            >
              Codice Fiscale
              <span className="text-red-600 ml-1" aria-label="campo obbligatorio">*</span>
            </label>
            
            <input
              ref={fiscalCodeInputRef}
              id="fiscal-code"
              type="text"
              value={fiscalCode}
              onChange={handleFiscalCodeChange}
              placeholder="RSSMRA85M01H501Z"
              maxLength={16}
              required
              autoFocus
              inputMode="text"
              autoCapitalize="characters"
              autoComplete="off"
              aria-describedby={error ? 'form-error fiscal-code-help' : 'fiscal-code-help'}
              aria-invalid={error ? 'true' : 'false'}
              className={`
                text-center tracking-wider font-mono text-mobile-md
                w-full px-mobile-sm py-mobile-sm border-2 rounded-mobile-sm
                min-h-touch-md transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-family-input-focus/80
                ${error 
                  ? 'border-red-500 bg-red-50 focus:border-red-500' 
                  : 'border-gray-300 focus:border-family-input-focus'
                }
              `}
            />
            
            {/* Help text */}
            <div id="fiscal-code-help" className="mt-2 text-mobile-sm text-family-text-body">
              Formato: 16 caratteri (lettere e numeri)
            </div>
          </div>
          
          {/* Language Selector */}
          <div>
            <LanguageSelector
              value={selectedLanguage}
              onChange={handleLanguageChange}
              id="language-selector"
            />
          </div>
          
          {/* Error Message */}
          {error && (
            <div 
              id="form-error"
              role="alert"
              aria-live="assertive"
              className="mt-4 p-3 bg-red-50 border border-red-200 rounded-mobile-sm"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg 
                    className="h-5 w-5 text-red-400" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-mobile-sm text-red-800 font-medium">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Submit Button */}
          <div className="pt-mobile-md">
            <Button 
              type="submit" 
              size="lg"
              variant="primary"
              className="w-full"
              disabled={loading}
              aria-describedby={error ? 'form-error' : undefined}
            >
              Avanti
            </Button>
          </div>
        </form>
        
        {/* Privacy Link */}
        <footer className="mt-mobile-xl text-center">
          <button 
            type="button"
            className="inline-flex items-center text-family-text-body hover:text-family-text-primary transition-colors group focus:outline-none focus:ring-2 focus:ring-family-input-focus/80 focus:rounded"
            aria-label="Visualizza informazioni sulla privacy"
            onClick={() => {
              announce('Apertura informazioni privacy', 'polite');
              // TODO: Implementare modal privacy
              alert('Modal privacy da implementare');
            }}
          >   
            <Info className="w-5 h-5 mr-2" aria-hidden="true" />
            <span className="text-mobile-sm underline">Info sulla privacy</span>
          </button>
        </footer>
      </main>
    </SimpleLayout>
  );
};

export default CFLoginPage;