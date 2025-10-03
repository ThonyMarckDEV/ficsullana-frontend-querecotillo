// src/pages/NuevaEvaluacion.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import createEvaluacion from 'services/evaluacionClienteService';
import { toast } from 'react-toastify';

import UsuarioForm from './components/formularios/UsuarioForm'; 
import CreditoForm from './components/formularios/CreditoForm';
import AvalForm from './components/formularios/AvalForm';
import LoadingScreen from 'components/Shared/LoadingScreen';

import CollapsibleSection from './components/CollapsibleSection'; 
import ViewPdfModal from 'components/Shared/Modals/ViewPdfModal';  
import BuscarClientePorDni from 'components/Shared/Comboboxes/BuscarClientePorDni';

import { useToast } from 'components/Shared/Errors/ToastNotification';

const initialState = {
    usuario: {},
    credito: {},
    aval: {}
};


const NuevaEvaluacion = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(initialState);
    const [isClientLocked, setIsClientLocked] = useState(false);
    const [pdfFile, setPdfFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const { showToast } = useToast();
    
    // --- NUEVOS ESTADOS PARA EL MODAL ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);

    const handleClientFound = (data) => {
        const datos = data.datosCliente;
        const flattenedUsuario = {
            id: datos.id, nombre: datos.nombre, apellidoPaterno: datos.apellidoPaterno, apellidoMaterno: datos.apellidoMaterno, estadoCivil: datos.estadoCivil, sexo: datos.sexo, dni: datos.dni, fechaCaducidadDni: datos.fechaCaducidadDni, fechaNacimiento: datos.fechaNacimiento, nacionalidad: datos.nacionalidad, residePeru: datos.residePeru ? 1:0, nivelEducativo: datos.nivelEducativo, profesion: datos.profesion, enfermedadesPreexistentes: datos.enfermedadesPreexistentes ? 1:0, expuestaPoliticamente: datos.expuesta ? 1:0, 
            telefonoMovil: data.datosCliente.contactos[0]?.telefonoMovil, telefonoFijo: data.datosCliente.contactos[0]?.telefonoFijo, correo: data.datosCliente.contactos[0]?.correo, 
            direccionFiscal: data.datosCliente.direcciones[0]?.direccionFiscal, direccionCorrespondencia: data.datosCliente.direcciones[0]?.direccionCorrespondencia, departamento: data.datosCliente.direcciones[0]?.departamento, provincia: data.datosCliente.direcciones[0]?.provincia, distrito: data.datosCliente.direcciones[0]?.distrito, tipoVivienda: data.datosCliente.direcciones[0]?.tipoVivienda, tiempoResidencia: data.datosCliente.direcciones[0]?.tiempoResidencia, referenciaDomicilio: data.datosCliente.direcciones[0]?.referenciaDomicilio, 
            centroLaboral: data.datosCliente.empleos[0]?.centroLaboral, ingresoMensual: data.datosCliente.empleos[0]?.ingresoMensual, inicioLaboral: data.datosCliente.empleos[0]?.inicioLaboral, situacionLaboral: data.datosCliente.empleos[0]?.situacionLaboral, 
            ctaAhorros: data.datosCliente.cuentas_bancarias[0]?.ctaAhorros, cci: data.datosCliente.cuentas_bancarias[0]?.cci, entidadFinanciera: data.datosCliente.cuentas_bancarias[0]?.entidadFinanciera
        };
        setFormData({ ...initialState, usuario: flattenedUsuario, aval: data.aval || {} });
        setIsClientLocked(true);
    };


    const handleClear = () => {
        setFormData(initialState);
        setIsClientLocked(false);
        setPdfFile(null);
        if(pdfPreviewUrl) {
            URL.revokeObjectURL(pdfPreviewUrl); // Libera memoria
            setPdfPreviewUrl(null);
        }
    };
    
    const handleInputChange = (e, formType) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [formType]: { ...prev[formType], [name]: value } }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
            // Libera la URL anterior si existe para evitar fugas de memoria
            if (pdfPreviewUrl) {
                URL.revokeObjectURL(pdfPreviewUrl);
            }
            setPdfPreviewUrl(URL.createObjectURL(file));
        } else {
            toast.error('Por favor, suba un archivo PDF válido.');
            setPdfFile(null);
            setPdfPreviewUrl(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!pdfFile) {
            toast.error('Por favor, adjunte el archivo PDF de la evaluación.');
            return;
        }
        setIsLoading(true);
       try {
            await createEvaluacion(formData, pdfFile);
            
            // Éxito: Usamos showToast
            showToast({ msg: 'Nueva evaluación creada con **éxito**!' }, 'success');
            navigate('/asesor/evaluaciones-enviadas');
            
        } catch (error) {
            // Fallo: 'error' contiene el objeto JSON del backend que queremos mostrar
            showToast(error, 'error'); 
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {isLoading && <LoadingScreen />}
            <div className="bg-gray-50 min-h-screen p-4 sm:p-8">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-800 mb-8 border-b pb-4">Registrar Nueva Evaluación</h1>
                    
                   {/* AQUI USAMOS EL NUEVO COMPONENTE REUTILIZABLE */}
                    <BuscarClientePorDni onClientFound={handleClientFound} onClear={handleClear} />

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <CollapsibleSection title="1. Datos del Cliente">
                            <UsuarioForm formData={formData.usuario} handleInputChange={(e) => handleInputChange(e, 'usuario')} isDisabled={isClientLocked} />
                        </CollapsibleSection>

                        <CollapsibleSection title="2. Datos del Aval (Opcional)">
                          <AvalForm formData={formData.aval} handleInputChange={(e) => handleInputChange(e, 'aval')} isDisabled={isClientLocked} />
                        </CollapsibleSection>
                        
                        <CollapsibleSection title="3. Datos del Crédito">
                            <CreditoForm formData={formData.credito} handleInputChange={(e) => handleInputChange(e, 'credito')} />
                        </CollapsibleSection>

                        <CollapsibleSection title="4. Adjuntar Documento">
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileChange}
                                className="w-full p-2 border border-yellow-500 rounded file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                                required
                            />
                            {pdfFile && (
                                <button
                                  type="button"
                                  onClick={() => setIsModalOpen(true)}
                                  className="mt-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  Ver PDF Adjuntado
                                </button>
                            )}
                        </CollapsibleSection>

                        <div className="text-center pt-4">
                            <button type="submit" className="w-full md:w-1/2 px-8 py-4 bg-green-600 text-white font-bold text-xl rounded-lg hover:bg-green-700 transition-colors shadow-lg">
                                Enviar Evaluación
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            
            <ViewPdfModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                pdfUrl={pdfPreviewUrl} 
            />
        </>
    );
};

export default NuevaEvaluacion;