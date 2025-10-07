// src/pages/EvaluacionesClientes.jsx
import React, { useState, useMemo } from 'react';
import { getEvaluaciones, updateStatusEvaluacion } from 'services/evaluacionClienteService'; 
import { showClientByDNI } from 'services/clienteService';
import LoadingScreen from 'components/Shared/LoadingScreen';
import Pagination from './components/Pagination';       
import BuscarEvaluacionesPorDni from 'components/Shared/Comboboxes/BuscarEvaluacionesPorDni';
import RejectModal from './components/modals/RejectModal';
import CreditScoreComponent from './components/CreditScoreComponent';
import { toast } from 'react-toastify';

const ITEMS_PER_PAGE = 3;

const EvaluacionesClientes = () => {
  const [dni, setDni] = useState('');
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [clienteData, setClienteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [pages, setPages] = useState({ pendientes: 1, aceptadas: 1, rechazadas: 1 });
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedEvaluacion, setSelectedEvaluacion] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleEvaluacionesFound = async (data, searchDni) => {
    setLoading(true);
    setEvaluaciones(data || []);
    setHasSearched(true);
    setError(null);
    setDni(searchDni);
    if (data && data.length > 0) {
      try {
        const details = await showClientByDNI(searchDni);
        setClienteData(details);
      } catch (detailsErr) {
        console.error('Error al obtener detalles del cliente:', detailsErr);
      }
    } else {
      setClienteData(null);
    }
    setLoading(false);
  };

  const handleClear = () => {
    setEvaluaciones([]);
    setClienteData(null);
    setHasSearched(false);
    setError(null);
    setPages({ pendientes: 1, aceptadas: 1, rechazadas: 1 });
  };

  const handleApprove = async (evaluacionId) => {
    setLoading(true);
    try {
      await updateStatusEvaluacion(evaluacionId, { estado: 1 });
      setEvaluaciones(evaluaciones.map(e => 
        e.id === evaluacionId ? { ...e, estado: 1, observaciones: null } : e
      ));
      toast.success('Evaluación aprobada exitosamente.');
    } catch (err) {
      toast.error('Error al aprobar: ' + (err.message || 'Intente nuevamente.'));
    } finally {
      setLoading(false);
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
    setLoading(true);
    try {
      await updateStatusEvaluacion(selectedEvaluacion.id, { 
        estado: 2, 
        observaciones: rejectReason 
      });
      setEvaluaciones(evaluaciones.map(e => 
        e.id === selectedEvaluacion.id ? { ...e, estado: 2, observaciones: rejectReason } : e
      ));
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedEvaluacion(null);
      toast.success('Evaluación rechazada exitosamente.');
    } catch (err) {
      toast.error('Error al rechazar: ' + (err.message || 'Intente nuevamente.'));
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowRejectModal(false);
    setRejectReason('');
    setSelectedEvaluacion(null);
  };

  const { pendientes, aceptadas, rechazadas } = useMemo(() => ({
    pendientes: evaluaciones.filter(e => e.estado === 0),
    aceptadas: evaluaciones.filter(e => e.estado === 1),
    rechazadas: evaluaciones.filter(e => e.estado === 2),
  }), [evaluaciones]);

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
                      disabled={loading}
                    >
                      {loading ? 'Procesando...' : 'Aprobar'}
                    </button>
                    <button 
                      onClick={() => openRejectModal(eva)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      disabled={loading}
                    >
                      {loading ? 'Procesando...' : 'Rechazar'}
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
          
          <BuscarEvaluacionesPorDni 
            onEvaluacionesFound={handleEvaluacionesFound} 
            onClear={handleClear}
            variant="jefe"
          />

          {clienteData && (
            <div className="mb-8 p-6 bg-white rounded-lg shadow-md border border-gray-200">
              <h3 className="text-xl font-semibold mb-2">Resumen del Cliente</h3>
              <p className="text-gray-700 mb-2"><strong>Nombre:</strong> {clienteData.datosCliente?.nombre} {clienteData.datosCliente?.apellidoPaterno} {clienteData.datosCliente?.apellidoMaterno}</p>
              <CreditScoreComponent clienteData={clienteData} />
            </div>
          )}

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

      <RejectModal
        isOpen={showRejectModal}
        onClose={handleCloseModal}
        onConfirm={handleReject}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
      />
    </>
  );
};

export default EvaluacionesClientes;