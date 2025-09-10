
import { Language, LocalizedText } from "../schemas/";
const DEFAULT_LANGUAGE: Language = 'it';



export const getLocalizedText = (
  textObject: LocalizedText | undefined,
  selectedLanguage: Language
): string => {
  // Se l'oggetto stesso è nullo o non definito, restituisci una stringa vuota
  if (!textObject) {
    return '';
  }

  // 1. Prova a ottenere il testo nella lingua selezionata
  const selectedText = textObject[selectedLanguage];
  if (selectedText && selectedText.trim() !== '') {
    return selectedText;
  }

  // 2. Se non trovato, prova con la lingua di default (fallback)
  const defaultText = textObject[DEFAULT_LANGUAGE];
  if (defaultText && defaultText.trim() !== '') {
    return defaultText;
  }
  
  // 3. Se anche il default manca, cerca la prima traduzione disponibile
  for (const lang in textObject) {
    const anyText = textObject[lang as Language];
    if (anyText && anyText.trim() !== '') {
      return anyText;
    }
  }

  // 4. Se l'oggetto è completamente vuoto, restituisci un avviso per il debug
  return '[Testo mancante]';
};