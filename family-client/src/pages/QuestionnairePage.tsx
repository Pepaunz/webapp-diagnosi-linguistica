// src/pages/QuestionnairePage.tsx - Con API reali e gestione errori
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import SimpleLayout from '../components/layout/SimpleLayout';
import { Button, LoadingSpinner } from '../components/ui';
import { Question, Section, Language, QuestionnaireData, Template } from '@bilinguismo/shared';
import { getLocalizedText } from  '../../../shared/src/utils';
import { z } from 'zod';
import { questionSchema } from '../../../shared/src/schemas/questionnaire.schemas';
import { 
  SectionHeader, 
  QuestionBlock, 
  MultipleChoiceQuestion, 
  TextQuestion,
  DateQuestion
} from '../components/questionnaire/QuestionnaireComponents';
import { AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { bilingualismQuestionnaireData } from '../../mock-template';
import { ProgressBar } from '../components/questionnaire/ProgressBar';
import { StarRating } from '../components/questionnaire/QuestionnaireComponents';
import { ScreenReaderAnnouncements, useScreenReaderAnnouncements } from '../components/accessibility/ScreenReaderAnnouncements';
import TTSFloatingButton from '../components/accessibility/TTSFloatingButton';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { submissionApi } from '../services/apiService';
import { useApiError } from '../hooks/useApiError';
import FeedbackForm from "../components/questionnaire/FeedbackForm"


const QuestionnairePage: React.FC = () => {
  const { templateId, submissionId,fiscalCode } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  
  // Focus management refs
  const sectionHeaderRef = useRef<HTMLHeadingElement>(null);
  const skipToNavRef = useRef<HTMLDivElement>(null);
  
  // Hooks
  const { announce } = useScreenReaderAnnouncements();
  const { handleApiError, handleApiSuccess, clearErrors } = useApiError();

   // State management - Inizializza con dati dal navigation state se disponibili

  
  // TTS State
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [currentSpeakingQuestionId, setCurrentSpeakingQuestionId] = useState<string | null>(null);
  const { speak, stop, status } = useTextToSpeech(location.state?.language || 'it');
  
 
  const [template, setTemplate] = useState<Template | null>(location.state?.questionnaire_template || null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false);
  const [selectedLanguage] = useState<Language>(location.state?.language || 'it');
  const [loading, setLoading] = useState(true); 
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Network & Error states
  const [error, setError] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  
 

  useEffect(() => {
    
    const initializePage = async () => {
      // Dati iniziali 
      let initialTemplate = location.state?.questionnaire_template || null;
      let initialAnswers = location.state?.answers || [];
      let lastSavedStepId = location.state?.current_step_identifier || null;

      // --- Logica di Fallback (Refresh Pagina) ---
      // Se non abbiamo un template dallo stato di navigazione, facciamo la chiamata API.
      if (!initialTemplate) {
        console.log("No initial data from navigation state, fetching from API...");

        if (!submissionId || !templateId || !fiscalCode) {
          navigate('/');
          return;
        }

        try {
          const response = await submissionApi.startOrResume({
            fiscal_code: fiscalCode,
            questionnaire_template_id: templateId,
            language_used: selectedLanguage,
          });

          initialTemplate = response.questionnaire_template;
          initialAnswers = response.answers;
          lastSavedStepId = response.current_step_identifier;

        } catch (err) {
          handleApiError(err, "il caricamento del questionario");
          navigate('/'); // Reindirizza in caso di errore
          return;
        } finally {
          setLoading(false);
        }
      }
      // A questo punto, abbiamo i dati necessari, o da `location.state` o dall'API.
      if (initialTemplate) {
        // Imposta il template
        setTemplate(initialTemplate);

        const answersMap: Record<string, string> = {};
        initialAnswers.forEach((answer: any) => {
          if (answer.question_identifier && answer.answer_value !== null) {
            answersMap[answer.question_identifier] = String(answer.answer_value);
          }
        });
        setAnswers(answersMap);
        const structure = initialTemplate.structure_definition as QuestionnaireData;
        let sectionIndexToShow = 0; 

        if (lastSavedStepId && structure.sections) {
          // Trova l'indice dell'ultima sezione salvata
          const lastSavedIndex = structure.sections.findIndex(s => s.sectionId === lastSavedStepId);

          if (lastSavedIndex !== -1 && lastSavedIndex < structure.sections.length - 1) {
            
            sectionIndexToShow = lastSavedIndex + 1;
          } else if (lastSavedIndex !== -1) {
            sectionIndexToShow = lastSavedIndex;
          }
        }
        setCurrentSectionIndex(sectionIndexToShow);
      } else {
        navigate('/');
      }
      setLoading(false); 
    };

    initializePage();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { 
    structure, 
    questionnaireSections, 
    currentSection, 
    totalSections, 
    isLastSection, 
    isFirstSection 
  } = useMemo(() => {
    if (!template) {
      // Se il template non c'è, restituisci valori di default per evitare crash
      return { 
        structure: null, 
        questionnaireSections: [], 
        currentSection: null, 
        totalSections: 0, 
        isLastSection: false, 
        isFirstSection: true 
      };
    }
    const struct = template.structure_definition as QuestionnaireData;
    const sections = struct?.sections || [];
    const total = sections.length;
    const currentIdx = Math.min(currentSectionIndex, total - 1); // Prevenzione errori
    
    return {
      structure: struct,
      questionnaireSections: sections,
      currentSection: sections[currentIdx] || null,
      totalSections: total,
      isLastSection: currentIdx === total - 1,
      isFirstSection: currentIdx === 0,
    };
  }, [template, currentSectionIndex]);

/*
  useEffect(() => {
    // Se i dati del questionario non sono stati passati tramite lo stato della navigazione,
    // significa che l'utente ha ricaricato la pagina. Dobbiamo recuperarli.
    const loadInitialData = async () => {
      if (!template && submissionId && templateId && fiscalCode) {
        console.log("No initial data found, fetching from API...");
        setLoading(true);
        try {
          // La chiamata startOrResume ci ridarà tutto ciò di cui abbiamo bisogno
          const response = await submissionApi.startOrResume({
            fiscal_code: fiscalCode, 
            questionnaire_template_id: templateId,
            language_used: selectedLanguage,
          });

          setTemplate(response.questionnaire_template);
          
          // Ricostruisci la mappa delle risposte
          const answersMap: Record<string, string> = {};
          response.answers.forEach((answer: any) => {
            if (answer.question_identifier && answer.answer_value !== null) {
              answersMap[answer.question_identifier] = String(answer.answer_value);
            }
          });
          setAnswers(answersMap);
          
        } catch (err) {
          handleApiError(err, "il caricamento del questionario");
          // Potresti voler reindirizzare l'utente se il caricamento fallisce
          navigate('/'); 
        } finally {
          setLoading(false);
        }
      }
    };

    loadInitialData();
  }, [ submissionId, templateId, navigate, handleApiError, selectedLanguage]);

  useEffect(() => {
    // Questo effetto si attiva solo quando il template è finalmente disponibile.
    if (template) {
 
      const stepIdentifier = location.state?.current_step_identifier || null;

      if (stepIdentifier) {
        const structure = template.structure_definition as QuestionnaireData;
        const foundIndex = structure.sections.findIndex(s => s.sectionId === stepIdentifier);
        
        if (foundIndex > 0) { 
          setCurrentSectionIndex(foundIndex);
        }
      }
    }
  }, [template, location]); */


 
  // Network monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (error) {
        setError('');
        announce('Connessione ristabilita', 'polite');
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      announce('Connessione persa. Le modifiche verranno salvate quando tornerai online.', 'assertive');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [error]);

  // TTS handlers
  const handleQuestionSpeak = async (text: string, questionId: string) => {
    if (currentSpeakingQuestionId === questionId && status === 'speaking') {
      stop();
      setCurrentSpeakingQuestionId(null);
      return;
    }
    
    stop();
    setCurrentSpeakingQuestionId(questionId);
    
    const success = await speak(text);
    if (!success) {
      setCurrentSpeakingQuestionId(null);
      announce('Errore nella lettura della domanda', 'assertive');
    }
  };

  useEffect(() => {
    if (status === 'idle' && currentSpeakingQuestionId) {
      setCurrentSpeakingQuestionId(null);
    }
  }, [status, currentSpeakingQuestionId]);

  // Cleanup TTS quando cambia sezione
  useEffect(() => {
    stop();
    setCurrentSpeakingQuestionId(null);
  }, [currentSectionIndex, stop]);

  // Reset TTS quando viene disabilitato
  useEffect(() => {
    if (!ttsEnabled) {
      stop();
      setCurrentSpeakingQuestionId(null);
    }
  }, [ttsEnabled, stop]);

  // Focus management quando cambia sezione
  useEffect(() => {
    if(!currentSection) return; 
    if (sectionHeaderRef.current) {
      sectionHeaderRef.current.focus();
      const sectionTitle = getLocalizedText(currentSection.title, selectedLanguage);
      announce(
        `Sezione ${currentSectionIndex + 1} di ${totalSections}: ${sectionTitle}`,
        'polite'
      );
    }
  }, [currentSectionIndex, announce, currentSection, selectedLanguage, totalSections]);

  // Validazione
  const validateCurrentSection = (): boolean => {
    const errors: Record<string, string> = {};
    if (!currentSection) {
      return false;
    }
    currentSection.questions.forEach((question) => {
      const answer = answers[question.questionId] || '';
      
      try {
        questionSchema.parse(question);
        
        if (question.required && (!answer || answer.trim() === '')) {
          errors[question.questionId] = 'Questa domanda è obbligatoria';
        }     
        if (answer && question.type === 'date') {
          const dateSchema = z.string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Il formato della data deve essere AAAA-MM-GG" })
          .refine((date) => !isNaN(Date.parse(date)), { message: "Data non valida" });
          
          const result = dateSchema.safeParse(answer);
          if (!result.success) {
            errors[question.questionId] = result.error.issues[0].message; // Usa il messaggio di errore di Zod
          }
        }
        
      } catch (error) {
        errors[question.questionId] = 'Errore nella domanda';
      }
    });
    
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      announce('Ci sono errori nelle domande', 'assertive');
      const firstErrorQuestionId = Object.keys(errors)[0];
      const firstErrorElement = document.querySelector(`[data-question-id="${firstErrorQuestionId}"]`);
      if (firstErrorElement instanceof HTMLElement) {
        firstErrorElement.focus();
      }
    }
    
    return Object.keys(errors).length === 0;
  };

  // Handle answer change
  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    if (validationErrors[questionId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
    
    // Clear error when user interacts
    if (error) {
      setError('');
    }
  };


  const saveProgress = async (showLoading = true): Promise<boolean> => {
    if(!currentSection || !submissionId) return false
    if (!isOnline) {
      announce('Nessuna connessione. Il salvataggio verrà effettuato quando tornerai online.', 'polite');
      return false;
    }

    if (showLoading) setSaving(true);
    setError('');
    announce('Salvataggio in corso...', 'polite');
    
    try {
      const currentSectionQuestionIds = new Set(currentSection.questions.map(q => q.questionId));

      const answersForCurrentSection = Object.entries(answers)
        .filter(([questionId, _]) => currentSectionQuestionIds.has(questionId))
        .map(([questionId, answerValue]) => ({
          question_identifier: questionId,
          answer_value: answerValue,
        }));
      
        if (answersForCurrentSection.length === 0) {
          if (showLoading) setSaving(false);
          return true; 
        }
        await submissionApi.saveProgress(submissionId, {
          answers: answersForCurrentSection,
          current_step_identifier: currentSection.sectionId
        });
      
      handleApiSuccess('Progressi salvati');
      announce('Progressi salvati', 'polite');
      setRetryCount(0);
      return true;
      
    } catch (err) {
      console.error('Error saving progress:', err);
      handleApiError(err, 'il salvataggio');
      setError('Errore nel salvataggio. Riprovare.');
      announce('Errore nel salvataggio. Riprovare.', 'assertive');
      
      // Retry automatico per errori di rete
      if (err instanceof TypeError && err.message.includes('fetch') && retryCount < 3) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => saveProgress(false), 2000 * (retryCount + 1));
      }
      
      return false;
    } finally {
      if (showLoading) setSaving(false);
    }
  };

  const handleComplete = async () => {
    if(!currentSection || !submissionId) return;
    setLoading(true);
    setError('');
    clearErrors();
    announce('Completamento questionario in corso...', 'polite');
    
    try {

      const currentSectionQuestionIds = new Set(currentSection.questions.map(q => q.questionId));
      const finalAnswers = Object.entries(answers)
        .filter(([questionId, _]) => currentSectionQuestionIds.has(questionId))
        .map(([questionId, answerValue]) => ({
          question_identifier: questionId,
          answer_value: answerValue
        }));

     
      await submissionApi.complete(submissionId, {
        answers: finalAnswers,
        current_step_identifier: currentSection.sectionId
      });
      
      handleApiSuccess('Questionario completato con successo!');
      announce('Questionario completato con successo!', 'polite');
      navigate(`/complete/${submissionId}`);
      
    } catch (error) {
      console.error('Error completing questionnaire:', error);
      handleApiError(error, 'il completamento del questionario');
      setError('Errore nel completamento del questionario');
      announce('Errore nel completamento del questionario', 'assertive');
    } finally {
      setLoading(false);
    }
  };

  // Navigation handlers
  const handleNext = async () => {
    if (!validateCurrentSection()) {
      return;
    }
    
    if (isLastSection) {
      await handleComplete();
    } else {
      const saveSuccess = await saveProgress();
      if (saveSuccess || !isOnline) {
        setCurrentSectionIndex(prev => prev + 1);
        setError(''); // Clear errors when advancing
      }
    }
  };

  const handlePrevious = async () => {
    if (!isFirstSection) {
      await saveProgress();
      setCurrentSectionIndex(prev => prev - 1);
      setError(''); // Clear errors when going back
    }
  };

  // Skip to navigation
  const handleSkipToNavigation = () => {
    if (skipToNavRef.current) {
      skipToNavRef.current.focus();
    }
  };

  const handleReportProblem = () => {
    announce('Apertura modulo segnalazione problema', 'polite');
    setShowFeedbackForm(true);
  };

  // Retry function
  const handleRetry = () => {
    setError('');
    setRetryCount(0);
    saveProgress();
  };

  // Render question con integrazione TTS
  const renderQuestion = (question: Question) => {
    const questionText = getLocalizedText(question.text, selectedLanguage);
    const questionValue = answers[question.questionId] || '';
    const hasError = !!validationErrors[question.questionId];
    const errorMessage = validationErrors[question.questionId];

    const commonProps = {
      questionId: question.questionId,
      required: question.required,
      helpText: hasError ? errorMessage : undefined,
    };

    const errorProps = {
      hasError,
      errorMessage
    };

    // Props TTS per QuestionBlock
    const ttsProps = ttsEnabled ? {
      ttsEnabled,
      questionText,
      onQuestionSpeak: handleQuestionSpeak,
      currentSpeakingId: currentSpeakingQuestionId,
      ttsStatus: status
    } : {};

    if (question.type === 'multiple-choice') {
      const options = question.options?.map((opt) => ({
        value: opt.value,
        label: getLocalizedText(opt.text, selectedLanguage)
      })) || [];

      return (
        <QuestionBlock 
          key={question.questionId} 
          question={questionText}
          questionId={question.questionId}
          required={question.required}
          {...errorProps}
          {...ttsProps}
        >
          <div data-question-id={question.questionId} tabIndex={-1}>
            <MultipleChoiceQuestion
              options={options}
              value={questionValue}
              onChange={(value) => handleAnswerChange(question.questionId, value)}
              name={question.questionId}
              {...commonProps}
            />
          </div>
        </QuestionBlock>
      );
    }

    if (question.type === 'text') {
      return (
        <QuestionBlock 
          key={question.questionId} 
          question={questionText}
          questionId={question.questionId}
          required={question.required}
          {...errorProps}
          {...ttsProps}
        >
          <div data-question-id={question.questionId} tabIndex={-1}>
            <TextQuestion
              value={questionValue}
              onChange={(value) => handleAnswerChange(question.questionId, value)}
              placeholder="Inserisci risposta"
              label={questionText}
              {...commonProps}
            />
          </div>
        </QuestionBlock>
      );
    }

    if (question.type === 'date') {
      return (
        <QuestionBlock 
          key={question.questionId} 
          question={questionText}
          questionId={question.questionId}
          required={question.required}
          {...errorProps}
          {...ttsProps}
        >
          <div data-question-id={question.questionId} tabIndex={-1}>
            <DateQuestion
              value={questionValue}
              onChange={(value) => handleAnswerChange(question.questionId, value)}
              label={questionText}
              {...commonProps}
            />
          </div>
        </QuestionBlock>
      );
    }

    if (question.type === 'rating') {
      const numValue = questionValue ? parseInt(questionValue, 10) : 0;
      const maxValue = question.maxValue || 10;
      
      return (
        <QuestionBlock 
          key={question.questionId} 
          question={questionText}
          questionId={question.questionId}
          required={question.required}
          {...errorProps}
          {...ttsProps}
        >
          <div data-question-id={question.questionId} tabIndex={-1}>
            <StarRating
              value={numValue}
              onChange={(value) => handleAnswerChange(question.questionId, value.toString())}
              maxStars={maxValue}
              label={questionText}
              {...commonProps}
            />
          </div>
        </QuestionBlock>
      );
    }

    return null;
  };

  if (loading || !template || !currentSection) {
    return (
      <SimpleLayout>
        <div className="text-center py-mobile-xl">
          <LoadingSpinner size="lg" text="Caricamento questionario..." />
        </div>
      </SimpleLayout>
    );
  }
  // Loading state
  if (loading) {
    return (
      <SimpleLayout>
        <div 
          className="text-center py-mobile-xl"
          role="status"
          aria-live="polite"
          aria-label="Completamento in corso"
        >
          <LoadingSpinner size="lg" text="Completamento in corso..." />
        </div>
      </SimpleLayout>
    );
  }

  return (
    <SimpleLayout>
      <ScreenReaderAnnouncements />
      
      {/* Skip Link */}
      <a 
        href="#navigation" 
        className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded"
        onClick={(e) => {
          e.preventDefault();
          handleSkipToNavigation();
        }}
      >
        Salta al contenuto principale
      </a>
      
      {/* TTS Floating Button */}
      <TTSFloatingButton
        isEnabled={ttsEnabled}
        onToggle={setTtsEnabled}
        currentLanguage={selectedLanguage}
      />
      
      {/* Main Content */}
      <main role="main" aria-label="Compilazione questionario">
        <ProgressBar currentStep={currentSectionIndex + 1} totalSteps={totalSections} />
        
        {/* Connection Status */}
        {!isOnline && (
          <div 
            role="alert" 
            aria-live="assertive"
            className="mb-mobile-md mx-mobile-md p-3 bg-orange-50 border-l-4 border-orange-400 rounded-mobile-sm"
          >
            <div className="flex items-center">
              <WifiOff className="h-5 w-5 text-orange-400 mr-3" aria-hidden="true" />
              <div>
                <p className="text-mobile-sm font-medium text-orange-800">
                  Nessuna connessione
                </p>
                <p className="text-mobile-xs text-orange-700 mt-1">
                  Le modifiche verranno salvate quando tornerai online
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div 
            role="alert"
            aria-live="assertive" 
            className="mb-mobile-md mx-mobile-md p-4 bg-red-50 border-l-4 border-red-400 rounded-mobile-sm"
          >
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div className="flex-1">
                <p className="text-mobile-sm font-medium text-red-800 mb-2">
                  {error}
                </p>
                <button
                  onClick={handleRetry}
                  className="text-mobile-xs text-red-700 underline hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                >
                  Riprova
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex-1 pb-24" aria-label="Contenuto sezione corrente">
          <SectionHeader 
            ref={sectionHeaderRef}
            title={getLocalizedText(currentSection.title, selectedLanguage)}
            description={getLocalizedText(currentSection.description, selectedLanguage)}
            sectionNumber={currentSectionIndex + 1}
            sectionId={currentSection.sectionId}
          />
          
          <div role="group" aria-label="Domande della sezione">
            {currentSection.questions.map(renderQuestion)}
          </div>
        </div>

        {/* Navigation */}
        <nav 
          id="navigation"
          className="bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-mobile-md py-mobile-md"
          aria-label="Navigazione questionario"
          ref={skipToNavRef}
          tabIndex={-1}
        >
          <div className="max-w-sm mx-auto">
            {/* Save Status Indicator */}
            <div className="flex items-center justify-center text-mobile-sm text-family-text-body mb-mobile-sm">
              {saving ? (
                <div className="flex items-center">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Salvataggio...</span>
                </div>
              ) : isOnline ? (
                <div className="flex items-center text-green-600">
                  <Wifi className="h-4 w-4 mr-1" aria-hidden="true" />
                  <span>Online</span>
                </div>
              ) : (
                <div className="flex items-center text-orange-600">
                  <WifiOff className="h-4 w-4 mr-1" aria-hidden="true" />
                  <span>Offline</span>
                </div>
              )}
            </div>

            <div className="flex gap-mobile-sm mb-mobile-sm" role="group" aria-label="Controlli navigazione">
              {!isFirstSection && (
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handlePrevious}
                  disabled={saving}
                  className="flex-1"
                  aria-label="Vai alla sezione precedente"
                >
                  Indietro
                </Button>
              )}
              
              <Button
                variant="primary"
                size="lg"
                onClick={handleNext}
                disabled={saving}
                loading={saving}
                className={isFirstSection ? "w-full" : "flex-1"}
                aria-label={isLastSection ? 'Completa e invia questionario' : 'Vai alla sezione successiva'}
              >
                {isLastSection ? 'Completa' : 'Avanti'}
              </Button>
            </div>
            
            <div className="text-center">
              <button 
                type="button"
                onClick={handleReportProblem}
                className="inline-flex items-center text-family-text-body hover:text-family-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-family-input-focus/80 focus:rounded"
                aria-label="Segnala un problema con questo questionario"
              >
                <AlertTriangle className="w-4 h-4 mr-2" aria-hidden="true" />
                <span className="text-mobile-sm underline">Segnala problema</span>
              </button>
            </div>
          </div>
        </nav>
      </main>

      {/* Feedback Form Modal */}
      <FeedbackForm
        isOpen={showFeedbackForm}
        onClose={() => setShowFeedbackForm(false)}
        submissionId={submissionId}
        questionId={currentSection.questions.length > 0 ? currentSection.questions[0].questionId : undefined}
        templateId={templateId}
      />
    </SimpleLayout>
  );
};

export default QuestionnairePage;