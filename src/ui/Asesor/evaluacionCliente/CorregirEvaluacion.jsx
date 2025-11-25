import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { updateEvaluacion, getEvaluacionDetail } from 'services/evaluacionClienteService';

// Importamos TODOS los formularios necesarios
import UsuarioForm from './components/formularios/UsuarioForm'; 
import DatosNegocioForm from './components/formularios/DatosNegocioForm'; // <--- Agregado
import UnidadFamiliarForm from './components/formularios/UnidadFamiliarForm'; // <--- Agregado
import GarantiasForm from './components/formularios/GarantiasForm'; // <--- Agregado
import AvalForm from './components/formularios/AvalForm';

import LoadingScreen from 'components/Shared/LoadingScreen';
import { toast } from 'react-toastify';

const CorregirEvaluacion = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState(null);
  const [showAval, setShowAval] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- WHITELISTS PARA LIMPIEZA ---
  const BASE_CREDITO_WHITELIST = [
    'producto', 'montoPrestamo', 'tasaInteres', 'cuotas', 
    'modalidadCredito', 'destinoCredito', 'periodoCredito', 'observaciones'
  ];

  const DATOS_NEGOCIO_WHITELIST = [
    'otros_ingresos_sector', 'otros_ingresos_tiempo', 'riesgo_sector',
    'otros_ingresos_monto', 'otros_ingresos_frecuencia', 'depende_otros_ingresos',
    'sustento_otros_ingresos', 'tiene_medios_pago', 'descripcion_medios_pago',
    'zona_ubicacion', 'modalidad_atencion', 'restriccion_actual',
    'ventas_diarias', 'cuenta_con_ahorros', 'ahorros_sustentables',
    'fecha_ultima_compra', 'monto_ultima_compra', 'variacion_compras_mes_anterior',
    'cuentas_por_cobrar_monto', 'cuentas_por_cobrar_num_clientes', 'tiempo_recuperacion',
    'foto_apuntes_cobranza', 'detalle_activo_fijo', 'valor_actual_activo_fijo',
    'foto_activo_fijo', 'dias_efectivo', 'monto_efectivo',
    'pagos_realizados_mes', 'gastos_administrativos_fijos', 'gastos_operativos_variables',
    'imprevistos_mermas', 'promedio_ventas_pdt', 'contribucion_essalud_anual',
    'referencias_comerciales'
  ];

  const UNIDAD_FAMILIAR_WHITELIST = [
    'numero_miembros', 'gastos_alimentacion', 'gastos_educacion',
    'detalle_educacion', 'gastos_servicios', 'gastos_movilidad',
    'tiene_deudas_ifis', 'ifi_1_nombre', 'ifi_1_cuota',
    'ifi_2_nombre', 'ifi_2_cuota', 'ifi_3_nombre', 'ifi_3_cuota',
    'gastos_salud', 'frecuencia_salud', 'detalle_salud',
    'total_gastos_mensuales'
  ];

  const extractSection = (data, whitelist) => {
    const section = {};
    whitelist.forEach(field => {
      if (data.hasOwnProperty(field)) {
        section[field] = data[field];
      }
    });
    return section;
  };

  useEffect(() => {
    const cargarDatosEvaluacion = async () => {
      try {
        setLoading(true);
        const evaluacionData = await getEvaluacionDetail(id);
        
        // --- 1. PREPARAR DATOS DEL CLIENTE ---
        // Accedemos a la data anidada gracias al 'with' profundo del controller
        const clienteData = evaluacionData.cliente?.datos || {};
        const getFirst = (arr) => (arr && arr.length > 0 ? arr[0] : {});

        const contacto = getFirst(clienteData.contactos);
        const direccion = getFirst(clienteData.direcciones);
        const empleo = getFirst(clienteData.empleos);
        const cuenta = getFirst(clienteData.cuentas_bancarias);

        // --- 2. MAPEO AL ESTADO INICIAL ---
        const initialFormData = {
          // A. USUARIO
          usuario: {
            id: clienteData.id,
            nombre: clienteData.nombre,
            apellidoPaterno: clienteData.apellidoPaterno,
            apellidoMaterno: clienteData.apellidoMaterno,
            estadoCivil: clienteData.estadoCivil,
            sexo: clienteData.sexo,
            dni: clienteData.dni,
            fechaCaducidadDni: clienteData.fechaCaducidadDni,
            fechaNacimiento: clienteData.fechaNacimiento,
            nacionalidad: clienteData.nacionalidad,
            residePeru: clienteData.residePeru,
            nivelEducativo: clienteData.nivelEducativo,
            profesion: clienteData.profesion,
            enfermedadesPreexistentes: clienteData.enfermedadesPreexistentes,
            expuestaPoliticamente: clienteData.expuestaPoliticamente,
            telefonoMovil: contacto.telefonoMovil,
            telefonoFijo: contacto.telefonoFijo,
            correo: contacto.correo,
            direccionFiscal: direccion.direccionFiscal,
            direccionCorrespondencia: direccion.direccionCorrespondencia,
            departamento: direccion.departamento,
            provincia: direccion.provincia,
            distrito: direccion.distrito,
            tipoVivienda: direccion.tipoVivienda,
            tiempoResidencia: direccion.tiempoResidencia,
            referenciaDomicilio: direccion.referenciaDomicilio,
            centroLaboral: empleo.centroLaboral,
            ingresoMensual: empleo.ingresoMensual,
            inicioLaboral: empleo.inicioLaboral,
            situacionLaboral: empleo.situacionLaboral,
            ctaAhorros: cuenta.ctaAhorros,
            cci: cuenta.cci,
            entidadFinanciera: cuenta.entidadFinanciera,
          },

          // B. CRÉDITO (Contenedor para Negocio, Familia, Garantías) - USAMOS WHITELISTS PARA EVITAR SPREAD SUCIO
          credito: {
            // Solo campos base del crédito
            ...extractSection(evaluacionData, BASE_CREDITO_WHITELIST),
            // Campos de negocio para los inputs del form
            ...extractSection(evaluacionData.datos_negocio || {}, DATOS_NEGOCIO_WHITELIST),
            // Campos de familia para los inputs del form
            ...extractSection(evaluacionData.unidad_familiar || {}, UNIDAD_FAMILIAR_WHITELIST),
            // Arrays
            garantias: evaluacionData.garantias || [],
            detalleInventario: evaluacionData.datos_negocio?.detalle_inventario || [],
            // NO SPREAD DE OBJETOS ANIDADOS - Solo los campos que necesitan los forms via whitelists en submit
          },

          // C. AVAL
          aval: evaluacionData.aval || {},
        };

        setFormData(initialFormData);
        setShowAval(!!evaluacionData.aval && !!evaluacionData.aval.dniAval);
        
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar la información de la evaluación. Verifique su conexión.');
        toast.error('Error al cargar datos.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
        cargarDatosEvaluacion();
    }
  }, [id]);
  
  const handleInputChange = (e, formType) => {
    // Manejo robusto para Inputs normales, Checkboxes, Files y Custom Events (Garantías)
    const target = e.target || e; // A veces viene el evento, a veces el objeto directo
    const name = target.name;
    let value = target.value;
    const type = target.type;
    const files = target.files;

    if (type === 'file') {
        value = files[0];
    } else if (type === 'checkbox') {
        // Asumiendo que tus sub-formularios envían 1 o 0, o lo manejamos aquí
        // Si el componente hijo ya mandó el valor procesado (1/0), usamos 'value'
        // Si es un evento nativo, usamos 'checked'
        // Nota: Tus componentes hijos (UnidadFamiliarForm) ya hacen la conversión a 1/0
    }

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

    try {
      // --- CONSTRUCCIÓN DEL PAYLOAD LIMPIO CON WHITELISTS ---
      const creditoData = formData.credito || {};

      const payload = {
        // A. Usuario (si se necesita actualizar, sino omitir)
        usuario: formData.usuario,

        // B. Crédito Base (solo campos whitelisteados)
        credito: extractSection(creditoData, BASE_CREDITO_WHITELIST),

        // C. Datos Negocio (campos específicos + inventario)
        datosNegocio: {
          ...extractSection(creditoData, DATOS_NEGOCIO_WHITELIST),
          detalleInventario: creditoData.detalleInventario || creditoData.detalle_inventario || []
        },

        // D. Unidad Familiar (campos específicos)
        unidadFamiliar: extractSection(creditoData, UNIDAD_FAMILIAR_WHITELIST),

        // E. Garantías
        garantias: creditoData.garantias || [],

        // F. Aval
        aval: showAval ? formData.aval : null,
      };

      console.log("Payload FINAL Limpio:", payload); 

      await updateEvaluacion(id, payload);
      
      navigate('/asesor/evaluaciones-enviadas');
      toast.success('Evaluación corregida exitosamente.');

    } catch (err) {
      console.error(err);
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (error) return <div className="p-10 text-center text-red-600 font-bold">{error}</div>;

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 border-b pb-4">
          Corregir Evaluación #{id}
        </h1>
        <p className="text-gray-500 mb-8">
            Cliente: {formData?.usuario?.nombre} {formData?.usuario?.apellidoPaterno}
        </p>

        <form onSubmit={handleSubmit}>
          
          {/* 1. DATOS DEL CLIENTE */}
          <div className="p-6 bg-white rounded-lg shadow-md border-t-4 border-blue-600 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                👤 1. Datos Personales del Cliente
            </h2>
            {formData && (
                <UsuarioForm 
                    formData={formData.usuario} 
                    handleInputChange={(e) => handleInputChange(e, 'usuario')} 
                    isDisabled={false} // Permitir edición si es necesario corregir datos personales
                />
            )}
          </div>

          {/* 2. DATOS DEL CRÉDITO (Desglosado en Sub-Formularios) */}
          <div className="p-6 bg-white rounded-lg shadow-md border-t-4 border-yellow-500 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                💼 2. Análisis del Crédito
            </h2>
            
            {formData && (
              <div className="space-y-10">
                  {/* A. Datos del Negocio */}
                  <DatosNegocioForm 
                      formData={formData.credito}
                      handleInputChange={(e) => handleInputChange(e, 'credito')}
                      isDisabled={false}
                  />

                  <hr className="border-gray-300" />

                  {/* B. Unidad Familiar */}
                  <UnidadFamiliarForm 
                      formData={formData.credito}
                      handleInputChange={(e) => handleInputChange(e, 'credito')}
                      isDisabled={false}
                  />

                  <hr className="border-gray-300" />

                  {/* C. Garantías */}
                  {/* Nota: GarantiasForm usa 'garantias' (array) que está dentro de formData.credito */}
                  <GarantiasForm 
                      formData={formData.credito.garantias} 
                      handleInputChange={(e) => handleInputChange(e, 'credito')}
                      isDisabled={false}
                  />
              </div>
            )}
          </div>

          {/* 3. DATOS DEL AVAL */}
          <div className="p-6 bg-white rounded-lg shadow-md border-t-4 border-green-600 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  🤝 3. Datos del Aval
              </h2>
              <button
                type="button"
                onClick={() => setShowAval(!showAval)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    showAval ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {showAval ? '✕ Quitar Aval' : '+ Añadir Aval'}
              </button>
            </div>
            {showAval && formData && (
                <AvalForm 
                    formData={formData.aval} 
                    handleInputChange={(e) => handleInputChange(e, 'aval')} 
                    isDisabled={false}
                />
            )}
          </div>

          {/* BOTÓN DE GUARDAR */}
          <div className="text-center mt-10 pb-10">
            <button
              type="submit"
              className="w-full md:w-1/2 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold text-xl rounded-xl hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              💾 Guardar Correcciones
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CorregirEvaluacion;