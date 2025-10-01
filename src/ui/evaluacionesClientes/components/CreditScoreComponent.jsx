// src/components/CreditScoreComponent.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { calculateCreditScore } from '../utilities/creditScoreUtils';

const CreditScoreComponent = ({ clienteData }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState({}); // Usamos un objeto de estilo para la posición
  const tooltipRef = useRef(null);
  const triggerRef = useRef(null);

  const result = calculateCreditScore(clienteData);
  const score = result.score;
  const details = result.details || [];
  const scoreColor = score > 70 ? 'text-green-600' : score > 40 ? 'text-orange-600' : 'text-red-600';
  const scoreText = score > 70 ? 'Alta Confiabilidad' : score > 40 ? 'Confiabilidad Media' : 'Baja Confiabilidad';

  // Función de ajuste de posición, memorizada con useCallback
  const adjustTooltipPosition = useCallback(() => {
    if (!showTooltip || !tooltipRef.current || !triggerRef.current) return;

    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;
    const padding = 10; // Margen de la ventana

    // 1. Posición inicial: Centrado horizontalmente sobre el trigger.
    let targetX = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2) + scrollX;
    // 2. Posición vertical inicial: Encima del trigger.
    let targetY = triggerRect.top - tooltipRect.height - padding + scrollY;
    let flip = false;
    
    // --- Ajustes dinámicos ---

    // 3. Ajuste Horizontal (evitar desbordamiento a los lados)
    if (targetX + tooltipRect.width > window.innerWidth + scrollX - padding) {
      targetX = window.innerWidth + scrollX - tooltipRect.width - padding;
    }
    if (targetX < scrollX + padding) {
      targetX = scrollX + padding;
    }

    // 4. Ajuste Vertical (Comprobar desbordamiento superior y voltear si es necesario)
    if (targetY < scrollY + padding) {
      // Si desborda por arriba, voltear para que aparezca debajo
      targetY = triggerRect.bottom + padding + scrollY;
      flip = true;
    }

    // 5. Si está volteado (debajo) y desborda por abajo, ajustarlo hacia arriba
    if (flip && targetY + tooltipRect.height > window.innerHeight + scrollY - padding) {
        // En un caso extremo (trigger cerca del fondo), lo ajustamos al máximo posible
        targetY = window.innerHeight + scrollY - tooltipRect.height - padding;
    }

    setTooltipStyle({ 
      left: targetX, 
      top: targetY, 
      // Opcional: añadir una clase para cambiar el estilo de la flecha si se voltea
      // flip: flip 
    });
  }, [showTooltip]);

  // Ejecuta la función de ajuste cada vez que showTooltip cambie
  useEffect(() => {
    // Si se muestra, ajusta la posición
    if (showTooltip) {
      adjustTooltipPosition();
      // Además, si el tamaño de la ventana cambia mientras está abierto, re-ajusta
      window.addEventListener('resize', adjustTooltipPosition);
    }
    
    // Cleanup: remueve el listener
    return () => {
      window.removeEventListener('resize', adjustTooltipPosition);
    };
  }, [showTooltip, adjustTooltipPosition]); // Depende de showTooltip y de la función adjustTooltipPosition

  // Manejadores de eventos (más limpios)
  const handleToggle = (e) => {
    e.stopPropagation();
    setShowTooltip(prev => !prev);
  };
  
  // Para mouseEnter/Leave, solo mostramos/ocultamos si no está activo (opcional, para evitar que se cierre inmediatamente al mover el mouse si se abrió con click)
  const handleMouseEnter = () => setShowTooltip(true);
  const handleMouseLeave = () => setShowTooltip(false);

  // Close on outside click (Mantener como estaba, es correcto)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showTooltip && triggerRef.current && !triggerRef.current.contains(e.target) && tooltipRef.current && !tooltipRef.current.contains(e.target)) {
        setShowTooltip(false);
      }
    };
    if (showTooltip) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTooltip]);

  return (
    <div className="relative">
      <div 
        ref={triggerRef}
        className="cursor-pointer inline-flex items-center gap-2"
        onMouseEnter={handleMouseEnter} // Puedes remover este si prefieres solo click
        onMouseLeave={handleMouseLeave} // Puedes remover este si prefieres solo click
        onClick={handleToggle} // Usar handleToggle para un click universal
      >
        <span className={`text-lg font-bold ${scoreColor}`}>
          Credit Score: {score}/100 - {scoreText}
        </span>
        <span className="text-gray-500 text-sm">ℹ️</span>
      </div>

      {showTooltip && (
        // Posicionamiento absoluto y fijo para que flote correctamente sobre el contenido
        <div 
          ref={tooltipRef}
          className="fixed bg-white border border-gray-300 rounded-lg shadow-xl p-4 z-50 whitespace-pre-wrap min-w-[320px] max-w-[400px] max-h-[500px] overflow-y-auto"
          style={{ 
            left: tooltipStyle.left, 
            top: tooltipStyle.top,
            // Importante: usar 'fixed' para que las coordenadas de window.scrollY/X funcionen bien
            position: 'fixed', 
            transform: 'translate(0, 0)' // Resetear transformaciones
          }}
        >
          <h4 className="font-semibold mb-3 text-sm border-b pb-1">Desglose del Credit Score:</h4>
          <ul className="text-sm space-y-2">
            {details.map((detail, index) => (
              <li key={index} className={`${detail.points >= 0 ? 'text-green-700' : 'text-red-700'} flex justify-between`}>
                <span>{detail.factor}:</span>
                <span>{detail.points} pts {detail.reason && <span className="text-xs italic">({detail.reason})</span>}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CreditScoreComponent;