import { Edit, Share2, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Template } from "@bilinguismo/shared";
import qrCodeImage from "../../assets/Rickrolling_QR_code.png"
import { useError } from "../../context";

interface TemplateCardProps {
  template: Template;
  onDelete: (templateId: string, templateName: string) => void;
  isDeleting?: boolean;
}

// 2. SOSTITUISCI la funzione TemplateCard con questa:
export function TemplateCard({ template, onDelete, isDeleting = false }: TemplateCardProps) {
  const [showQrModal, setShowQrModal] = useState(false);
  const { showError, showSuccess } = useError(); 

  // Formatta data per display
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('it-IT');
  };

  // URL per questionario famiglia
  const shareUrl = `https://miolink.com/questionario/${template.template_id}`;

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Evita navigazione se è dentro un Link
    onDelete(template.template_id, template.name);
  };

  return (
    <div className="border rounded-lg bg-white p-4 shadow hover:shadow-md transition flex flex-col">
      {/* Header con stato */}
      <div className="flex items-center justify-between mb-2">
        {!template.is_active && (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
            Disattivato
          </span>
        )}
        <div className="text-xs text-gray-400">
          {template.available_languages.join(", ").toUpperCase()}
        </div>
      </div>

      {/* Contenuto */}
      <h3 className="font-semibold text-lg mb-1">{template.name}</h3>
      <p className="text-sm text-gray-600 mb-2 flex-grow">
        {template.description || "Nessuna descrizione"}
      </p>
      <p className="text-sm text-gray-500 mb-4">
        Modificato: {formatDate(template.updated_at)}
      </p>

      {/* Azioni */}
      <div className="flex justify-between">
        <div className="flex gap-2">
          <Link to={`/templates/editor/${template.template_id}`}>
            <button 
              className="text-gray-600 hover:text-gray-800 p-1"
              title="Modifica template"
            >
              <Edit size={18} />
            </button>
          </Link>
          
          <button 
            className={`p-1 ${
              isDeleting 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-gray-600 hover:text-red-600'
            }`}
            onClick={handleDeleteClick}
            disabled={isDeleting}
            title="Elimina template"
          >
            {isDeleting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Trash2 size={18} />
            )}
          </button>
        </div>

        <button
          className="bg-gray-800 hover:bg-gray-700 transition text-white px-3 py-1 rounded flex items-center text-sm"
          onClick={() => setShowQrModal(true)}
        >
          <Share2 size={16} className="mr-1" />
          Condividi
        </button>
      </div>

      {/* QR Code Modal - aggiornato con dati reali */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Condividi: {template.name}</h3>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                &times;
              </button>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded-lg mb-4">
                <img 
                  src={qrCodeImage} 
                  alt={`QR Code per ${template.name}`}
                  className="w-full h-full object-contain"
                />
              </div>
              
              <p className="text-sm text-gray-600 mb-3 text-center">
                Scansiona il QR code o condividi il link:
              </p>
              
              <div className="w-full">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="w-full p-3 text-sm border rounded bg-gray-50 text-center"
                />
              </div>
              
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  showSuccess("Link copiato negli appunti!");
                }}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Copia Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}