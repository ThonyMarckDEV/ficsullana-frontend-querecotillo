// src/components/CreditScoreComponent.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { calculateCreditScore } from '../utilities/creditScoreUtils';
import ClientModal from './modals/ClientModal'; 
import UserInfo from './UserInfo';

const CreditScoreComponent = ({ clienteData }) => {
  // --- 1. Hooks: Estado y Referencias ---
  const [showTooltip, setShowTooltip] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para el modal
  const [tooltipStyle, setTooltipStyle] = useState({});
  const tooltipRef = useRef(null);
  const triggerRef = useRef(null);

  // --- 2. Datos Derivados ---
  const result = calculateCreditScore(clienteData);
  const { score, details = [] } = result;
  const rawScore = details.reduce((sum, detail) => sum + detail.points, 0);

  const getScorePresentation = (s) => {
    if (s > 70) return { color: 'text-green-600', text: 'Alta Confiabilidad' };
    if (s > 40) return { color: 'text-orange-600', text: 'Confiabilidad Media' };
    return { color: 'text-red-600', text: 'Baja Confiabilidad' };
  };
  const { color: scoreColor, text: scoreText } = getScorePresentation(score);

  // --- 3. Lógica de Posicionamiento del Tooltip (sin cambios) ---
  const adjustTooltipPosition = useCallback(() => {
    // ... (código sin cambios)
    if (!triggerRef.current || !tooltipRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const VIEWPORT_PADDING = 10;
    let top = triggerRect.top - tooltipRect.height - VIEWPORT_PADDING;
    let left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
    if (left < VIEWPORT_PADDING) left = VIEWPORT_PADDING;
    if (left + tooltipRect.width > window.innerWidth - VIEWPORT_PADDING) {
      left = window.innerWidth - tooltipRect.width - VIEWPORT_PADDING;
    }
    if (top < VIEWPORT_PADDING) top = triggerRect.bottom + VIEWPORT_PADDING;
    if (top + tooltipRect.height > window.innerHeight - VIEWPORT_PADDING) {
      top = window.innerHeight - tooltipRect.height - VIEWPORT_PADDING;
    }
    setTooltipStyle({ top: `${top}px`, left: `${left}px` });
  }, []);

  // --- 4. Efectos (sin cambios) ---
  useEffect(() => {
    if (showTooltip) {
      requestAnimationFrame(() => {
        adjustTooltipPosition();
      });
      window.addEventListener('resize', adjustTooltipPosition);
      window.addEventListener('scroll', adjustTooltipPosition, true);
      return () => {
        window.removeEventListener('resize', adjustTooltipPosition);
        window.removeEventListener('scroll', adjustTooltipPosition, true);
      };
    }
  }, [showTooltip, adjustTooltipPosition]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        tooltipRef.current && !tooltipRef.current.contains(event.target) &&
        triggerRef.current && !triggerRef.current.contains(event.target)
      ) {
        setShowTooltip(false);
      }
    };
    if (showTooltip) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTooltip]);

  // --- 5. Manejadores de Eventos ---
  const handleToggleTooltip = (e) => {
    e.stopPropagation();
    setShowTooltip((prev) => !prev);
  };
  
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  // --- 6. Renderizado del Componente ---
  return (
    <>
      <div className="relative flex items-center gap-4">
        {/* Credit Score y Tooltip Trigger */}
        <div
          ref={triggerRef}
          className="cursor-pointer inline-flex items-center gap-2"
          onClick={handleToggleTooltip}
        >
          <span className={`text-lg font-bold ${scoreColor}`}>
            Credit Score: {score}/100 - {scoreText}
          </span>
          <span className="text-gray-500 text-sm">ℹ️</span>
        </div>
        
        {/* Botón para abrir el Modal */}
        <button
          onClick={handleOpenModal}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Ver Cliente
        </button>

        {/* Tooltip del Credit Score */}
        {showTooltip && (
          <div
            ref={tooltipRef}
            style={tooltipStyle}
            className="fixed bg-white border border-gray-300 rounded-lg shadow-xl p-4 z-50 min-w-[320px] max-w-[400px]"
          >
            <h4 className="font-semibold mb-3 text-sm border-b pb-1">
              Desglose del Credit Score:
            </h4>
            <div className="mb-3 text-sm text-center">
              <strong className="text-2xl">{rawScore}</strong> puntos brutos
              <br />
              <span className="text-xs text-gray-500">(Normalizado a {score}/100)</span>
            </div>
            <ul className="text-sm space-y-2">
              {details.map((detail, index) => (
                <li
                  key={index}
                  className={`flex justify-between ${detail.points >= 0 ? 'text-green-700' : 'text-red-700'}`}
                >
                  <span>{detail.factor}:</span>
                  <span className="font-mono">
                    {detail.points > 0 && '+'}{detail.points} pts
                    {detail.reason && (
                      <span className="text-xs italic text-gray-500 ml-1">({detail.reason})</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Instancia del Modal del Cliente */}
      <ClientModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={`Información de Cliente: ${clienteData.datosCliente.nombre} ${clienteData.datosCliente.apellidoPaterno}`}
      >
        <UserInfo cliente={clienteData} />
      </ClientModal>
    </>
  );
};

export default CreditScoreComponent;