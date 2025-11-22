// src/pages/NuevaEvaluacion.jsx
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
    // NUEVO ESTADO PARA GARANTÍAS (Array de objetos)
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
            // Si la respuesta incluyera garantías previas, las cargaríamos aquí
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
        const { name, value } = e.target;
        // Caso especial para 'garantias' que es un array directo en el root de formData (si así lo decidimos)
        // Ojo: En el state 'garantias' está en el primer nivel, así que formType no aplica igual si se pasa directo.
        // Pero como en GarantiasForm llamamos con name='garantias', manejémoslo:
        
        if (name === 'garantias') {
            // Actualización directa del array de garantías
            setFormData(prev => ({ ...prev, garantias: value }));
        } else {
            // Actualización de objetos anidados (usuario, credito, etc)
            setFormData(prev => ({ ...prev, [formType]: { ...prev[formType], [name]: value } }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // Preparar payload
            const dataToSend = {
                ...formData,
                aval: hasAval ? formData.aval : {} 
            };

            // ---------------------------------------------------------
            // IMPRESIÓN EN CONSOLA ANTES DE ENVIAR (Solicitado)
            // ---------------------------------------------------------
            console.log(">>> JSON A ENVIAR AL BACKEND:", JSON.stringify(dataToSend, null, 2));
            
            await createEvaluacion(dataToSend);
            
            showToast({ msg: 'Nueva evaluación creada con **éxito**!' }, 'success');
            navigate('/asesor/evaluaciones-enviadas');
            
        } catch (error) {
            console.error("Error al enviar:", error);
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
                        
                        {/* 4. GARANTÍAS (NUEVA SECCIÓN) */}
                        <CollapsibleSection title="4. Garantías (Declaración Jurada / Reales)">
                            <GarantiasForm 
                                formData={formData.garantias} 
                                // Nota: Pasamos null como formType o manejamos la lógica en handleInputChange
                                handleInputChange={(e) => handleInputChange(e, null)} 
                                isDisabled={isClientLocked} 
                            />
                        </CollapsibleSection>

                        {/* CHECKBOX AVAL */}
                        <div className="flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                            <input 
                                id="checkAval"
                                type="checkbox" 
                                checked={hasAval}
                                onChange={(e) => setHasAval(e.target.checked)}
                                className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                            />
                            <label htmlFor="checkAval" className="ml-3 text-lg font-medium text-gray-900 cursor-pointer select-none">
                                ¿Esta evaluación incluye un <strong>Aval</strong>?
                            </label>
                        </div>

                        {/* 5. AVAL (Condicional) */}
                        {hasAval && (
                            <CollapsibleSection title="5. Datos del Aval">
                                <AvalForm 
                                    formData={formData.aval} 
                                    handleInputChange={(e) => handleInputChange(e, 'aval')} 
                                    isDisabled={isClientLocked} 
                                />
                            </CollapsibleSection>
                        )}
                        
                        {/* 6. CREDITO */}
                        <CollapsibleSection title="6. Datos del Crédito">
                            <CreditoForm formData={formData.credito} handleInputChange={(e) => handleInputChange(e, 'credito')} />
                        </CollapsibleSection>

                        <div className="text-center pt-4">
                            <button type="submit" className="w-full md:w-1/2 px-8 py-4 bg-green-600 text-white font-bold text-xl rounded-lg hover:bg-green-700 transition-colors shadow-lg">
                                Enviar Evaluación
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default NuevaEvaluacion;