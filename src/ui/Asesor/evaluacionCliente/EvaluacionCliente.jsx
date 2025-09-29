// src/pages/NuevaEvaluacion.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClienteParaCorregir } from './services/evaluacionClienteService';
import createSolicitud from './services/evaluacionClienteService';
import { toast } from 'react-toastify';

import UsuarioForm from './components/Formularios/UsuarioForm'; 
import CreditoForm from './components/Formularios/CreditoForm';
import AvalForm from './components/Formularios/AvalForm';
import LoadingScreen from 'components/Shared/LoadingScreen';

import CollapsibleSection from './components/CollapsibleSection'; 
import ViewPdfModal from 'components/Shared/Modals/ViewPdfModal';  


// Componente reutilizable para la búsqueda (integrado aquí)
const ClienteSearch = ({ onClientFound, onClear }) => {
    const [dni, setDni] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (dni.length < 8) {
            toast.error('El DNI debe tener 8 o 9 dígitos.');
            return;
        }
        setLoading(true);
        try {
            const data = await getClienteParaCorregir(dni);
            toast.success('Cliente encontrado. Se han cargado sus datos.');
            onClientFound(data);
        } catch (error) {
            toast.info('Cliente no encontrado. Puede registrarlo como nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-10 p-6 bg-white rounded-lg shadow-md border border-yellow-500">
            <input
              type="number" value={dni} onChange={(e) => setDni(e.target.value)}
              placeholder="Buscar cliente existente por DNI"
              className="w-full p-3 border border-yellow-500 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            />
            <button type="button" onClick={handleSearch} disabled={loading} className="w-full sm:w-auto px-8 py-3 bg-red-700 text-white font-bold rounded-lg hover:bg-red-800 transition-colors disabled:opacity-50">
                {loading ? 'Buscando...' : 'Buscar'}
            </button>
            <button type="button" onClick={() => { setDni(''); onClear(); }} className="w-full sm:w-auto px-8 py-3 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors">
                Limpiar / Nuevo
            </button>
        </div>
    );
};

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
            await createSolicitud(formData, pdfFile);
            toast.success('Nueva evaluación creada con éxito!');
            navigate('/asesor/evaluaciones-enviadas');
        } catch (error) {
            toast.error(`Error: ${error.message}`);
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
                    
                    <ClienteSearch onClientFound={handleClientFound} onClear={handleClear} />

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