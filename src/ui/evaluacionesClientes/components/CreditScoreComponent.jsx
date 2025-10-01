// src/components/CreditScoreComponent.jsx
import React, { useState } from 'react';
import { calculateCreditScore } from '../utilities/creditScoreUtils';

const CreditScoreComponent = ({ clienteData }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (e) => {
    setTooltipPosition({ x: e.clientX + 10, y: e.clientY + 10 });
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const handleClick = (e) => {
    setTooltipPosition({ x: e.clientX + 10, y: e.clientY + 10 });
    setShowTooltip(!showTooltip);
  };

  const result = calculateCreditScore(clienteData); // Now returns { score, details }

  const score = result.score;
  const details = result.details || [];
  const scoreColor = score > 70 ? 'text-green-600' : score > 40 ? 'text-orange-600' : 'text-red-600';
  const scoreText = score > 70 ? 'Alta Confiabilidad' : score > 40 ? 'Confiabilidad Media' : 'Baja Confiabilidad';

  return (
    <div className="relative">
      <div 
        className="cursor-pointer inline-flex items-center gap-2"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        <span className={`text-lg font-bold ${scoreColor}`}>
          Credit Score: {score}/100 - {scoreText}
        </span>
        <span className="text-gray-500 text-sm">ℹ️</span>
      </div>

      {showTooltip && (
        <div 
          className="absolute bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm z-50 whitespace-pre-wrap"
          style={{ left: tooltipPosition.x, top: tooltipPosition.y }}
        >
          <h4 className="font-bold mb-2">Desglose del Credit Score:</h4>
          <ul className="text-sm space-y-1">
            {details.map((detail, index) => (
              <li key={index} className={detail.points >= 0 ? 'text-green-600' : 'text-red-600'}>
                {detail.factor}: {detail.points} pts {detail.reason && `(${detail.reason})`}
              </li>
            ))}
          </ul>
          <button 
            onClick={() => setShowTooltip(false)} 
            className="mt-2 text-xs text-gray-500 hover:text-gray-700"
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
};

export default CreditScoreComponent;