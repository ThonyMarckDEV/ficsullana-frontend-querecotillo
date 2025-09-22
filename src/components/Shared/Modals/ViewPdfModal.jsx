// src/shared/components/ViewPdfModal.jsx
import React, { useState } from "react";
import { X, Maximize2, Minimize2 } from "lucide-react"; // íconos de cerrar y fullscreen

const ViewPdfModal = ({ isOpen, onClose, pdfUrl }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className={`bg-white rounded-2xl shadow-2xl flex flex-col animate-fadeIn transition-all duration-300
          ${isFullScreen ? "w-full h-full" : "w-full max-w-5xl h-[80vh]"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <h2 className="text-lg font-semibold text-gray-700">Vista de PDF</h2>
          <div className="flex items-center gap-2">
            {/* Botón fullscreen */}
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-2 rounded-full hover:bg-gray-100 transition"
              aria-label="Pantalla completa"
            >
              {isFullScreen ? (
                <Minimize2 className="w-5 h-5 text-gray-600" />
              ) : (
                <Maximize2 className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {/* Botón cerrar */}
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-red-100 transition"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5 text-red-600" />
            </button>
          </div>
        </div>

        {/* Contenido PDF */}
        <div className="flex-1 overflow-hidden">
          <iframe
            src={pdfUrl}
            className="w-full h-full rounded-b-2xl"
            title="Vista de PDF"
          />
        </div>
      </div>
    </div>
  );
};

export default ViewPdfModal;
