import React, { useState, useEffect, useMemo } from 'react';
import { getEvaluaciones } from 'services/evaluacionClienteService'; 
import LoadingScreen from 'components/Shared/LoadingScreen';
import Pagination from './components/Pagination'; 
import { EvaluacionCard } from './components/EvaluacionCard'; // Asegúrate que la ruta sea correcta
import { toast } from 'react-toastify';

const ITEMS_PER_PAGE = 3;

const EvaluacionesClientes = () => {
  // --- ESTADOS ---
  const [allEvaluaciones, setAllEvaluaciones] = useState([]); 
  const [searchDni, setSearchDni] = useState(''); 
  const [loading, setLoading] = useState(false);
  
  // Paginación independiente por estado
  const [pages, setPages] = useState({ pendientes: 1, aceptadas: 1, rechazadas: 1 });

  // --- CARGA INICIAL Y BÚSQUEDA ---
  useEffect(() => {
    fetchEvaluaciones();
  }, []);

  const fetchEvaluaciones = async (dniFilter = '') => {
    setLoading(true);
    try {
      // Asumimos que getEvaluaciones maneja el filtro si se le pasa, 
      // o trae todo si se pasa string vacío.
      const data = await getEvaluaciones(dniFilter);
      setAllEvaluaciones(data || []);
      
      // Reiniciar páginas a 1 cuando se actualizan los datos
      setPages({ pendientes: 1, aceptadas: 1, rechazadas: 1 });
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar evaluaciones.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEvaluaciones(searchDni);
  };

  const handleReload = () => {
    setSearchDni('');
    fetchEvaluaciones(''); 
  };

  // --- CLASIFICACIÓN DE DATOS (MEMOIZED) ---
  const { pendientes, aceptadas, rechazadas } = useMemo(() => ({
    pendientes: allEvaluaciones.filter(e => e.estado === 0),
    aceptadas: allEvaluaciones.filter(e => e.estado === 1),
    rechazadas: allEvaluaciones.filter(e => e.estado === 2),
  }), [allEvaluaciones]);

  // --- RENDERIZADO DE SECCIONES ---
  const renderSection = (title, data, type) => {
    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
    const currentPage = pages[type];
    
    // Lógica de corte para paginación
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentData = data.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handlePageChange = (page) => {
      setPages(prev => ({ ...prev, [type]: page }));
    };

    const colorMap = { 
      'Pendientes': 'text-yellow-600', 
      'Aceptadas': 'text-green-600', 
      'Rechazadas': 'text-red-600' 
    };

    return (
      <section className="mb-12 animate-fadeIn">
        <div className="flex items-center gap-2 mb-6 border-b pb-2">
            <h2 className={`text-2xl font-bold ${colorMap[title]}`}>{title}</h2>
            <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-bold shadow-sm">
              {data.length}
            </span>
        </div>

        {currentData.length > 0 ? (
          <>
            <div className="space-y-6">
              {currentData.map(eva => (
                // Usamos la Card simple que solicitaste
                <EvaluacionCard key={eva.id} evaluacion={eva} />
              ))}
            </div>
            
            <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={handlePageChange} 
            />
          </>
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
          
          {/* HEADER Y BUSCADOR */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800">Evaluaciones de Clientes</h1>
                    <p className="text-gray-500">Listado general de solicitudes</p>
                  </div>
                  <button onClick={handleReload} className="text-sm text-blue-600 hover:underline mt-2 md:mt-0 flex items-center gap-1">
                    🔄 Recargar lista completa
                  </button>
              </div>
              
              <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3 items-end">
                  <div className="flex-1 w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Buscar por DNI</label>
                      <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Ingrese DNI..." 
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pl-10 shadow-sm"
                            value={searchDni}
                            onChange={(e) => setSearchDni(e.target.value)}
                        />
                        <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
                      </div>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-bold transition-colors flex-1 md:flex-none shadow-md">
                        Buscar
                    </button>
                    {searchDni && (
                        <button type="button" onClick={handleReload} className="bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 font-semibold transition-colors">
                            Limpiar
                        </button>
                    )}
                  </div>
              </form>
          </div>

          {/* LISTADOS POR ESTADO */}
          {renderSection('Pendientes', pendientes, 'pendientes')}
          {renderSection('Aceptadas', aceptadas, 'aceptadas')}
          {renderSection('Rechazadas', rechazadas, 'rechazadas')}

        </div>
      </div>

      <style>{`
        .animate-fadeIn { animation: fadeIn 0.5s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </>
  );
};

export default EvaluacionesClientes;