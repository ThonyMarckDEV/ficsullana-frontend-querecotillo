// src/components/EvaluacionCliente.jsx (actualizado)
import React, { useState } from 'react';
import ViewPdfModal from '../../components/Shared/Modals/ViewPdfModal';
import UsuarioForm from './components/Formularios/UsuarioForm';
import CreditoForm from './components/Formularios/CreditoForm';
import AvalForm from './components/Formularios/AvalForm';
import CollapsibleSection from './components/CollapsibleSection';
import createSolicitud from './services/evaluacionClienteService';
import LoadingScreen from '../../components/Shared/LoadingScreen';
import { toast, ToastContainer } from 'react-toastify';

const EvaluacionCliente = () => {
  const initialFormData = {
    //CAMPOS USUARIO
    dni: '',
    fechaCaducidadDni:'',
    apellidoPaterno: '',
    apellidoMaterno: '',
    nombre: '',
    fechaNacimiento: '',
    sexo: '',
    estadoCivil: '',
    nacionalidad: '',
    residePeru: '',
    nivelEducativo: '',
    profesion: '',
    telefonoFijo: '',
    telefonoMovil: '',
    correo: '',
    enfermedadesPreexistentes: '',
    ctaAhorros: '',
    entidadFinanciera: '',
    direccionFiscal: '',
    direccionCorrespondencia: '',
    tipoVivienda: '',
    tiempoResidencia: '',
    referenciaDomicilio: '',
    centroLaboral: '',
    ingresoMensual: '',
    inicioLaboral: '',
    situacionLaboral: '',
    provincia: '',
    departamento: '',
    distrito: '',
    expuestaPoliticamente: '',
    
    //CAMPOS CREDITO
    producto: '',
    montoPrestamo: '',
    tasaInteres: '',
    cuotas: '',
    modalidadCredito: '',
    destinoCredito: '',
    periodoCredito: '',

    //CAMPOS AVAL
    dniAval: '',
    apellidoPaternoAval: '',
    apellidoMaternoAval: '',
    nombresAval: '',
    telefonoFijoAval: '',
    telefonoMovilAval: '',
    direccionAval: '',
    referenciaDomicilioAval: '',
    provinciaAval: '',
    departamentoAval: '',
    distritoAval: '',
    relacionAval: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [pdfFile, setPdfFile] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [tieneAval, setTieneAval] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setPdfUrl(URL.createObjectURL(file));
    } else {
      alert('Por favor, suba un archivo PDF válido.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pdfFile) {
      alert('La solicitud de préstamo en PDF es obligatoria.');
      return;
    }
    setIsLoading(true);
    // Preparar datos anidados por sección para envío al backend
    const dataToSend = {
      usuario: {
        dni: formData.dni,
        fechaCaducidadDni:formData.fechaCaducidadDni,
        apellidoPaterno: formData.apellidoPaterno,
        apellidoMaterno: formData.apellidoMaterno,
        nombre: formData.nombre,
        fechaNacimiento: formData.fechaNacimiento,
        sexo: formData.sexo,
        estadoCivil: formData.estadoCivil,
        nacionalidad: formData.nacionalidad,
        residePeru: formData.residePeru,
        nivelEducativo: formData.nivelEducativo,
        profesion: formData.profesion,
        telefonoFijo: formData.telefonoFijo,
        telefonoMovil: formData.telefonoMovil,
        correo: formData.correo,
        enfermedadesPreexistentes: formData.enfermedadesPreexistentes,
        ctaAhorros: formData.ctaAhorros,
        entidadFinanciera: formData.entidadFinanciera,
        direccionFiscal: formData.direccionFiscal,
        direccionCorrespondencia: formData.direccionCorrespondencia,
        tipoVivienda: formData.tipoVivienda,
        tiempoResidencia: formData.tiempoResidencia,
        referenciaDomicilio: formData.referenciaDomicilio,
        centroLaboral: formData.centroLaboral,
        ingresoMensual: formData.ingresoMensual,
        inicioLaboral: formData.inicioLaboral,
        situacionLaboral: formData.situacionLaboral,
        provincia: formData.provincia,
        departamento: formData.departamento,
        distrito: formData.distrito,
        expuestaPoliticamente: formData.expuestaPoliticamente
      },
      credito: {
        producto: formData.producto,
        montoPrestamo: formData.montoPrestamo,
        tasaInteres: formData.tasaInteres,
        cuotas: formData.cuotas,
        modalidadCredito: formData.modalidadCredito,
        destinoCredito: formData.destinoCredito,
        periodoCredito: formData.periodoCredito,
      },
    };
    
    // Incluir aval solo si tieneAval es true
    if (tieneAval) {
      dataToSend.aval = {
        dniAval: formData.dniAval,
        apellidoPaternoAval: formData.apellidoPaternoAval,
        apellidoMaternoAval: formData.apellidoMaternoAval,
        nombresAval: formData.nombresAval,
        telefonoFijoAval: formData.telefonoFijoAval,
        telefonoMovilAval: formData.telefonoMovilAval,
        direccionAval: formData.direccionAval,
        referenciaDomicilioAval: formData.referenciaDomicilioAval,
        provinciaAval: formData.provinciaAval,
        departamentoAval: formData.departamentoAval,
        distritoAval: formData.distritoAval,
        relacionClienteAval: formData.relacionClienteAval,
      };
    }
    
    try {
      const result = await createSolicitud(dataToSend, pdfFile);
      console.log('Respuesta del backend:', result);
      toast.success('Datos Enviados Correctamente');
      // Limpiar el formulario si es exitoso
      setFormData(initialFormData);
      setPdfFile(null);
      setPdfUrl(null);
      setTieneAval(false);
    } catch (error) {
      console.error('Error al enviar la solicitud:', error);
      toast.error(error.message || 'Error al enviar la solicitud');
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = () => {
    if (pdfUrl) setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  return (
    <div className="flex-1 p-6 bg-white relative">
      {isLoading && <LoadingScreen />}
      <h1 className="text-2xl font-bold text-red-800 mb-6">Evaluacion Cliente</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <CollapsibleSection title="Información del Usuario">
          <UsuarioForm formData={formData} handleInputChange={handleInputChange} />
        </CollapsibleSection>

        <CollapsibleSection title="Información del Crédito">
          <CreditoForm formData={formData} handleInputChange={handleInputChange} />
        </CollapsibleSection>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="tieneAval"
            checked={tieneAval}
            onChange={(e) => setTieneAval(e.target.checked)}
            className="h-4 w-4 text-red-600 border-yellow-500 rounded"
          />
          <label htmlFor="tieneAval" className="text-red-700 font-semibold">Tiene Aval</label>
        </div>
        
        {tieneAval && (
          <CollapsibleSection title="Información del Aval">
            <AvalForm formData={formData} handleInputChange={handleInputChange} />
          </CollapsibleSection>
        )}
        
        <CollapsibleSection title="Documentos">
          <div>
            <label className="block text-red-700 font-semibold">Solicitud de Préstamo (PDF Obligatorio)</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="w-full p-2 border border-yellow-500 rounded"
              required
            />
          </div>
          
          {pdfFile && (
            <button
              type="button"
              onClick={openModal}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 mt-4"
            >
              Ver PDF
            </button>
          )}
        </CollapsibleSection>
        
        <button
          type="submit"
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          disabled={isLoading}
        >
          Enviar Solicitud
        </button>
      </form>
      
      <ViewPdfModal isOpen={modalOpen} onClose={closeModal} pdfUrl={pdfUrl} />
      <ToastContainer/>
    </div>
  );
};

export default EvaluacionCliente;