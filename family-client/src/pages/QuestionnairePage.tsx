// src/pages/QuestionnairePage.tsx - Con API reali e gestione errori
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import SimpleLayout from '../components/layout/SimpleLayout';
import { Button, LoadingSpinner } from '../components/ui';
import { Question, Section, Language } from '@bilinguismo/shared';
import { getLocalizedText } from '@bilinguismo/shared';
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

const questionnaireData = bilingualismQuestionnaireData as {
  sections: Section[];
};

const QuestionnairePage: React.FC = () => {
  const { templateId, submissionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Focus management refs
  const sectionHeaderRef = useRef<HTMLHeadingElement>(null);
  const skipToNavRef = useRef<HTMLDivElement>(null);
  
  // Hooks
  const { announce } = useScreenReaderAnnouncements();
  const { handleApiError, handleApiSuccess, clearErrors } = useApiError();
  
  // TTS State
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [currentSpeakingQuestionId, setCurrentSpeakingQuestionId] = useState<string | null>(null);
  const { speak, stop, status } = useTextToSpeech(location.state?.language || 'it');
  
  // State management - Inizializza con dati dal navigation state se disponibili
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(
    location.state?.answers ? 
    location.state.answers.reduce((acc: Record<string, string>, answer: any) => {
      acc[answer.question_id] = answer.answer_value;
      return acc;
    }, {}) : {}
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedLanguage] = useState<Language>(location.state?.language || 'it');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Network & Error states
  const [error, setError] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  
  // Dati questionario
  const currentSection = questionnaireData.sections[currentSectionIndex];
  const totalSections = questionnaireData.sections.length;
  const isLastSection = currentSectionIndex === totalSections - 1;
  const isFirstSection = currentSectionIndex === 0;

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

    currentSection.questions.forEach((question) => {
      const answer = answers[question.questionId] || '';
      
      try {
        questionSchema.parse(question);
        
        if (question.required && (!answer || answer.trim() === '')) {
          errors[question.questionId] = 'Questa domanda è obbligatoria';
        }     
        if (answer && question.type === 'date') {
          const dateSchema = z.string().datetime();
          const result = dateSchema.safeParse(answer);
          if (!result.success) {
            errors[question.questionId] = 'Data non valida';
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

  // ✅ API CALLS CON GESTIONE ERRORI REALE
  const saveProgress = async (showLoading = true): Promise<boolean> => {
    if (!isOnline) {
      announce('Nessuna connessione. Il salvataggio verrà effettuato quando tornerai online.', 'polite');
      return false;
    }

    if (showLoading) setSaving(true);
    setError('');
    announce('Salvataggio in corso...', 'polite');
    
    try {
      await submissionApi.saveProgress(submissionId!, {
        answers: Object.entries(answers).map(([questionId, answerValue]) => ({
          question_identifier: questionId,
          answer_value: answerValue
        })),
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
    setLoading(true);
    setError('');
    clearErrors();
    announce('Completamento questionario in corso...', 'polite');
    
    try {
      // Prima salva i progressi correnti
      const saveSuccess = await saveProgress(false);
      if (!saveSuccess && isOnline) {
        throw new Error('Errore nel salvataggio finale');
      }
      
      // Poi completa il questionario
      await submissionApi.complete(submissionId!, {
        answers: Object.entries(answers).map(([questionId, answerValue]) => (
          {
          question_identifier: questionId,
          answer_value: answerValue
        })),
        current_step_identifier:currentSection.sectionId
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