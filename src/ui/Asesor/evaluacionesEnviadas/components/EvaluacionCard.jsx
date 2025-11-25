import React from 'react';
import { Link } from 'react-router-dom';

export const EvaluacionCard = ({ evaluacion }) => {
  // 1. Extraemos el 'id' de la evaluación
  const { 
    id, // <--- IMPORTANTE: Necesitamos el ID para la ruta de corrección
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
    <div className={`bg-white p-4 sm:p-6 border border-yellow-500 rounded-lg shadow-lg mb-8 border-l-8 ${status.borderColor}`}>
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
          <label className="block text-red-700 font-semibold text-sm">Monto Solicitado</label>
          <p className="text-xl font-medium text-gray-900">
            S/ {parseFloat(montoPrestamo).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <label className="block text-red-700 font-semibold text-sm">Tasa de Interés</label>
          <p className="text-lg text-gray-800">{tasaInteres}%</p>
        </div>
        <div>
          <label className="block text-red-700 font-semibold text-sm">Cuotas</label>
          <p className="text-lg text-gray-800">{cuotas}</p>
        </div>
        <div>
          <label className="block text-red-700 font-semibold text-sm">Modalidad</label>
          <p className="text-gray-800">{modalidadCredito}</p>
        </div>
        <div>
          <label className="block text-red-700 font-semibold text-sm">Periodo</label>
          <p className="text-gray-800">{periodoCredito}</p>
        </div>
        <div>
          <label className="block text-red-700 font-semibold text-sm">Destino</label>
          <p className="text-gray-800">{destinoCredito}</p>
        </div>
      </div>
      
      <div className='text-right text-xs text-gray-400 mt-4'>
          Enviado el: {new Date(created_at).toLocaleDateString('es-PE')}
      </div>

      {/* -- Observaciones y Botón de Corrección para Rechazados -- */}
      {estado === 2 && (
        <div className="mt-5">
          {observaciones && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="block text-red-700 font-semibold text-sm">Motivo del Rechazo:</p>
              <p className="text-sm text-red-900 italic">"{observaciones}"</p>
            </div>
          )}

          <div className="text-right mt-4">
            {/* 2. CORRECCIÓN: Usamos el ID de la evaluación en la URL */}
            <Link
              to={`/asesor/evaluacion-cliente/${id}`} 
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-bold text-sm rounded-lg hover:bg-red-700 transition-colors shadow"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
              </svg>
              Corregir Evaluación
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};