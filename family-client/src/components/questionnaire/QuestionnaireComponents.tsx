import React from 'react';



// ===== SECTION HEADER =====
interface SectionHeaderProps {
  title: string;
  description?: string;
  sectionNumber: number;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  description, 
  sectionNumber 
}) => {
  return (
    <div className="px-mobile-md py-mobile-md">
      {/* Section Title con numero - design più moderno */}
      <div className="bg-family-header text-white px-mobile-sm py-mobile-xs rounded-mobile-sm mb-mobile-sm shadow-sm">
        <div className="flex items-center gap-3">
          {/* Numero sezione con design più accattivante */}
          <div className="bg-blue-600 text-white px-2.5 py-1.5 rounded-md text-mobile-sm font-bold min-w-[32px] text-center shadow-sm">
            {sectionNumber}
          </div>
          <h2 className="text-mobile-md font-medium flex-1">{title}</h2>
        </div>
      </div>
      
      {/* Section Description - versione moderna */}
      {description && (
        <div className=" mb-mobile-md"> {/* ml-11 per compensare il numero più largo */}
          {/* Card per la descrizione */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mb-3">
            <p className="text-mobile-md text-family-text-primary font-medium leading-relaxed text-gray-800 mb-3">
              {description}
            </p>
            
            {/* Divider sottile */}
            <hr className="border-gray-200 mb-3" />
            
            {/* Testo di incoraggiamento con icona */}
            <div className="flex items-start gap-3">
              <p className="text-mobile-sm text-family-text-body text-gray-600 leading-relaxed">
                Rispondi sinceramente perché puoi aiutarci molto
              </p>
            </div>
          </div>
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
      <div className="bg-gradient-to-r from-family-header to-family-header/90 text-white px-mobile-sm py-mobile-xs rounded-t-mobile-sm">
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
          />
          
          {/* Custom Radio Button */}
          <div className={`
            w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center
            transition-all duration-200 flex-shrink-0
            ${value === option.value 
              ? 'border-family-input-focus bg-family-input-focus/80' 
              : 'border-gray-400 bg-white group-hover:border-gray-500'
            }
          `}>
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
          focus:outline-none focus:ring-2 focus:ring-family-input-focus/80 focus:border-family-input-focus/90
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
        focus:outline-none focus:ring-2 focus:ring-family-input-focus/70 focus:border-family-input-focus/90
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
        focus:outline-none focus:ring-2 focus:ring-family-input-focus/70 focus:border-family-input-focus/90
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
    <div className="px-3 py-2 rounded-lg border-2 border-transparent bg-white">
      <div className="flex flex-wrap gap-2 justify-center">
        {Array.from({ length: maxStars }, (_, i) => i + 1).map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`
              w-10 h-10 rounded-lg border-2 min-h-touch-sm
              flex items-center justify-center transition-all duration-200
              ${star <= value
                ? 'border-family-input-focus bg-family-input-focus text-white shadow-sm font-semibold'
                : 'bg-white border-gray-400 text-gray-600 hover:border-gray-500 hover:bg-gray-50'
              }
            `}
          >
            <span className="text-sm font-medium">{star}</span>
          </button>
        ))}
      </div>
    
    </div>
  );
};
