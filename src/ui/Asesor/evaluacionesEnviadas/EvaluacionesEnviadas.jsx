// src/pages/EvaluacionesEnviadas.jsx (o donde lo tengas)
import React, { useState, useMemo } from 'react';
import { getEvaluaciones } from 'services/evaluacionClienteService'; 
import LoadingScreen from 'components/Shared/LoadingScreen';
import Pagination from './components/Pagination';       
import { EvaluacionCard } from './components/EvaluacionCard';

const ITEMS_PER_PAGE = 3; // Define cuántos items por página

const EvaluacionesEnviadas = () => {
  // Estados para la búsqueda y los datos
  const [dni, setDni] = useState('');
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Estados para la paginación de cada sección
  const [pages, setPages] = useState({ pendientes: 1, aceptadas: 1, rechazadas: 1 });

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setHasSearched(true);
    setEvaluaciones([]);
    setPages({ pendientes: 1, aceptadas: 1, rechazadas: 1 }); // Resetea las páginas
    try {
      const data = await getEvaluaciones(dni);
      setEvaluaciones(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Usamos useMemo para no recalcular esto en cada render
  const { pendientes, aceptadas, rechazadas } = useMemo(() => ({
    pendientes: evaluaciones.filter(e => e.estado === 0),
    aceptadas: evaluaciones.filter(e => e.estado === 1),
    rechazadas: evaluaciones.filter(e => e.estado === 2),
  }), [evaluaciones]);

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
            {currentData.map(eva => <EvaluacionCard key={eva.id} evaluacion={eva} />)}
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
          <h1 className="text-4xl font-bold text-gray-800 mb-8 border-b pb-4">Buscar Evaluaciones por Cliente</h1>
          
          {/* Formulario de Búsqueda */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 mb-10 p-6 bg-white rounded-lg shadow-md border border-yellow-500">
            <input
              type="number"
              value={dni}
              onChange={(e) => setDni(e.target.value.slice(0,9))}
              placeholder="Ingrese DNI del cliente ( 8 a max. 9 dígitos)"
              className="w-full p-3 border border-yellow-500 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            />
            <button type="submit" className="w-full sm:w-auto px-8 py-3 bg-red-700 text-white font-bold rounded-lg hover:bg-red-800 transition-colors">
              Buscar
            </button>
          </form>

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
    </>
  );
};

export default EvaluacionesEnviadas;
