// src/pages/EvaluacionesEnviadas.jsx (conectado al servicio API)

import React, { useState, useMemo, useEffect } from 'react';
import LoadingScreen from 'components/Shared/LoadingScreen';
import Pagination from './components/Pagination';
import { EvaluacionCard } from './components/EvaluacionCard';
import { getEvaluaciones } from 'services/evaluacionClienteService';
import jwtUtils from 'utilities/jwtUtils'; 

const ITEMS_PER_PAGE = 3;

const MisEvaluaciones = () => {
  
  const token = jwtUtils.getAccessTokenFromCookie();
  const dniCliente = jwtUtils.getDNI(token);

  const [evaluaciones, setEvaluaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pages, setPages] = useState({ pendientes: 1, aceptadas: 1, rechazadas: 1 });

  // 3. useEffect ahora llama al servicio real en lugar de usar datos de prueba
  useEffect(() => {
    const fetchEvaluaciones = async () => {
      // Validamos que tengamos el DNI antes de hacer la llamada
      if (!dniCliente) {
        setError("No se pudo obtener la información del usuario para buscar evaluaciones.");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        // Usamos la función importada del servicio
        const data = await getEvaluaciones(dniCliente);
        setEvaluaciones(data || []);
      } catch (err) {
        // El error ya viene formateado desde handleResponse
        setError(err.message || 'Ocurrió un error al cargar tus evaluaciones.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluaciones();
  }, [dniCliente]); // Se ejecuta cada vez que el DNI del usuario cambie

  // El resto del componente no necesita cambios...
  
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
            {currentData.map(eva => <EvaluacionCard key={eva.id} evaluacion={eva} />)}
            {totalPages > 1 && (
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            )}
          </>
        ) : (
          <p className="text-gray-500">No tienes evaluaciones en este estado.</p>
        )}
      </section>
    );
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 border-b pb-4">Mis Evaluaciones</h1>

        {error && <p className="text-center p-10 text-red-500 font-semibold">{error}</p>}

        {!loading && !error && evaluaciones.length === 0 && (
          <p className="text-center text-gray-500 mt-16">Aún no tienes ninguna evaluación.</p>
        )}

        {!error && evaluaciones.length > 0 && (
          <div>
            {renderSection('Pendientes', pendientes, 'pendientes')}
            {renderSection('Aceptadas', aceptadas, 'aceptadas')}
            {renderSection('Rechazadas', rechazadas, 'rechazadas')}
          </div>
        )}
      </div>
    </div>
  );
};

export default MisEvaluaciones;