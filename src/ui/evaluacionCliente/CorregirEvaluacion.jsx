// src/pages/CorregirEvaluacion.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { updateEvaluacion } from 'services/evaluacionClienteService';
import {showClientByDNI} from 'services/clienteService';

import UsuarioForm from './components/formularios/UsuarioForm'; 
import CreditoForm from './components/formularios/CreditoForm';
import AvalForm from './components/formularios/AvalForm';
import LoadingScreen from 'components/Shared/LoadingScreen';
import { toast } from 'react-toastify';

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
        setLoading(true);
        const data = await showClientByDNI(dniCliente);
        
        const datos = data.datosCliente;
        const contacto = data.datosCliente.contactos[0] || {};
        const direccion = data.datosCliente.direcciones[0] || {};
        const empleo = data.datosCliente.empleos[0] || {};
        const cuenta = data.datosCliente.cuentas_bancarias[0] || {};

        const initialFormData = {
          usuario: {
            // Datos de la tabla 'datos' (incluyendo el ID correcto)
            id: datos.id,
            nombre: datos.nombre,
            apellidoPaterno: datos.apellidoPaterno,
            apellidoMaterno: datos.apellidoMaterno,
            estadoCivil: datos.estadoCivil,
            sexo: datos.sexo,
            dni: datos.dni,
            fechaCaducidadDni: datos.fechaCaducidadDni,
            fechaNacimiento: datos.fechaNacimiento,
            nacionalidad: datos.nacionalidad,
            residePeru: datos.residePeru,
            nivelEducativo: datos.nivelEducativo,
            profesion: datos.profesion,
            enfermedadesPreexistentes: datos.enfermedadesPreexistentes,
            expuestaPoliticamente: datos.expuestaPoliticamente,

            // Datos de la tabla 'contactos'
            telefonoMovil: contacto.telefonoMovil,
            telefonoFijo: contacto.telefonoFijo,
            correo: contacto.correo,

            // Datos de la tabla 'direcciones'
            direccionFiscal: direccion.direccionFiscal,
            direccionCorrespondencia: direccion.direccionCorrespondencia,
            departamento: direccion.departamento,
            provincia: direccion.provincia,
            distrito: direccion.distrito,
            tipoVivienda: direccion.tipoVivienda,
            tiempoResidencia: direccion.tiempoResidencia,
            referenciaDomicilio: direccion.referenciaDomicilio,

            // Datos de la tabla 'empleos'
            centroLaboral: empleo.centroLaboral,
            ingresoMensual: empleo.ingresoMensual,
            inicioLaboral: empleo.inicioLaboral,
            situacionLaboral: empleo.situacionLaboral,

            // Datos de la tabla 'cuentas_bancarias'
            ctaAhorros: cuenta.ctaAhorros,
            cci: cuenta.cci,
            entidadFinanciera: cuenta.entidadFinanciera,
          },
          credito: data.evaluacion,
          aval: data.aval || {},
        };

        setFormData(initialFormData);
        setEvaluacionId(data.evaluacion.id);
        setShowAval(!!data.aval);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, [dniCliente]);
  
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
        // Usamos el formData directamente, ya que ahora tiene la estructura correcta
      await updateEvaluacion(evaluacionId, {
        ...formData,
        aval: showAval ? formData.aval : null,
      });
      navigate('/asesor/evaluaciones-enviadas');
      toast.success('Evaluacion Actualizada con Exito!!');
    } catch (err) {
      setError(err.message);
      toast.error(`Error: ${err.message}`);
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
          {/* ... El resto del JSX (los formularios y botones) no necesita cambios ... */}
          <div className="p-6 bg-white rounded-lg shadow-md border border-yellow-500 mb-8">
            <h2 className="text-2xl font-semibold text-red-700 mb-4">1. Datos del Cliente</h2>
            {formData && <UsuarioForm formData={formData.usuario} handleInputChange={(e) => handleInputChange(e, 'usuario')} />}
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md border border-yellow-500 mb-8">
            <h2 className="text-2xl font-semibold text-red-700 mb-4">2. Datos del Crédito</h2>
            {formData && <CreditoForm formData={formData.credito} handleInputChange={(e) => handleInputChange(e, 'credito')} />}
          </div>
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