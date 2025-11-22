import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import createEvaluacion from 'services/evaluacionClienteService';

// Importación de Formularios
import UsuarioForm from './components/formularios/UsuarioForm'; 
import CreditoForm from './components/formularios/CreditoForm';
import AvalForm from './components/formularios/AvalForm';
import UnidadFamiliarForm from './components/formularios/UnidadFamiliarForm';
import DatosNegocioForm from './components/formularios/DatosNegocioForm';
import GarantiasForm from './components/formularios/GarantiasForm';

// Componentes Compartidos
import LoadingScreen from 'components/Shared/LoadingScreen';
import CollapsibleSection from './components/CollapsibleSection'; 
import BuscarClientePorDni from 'components/Shared/Comboboxes/BuscarClientePorDni';
import { useToast } from 'components/Shared/Errors/ToastNotification';

const initialState = {
    usuario: {},
    credito: {},
    aval: {},
    unidadFamiliar: {
        numero_miembros: 0,
        tiene_deudas_ifis: 0,
    },
    datosNegocio: {
        otros_ingresos_monto: 0,
        ventas_diarias: 0,
        monto_ultima_compra: 0,
        detalleInventario: []
    },
    garantias: [] 
};

const NuevaEvaluacion = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [formData, setFormData] = useState(initialState);
    const [isClientLocked, setIsClientLocked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasAval, setHasAval] = useState(false);

    const handleClientFound = (data) => {
        const datos = data.datosCliente;
        
        const flattenedUsuario = {
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
            residePeru: datos.residePeru ? 1 : 0, 
            nivelEducativo: datos.nivelEducativo, 
            profesion: datos.profesion, 
            enfermedadesPreexistentes: datos.enfermedadesPreexistentes ? 1 : 0, 
            expuestaPoliticamente: datos.expuesta ? 1 : 0, 
            telefonoMovil: data.datosCliente.contactos[0]?.telefonoMovil, 
            telefonoFijo: data.datosCliente.contactos[0]?.telefonoFijo, 
            correo: data.datosCliente.contactos[0]?.correo, 
            direccionFiscal: data.datosCliente.direcciones[0]?.direccionFiscal, 
            direccionCorrespondencia: data.datosCliente.direcciones[0]?.direccionCorrespondencia, 
            departamento: data.datosCliente.direcciones[0]?.departamento, 
            provincia: data.datosCliente.direcciones[0]?.provincia, 
            distrito: data.datosCliente.direcciones[0]?.distrito, 
            tipoVivienda: data.datosCliente.direcciones[0]?.tipoVivienda, 
            tiempoResidencia: data.datosCliente.direcciones[0]?.tiempoResidencia, 
            referenciaDomicilio: data.datosCliente.direcciones[0]?.referenciaDomicilio, 
            centroLaboral: data.datosCliente.empleos[0]?.centroLaboral, 
            ingresoMensual: data.datosCliente.empleos[0]?.ingresoMensual, 
            inicioLaboral: data.datosCliente.empleos[0]?.inicioLaboral, 
            situacionLaboral: data.datosCliente.empleos[0]?.situacionLaboral, 
            ctaAhorros: data.datosCliente.cuentas_bancarias[0]?.ctaAhorros, 
            cci: data.datosCliente.cuentas_bancarias[0]?.cci, 
            entidadFinanciera: data.datosCliente.cuentas_bancarias[0]?.entidadFinanciera
        };

        const avalData = data.aval || {};
        
        setFormData(prev => ({ 
            ...prev, 
            usuario: flattenedUsuario, 
            aval: avalData,
            // Si recuperas garantías previas, descomenta esto:
            // garantias: data.garantias || []
        }));
        
        setIsClientLocked(true);

        if (avalData && Object.keys(avalData).length > 0 && avalData.dniAval) {
            setHasAval(true);
        } else {
            setHasAval(false);
        }
    };

    const handleClear = () => {
        setFormData(initialState);
        setIsClientLocked(false);
        setHasAval(false);
    };
    
    const handleInputChange = (e, formType) => {
        if (formType === null && e.target.name === 'garantias') {
             setFormData(prev => ({ ...prev, garantias: e.target.value }));
             return;
        }

        const { name, value } = e.target;

        if (name === 'garantias') {
            setFormData(prev => ({ ...prev, garantias: value }));
        } else {
            setFormData(prev => ({ ...prev, [formType]: { ...prev[formType], [name]: value } }));
        }
    };

    const validateForm = () => {
        console.log("---- VALIDANDO FORMULARIO ----");

        // 1. Validar Datos Texto Cliente
        if (!formData.usuario.dni || !formData.usuario.nombre || !formData.usuario.apellidoPaterno) {
            showToast('Faltan datos básicos del Cliente (Sección 1).', 'error');
            return false;
        }

        // 1.1. VALIDAR FIRMA CLIENTE (OBLIGATORIO)
        // Verificamos si es null, undefined o string vacío
        if (!formData.usuario.firmaCliente) {
            console.error("FALLO: No se ha cargado la firma del cliente.");
            showToast('⚠️ FALTA: Debe subir la imagen de la Firma del Cliente (Sección 1).', 'error');
            return false;
        }

        // 2. Validar Unidad Familiar
        if (Number(formData.unidadFamiliar.gastos_alimentacion) <= 0 || Number(formData.unidadFamiliar.gastos_servicios) <= 0) {
            showToast('Complete los Gastos Familiares (Sección 2). No pueden ser 0.', 'error');
            return false;
        }

        // 3. Validar Negocio
        if (!formData.datosNegocio.ventas_diarias || Number(formData.datosNegocio.ventas_diarias) <= 0) {
             showToast('Las Ventas Diarias deben ser mayor a 0 (Sección 3).', 'error');
             return false;
        }
        if (!formData.datosNegocio.monto_efectivo) {
            showToast('Ingrese el Efectivo Actual del negocio (Sección 3).', 'error');
            return false;
        }

        // 4. Validar Garantías
        if (!formData.garantias || formData.garantias.length === 0) {
            showToast('Debe agregar al menos una fila en la tabla de Garantías (botón azul +).', 'error');
            return false;
        }

        // Validar filas de garantías
        for (let i = 0; i < formData.garantias.length; i++) {
            const g = formData.garantias[i];
            if (!g.clase_garantia || !g.descripcion_bien || !g.valor_comercial) {
                showToast(`Faltan datos en la Garantía #${i + 1} (Clase, Descripción o Valor).`, 'error');
                return false;
            }
        }

        // 5. Validar Aval (SOLO SI EL CHECK ESTÁ ACTIVADO)
        if (hasAval) {
            // 5.1 Validar Datos Texto Aval
            if (!formData.aval.dniAval || !formData.aval.nombresAval) {
                showToast('Ha marcado que TIENE AVAL, complete DNI y Nombre (Sección 5).', 'error');
                return false;
            }

            // 5.2 VALIDAR FIRMA AVAL (OBLIGATORIO SI HAY AVAL)
            if (!formData.aval.firmaAval) {
                console.error("FALLO: No se ha cargado la firma del aval.");
                showToast('⚠️ FALTA: Debe subir la imagen de la Firma del Aval (Sección 5).', 'error');
                return false;
            }
        }

        // 6. Validar Crédito
        if (!formData.credito.montoPrestamo || !formData.credito.cuotas || !formData.credito.tasaInteres) {
            showToast('Complete los datos del Crédito Solicitado (Sección 6).', 'error');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            const dataToSend = {
                ...formData,
                aval: hasAval ? formData.aval : null
            };

            if (!hasAval) {
                delete dataToSend.aval;
            }
            
            console.log(">>> PAYLOAD:", JSON.stringify(dataToSend, null, 2));
            
            await createEvaluacion(dataToSend);
            
            showToast({ msg: 'Nueva evaluación creada con **éxito**!' }, 'success');
            navigate('/asesor/evaluaciones-enviadas');
            
        } catch (error) {
            console.error("Error al enviar:", error);
            showToast(error.message || 'Error al guardar la evaluación', 'error'); 
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
                    
                    <BuscarClientePorDni onClientFound={handleClientFound} onClear={handleClear} />

                    <form onSubmit={handleSubmit} className="space-y-6 mt-6">

                        {/* 1. CLIENTE */}
                        <CollapsibleSection title="1. Datos del Cliente">
                            <UsuarioForm formData={formData.usuario} handleInputChange={(e) => handleInputChange(e, 'usuario')} isDisabled={isClientLocked} />
                        </CollapsibleSection>

                        {/* 2. UNIDAD FAMILIAR */}
                        <CollapsibleSection title="2. Análisis de la Unidad Familiar">
                            <UnidadFamiliarForm 
                                formData={formData.unidadFamiliar} 
                                handleInputChange={(e) => handleInputChange(e, 'unidadFamiliar')} 
                            />
                        </CollapsibleSection>

                        {/* 3. DATOS DEL NEGOCIO */}
                        <CollapsibleSection title="3. Datos del Negocio y Balance">
                            <DatosNegocioForm 
                                formData={formData.datosNegocio} 
                                handleInputChange={(e) => handleInputChange(e, 'datosNegocio')} 
                            />
                        </CollapsibleSection>
                        
                        {/* 4. GARANTÍAS */}
                        <CollapsibleSection title="4. Garantías (Declaración Jurada / Reales)">
                            <GarantiasForm 
                                formData={formData.garantias} 
                                handleInputChange={(e) => handleInputChange(e, null)} 
                                isDisabled={isClientLocked} 
                            />
                        </CollapsibleSection>

                        {/* CHECKBOX AVAL */}
                        <div className="flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm transition-all hover:shadow-md">
                            <input 
                                id="checkAval"
                                type="checkbox" 
                                checked={hasAval}
                                onChange={(e) => setHasAval(e.target.checked)}
                                className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2 cursor-pointer"
                            />
                            <label htmlFor="checkAval" className="ml-3 text-lg font-medium text-gray-900 cursor-pointer select-none">
                                ¿Esta evaluación incluye un <strong>Aval</strong>?
                            </label>
                        </div>

                        {/* 5. AVAL */}
                        {hasAval && (
                            <div className="animate-fadeIn">
                                <CollapsibleSection title="5. Datos del Aval">
                                    <AvalForm 
                                        formData={formData.aval} 
                                        handleInputChange={(e) => handleInputChange(e, 'aval')} 
                                        isDisabled={isClientLocked} 
                                    />
                                </CollapsibleSection>
                            </div>
                        )}
                        
                        {/* 6. CREDITO */}
                        <CollapsibleSection title="6. Datos del Crédito">
                            <CreditoForm formData={formData.credito} handleInputChange={(e) => handleInputChange(e, 'credito')} />
                        </CollapsibleSection>

                        <div className="text-center pt-4 pb-10">
                            <button type="submit" className="w-full md:w-1/2 px-8 py-4 bg-green-600 text-white font-bold text-xl rounded-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                                Enviar Evaluación
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <style>{`
                .animate-fadeIn { animation: fadeIn 0.3s ease-in-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </>
    );
};

export default NuevaEvaluacion;