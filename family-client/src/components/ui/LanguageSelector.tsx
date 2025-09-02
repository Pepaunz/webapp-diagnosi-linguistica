// src/components/ui/LanguageSelector.tsx - VERSIONE CUSTOM
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface LanguageOption {
  value: string;
  label: string;
  flag: string;
}

interface LanguageSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
  id: string;
}

const languages: LanguageOption[] = [
  { value: 'it', label: 'Italiano', flag: '🇮🇹' },
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'es', label: 'Español', flag: '🇪🇸' },
  { value: 'ar', label: 'العربية', flag: '🇸🇦' }
];

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  value,
  onChange,
  label = 'Scegli lingua',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedLanguage = languages.find(lang => lang.value === value) || languages[0];

  // Chiude dropdown se clicchi fuori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Chiude dropdown se premi Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const handleSelect = (languageValue: string) => {
    onChange(languageValue);
    setIsOpen(false);
  };

  return (
    <div className={`w-full ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-mobile-md font-medium text-family-text-label mb-mobile-sm">
          {label}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="
            w-full px-mobile-md py-mobile-sm
            bg-family-select-bg 
            border-2 border-family-select-border
            rounded-mobile-md
            min-h-touch-md
            text-mobile-md text-family-text-primary
            focus:outline-none focus:ring-2 focus:ring-family-input-focus/80 focus:border-family-input-focus/90
            transition-all duration-200
            flex items-center justify-between
            hover:border-gray-400
          "
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <div className="flex items-center">
            <span className="text-lg mr-3">{selectedLanguage.flag}</span>
            <span>{selectedLanguage.label}</span>
          </div>
          <ChevronDown 
            className={`w-5 h-5 text-family-text-muted transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </button>

        {/* Dropdown Menu - Posizionato intelligentemente per mobile */}
        {isOpen && (
          <div className="
            absolute top-full left-0 right-0 mt-1 z-50
            bg-white border-2 border-family-select-border rounded-mobile-md shadow-mobile-lg
            max-h-60 overflow-y-auto
            /* Mobile positioning fix */
            md:left-0 md:right-auto md:min-w-full
          ">
            {languages.map((lang) => (
              <button
                key={lang.value}
                type="button"
                onClick={() => handleSelect(lang.value)}
                className="
                  w-full px-mobile-md py-mobile-sm text-left
                  flex items-center justify-between
                  hover:bg-gray-50 focus:bg-gray-50 focus:outline-none
                  transition-colors duration-150
                  min-h-touch-sm
                  first:rounded-t-mobile-md last:rounded-b-mobile-md
                "
                role="option"
                aria-selected={lang.value === value}
              >
                <div className="flex items-center">
                  <span className="text-lg mr-3">{lang.flag}</span>
                  <span className="text-mobile-md text-family-text-primary">{lang.label}</span>
                </div>
                {lang.value === value && (
                  <Check className="w-4 h-4 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LanguageSelector;