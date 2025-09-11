import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SimpleLayout from "../components/layout/SimpleLayout";
import { Button, LoadingSpinner } from "../components/ui";
import LanguageSelector from "../components/ui/LanguageSelector";
import { Info } from "lucide-react";
import {
  ScreenReaderAnnouncements,
  useScreenReaderAnnouncements,
} from "../components/accessibility/ScreenReaderAnnouncements";
import { z } from "zod";
import { fiscalCodeSchema } from "../../../shared/src/schemas/common.schemas";
import { ApiError, submissionApi } from "../services/apiService";
import { useApiError } from "../hooks/useApiError";
import { Language } from "@bilinguismo/shared";

const CFLoginPage: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();

  // Refs for focus management
  const mainContentRef = useRef<HTMLDivElement>(null);
  const fiscalCodeInputRef = useRef<HTMLInputElement>(null);

  // Hooks
  const { announce } = useScreenReaderAnnouncements();
  const { handleApiError, handleApiSuccess, clearErrors } = useApiError();

  // State
  const [fiscalCode, setFiscalCode] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("it");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Focus management on mount
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.focus();
    }
  }, []);

  // Validazione base Codice Fiscale
  const validateFiscalCode = (
    cf: string
  ): { isValid: boolean; error?: string } => {
    try {
      fiscalCodeSchema.parse(cf.toUpperCase());
      return { isValid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          error: error.issues[0]?.message || "Codice fiscale non valido",
        };
      }
      return { isValid: false, error: "Errore di validazione" };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitted(true);
    clearErrors();

    // Validazione campo vuoto
    if (!fiscalCode.trim()) {
      const errorMsg = "Il codice fiscale è obbligatorio";
      setError(errorMsg);
      announce(errorMsg, "assertive");
      if (fiscalCodeInputRef.current) {
        fiscalCodeInputRef.current.focus();
      }
      return;
    }

    if (!templateId) {
      const errorMsg = "Template ID mancante. Ricarica la pagina.";
      setError(errorMsg);
      handleApiError(errorMsg, "validation");
      return;
    }

    // Validazione formato
    const validation = validateFiscalCode(fiscalCode);
    if (!validation.isValid) {
      const errorMsg =
        validation.error ||
        "Codice fiscale non valido. Controlla il formato e riprova.";
      setError(errorMsg);
      announce(errorMsg, "assertive");
      if (fiscalCodeInputRef.current) {
        fiscalCodeInputRef.current.focus();
      }
      return;
    }

    setLoading(true);
    announce("Verifica codice fiscale in corso...", "polite");

    try {
      const result = await submissionApi.startOrResume({
        fiscal_code: fiscalCode.toUpperCase(),
        questionnaire_template_id: templateId,
        language_used: selectedLanguage as Language,
      });

      handleApiSuccess("Accesso effettuato con successo");
      announce("Accesso effettuato con successo", "polite");

      navigate(
        `/questionnaire/${templateId}/${fiscalCode.toUpperCase()}/${
          result.submission_id
        }`,
        {
          state: {
            language: selectedLanguage,
            questionnaire: result.questionnaire_template,
            answers: result.answers,
            current_step_identifier: result.current_step_identifier,
          },
        }
      );
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        const errorMessage = err.message;
        setError(errorMessage);
        announce(errorMessage, "assertive");

        //Logica per auto-correggere la lingua nell'UI
        const details = err.response?.details;
        if (
          Array.isArray(details) &&
          details[0]?.code === "language_mismatch"
        ) {
          const savedLanguage = details[0].savedLanguage;
          setSelectedLanguage(savedLanguage);
          announce(
            `La lingua è stata impostata su ${savedLanguage.toUpperCase()} per continuare.`,
            "polite"
          );
        } else if (
          Array.isArray(details) &&
          details[0]?.code === "already_completed"
        ) {
          // **NUOVA GESTIONE PER QUESTIONARIO GIÀ COMPLETATO**
          const errorMessage = err.message;
          setError(errorMessage);
          announce(errorMessage, "assertive");
        } else {
          setError(err.message);
        }
      } else {
        handleApiError(err, "l'accesso");

        // Mantieni anche l'errore locale per l'UI inline
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Errore durante l'accesso. Riprova più tardi.");
        }

        announce("Errore durante l'accesso", "assertive");
      }
      if (fiscalCodeInputRef.current) {
        fiscalCodeInputRef.current.focus();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFiscalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setFiscalCode(value);

    // Rimuovi errore se l'utente sta digitando
    if (error && value.trim()) {
      setError("");
    }
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    document.documentElement.lang = language;
    announce(`Lingua cambiata in ${language}`, "polite");
  };

  if (loading) {
    return (
      <SimpleLayout>
        <div
          className="max-w-sm mx-auto text-center py-mobile-xl"
          role="status"
          aria-live="polite"
          aria-label="Accesso in corso"
        >
          <LoadingSpinner size="lg" text="Accesso in corso..." />
        </div>
      </SimpleLayout>
    );
  }

  return (
    <SimpleLayout>
      <ScreenReaderAnnouncements />

      <main
        role="main"
        className="max-w-sm mx-auto px-mobile-md focus:outline-none"
        ref={mainContentRef}
        tabIndex={-1}
        aria-label="Pagina di accesso al questionario"
      >
        {/* Header Section */}
        <header className="text-center mb-mobile-xl">
          <h1
            className="text-mobile-2xl font-bold text-family-text-primary mb-mobile-md"
            id="main-heading"
          >
            Benvenuto/a
          </h1>
          <p
            className="text-mobile-md text-family-text-body leading-relaxed px-2"
            role="doc-subtitle"
            aria-describedby="main-heading"
          >
            Per iniziare o riprendere il questionario inserisci il codice
            fiscale del bambino/a
          </p>
        </header>

        {/* Main Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-mobile-lg"
          noValidate
          aria-describedby={
            error ? "form-error fiscal-code-help" : "fiscal-code-help"
          }
        >
          {/* Fiscal Code Input */}
          <div>
            <label
              htmlFor="fiscal-code"
              className="block text-mobile-md font-medium text-family-text-primary mb-2"
            >
              Codice Fiscale <span className="text-red-500">*</span>
            </label>
            <input
              ref={fiscalCodeInputRef}
              id="fiscal-code"
              name="fiscalCode"
              type="text"
              value={fiscalCode}
              onChange={handleFiscalCodeChange}
              placeholder="RSSMRA85M01H501Z"
              maxLength={16}
              required
              aria-required="true"
              aria-describedby={
                error ? "form-error fiscal-code-help" : "fiscal-code-help"
              }
              aria-invalid={error ? "true" : "false"}
              className={`
                text-center tracking-wider font-mono text-mobile-md
                w-full px-mobile-sm py-mobile-sm border-2 rounded-mobile-sm
                min-h-touch-md transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-family-input-focus/80
                ${
                  error
                    ? "border-red-500 bg-red-50 focus:border-red-500"
                    : "border-gray-300 focus:border-family-input-focus"
                }
              `}
            />

            <div
              id="fiscal-code-help"
              className="mt-2 text-mobile-sm text-family-text-body"
            >
              Formato: 16 caratteri (lettere e numeri)
            </div>
          </div>

          {/* Language Selector */}
          <div>
            <LanguageSelector
              value={selectedLanguage}
              onChange={handleLanguageChange}
              id="language-selector"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div
              id="form-error"
              role="alert"
              aria-live="assertive"
              className="p-4 bg-red-50 border-l-4 border-red-400 rounded-mobile-sm"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-mobile-sm text-red-800 font-medium">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-mobile-md">
            <Button
              type="submit"
              size="lg"
              variant="primary"
              className="w-full"
              disabled={loading}
              aria-describedby={error ? "form-error" : undefined}
            >
              Avanti
            </Button>
          </div>
        </form>

        {/* Privacy Link */}
        <footer className="mt-mobile-xl text-center">
          <button
            type="button"
            className="inline-flex items-center text-family-text-body hover:text-family-text-primary transition-colors group focus:outline-none focus:ring-2 focus:ring-family-input-focus/80 focus:rounded"
            aria-label="Visualizza informazioni sulla privacy"
            onClick={() => {
              announce("Apertura informazioni privacy", "polite");
              alert("Modal privacy da implementare");
            }}
          >
            <Info className="w-5 h-5 mr-2" aria-hidden="true" />
            <span className="text-mobile-sm underline">Info sulla privacy</span>
          </button>
        </footer>
      </main>
    </SimpleLayout>
  );
};

export default CFLoginPage;
