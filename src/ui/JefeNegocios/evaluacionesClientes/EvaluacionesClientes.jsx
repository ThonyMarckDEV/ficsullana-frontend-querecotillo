import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getEvaluaciones, updateStatusEvaluacion } from 'services/evaluacionClienteService'; 
import LoadingScreen from 'components/Shared/LoadingScreen';
import Pagination from './components/Pagination'; 
import RejectModal from './components/modals/RejectModal';
import CreditScoreComponent from './components/CreditScoreComponent';
import EvaluacionDetailComponent from './components/EvaluacionDetailComponent';
import { toast } from 'react-toastify';

const ITEMS_PER_PAGE = 3;

const EvaluacionesClientes = () => {
  // --- ESTADOS ---
  const [allEvaluaciones, setAllEvaluaciones] = useState([]); 
  
  // Filtros
  const [searchDni, setSearchDni] = useState(''); 
  const [isGeneral, setIsGeneral] = useState(false); // Nuevo: Checkbox "Listar General"
  const [fechaInicio, setFechaInicio] = useState(''); // Nuevo: Fecha Inicio
  const [fechaFin, setFechaFin] = useState('');       // Nuevo: Fecha Fin
  
  const [loading, setLoading] = useState(false);
  
  // Paginación independiente por estado
  const [pages, setPages] = useState({ pendientes: 1, aceptadas: 1, rechazadas: 1 });
  
  // Modales
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedEvaluacion, setSelectedEvaluacion] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // --- CARGA INICIAL ---
  useEffect(() => {
    fetchEvaluaciones();
  }, []);

  /**
   * Función centralizada para obtener evaluaciones
   */
  const fetchEvaluaciones = async (dniFilter = '', inicio = '', fin = '') => {
      setLoading(true);
      try {
          // Llamada al servicio con los 3 argumentos (DNI, Fecha Inicio, Fecha Fin)
          const data = await getEvaluaciones(dniFilter, inicio, fin);
          setAllEvaluaciones(data || []);
          // Reiniciamos paginación al filtrar
          setPages({ pendientes: 1, aceptadas: 1, rechazadas: 1 });
      } catch (err) {
          console.error(err);
          toast.error("Error al cargar evaluaciones.");
      } finally {
          setLoading(false);
      }
  };

  /**
   * Manejo del formulario de búsqueda
   */
  const handleSearchSubmit = (e) => {
      e.preventDefault();
      // Si "General" está marcado, mandamos DNI vacío aunque haya texto (aunque el input estará disabled)
      const dniToSend = isGeneral ? '' : searchDni;
      fetchEvaluaciones(dniToSend, fechaInicio, fechaFin);
  };

  /**
   * Checkbox "Listar General"
   */
  const handleGeneralChange = (e) => {
      const checked = e.target.checked;
      setIsGeneral(checked);
      if (checked) {
          setSearchDni(''); // Limpiamos el DNI visualmente si marca general
      }
  };

  /**
   * Limpiar filtros y recargar
   */
  const handleReload = () => {
    setSearchDni('');
    setIsGeneral(false);
    setFechaInicio('');
    setFechaFin('');
    fetchEvaluaciones('', '', ''); 
  };

  /**
   * Callback tras actualizar una evaluación (para recargar lista manteniendo filtros)
   */
  const handleUpdateSuccess = useCallback(() => {
    toast.info("Actualizando lista...");
    const dniToSend = isGeneral ? '' : searchDni;
    fetchEvaluaciones(dniToSend, fechaInicio, fechaFin); 
  }, [searchDni, isGeneral, fechaInicio, fechaFin]);

  // --- ACCIONES (Aprobar / Rechazar) ---
  const handleApprove = async (evaluacionId) => {
    if(!window.confirm("¿Está seguro de aprobar esta evaluación?")) return;
    
    setLoading(true);
    try {
      await updateStatusEvaluacion(evaluacionId, { estado: 1 });
      // Actualización optimista local
      setAllEvaluaciones(prev => prev.map(e => 
        e.id === evaluacionId ? { ...e, estado: 1, observaciones: null } : e
      ));
      toast.success('Evaluación aprobada.');
    } catch (err) {
      toast.error(err.message || 'Error al aprobar.');
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
    if (!rejectReason.trim()) return toast.warning('Ingrese un motivo.');
    
    setLoading(true);
    try {
      await updateStatusEvaluacion(selectedEvaluacion.id, { estado: 2, observaciones: rejectReason });
      setAllEvaluaciones(prev => prev.map(e => 
        e.id === selectedEvaluacion.id ? { ...e, estado: 2, observaciones: rejectReason } : e
      ));
      setShowRejectModal(false);
      toast.success('Evaluación rechazada.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- FILTRADO EN MEMORIA (Separación por estados) ---
  const { pendientes, aceptadas, rechazadas } = useMemo(() => ({
    pendientes: allEvaluaciones.filter(e => e.estado === 0),
    aceptadas: allEvaluaciones.filter(e => e.estado === 1),
    rechazadas: allEvaluaciones.filter(e => e.estado === 2),
  }), [allEvaluaciones]);

  // --- RENDER SECTION ---
  const renderSection = (title, data, type) => {
    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
    const currentPage = pages[type];
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentData = data.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const colorMap = { 'Pendientes': 'text-yellow-600', 'Aceptadas': 'text-green-600', 'Rechazadas': 'text-red-600' };

    return (
      <section className="mb-12 animate-fadeIn">
        <div className="flex items-center gap-2 mb-6 border-b pb-2">
            <h2 className={`text-2xl font-bold ${colorMap[title]}`}>{title}</h2>
            <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-bold shadow-sm">{data.length}</span>
        </div>

        {currentData.length > 0 ? (
          <div className="space-y-10">
            {currentData.map(eva => {
                const clienteInfo = { 
                    datosCliente: eva.cliente?.datos || {}, 
                    aval: eva.aval || null,
                    datosNegocio: eva.datos_negocio || {} 
                };
                
                const distrito = clienteInfo.datosCliente?.direcciones?.[0]?.distrito || 'Sin distrito';
                const departamento = clienteInfo.datosCliente?.direcciones?.[0]?.departamento || '';

                return (
                    <div key={eva.id} className="border border-gray-300 rounded-xl bg-white shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                        
                        {/* HEADER DE LA CARD */}
                        <div className="bg-gray-50 p-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl">
                                    {clienteInfo.datosCliente?.nombre?.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">
                                            {clienteInfo.datosCliente?.nombre} {clienteInfo.datosCliente?.apellidoPaterno} {clienteInfo.datosCliente?.apellidoMaterno}
                                    </h3>
                                    <div className="flex gap-3 text-sm text-gray-600">
                                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                                            DNI: {clienteInfo.datosCliente?.dni}
                                        </span>
                                        <span>📍 {distrito}, {departamento}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="w-full md:w-auto">
                                <CreditScoreComponent clienteData={clienteInfo} />
                            </div>
                        </div>

                        {/* DETALLE COMPONENTE */}
                        <div className="p-4 bg-white">
                            <div className="mb-2 text-xs text-gray-400 uppercase font-semibold tracking-wider">
                                Solicitud #{eva.id} - {eva.producto}
                            </div>
                            <EvaluacionDetailComponent
                                evaluacion={eva}
                                onUpdateSuccess={handleUpdateSuccess}
                                onApprove={handleApprove}
                                onReject={openRejectModal}
                                isLoading={loading}
                                isPending={type === 'pendientes'}
                            />
                        </div>
                    </div>
                );
            })}
            
            <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={(pageNumber) => setPages(prev => ({ ...prev, [type]: pageNumber }))} 
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-10 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg text-gray-400">
              <span className="text-4xl mb-2">📭</span>
              <p>No hay evaluaciones en estado <strong>{title}</strong>.</p>
          </div>
        )}
      </section>
    );
  };
  
  return (
    <>
      {loading && <LoadingScreen />}
      
      <div className="bg-gray-50 min-h-screen p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">
          
          {/* HEADER PRINCIPAL */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800">Panel de Jefe de Negocios</h1>
                    <p className="text-gray-500">Gestión y aprobación de créditos</p>
                  </div>
                  <button onClick={handleReload} className="text-sm text-blue-600 hover:underline mt-2 md:mt-0">
                    🔄 Actualizar datos
                  </button>
              </div>
              
              {/* FORMULARIO DE BÚSQUEDA */}
              <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3 items-end">
                  
                  {/* BLOQUE DNI Y CHECKBOX GENERAL */}
                  <div className="flex-1 w-full">
                      <div className="flex justify-between items-center mb-1">
                          <label className="block text-sm font-medium text-gray-700">Filtrar por Cliente</label>
                          
                          {/* CHECKBOX "LISTAR GENERAL" */}
                          <label className="flex items-center gap-2 cursor-pointer text-sm text-blue-600 hover:text-blue-800 transition-colors">
                              <input 
                                  type="checkbox" 
                                  checked={isGeneral}
                                  onChange={handleGeneralChange}
                                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                              />
                              <span className="font-semibold select-none">Listar General</span>
                          </label>
                      </div>
                      
                      <div className="relative">
                        <input 
                            type="text" 
                            placeholder={isGeneral ? "Búsqueda general activada (Todo)" : "Ingrese DNI para buscar..."}
                            className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pl-10 shadow-sm transition-colors ${
                                isGeneral ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'
                            }`}
                            value={searchDni}
                            onChange={(e) => setSearchDni(e.target.value)}
                            disabled={isGeneral} // Deshabilitado si es búsqueda general
                        />
                        <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
                      </div>
                  </div>

                  {/* INPUT FECHA INICIO */}
                  <div className="w-full md:w-40">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                      <input 
                          type="date" 
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 shadow-sm"
                          value={fechaInicio}
                          onChange={(e) => setFechaInicio(e.target.value)}
                      />
                  </div>
                  
                  {/* INPUT FECHA FIN */}
                  <div className="w-full md:w-40">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                      <input 
                          type="date" 
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 shadow-sm"
                          value={fechaFin}
                          onChange={(e) => setFechaFin(e.target.value)}
                      />
                  </div>
                  
                  {/* BOTONES DE ACCIÓN */}
                  <div className="flex gap-2 w-full md:w-auto">
                    <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-bold transition-colors flex-1 md:flex-none shadow-md">
                        Buscar
                    </button>
                    {(searchDni || isGeneral || fechaInicio || fechaFin) && (
                        <button type="button" onClick={handleReload} className="bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 font-semibold transition-colors shadow-sm">
                            Limpiar
                        </button>
                    )}
                  </div>
              </form>
          </div>

          {/* LISTADOS DE EVALUACIONES */}
          {renderSection('Pendientes', pendientes, 'pendientes')}
          {renderSection('Aceptadas', aceptadas, 'aceptadas')}
          {renderSection('Rechazadas', rechazadas, 'rechazadas')}

        </div>
      </div>

      <RejectModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleReject}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
      />

      <style>{`
        .animate-fadeIn { animation: fadeIn 0.5s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </>
  );
};

export default EvaluacionesClientes;