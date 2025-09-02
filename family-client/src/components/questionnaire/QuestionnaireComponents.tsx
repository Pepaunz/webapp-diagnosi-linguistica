import React from 'react';
import TTSQuestionControls from '../accessibility/TTSQuestionControls';
import { TTSStatus } from '../../hooks/useTextToSpeech';
// ===== SECTION HEADER =====
interface SectionHeaderProps {
  title: string;
  description?: string;
  sectionNumber: number;
  sectionId?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  description, 
  sectionNumber,
  sectionId = `section-${sectionNumber}`
}) => {
  const titleId = `section-title-${sectionId}`;
  
  return (
    <section 
      aria-labelledby={titleId}
      className="py-mobile-md"
    >
      {/* Section Title con numero - design più moderno */}
      <header className="bg-family-header text-white px-mobile-sm py-mobile-xs rounded-mobile-sm mb-mobile-sm shadow-sm">
        <div className="flex items-center gap-3">
          {/* Numero sezione con design più accattivante */}
          <div className="bg-blue-600 text-white px-2.5 py-1.5 rounded-md text-mobile-sm font-bold min-w-[32px] text-center shadow-sm">
            <span aria-hidden="true">{sectionNumber}</span>
          </div>
          <h2 
            id={titleId}
            className="text-mobile-md font-medium flex-1"
            tabIndex={-1} // Consente focus programmatico
          >
            <span className="sr-only">Sezione {sectionNumber}: </span>
            {title}
          </h2>
        </div>
      </header>
      
      {/* Section Description - versione moderna */}
      {description && (
        <div className="mb-mobile-md">
          {/* Card per la descrizione */}
          <div 
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mb-3"
            role="note"
            aria-labelledby={titleId}
          >
            <p className="text-mobile-md text-family-text-primary font-medium leading-relaxed text-gray-800 mb-3">
              {description}
            </p>
            
            {/* Divider sottile */}
            <hr className="border-gray-200 mb-3" aria-hidden="true" />
            
            {/* Testo di incoraggiamento con icona */}
            <div className="flex items-start gap-3">
              <p className="text-mobile-sm text-family-text-body text-gray-600 leading-relaxed">
                Rispondi sinceramente perché puoi aiutarci molto
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

// ===== QUESTION BLOCK =====
interface QuestionBlockProps {
  question: string;
  children: React.ReactNode;
  className?: string;
  questionId: string;
  required?: boolean;
}

interface QuestionBlockProps {
  question: string;
  children: React.ReactNode;
  className?: string;
  questionId: string;
  required?: boolean;
  
  // ➕ AGGIUNGI: Props TTS opzionali
  ttsEnabled?: boolean;
  questionText?: string;
  onQuestionSpeak?: (text: string, questionId: string) => void;
  currentSpeakingId?: string | null;
  ttsStatus?: TTSStatus;
  questionOptions?: string[]; // Per multiple choice
}

// ➕ MODIFICA: QuestionBlock component
export const QuestionBlock: React.FC<QuestionBlockProps> = ({ 
  question, 
  children, 
  className = '',
  questionId,
  required = false,
  
  // ➕ AGGIUNGI: TTS props con default
  ttsEnabled = false,
  questionText,
  onQuestionSpeak,
  currentSpeakingId = null,
  ttsStatus = 'idle',
  questionOptions = []
}) => {
  const legendId = `question-${questionId}`;
  
  // ➕ AGGIUNGI: Gestione click TTS
  const handleTTSClick = () => {
    if (onQuestionSpeak && questionText) {
      onQuestionSpeak(questionText, questionId);
    }
  };
  
  return (
    <fieldset className={`mb-mobile-md ${className}`}>
      {/* Question Container con TTS integration */}
      <legend 
        id={legendId}
        className="bg-gradient-to-r from-family-header to-family-header/90 text-white px-mobile-sm py-mobile-xs rounded-t-mobile-sm w-full"
      >
        <div className="flex items-center justify-between">
          {/* Question Text */}
          <span className="text-mobile-md font-medium leading-relaxed flex-1">
            {question}
            {required && (
              <span className="text-red-300 ml-1" aria-label="obbligatorio">
                *
              </span>
            )}
          </span>
          
          {/* ➕ AGGIUNGI: TTS Controls per domanda */}
          {ttsEnabled && onQuestionSpeak && (
            <div className="ml-3 flex-shrink-0">
              <TTSQuestionControls
                questionId={questionId}
                questionText={questionText || question}
                options={questionOptions}
                isEnabled={ttsEnabled}
                onSpeak={onQuestionSpeak}
                currentSpeakingId={currentSpeakingId}
                status={ttsStatus}
              />
            </div>
          )}
        </div>
      </legend>
      
      {/* Answer Container (come prima) */}
      <div 
        className="bg-white px-mobile-md py-mobile-md rounded-b-mobile-sm border border-gray-200 border-t-0"
        role="group"
        aria-labelledby={legendId}
      >
        {children}
      </div>
    </fieldset>
  );
};

// ===== MULTIPLE CHOICE QUESTION =====
interface MultipleChoiceOption {
  value: string;
  label: string;
}

interface MultipleChoiceProps {
  options: MultipleChoiceOption[];
  value?: string;
  onChange: (value: string) => void;
  name: string;
  required?: boolean;
  helpText?: string;
}

export const MultipleChoiceQuestion: React.FC<MultipleChoiceProps> = ({
  options,
  value,
  onChange,
  name,
  required = false,
  helpText
}) => {
  const helpId = `${name}-help`;
  
  return (
    <div 
      className="space-y-mobile-sm"
      role="radiogroup"
      aria-required={required}
      aria-describedby={helpText ? helpId : undefined}
    >
      {options.map((option, index) => (
        <label
          key={option.value}
          className={`
            flex items-center min-h-touch-sm cursor-pointer group
            px-3 py-2 rounded-lg border-2 transition-all duration-200
            ${value === option.value 
              ? 'border-family-input-focus/50 bg-family-input-focus/15 shadow-sm' 
              : 'border-transparent bg-white hover:bg-gray-50 hover:border-gray-200'
            }
          `}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="sr-only"
            required={required}
            aria-describedby={helpText ? helpId : undefined}
          />
          
          {/* Custom Radio Button */}
          <div 
            className={`
              w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center
              transition-all duration-200 flex-shrink-0
              ${value === option.value 
                ? 'border-family-input-focus bg-family-input-focus/80' 
                : 'border-gray-400 bg-white group-hover:border-gray-500'
              }
            `}
            role="radio"
            aria-checked={value === option.value}
            aria-hidden="true"
          >
            {value === option.value && (
              <div className="w-2 h-2 bg-white rounded-full" />
            )}
          </div>
          
          <span className={`
            text-mobile-md flex-1 leading-relaxed transition-colors duration-200
            ${value === option.value 
              ? 'text-blue-800 font-medium' 
              : 'text-family-text-primary group-hover:text-gray-700'
            }
          `}>
            {option.label}
          </span>
        </label>
      ))}
      
      {/* Help text */}
      {helpText && (
        <div id={helpId} className="text-mobile-sm text-family-text-body mt-2">
          {helpText}
        </div>
      )}
    </div>
  );
};

// ===== TEXT QUESTION =====
interface TextQuestionProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  required?: boolean;
  questionId: string;
  label?: string;
  helpText?: string;
}

export const TextQuestion: React.FC<TextQuestionProps> = ({
  value = '',
  onChange,
  placeholder = 'Inserisci risposta',
  multiline = false,
  required = false,
  questionId,
  label,
  helpText
}) => {
  const inputId = `input-${questionId}`;
  const helpId = `${questionId}-help`;
  const labelId = `${questionId}-label`;

  const commonProps = {
    id: inputId,
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
    placeholder,
    required,
    'aria-labelledby': label ? labelId : undefined,
    'aria-describedby': helpText ? helpId : undefined,
    className: `
      w-full px-mobile-sm py-mobile-sm
      border border-gray-300 rounded-mobile-sm
      min-h-touch-md
      text-mobile-md text-family-text-primary
      focus:outline-none focus:ring-2 focus:ring-family-input-focus/80 focus:border-family-input-focus/90
      placeholder:text-family-text-muted
      transition-all duration-200
    `
  };

  return (
    <div>
      {label && (
        <label id={labelId} htmlFor={inputId} className="sr-only">
          {label}
        </label>
      )}
      
      {multiline ? (
        <textarea
          {...commonProps}
          rows={3}
          className={`${commonProps.className} resize-none`}
        />
      ) : (
        <input
          type="text"
          {...commonProps}
        />
      )}
      
      {helpText && (
        <div id={helpId} className="text-mobile-sm text-family-text-body mt-2">
          {helpText}
        </div>
      )}
    </div>
  );
};

// ===== DATE QUESTION =====
interface DateQuestionProps {
  value?: string;
  onChange: (value: string) => void;
  required?: boolean;
  questionId: string;
  label?: string;
  helpText?: string;
}

export const DateQuestion: React.FC<DateQuestionProps> = ({
  value = '',
  onChange,
  required = false,
  questionId,
  label,
  helpText
}) => {
  const inputId = `date-${questionId}`;
  const helpId = `${questionId}-help`;
  const labelId = `${questionId}-label`;

  return (
    <div>
      {label && (
        <label id={labelId} htmlFor={inputId} className="sr-only">
          {label}
        </label>
      )}
      
      <input
        type="date"
        id={inputId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={helpText ? helpId : undefined}
        className="
          w-full px-mobile-sm py-mobile-sm
          border border-gray-300 rounded-mobile-sm
          min-h-touch-md
          text-mobile-md text-family-text-primary
          focus:outline-none focus:ring-2 focus:ring-family-input-focus/70 focus:border-family-input-focus/90
          transition-all duration-200
        "
      />
      
      {helpText && (
        <div id={helpId} className="text-mobile-sm text-family-text-body mt-2">
          {helpText}
        </div>
      )}
    </div>
  );
};

// ===== NUMBER QUESTION =====
interface NumberQuestionProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  required?: boolean;
  questionId: string;
  label?: string;
  helpText?: string;
}

export const NumberQuestion: React.FC<NumberQuestionProps> = ({
  value = '',
  onChange,
  placeholder = 'Inserisci numero',
  min,
  max,
  required = false,
  questionId,
  label,
  helpText
}) => {
  const inputId = `number-${questionId}`;
  const helpId = `${questionId}-help`;
  const labelId = `${questionId}-label`;

  return (
    <div>
      {label && (
        <label id={labelId} htmlFor={inputId} className="sr-only">
          {label}
        </label>
      )}
      
      <input
        type="number"
        id={inputId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        required={required}
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={helpText ? helpId : undefined}
        className="
          w-full px-mobile-sm py-mobile-sm
          border border-gray-300 rounded-mobile-sm
          min-h-touch-md
          text-mobile-md text-family-text-primary
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          placeholder:text-family-text-muted
          transition-all duration-200
        "
      />
      
      {helpText && (
        <div id={helpId} className="text-mobile-sm text-family-text-body mt-2">
          {helpText}
        </div>
      )}
    </div>
  );
};

// ===== STAR RATING (per domande tipo scala) =====
interface StarRatingProps {
  value?: number;
  onChange: (value: number) => void;
  maxStars?: number;
  required?: boolean;
  questionId: string;
  label?: string;
  helpText?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  value = 0,
  onChange,
  maxStars = 10,
  required = false,
  questionId,
  label,
  helpText
}) => {
  const ratingId = `rating-${questionId}`;
  const helpId = `${questionId}-help`;
  const labelId = `${questionId}-label`;

  return (
    <div>
      {label && (
        <div id={labelId} className="sr-only">
          {label}
        </div>
      )}
      
      <div className="px-3 py-2 rounded-lg border-2 border-transparent bg-white">
        <div 
          role="radiogroup"
          aria-labelledby={label ? labelId : undefined}
          aria-describedby={helpText ? helpId : undefined}
          aria-required={required}
          className="flex flex-wrap gap-2 justify-center"
        >
          {Array.from({ length: maxStars }, (_, i) => i + 1).map((star) => (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={star === value}
              aria-setsize={maxStars}
              aria-posinset={star}
              aria-label={`${star} su ${maxStars}`}
              onClick={() => onChange(star)}
              className={`
                w-10 h-10 rounded-lg border-2 min-h-touch-sm
                flex items-center justify-center transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-family-input-focus/80
                ${star <= value
                  ? 'border-family-input-focus bg-family-input-focus text-white shadow-sm font-semibold'
                  : 'bg-white border-gray-400 text-gray-600 hover:border-gray-500 hover:bg-gray-50'
                }
              `}
            >
              <span className="text-sm font-medium" aria-hidden="true">
                {star}
              </span>
            </button>
          ))}
        </div>
      </div>
      
      {helpText && (
        <div id={helpId} className="text-mobile-sm text-family-text-body mt-2">
          {helpText}
        </div>
      )}
      
      {/* Screen reader announcement for current value */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {value > 0 ? `Valore selezionato: ${value} su ${maxStars}` : 'Nessun valore selezionato'}
      </div>
    </div>
  );
};