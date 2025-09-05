// src/components/feedback/FeedbackForm.tsx - Form per segnalazioni/feedback
import React, { useState, useRef, useEffect } from 'react';
import { Button, LoadingSpinner } from '../ui';
import { X, Send, AlertTriangle } from 'lucide-react';
import { useScreenReaderAnnouncements } from '../accessibility/ScreenReaderAnnouncements';
import { feedbackApi, ApiError, getErrorMessage, isNetworkError, getNetworkErrorMessage } from '../../services/apiService';
import { useError } from "../../context/ErrorContext";

interface FeedbackFormProps {
  isOpen: boolean;
  onClose: () => void;
  submissionId?: string;
  questionId?: string;
  templateId?: string;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  isOpen,
  onClose,
  submissionId,
  questionId,
  templateId
}) => {
  const [feedbackText, setFeedbackText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const formRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { announce } = useScreenReaderAnnouncements();
    const { showError, showSuccess, clearAllErrors } = useError();

  // Focus management
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      setFeedbackText('');
      setError('');
      setSuccess(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAllErrors(); // Clear previous errors
    
    if (!feedbackText.trim()) {
      const errorMsg = 'Inserisci una descrizione del problema';
      setError(errorMsg);
      showError(errorMsg, 'validation');
      announce(errorMsg, 'assertive');
      textareaRef.current?.focus();
      return;
    }

    setLoading(true);
    setError('');
    announce('Invio segnalazione in corso...', 'polite');

    try {
      await feedbackApi.submitFeedback({
        feedback_text: feedbackText.trim(),
        submission_id: submissionId || undefined,
        question_identifier: questionId || undefined,
        reporter_metadata: {
          user_agent: navigator.userAgent,
        }
      });

      setSuccess(true);
      showSuccess('Segnalazione inviata con successo!');
      announce('Segnalazione inviata con successo. Grazie per il feedback!', 'polite');
      
      // Auto-close after success
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err) {
      console.error('Feedback submission error:', err);
      
      // Usa il sistema centralizzato di gestione errori
      showError(err, 'server');
      
      // Mantieni anche l'errore locale per l'UI del form
      let errorMsg: string;
      if (isNetworkError(err)) {
        errorMsg = getNetworkErrorMessage();
      } else if (err instanceof ApiError) {
        switch (err.status) {
          case 400:
            errorMsg = 'Dati non validi. Controlla la descrizione inserita.';
            break;
          case 422:
            errorMsg = 'Il testo della segnalazione non è valido.';
            break;
          case 500:
            errorMsg = 'Errore del server. Riprova più tardi.';
            break;
          default:
            errorMsg = getErrorMessage(err);
        }
      } else {
        errorMsg = 'Errore durante l\'invio della segnalazione. Riprova.';
      }
      
      setError(errorMsg);
      announce(errorMsg, 'assertive');
      textareaRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return; // Prevent closing while sending
    onClose();
  };

  // Keyboard handling for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, loading]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center"
        onClick={handleClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div
        ref={formRef}
        role="dialog"
        aria-labelledby="feedback-title"
        aria-describedby="feedback-description"
        aria-modal="true"
        className="fixed inset-x-0 bottom-0 sm:inset-auto sm:relative bg-white rounded-t-xl sm:rounded-xl shadow-xl z-50 max-w-md mx-auto sm:max-w-lg"
      >
        <div className="p-mobile-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-mobile-md">
            <h2 
              id="feedback-title"
              className="text-mobile-lg font-semibold text-family-text-primary"
            >
              Segnala un problema
            </h2>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="text-family-text-body hover:text-family-text-primary focus:outline-none focus:ring-2 focus:ring-family-input-focus rounded"
              aria-label="Chiudi modulo"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Description */}
          <p 
            id="feedback-description"
            className="text-mobile-sm text-family-text-body mb-mobile-md"
          >
            Descrivi il problema che hai riscontrato. Il tuo feedback ci aiuterà a migliorare il questionario.
          </p>

          {success ? (
            /* Success State */
            <div className="text-center py-mobile-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-mobile-md">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-mobile-md font-medium text-family-text-primary mb-2">
                Segnalazione inviata!
              </h3>
              <p className="text-mobile-sm text-family-text-body">
                Grazie per il tuo feedback. La segnalazione è stata inviata al nostro team.
              </p>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit}>
              {/* Error Message */}
              {error && (
                <div 
                  role="alert"
                  className="mb-mobile-md p-3 bg-red-50 border-l-4 border-red-400 rounded-mobile-sm"
                >
                  <div className="flex items-start">
                    <AlertTriangle className="h-4 w-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-mobile-sm text-red-800">{error}</p>
                  </div>
                </div>
              )}

              {/* Textarea */}
              <div className="mb-mobile-md">
                <label htmlFor="feedback-text" className="sr-only">
                  Descrizione del problema
                </label>
                <textarea
                  ref={textareaRef}
                  id="feedback-text"
                  name="feedback"
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Descrivi il problema che hai riscontrato..."
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-mobile-sm resize-none focus:outline-none focus:ring-2 focus:ring-family-input-focus focus:border-family-input-focus disabled:bg-gray-50 disabled:text-gray-500"
                  maxLength={1000}
                  required
                  aria-required="true"
                />
                <div className="text-right mt-1">
                  <span className="text-mobile-xs text-family-text-body">
                    {feedbackText.length}/1000
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-mobile-sm sm:justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={handleClose}
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  Annulla
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={loading || !feedbackText.trim()}
                  className="w-full sm:w-auto"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Invio...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Send className="h-4 w-4 mr-2" />
                      <span>Invia segnalazione</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default FeedbackForm;