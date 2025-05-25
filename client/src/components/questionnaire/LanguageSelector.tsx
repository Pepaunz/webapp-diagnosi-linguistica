// src/components/questionnaire/LanguageSelector.tsx

import React from "react";
import { Language } from "@shared/types/common.types";

interface LanguageSelectorProps {
  selectedLanguage: Language;
  onLanguageChange: (language: Language) => void;
  availableLanguages?: Language[]; // Lingue già presenti nel questionario
  isEditMode?: boolean; // Se true, permette di aggiungere nuove lingue
}

const languages = [
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
];

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
  availableLanguages,
  isEditMode = false,
}) => {
  const isLanguageAvailable = (langCode: string): boolean => {
    if (!availableLanguages) return true;
    return availableLanguages.includes(langCode as Language);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        {isEditMode
          ? "Lingua di modifica questionario"
          : "Lingua di visualizzazione"}
      </label>
      <div className="flex gap-3">
        {languages.map((lang) => {
          const isAvailable = isLanguageAvailable(lang.code);
          return (
            <button
              key={lang.code}
              onClick={() => onLanguageChange(lang.code as Language)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition relative ${
                selectedLanguage === lang.code
                  ? "bg-gray-800 text-white"
                  : isAvailable
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  : "bg-gray-50 text-gray-400 hover:bg-gray-200"
              }`}
              disabled={!isEditMode && !isAvailable}
              title={
                !isAvailable && isEditMode
                  ? "Clicca per aggiungere questa lingua"
                  : ""
              }
            >
              <span className="text-lg">{lang.flag}</span>
              <span>{lang.name}</span>
              {!isAvailable && (
                <span
                  className={`absolute -top-1 -right-1 text-xs px-1 rounded ${
                    isEditMode
                      ? "bg-yellow-400 text-gray-800"
                      : "bg-gray-400 text-white"
                  }`}
                >
                  {isEditMode ? "Nuova" : "Non disponibile"}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {isEditMode &&
        availableLanguages &&
        availableLanguages.length < languages.length && (
          <p className="text-sm text-gray-500 mt-2">
            Clicca su una lingua non disponibile per aggiungerla al questionario
          </p>
        )}
    </div>
  );
};

export default LanguageSelector;
