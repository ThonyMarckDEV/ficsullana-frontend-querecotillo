// src/components/modals/RejectModal.jsx
import React from 'react';

const RejectModal = ({ isOpen, onClose, onConfirm, rejectReason, setRejectReason }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h3 className="text-lg font-bold mb-4">Motivo de Rechazo</h3>
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Especifique el motivo del rechazo (máx. 500 caracteres)..."
          className="w-full p-3 border border-gray-300 rounded-lg mb-4 resize-none h-32"
          maxLength={500}
        />
        <div className="flex justify-end gap-2">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm} 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Confirmar Rechazo
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectModal;