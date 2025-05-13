import { Edit, Share2, Copy, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
// Import the image directly - this is the recommended way in most React frameworks
import qrCodeImage from "../assets/Rickrolling_QR_code.png";

export function TemplateCard({
  name,
  modified,
  isDefault,
}: {
  name: string;
  modified: string;
  isDefault?: boolean;
}) {
  const [showQrModal, setShowQrModal] = useState(false);

  // Example URL for the questionnaire
  const shareUrl = `https://miolink.com/questionario/${encodeURIComponent(
    name
  )}`;

  return (
    <div className="border rounded-lg bg-white p-4 shadow hover:shadow-md transition flex flex-col">
      <div className="flex items-center justify-between mb-2"></div>
      <h3 className="font-semibold text-lg mb-1">{name}</h3>
      <p className="text-sm text-gray-500 mb-4">Modificato: {modified}</p>
      <div className="flex justify-between">
        <div className="flex gap-2 ">
          <Link to={`/templates/editor/${encodeURIComponent(name)}`}>
            <button className="text-gray-600 hover:text-gray-800 mt-1 ">
              <Edit size={18} />
            </button>
          </Link>
          <button className="text-gray-600 hover:text-gray-800 mb-1">
            <Trash2 size={18} />
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

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Condividi Questionario</h3>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>

            <div className="flex flex-col items-center">
              {/* QR code image with proper import and alt text */}
              <div className="w-64 h-64 flex items-center justify-center mb-4">
                <img
                  src={qrCodeImage}
                  alt={`QR Code for ${name} questionnaire`}
                  width="256"
                  height="256"
                  className="object-contain"
                />
              </div>

              <div className="w-full mb-4">
                <p className="text-sm text-gray-500 mb-1">
                  Link al questionario:
                </p>
                <div className="flex">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 border rounded-l px-3 py-2 bg-gray-50 text-sm"
                  />
                  <button
                    className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-r text-sm"
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl);
                      alert("URL copiato negli appunti!");
                    }}
                  >
                    Copia
                  </button>
                </div>
              </div>

              <button
                className="bg-gray-800 hover:bg-gray-700 transition text-white px-4 py-2 rounded w-full"
                onClick={() => setShowQrModal(false)}
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
