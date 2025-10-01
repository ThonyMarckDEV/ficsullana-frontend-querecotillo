// src/pages/EvaluacionesJefeNegocios.jsx (actualizado)
import React, { useState, useMemo } from 'react';
import { getEvaluaciones, updateStatusEvaluacion } from 'services/evaluacionClienteService'; 
import { calculateCreditScore } from './utilities/creditScoreUtils'; 
import LoadingScreen from 'components/Shared/LoadingScreen';
import Pagination from './components/Pagination';       

const ITEMS_PER_PAGE = 3; // Define cuántos items por página

const EvaluacionesJefeNegocios = () => {
  // Estados para la búsqueda y los datos
  const [dni, setDni] = useState('');
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [clienteData, setClienteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Estados para la paginación de cada sección
  const [pages, setPages] = useState({ pendientes: 1, aceptadas: 1, rechazadas: 1 });

  // Estados para modal de rechazo
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedEvaluacion, setSelectedEvaluacion] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setHasSearched(true);
    setEvaluaciones([]);
    setClienteData(null);
    setPages({ pendientes: 1, aceptadas: 1, rechazadas: 1 }); // Resetea las páginas
    try {
      const data = await getEvaluaciones(dni);
      setEvaluaciones(data || []);
      if (data && data.length > 0) {
        try {
          const details = await getEvaluaciones(dni);
          setClienteData(details);
        } catch (detailsErr) {
          console.error('Error al obtener detalles del cliente:', detailsErr);
          // No set error, solo log, para no bloquear la vista de evaluaciones
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (evaluacionId) => {
    try {
      await updateStatusEvaluacion(evaluacionId, { estado: 1 });
      // Actualizar localmente
      setEvaluaciones(evaluaciones.map(e => 
        e.id === evaluacionId ? { ...e, estado: 1, observaciones: null } : e
      ));
      alert('Evaluación aprobada exitosamente.');
    } catch (err) {
      alert('Error al aprobar: ' + (err.message || 'Intente nuevamente.'));
    }
  };

  const openRejectModal = (evaluacion) => {
    setSelectedEvaluacion(evaluacion);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Especifique un motivo para el rechazo.');
      return;
    }
    try {
      await updateStatusEvaluacion(selectedEvaluacion.id, { 
        estado: 2, 
        observaciones: rejectReason 
      });
      // Actualizar localmente
      setEvaluaciones(evaluaciones.map(e => 
        e.id === selectedEvaluacion.id ? { ...e, estado: 2, observaciones: rejectReason } : e
      ));
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedEvaluacion(null);
      alert('Evaluación rechazada exitosamente.');
    } catch (err) {
      alert('Error al rechazar: ' + (err.message || 'Intente nuevamente.'));
    }
  };
  
  // Usamos useMemo para no recalcular esto en cada render
  const { pendientes, aceptadas, rechazadas } = useMemo(() => ({
    pendientes: evaluaciones.filter(e => e.estado === 0),
    aceptadas: evaluaciones.filter(e => e.estado === 1),
    rechazadas: evaluaciones.filter(e => e.estado === 2),
  }), [evaluaciones]);

  const creditScore = useMemo(() => calculateCreditScore(clienteData), [clienteData]);
  const scoreColor = creditScore > 70 ? 'text-green-600' : creditScore > 40 ? 'text-orange-600' : 'text-red-600';
  const scoreText = creditScore > 70 ? 'Alta Confiabilidad' : creditScore > 40 ? 'Confiabilidad Media' : 'Baja Confiabilidad';

  // Función para renderizar una sección con su paginación
  const renderSection = (title, data, type) => {
    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
    const currentPage = pages[type];
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentData = data.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handlePageChange = (page) => {
      setPages(prev => ({ ...prev, [type]: page }));
    };
    
    const colorMap = {
      Pendientes: 'text-yellow-600',
      Aceptadas: 'text-green-600',
      Rechazadas: 'text-red-600'
    };

    return (
      <section className="mb-12">
        <h2 className={`text-2xl font-semibold ${colorMap[title]} mb-6`}>{title}</h2>
        {currentData.length > 0 ? (
          <>
            {currentData.map(eva => (
              <div key={eva.id} className="bg-white p-6 rounded-lg shadow-md mb-4 border-l-4 border-l-yellow-500">
                <h3 className="text-lg font-bold mb-2">{eva.producto}</h3>
                <p className="text-gray-700 mb-2"><strong>Monto:</strong> S/ {eva.montoPrestamo}</p>
                <p className="text-gray-700 mb-2"><strong>Cuotas:</strong> {eva.cuotas}</p>
                <p className="text-gray-700 mb-2"><strong>Tasa de Interés:</strong> {eva.tasaInteres}%</p>
                <p className="text-gray-700 mb-2"><strong>Destino:</strong> {eva.destinoCredito}</p>
                {eva.observaciones && (
                  <p className="text-red-600 mt-2"><strong>Observaciones:</strong> {eva.observaciones}</p>
                )}
                {type === 'pendientes' && (
                  <div className="mt-4 flex gap-2">
                    <button 
                      onClick={() => handleApprove(eva.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Aprobar
                    </button>
                    <button 
                      onClick={() => openRejectModal(eva)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Rechazar
                    </button>
                  </div>
                )}
              </div>
            ))}
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </>
        ) : (
          <p className="text-gray-500">No hay evaluaciones en este estado.</p>
        )}
      </section>
    );
  };
  
  return (
    <>
      {loading && <LoadingScreen />}
      <div className="bg-gray-50 min-h-screen p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-8 border-b pb-4">Gestión de Evaluaciones - Jefe de Negocios</h1>
          
          {/* Formulario de Búsqueda */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 mb-10 p-6 bg-white rounded-lg shadow-md border border-blue-500">
            <input
              type="number"
              value={dni}
              onChange={(e) => setDni(e.target.value.slice(0,9))}
              placeholder="Ingrese DNI del cliente ( 8 a max. 9 dígitos)"
              className="w-full p-3 border border-blue-500 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button type="submit" className="w-full sm:w-auto px-8 py-3 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800 transition-colors">
              Buscar
            </button>
          </form>

          {/* Resumen del Cliente si existe */}
          {clienteData && (
            <div className="mb-8 p-6 bg-white rounded-lg shadow-md border border-gray-200">
              <h3 className="text-xl font-semibold mb-2">Resumen del Cliente</h3>
              <p className="text-gray-700 mb-2"><strong>Nombre:</strong> {clienteData.datosCliente?.nombre} {clienteData.datosCliente?.apellidoPaterno} {clienteData.datosCliente?.apellidoMaterno}</p>
              <p className={`text-lg font-bold ${scoreColor}`}>
                Credit Score: {creditScore}/100 - {scoreText}
              </p>
            </div>
          )}

          {/* Mensajes de estado y resultados */}
          {error && <p className="text-center p-10 text-red-500 font-semibold">Error: {error}</p>}

          {!hasSearched && !loading && (
            <p className="text-center text-gray-500 mt-16">Ingrese un DNI para comenzar la búsqueda.</p>
          )}

          {hasSearched && !loading && evaluaciones.length === 0 && (
            <p className="text-center text-gray-500 mt-16">No se encontraron evaluaciones para el DNI proporcionado.</p>
          )}

          {evaluaciones.length > 0 && (
            <div>
              {renderSection('Pendientes', pendientes, 'pendientes')}
              {renderSection('Aceptadas', aceptadas, 'aceptadas')}
              {renderSection('Rechazadas', rechazadas, 'rechazadas')}
            </div>
          )}
        </div>
      </div>

      {/* Modal para motivo de rechazo */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
                onClick={() => { setShowRejectModal(false); setRejectReason(''); setSelectedEvaluacion(null); }} 
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button 
                onClick={handleReject} 
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EvaluacionesJefeNegocios;