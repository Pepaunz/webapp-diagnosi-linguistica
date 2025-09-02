// src/pages/QuestionnairePage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SimpleLayout from '../components/layout/SimpleLayout';
import { Button, LoadingSpinner } from '../components/ui';
import { 
  SectionHeader, 
  QuestionBlock, 
  MultipleChoiceQuestion, 
  TextQuestion,
  DateQuestion
} from '../components/questionnaire/QuestionnaireComponents';
import { AlertTriangle } from 'lucide-react';
import { bilingualismQuestionnaireData } from '../../mock-template';
import { ProgressBar } from '../components/questionnaire/ProgressBar';
import { StarRating } from '../components/questionnaire/QuestionnaireComponents';
import { ScreenReaderAnnouncements, useScreenReaderAnnouncements } from '../components/accessibility/ScreenReaderAnnouncements'

// Types per il questionario
type Language = 'it' | 'en' | 'es' | 'ar';

interface MultilingualText {
  it: string;
  en: string;
  es: string;
  ar: string;
}

interface QuestionOption {
  value: string;
  text: MultilingualText;
}

interface Question {
  questionId: string;
  text: MultilingualText;
  type: 'text' | 'multiple-choice' | 'date' | 'rating';
  required: boolean;
  options?: QuestionOption[];
  minValue?: number;
  maxValue?: number;
}

interface Section {
  sectionId: string;
  title: MultilingualText;
  description?: MultilingualText;
  questions: Question[];
}

// Cast dei dati per assicurare compatibilità
const questionnaireData = bilingualismQuestionnaireData as {
  sections: Section[];
};

