// src/components/EvaluacionCard.jsx (actualizado sin botón de corregir)
import React from 'react';

// --- COMPONENTE PARA MOSTRAR UNA TARJETA DE EVALUACIÓN ---
export const EvaluacionCard = ({ evaluacion }) => {
  const {
    cliente, producto, montoPrestamo, tasaInteres, cuotas,
    modalidadCredito, periodoCredito, destinoCredito, estado,
    observaciones, created_at
  } = evaluacion;

  const nombreCliente = cliente?.datos ? `${cliente.datos.nombre} ${cliente.datos.apellidoPaterno} ${cliente.datos.apellidoMaterno}` : 'Datos del Cliente no encontrados';
  const dniCliente = cliente?.datos ? cliente.datos.dni : 'N/A';

  const estadoInfo = {
    0: { text: 'Pendiente', badge: 'bg-yellow-100 text-yellow-800', borderColor: 'border-l-yellow-400', icon: '⏳' },
    1: { text: 'Aceptado', badge: 'bg-green-100 text-green-800', borderColor: 'border-l-green-500', icon: '✅' },
    2: { text: 'Rechazado', badge: 'bg-red-100 text-red-800', borderColor: 'border-l-red-500', icon: '❌' },
  };

  const status = estadoInfo[estado] || {};

  return (
    <div className={`bg-white p-4 sm:p-6 rounded-lg shadow-lg mb-8 border-l-8 ${status.borderColor}`}>
      {/* -- Cabecera con Producto, Cliente y Estado -- */}
      <div className="flex justify-between items-start mb-4 border-b border-gray-200 pb-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">{producto}</h3>
          <p className="text-sm text-gray-500">{nombreCliente} - DNI: {dniCliente}</p>
        </div>
        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${status.badge}`}>
          {status.text} {status.icon}
        </span>
      </div>

      {/* -- Grid de Detalles del Crédito -- */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5 mt-4">
        <div>
          <label className="block text-gray-600 font-semibold text-sm">Monto Solicitado</label>
          <p className="text-xl font-medium text-gray-900">
            S/ {parseFloat(montoPrestamo).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <label className="block text-gray-600 font-semibold text-sm">Tasa de Interés</label>
          <p className="text-lg text-gray-800">{tasaInteres}%</p>
        </div>
        <div>
          <label className="block text-gray-600 font-semibold text-sm">Cuotas</label>
          <p className="text-lg text-gray-800">{cuotas}</p>
        </div>
        <div>
          <label className="block text-gray-600 font-semibold text-sm">Modalidad</label>
          <p className="text-gray-800">{modalidadCredito}</p>
        </div>
        <div>
          <label className="block text-gray-600 font-semibold text-sm">Periodo</label>
          <p className="text-gray-800">{periodoCredito}</p>
        </div>
        <div>
          <label className="block text-gray-600 font-semibold text-sm">Destino</label>
          <p className="text-gray-800">{destinoCredito}</p>
        </div>
      </div>

      <div className='text-right text-xs text-gray-400 mt-4'>
          Enviado el: {new Date(created_at).toLocaleDateString('es-PE')}
      </div>

      {/* -- Observaciones para Rechazados (sin botón de corregir) -- */}
      {estado === 2 && observaciones && (
        <div className="mt-5 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="block text-red-700 font-semibold text-sm">Motivo del Rechazo:</p>
          <p className="text-sm text-red-900 italic">"{observaciones}"</p>
        </div>
      )}
    </div>
  );
};