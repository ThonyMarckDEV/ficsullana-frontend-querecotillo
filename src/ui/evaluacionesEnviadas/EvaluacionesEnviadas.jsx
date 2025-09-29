import React, { useState, useEffect } from 'react';
import { getEvaluaciones } from './services/evaluacionService'; // Ajusta la ruta si es necesario

// --- COMPONENTE DE LA TARJETA (REDiseñado) ---
const EvaluacionCard = ({ evaluacion }) => {
  const { 
    cliente, producto, monto_prestamo, tasa_interes, cuotas,
    modalidad_credito, periodo_credito, destino_credito, estado,
    observaciones, created_at 
  } = evaluacion;

  const nombreCliente = cliente?.datos ? `${cliente.datos.nombre} ${cliente.datos.apellidoPaterno}` : 'Datos del Cliente no encontrados';
  const dniCliente = cliente?.datos ? cliente.datos.dni : 'N/A';

  // Define estilos basados en el estado para reutilizarlos
  const estadoInfo = {
    0: { text: 'Pendiente', badge: 'bg-yellow-100 text-yellow-800', borderColor: 'border-l-yellow-400', icon: '⏳' },
    1: { text: 'Aceptado', badge: 'bg-green-100 text-green-800', borderColor: 'border-l-green-500', icon: '✅' },
    2: { text: 'Rechazado', badge: 'bg-red-100 text-red-800', borderColor: 'border-l-red-500', icon: '❌' },
  };
  
  const status = estadoInfo[estado] || {};

  // --- NUEVA ESTRUCTURA INSPIRADA EN AVALFORM ---
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
            S/ {parseFloat(monto_prestamo).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <label className="block text-red-700 font-semibold text-sm">Tasa de Interés</label>
          <p className="text-lg text-gray-800">{tasa_interes}%</p>
        </div>
        <div>
          <label className="block text-red-700 font-semibold text-sm">Cuotas</label>
          <p className="text-lg text-gray-800">{cuotas}</p>
        </div>
        <div>
          <label className="block text-red-700 font-semibold text-sm">Modalidad</label>
          <p className="text-gray-800">{modalidad_credito}</p>
        </div>
        <div>
          <label className="block text-red-700 font-semibold text-sm">Periodo</label>
          <p className="text-gray-800">{periodo_credito}</p>
        </div>
        <div>
          <label className="block text-red-700 font-semibold text-sm">Destino</label>
          <p className="text-gray-800">{destino_credito}</p>
        </div>
      </div>
      
      <div className='text-right text-xs text-gray-400 mt-4'>
          Enviado el: {new Date(created_at).toLocaleDateString('es-PE')}
      </div>

      {/* -- Observaciones de Rechazo -- */}
      {estado === 2 && observaciones && (
        <div className="mt-5 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="block text-red-700 font-semibold text-sm">Motivo del Rechazo:</p>
          <p className="text-sm text-red-900 italic">"{observaciones}"</p>
        </div>
      )}
    </div>
  );
};


// --- COMPONENTE PRINCIPAL (Sin cambios) ---
const EvaluacionesEnviadas = () => {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvaluaciones = async () => {
      try {
        setLoading(true);
        const data = await getEvaluaciones();
        setEvaluaciones(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvaluaciones();
  }, []);

  const pendientes = evaluaciones.filter(e => e.estado === 0);
  const aceptadas = evaluaciones.filter(e => e.estado === 1);
  const rechazadas = evaluaciones.filter(e => e.estado === 2);

  if (loading) return <div className="text-center p-10">Cargando evaluaciones...</div>;
  if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>;

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 border-b pb-4">Historial de Evaluaciones</h1>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-yellow-600 mb-6">Pendientes</h2>
          {pendientes.length > 0 ? (
            pendientes.map(eva => <EvaluacionCard key={eva.id} evaluacion={eva} />)
          ) : (
            <p className="text-gray-500">No hay evaluaciones pendientes.</p>
          )}
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-green-600 mb-6">Aceptadas</h2>
          {aceptadas.length > 0 ? (
            aceptadas.map(eva => <EvaluacionCard key={eva.id} evaluacion={eva} />)
          ) : (
            <p className="text-gray-500">No hay evaluaciones aceptadas.</p>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-red-600 mb-6">Rechazadas</h2>
          {rechazadas.length > 0 ? (
            rechazadas.map(eva => <EvaluacionCard key={eva.id} evaluacion={eva} />)
          ) : (
            <p className="text-gray-500">No hay evaluaciones rechazadas.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default EvaluacionesEnviadas;