const QuestionnairePage: React.FC = () => {
  const { templateId, submissionId } = useParams();
  const navigate = useNavigate();
  
  // Focus management refs
  const sectionHeaderRef = useRef<HTMLHeadingElement>(null);
  const skipToNavRef = useRef<HTMLDivElement>(null);
  
  // Screen reader announcements
  const { announce } = useScreenReaderAnnouncements();
  
  // State management
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedLanguage] = useState<Language>('en');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Usa i dati reali del questionario bilinguismo
  const currentSection = questionnaireData.sections[currentSectionIndex];
  const totalSections = questionnaireData.sections.length;
  const isLastSection = currentSectionIndex === totalSections - 1;
  const isFirstSection = currentSectionIndex === 0;

  // Focus management quando cambia sezione
  useEffect(() => {
    if (sectionHeaderRef.current) {
      // Focus sul titolo della sezione
      sectionHeaderRef.current.focus();
      
      // Annuncia il cambio sezione
      const sectionTitle = currentSection.title[selectedLanguage];
      announce(
        `Sezione ${currentSectionIndex + 1} di ${totalSections}: ${sectionTitle}`,
        'polite'
      );
    }
  }, [currentSectionIndex, announce, currentSection, selectedLanguage, totalSections]);

  // Validazione delle domande obbligatorie
  const validateCurrentSection = (): boolean => {
    const errors: Record<string, string> = {};
    let hasErrors = false;

    currentSection.questions.forEach((question) => {
      if (question.required) {
        const answer = answers[question.questionId];
        if (!answer || answer.trim() === '') {
          errors[question.questionId] = 'Questa domanda è obbligatoria';
          hasErrors = true;
        }
      }
    });

    setValidationErrors(errors);
    
    if (hasErrors) {
      announce('Alcune domande obbligatorie non sono state compilate', 'assertive');
      // Focus sulla prima domanda con errore
      const firstErrorQuestionId = Object.keys(errors)[0];
      const firstErrorElement = document.querySelector(`[data-question-id="${firstErrorQuestionId}"]`);
      if (firstErrorElement instanceof HTMLElement) {
        firstErrorElement.focus();
      }
    }
    
    return !hasErrors;
  };

  // Handle answer change
  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Rimuovi errore di validazione se presente
    if (validationErrors[questionId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  // Navigation handlers
  const handleNext = async () => {
    // Valida sezione corrente prima di procedere
    if (!validateCurrentSection()) {
      return;
    }
    
    if (isLastSection) {
      // Completa questionario
      await handleComplete();
    } else {
      // Vai alla sezione successiva
      await saveProgress();
      setCurrentSectionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = async () => {
    if (!isFirstSection) {
      await saveProgress();
      setCurrentSectionIndex(prev => prev - 1);
    }
  };

  // Skip to navigation (accessibility)
  const handleSkipToNavigation = () => {
    if (skipToNavRef.current) {
      skipToNavRef.current.focus();
    }
  };

  // API calls
  const saveProgress = async () => {
    setSaving(true);
    announce('Salvataggio in corso...', 'polite');
    
    try {
      // TODO: chiamata API PUT /api/submissions/{submissionId}/save_progress
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log('Progress saved:', { submissionId, answers, currentStep: currentSectionIndex + 1 });
      announce('Progressi salvati', 'polite');
    } catch (error) {
      console.error('Error saving progress:', error);
      announce('Errore nel salvataggio. Riprovare.', 'assertive');
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    announce('Completamento questionario in corso...', 'polite');
    
    try {
      // Prima salva progress finale
      await saveProgress();
      // Poi completa
      // TODO: chiamata API POST /api/submissions/{submissionId}/complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      announce('Questionario completato con successo!', 'polite');
      navigate(`/complete/${submissionId}`);
    } catch (error) {
      console.error('Error completing questionnaire:', error);
      announce('Errore nel completamento del questionario', 'assertive');
    } finally {
      setLoading(false);
    }
  };

  const handleReportProblem = () => {
    // TODO: implementare modal segnalazione
    announce('Apertura modulo segnalazione problema', 'polite');
    alert('Funzionalità "Segnala problema" da implementare');
  };

  // Render question based on type
  const renderQuestion = (question: Question) => {
    const questionText = question.text[selectedLanguage];
    const questionValue = answers[question.questionId] || '';
    const hasError = !!validationErrors[question.questionId];
    const errorMessage = validationErrors[question.questionId];

    const commonProps = {
      questionId: question.questionId,
      required: question.required,
      helpText: hasError ? errorMessage : undefined,
    };

    if (question.type === 'multiple-choice') {
      const options = question.options?.map((opt) => ({
        value: opt.value,
        label: opt.text[selectedLanguage]
      })) || [];

      return (
        <QuestionBlock 
          key={question.questionId} 
          question={questionText}
          questionId={question.questionId}
          required={question.required}
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
      // Per le domande di tipo rating, converte il valore stringa in numero
      const numValue = questionValue ? parseInt(questionValue, 10) : 0;
      const maxValue = question.maxValue || 10;
      
      return (
        <QuestionBlock 
          key={question.questionId} 
          question={questionText}
          questionId={question.questionId}
          required={question.required}
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
      {/* Screen Reader Announcements */}
      <ScreenReaderAnnouncements />
      
      {/* Skip Link per keyboard navigation */}
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
      
      {/* Main Content */}
      <main role="main" aria-label="Compilazione questionario">
        {/* Progress Bar */}
        <ProgressBar currentStep={currentSectionIndex + 1} totalSteps={totalSections} />
        
        {/* Section Content */}
        <div className="flex-1 pb-24 sm:px-0" aria-label="Contenuto sezione corrente">
          <SectionHeader 
            title={currentSection.title[selectedLanguage]}
            description={currentSection.description?.[selectedLanguage]}
            sectionNumber={currentSectionIndex + 1}
            sectionId={currentSection.sectionId}
          />
          
          {/* Questions */}
          <div role="group" aria-label="Domande della sezione">
            {currentSection.questions.map(renderQuestion)}
          </div>
        </div>

        {/* Fixed Bottom Navigation */}
        <nav 
          id="navigation"
          className="bottom-0 left-0 right-0  border-t border-gray-200 px-mobile-md py-mobile-md"
          aria-label="Navigazione questionario"
          ref={skipToNavRef}
          tabIndex={-1}
        >
          <div className="max-w-sm mx-auto">
            {/* Navigation Buttons */}
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
            
            {/* Report Problem */}
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
    </SimpleLayout>
  );
};

export default QuestionnairePage;