import React, { useState, useRef, useEffect, useCallback } from 'react';
import { calculateCreditScore } from '../utilities/creditScoreUtils';
import ClientModal from './modals/ClientModal';
import UserInfo from './UserInfo';

const CreditScoreComponent = ({ clienteData }) => {
  // --- 1. Hooks ---
  const [showTooltip, setShowTooltip] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState({});
  const tooltipRef = useRef(null);
  const triggerRef = useRef(null);

  // --- 2. Validación de Datos ---
  // El componente padre (EvaluacionesClientes.jsx) ya envía la estructura correcta:
  // { datosCliente: { ... }, aval: { ... } }
  // No necesitamos transformar nada, solo validar que existan los datos.
  const dataToUse = clienteData || { datosCliente: {}, aval: {} };

  // --- 3. Cálculo del Score ---
  const result = calculateCreditScore(dataToUse);
  const { score, details = [] } = result;
  const rawScore = details.reduce((sum, detail) => sum + detail.points, 0);

  const getScorePresentation = (s) => {
    if (s > 70) return { color: 'text-green-600', text: 'Alta Confiabilidad' };
    if (s > 40) return { color: 'text-orange-600', text: 'Confiabilidad Media' };
    return { color: 'text-red-600', text: 'Baja Confiabilidad' };
  };
  const { color: scoreColor, text: scoreText } = getScorePresentation(score);

  // --- 4. Posicionamiento (Tooltip) ---
  const adjustTooltipPosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const PADDING = 10;
    
    let top = triggerRect.top - tooltipRect.height - PADDING;
    let left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);

    if (left < PADDING) left = PADDING;
    if (left + tooltipRect.width > window.innerWidth - PADDING) {
      left = window.innerWidth - tooltipRect.width - PADDING;
    }
    if (top < PADDING) top = triggerRect.bottom + PADDING;
    
    setTooltipStyle({ top: `${top}px`, left: `${left}px` });
  }, []);

  // --- 5. Efectos ---
  useEffect(() => {
    if (showTooltip) {
      requestAnimationFrame(adjustTooltipPosition);
      window.addEventListener('resize', adjustTooltipPosition);
      window.addEventListener('scroll', adjustTooltipPosition, true);
      return () => {
        window.removeEventListener('resize', adjustTooltipPosition);
        window.removeEventListener('scroll', adjustTooltipPosition, true);
      };
    }
  }, [showTooltip, adjustTooltipPosition]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target) &&
          triggerRef.current && !triggerRef.current.contains(e.target)) {
        setShowTooltip(false);
      }
    };
    if (showTooltip) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTooltip]);

  // --- 6. Render ---
  return (
    <>
      <div className="relative flex items-center gap-4">
        {/* Score Badge */}
        <div
          ref={triggerRef}
          className="cursor-pointer inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
          onClick={(e) => { e.stopPropagation(); setShowTooltip(!showTooltip); }}
        >
          <span className={`text-lg font-bold ${scoreColor}`}>
            {score}/100
          </span>
          <span className="text-xs text-gray-500 font-medium hidden sm:inline">{scoreText}</span>
          <span className="text-gray-400 text-xs">ℹ️</span>
        </div>
        
        {/* Botón Modal */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
        >
          Ver Cliente
        </button>

        {/* Tooltip */}
        {showTooltip && (
          <div
            ref={tooltipRef}
            style={tooltipStyle}
            className="fixed bg-white border border-gray-200 rounded-lg shadow-xl p-4 z-[60] min-w-[300px] max-w-[350px] animate-fadeIn"
          >
            <div className="flex justify-between items-center mb-3 border-b pb-2">
                <h4 className="font-bold text-gray-700">Análisis de Riesgo</h4>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">Raw: {rawScore} pts</span>
            </div>
            
            <ul className="text-xs space-y-2 max-h-[300px] overflow-y-auto">
              {details.length > 0 ? details.map((detail, index) => (
                <li key={index} className="flex justify-between items-start gap-2 border-b border-gray-50 pb-1 last:border-0">
                  <span className="text-gray-600 font-medium">{detail.factor}:</span>
                  <div className="text-right">
                    <span className={`font-bold ${detail.points >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {detail.points > 0 && '+'}{detail.points}
                    </span>
                    {detail.reason && (
                      <p className="text-[10px] text-gray-400 leading-tight max-w-[150px]">{detail.reason}</p>
                    )}
                  </div>
                </li>
              )) : (
                  <li className="text-gray-400 italic">Faltan datos para calcular el score.</li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Modal Info Cliente */}
      <ClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Expediente del Cliente"
      >
        <UserInfo cliente={dataToUse} />
      </ClientModal>
    </>
  );
};

export default CreditScoreComponent;