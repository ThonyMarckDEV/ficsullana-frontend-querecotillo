// src/pages/CorregirEvaluacion.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClienteParaCorregir, updateEvaluacion } from './services/evaluacionClienteService';

// Importa tus componentes de formulario
import UsuarioForm from './components/Formularios/UsuarioForm'; 
import CreditoForm from './components/Formularios/CreditoForm';
import AvalForm from './components/Formularios/AvalForm';
import LoadingScreen from '../../components/Shared/LoadingScreen';

const CorregirEvaluacion = () => {
  const { dniCliente } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState(null);
  const [evaluacionId, setEvaluacionId] = useState(null);
  const [showAval, setShowAval] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const data = await getClienteParaCorregir(dniCliente);
        
        // Aplanamos la data para que coincida con la estructura de los formularios
        const initialFormData = {
          usuario: { ...data.usuario, ...data.usuario.contactos[0], ...data.usuario.direcciones[0], ...data.usuario.empleos[0], ...data.usuario.cuentas_bancarias[0] },
          credito: data.evaluacion,
          aval: data.aval || {},
        };

        setFormData(initialFormData);
        setEvaluacionId(data.evaluacion.id);
        setShowAval(!!data.aval); // Muestra el form de aval si existe
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, [dniCliente]);
  
  // Manejador genérico para todos los inputs anidados
  const handleInputChange = (e, formType) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [formType]: {
        ...prev[formType],
        [name]: value,
      },
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await updateEvaluacion(evaluacionId, {
        ...formData,
        aval: showAval ? formData.aval : null, // Solo envía el aval si el form está visible
      });
      alert('Evaluación actualizada con éxito');
      navigate('/asesor/evaluaciones'); // Redirige al listado
    } catch (err) {
      setError(err.message);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>;

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 border-b pb-4">
          Corregir Evaluación del Cliente: {dniCliente}
        </h1>

        <form onSubmit={handleSubmit}>
          {/* ---- Sección de Datos del Usuario ---- */}
          <div className="p-6 bg-white rounded-lg shadow-md border border-yellow-500 mb-8">
            <h2 className="text-2xl font-semibold text-red-700 mb-4">1. Datos del Cliente</h2>
            {formData && <UsuarioForm formData={formData.usuario} handleInputChange={(e) => handleInputChange(e, 'usuario')} />}
          </div>

          {/* ---- Sección de Datos del Crédito ---- */}
          <div className="p-6 bg-white rounded-lg shadow-md border border-yellow-500 mb-8">
            <h2 className="text-2xl font-semibold text-red-700 mb-4">2. Datos del Crédito</h2>
            {formData && <CreditoForm formData={formData.credito} handleInputChange={(e) => handleInputChange(e, 'credito')} />}
          </div>

          {/* ---- Sección de Datos del Aval ---- */}
          <div className="p-6 bg-white rounded-lg shadow-md border border-yellow-500 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-red-700">3. Datos del Aval</h2>
              <button
                type="button"
                onClick={() => setShowAval(!showAval)}
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
              >
                {showAval ? 'Quitar Aval' : 'Añadir/Editar Aval'}
              </button>
            </div>
            {showAval && formData && <AvalForm formData={formData.aval} handleInputChange={(e) => handleInputChange(e, 'aval')} />}
          </div>
          
          {/* ---- Botón de Envío ---- */}
          <div className="text-center mt-10">
            <button
              type="submit"
              className="w-full md:w-1/2 px-8 py-4 bg-green-600 text-white font-bold text-xl rounded-lg hover:bg-green-700 transition-colors shadow-lg"
            >
              Re-enviar Evaluación Corregida
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CorregirEvaluacion;