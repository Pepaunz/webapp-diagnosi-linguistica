// src/pages/QuestionnairePage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SimpleLayout from '../components/layout/SimpleLayout';
import { Button, LoadingSpinner } from '../components/ui';
import { 
  ProgressBar, 
  SectionHeader, 
  QuestionBlock, 
  MultipleChoiceQuestion, 
  TextQuestion,
  DateQuestion
} from '../components/questionnaire/QuestionnaireComponents';
import { AlertTriangle } from 'lucide-react';
import { bilingualismQuestionnaireData } from '../../mock-template';

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
  
  // State management
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedLanguage] = useState<Language>('en');
  
  // Usa i dati reali del questionario bilinguismo
  const currentSection = questionnaireData.sections[currentSectionIndex];
  const totalSections = questionnaireData.sections.length;
  const isLastSection = currentSectionIndex === totalSections - 1;
  const isFirstSection = currentSectionIndex === 0;

  // Handle answer change
  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Navigation handlers
  const handleNext = async () => {
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

  // API calls
  const saveProgress = async () => {
    setSaving(true);
    try {
      // TODO: chiamata API PUT /api/submissions/{submissionId}/save_progress
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log('Progress saved:', { submissionId, answers, currentStep: currentSectionIndex + 1 });
    } catch (error) {
      console.error('Error saving progress:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Prima salva progress finale
      await saveProgress();
      // Poi completa
      // TODO: chiamata API POST /api/submissions/{submissionId}/complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate(`/complete/${submissionId}`);
    } catch (error) {
      console.error('Error completing questionnaire:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReportProblem = () => {
    // TODO: implementare modal segnalazione
    alert('Funzionalità "Segnala problema" da implementare');
  };

  // Render question based on type
  const renderQuestion = (question: Question) => {
    const questionText = question.text[selectedLanguage];
    const questionValue = answers[question.questionId] || '';

    if (question.type === 'multiple-choice') {
      const options = question.options?.map((opt) => ({
        value: opt.value,
        label: opt.text[selectedLanguage]
      })) || [];

      return (
        <QuestionBlock key={question.questionId} question={questionText}>
          <MultipleChoiceQuestion
            options={options}
            value={questionValue}
            onChange={(value) => handleAnswerChange(question.questionId, value)}
            name={question.questionId}
          />
        </QuestionBlock>
      );
    }

    if (question.type === 'text') {
      return (
        <QuestionBlock key={question.questionId} question={questionText}>
          <TextQuestion
            value={questionValue}
            onChange={(value) => handleAnswerChange(question.questionId, value)}
            placeholder="Inserisci risposta"
          />
        </QuestionBlock>
      );
    }

    if (question.type === 'date') {
      return (
        <QuestionBlock key={question.questionId} question={questionText}>
          <DateQuestion
            value={questionValue}
            onChange={(value) => handleAnswerChange(question.questionId, value)}
          />
        </QuestionBlock>
      );
    }

    if (question.type === 'rating') {
      // Per le domande di tipo rating, converte il valore stringa in numero
      const numValue = questionValue ? parseInt(questionValue, 10) : 0;
      const maxValue = question.maxValue || 10;
      
      return (
        <QuestionBlock key={question.questionId} question={questionText}>
          <div className="flex flex-wrap gap-2 justify-center">
            {Array.from({ length: maxValue }, (_, i) => i + 1).map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleAnswerChange(question.questionId, rating.toString())}
                className={`
                  w-8 h-8 rounded border-2 min-h-touch-sm
                  flex items-center justify-center transition-all duration-200
                  ${rating <= numValue
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-white border-gray-300 text-gray-400 hover:border-gray-400'
                  }
                `}
              >
                <span className="text-sm font-medium">{rating}</span>
              </button>
            ))}
          </div>
        </QuestionBlock>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <SimpleLayout>
        <div className="text-center py-mobile-xl">
          <LoadingSpinner size="lg" text="Completamento in corso..." />
        </div>
      </SimpleLayout>
    );
  }

  return (
    <SimpleLayout>
      {/* Progress Bar */}
      <ProgressBar currentStep={currentSectionIndex + 1} totalSteps={totalSections} />
      
      {/* Section Content */}
      <div className="flex-1 pb-24"> {/* Bottom padding per navigation buttons */}
        <SectionHeader 
          title={currentSection.title[selectedLanguage]}
          description={currentSection.description?.[selectedLanguage]}
        />
        
        {/* Questions */}
        <div>
          {currentSection.questions.map(renderQuestion)}
        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-mobile-md py-mobile-md">
        <div className="max-w-sm mx-auto">
          {/* Navigation Buttons */}
          <div className="flex gap-mobile-sm mb-mobile-sm">
            {!isFirstSection && (
              <Button
                variant="secondary"
                size="lg"
                onClick={handlePrevious}
                disabled={saving}
                className="flex-1"
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
            >
              {isLastSection ? 'Completa' : 'Avanti'}
            </Button>
          </div>
          
          {/* Report Problem */}
          <div className="text-center">
            <button 
              type="button"
              onClick={handleReportProblem}
              className="inline-flex items-center text-family-text-body hover:text-family-text-primary transition-colors"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              <span className="text-mobile-sm underline">Segnala problema</span>
            </button>
          </div>
        </div>
      </div>
    </SimpleLayout>
  );
};

export default QuestionnairePage;