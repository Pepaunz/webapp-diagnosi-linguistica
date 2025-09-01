import React from 'react';

// ===== PROGRESS BAR =====
interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => {
  const progress = (currentStep / totalSteps) * 100;
  
  return (
    <div className="px-mobile-md py-mobile-sm bg-white border-b border-gray-200">
      <div className="text-center mb-2">
        <span className="text-mobile-sm text-family-text-body font-medium">
          Passo {currentStep} di {totalSteps}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

// ===== SECTION HEADER =====
interface SectionHeaderProps {
  title: string;
  description?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, description }) => {
  return (
    <div className="px-mobile-md py-mobile-md">
      {/* Section Title - grigio scuro come nel Figma */}
      <div className="bg-gray-500 text-white px-mobile-sm py-mobile-xs rounded-mobile-sm mb-mobile-sm">
        <h2 className="text-mobile-md font-medium">{title}</h2>
      </div>
      
      {/* Section Description */}
      {description && (
        <div className="mb-mobile-md">
          <p className="text-mobile-md text-family-text-primary font-medium leading-relaxed">
            {description}
          </p>
          <p className="text-mobile-sm text-family-text-body mt-1">
            rispondi sinceramente perché puoi aiutarci molto
          </p>
        </div>
      )}
    </div>
  );
};

// ===== QUESTION BLOCK =====
interface QuestionBlockProps {
  question: string;
  children: React.ReactNode;
  className?: string;
}

export const QuestionBlock: React.FC<QuestionBlockProps> = ({ 
  question, 
  children, 
  className = '' 
}) => {
  return (
    <div className={`mx-mobile-md mb-mobile-md ${className}`}>
      {/* Question Container - grigio come nel Figma */}
      <div className="bg-gray-400 text-white px-mobile-sm py-mobile-xs rounded-t-mobile-sm">
        <h3 className="text-mobile-md font-medium leading-relaxed">{question}</h3>
      </div>
      
      {/* Answer Container - bianco */}
      <div className="bg-white px-mobile-md py-mobile-md rounded-b-mobile-sm border border-gray-200 border-t-0">
        {children}
      </div>
    </div>
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
}

export const MultipleChoiceQuestion: React.FC<MultipleChoiceProps> = ({
  options,
  value,
  onChange,
  name
}) => {
  return (
    <div className="space-y-mobile-sm">
      {options.map((option) => (
        <label
          key={option.value}
          className="flex items-center min-h-touch-sm cursor-pointer group"
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="sr-only"
          />
          
          {/* Custom Radio Button */}
          <div className={`
            w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center
            transition-all duration-200
            ${value === option.value 
              ? 'border-blue-500 bg-blue-500' 
              : 'border-gray-400 bg-white group-hover:border-gray-500'
            }
          `}>
            {value === option.value && (
              <div className="w-2 h-2 bg-white rounded-full" />
            )}
          </div>
          
          <span className="text-mobile-md text-family-text-primary flex-1 leading-relaxed">
            {option.label}
          </span>
        </label>
      ))}
    </div>
  );
};

// ===== TEXT QUESTION =====
interface TextQuestionProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
}

export const TextQuestion: React.FC<TextQuestionProps> = ({
  value = '',
  onChange,
  placeholder = 'Inserisci risposta',
  multiline = false
}) => {
  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="
          w-full px-mobile-sm py-mobile-sm
          border border-gray-300 rounded-mobile-sm
          min-h-touch-md resize-none
          text-mobile-md text-family-text-primary
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          placeholder:text-family-text-muted
          transition-all duration-200
        "
      />
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
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
  );
};

// ===== DATE QUESTION =====
interface DateQuestionProps {
  value?: string;
  onChange: (value: string) => void;
}

export const DateQuestion: React.FC<DateQuestionProps> = ({
  value = '',
  onChange
}) => {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="
        w-full px-mobile-sm py-mobile-sm
        border border-gray-300 rounded-mobile-sm
        min-h-touch-md
        text-mobile-md text-family-text-primary
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        transition-all duration-200
      "
    />
  );
};

// ===== NUMBER QUESTION =====
interface NumberQuestionProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  min?: number;
  max?: number;
}

export const NumberQuestion: React.FC<NumberQuestionProps> = ({
  value = '',
  onChange,
  placeholder = 'Inserisci numero',
  min,
  max
}) => {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      min={min}
      max={max}
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
  );
};

// ===== STAR RATING (per domande tipo scala) =====
interface StarRatingProps {
  value?: number;
  onChange: (value: number) => void;
  maxStars?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({
  value = 0,
  onChange,
  maxStars = 10
}) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {Array.from({ length: maxStars }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`
            w-8 h-8 rounded border-2 min-h-touch-sm
            flex items-center justify-center transition-all duration-200
            ${star <= value
              ? 'bg-blue-500 border-blue-500 text-white'
              : 'bg-white border-gray-300 text-gray-400 hover:border-gray-400'
            }
          `}
        >
          <span className="text-sm font-medium">{star}</span>
        </button>
      ))}
    </div>
  );
};