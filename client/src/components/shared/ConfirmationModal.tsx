import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './Filters'; // Riutilizziamo il tuo componente Button

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode; 
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Conferma',
  cancelText = 'Annulla',
  isDestructive = true, 
}) => {
  if (!isOpen) {
    return null;
  }

  return (
   
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Contenitore della modale */}
      <div 
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()} // Evita che il click sulla modale chiuda l'overlay
      >
        <div className="flex items-start">
          {/* Icona di Avviso */}
          {isDestructive && (
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
            </div>
          )}

          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
            {/* Titolo */}
            <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
              {title}
            </h3>
            {/* Messaggio */}
            <div className="mt-2">
              <p className="text-sm text-gray-500 whitespace-pre-wrap">
                {message}
              </p>
            </div>
          </div>
          
          {/* Pulsante di Chiusura */}
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Pulsanti di Azione */}
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <Button
            onClick={onConfirm}
            variant={isDestructive ? 'danger' : 'primary'}
            className="w-full sm:ml-3 sm:w-auto"
          >
            {confirmText}
          </Button>
          <Button
            onClick={onClose}
            variant="secondary"
            className="mt-3 w-full sm:mt-0 sm:w-auto"
          >
            {cancelText}
          </Button>
        </div>
      </div>
    </div>
  );
};