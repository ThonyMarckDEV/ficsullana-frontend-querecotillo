import React from 'react';
import peruData from 'utilities/PeruData/PeruData';

const UsuarioForm = ({ formData, handleInputChange, isDisabled }) => {
  const departamentos = Object.keys(peruData);
  const provincias = formData.departamento ? Object.keys(peruData[formData.departamento] || {}) : [];
  const distritos = (formData.departamento && formData.provincia) ? (peruData[formData.departamento][formData.provincia] || []) : [];

  // Función auxiliar para manejar la imagen y pasar el ARCHIVO al estado padre
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const { name } = e.target;
    if (file) {
      // Simulamos el evento para que tu handleInputChange genérico funcione
      handleInputChange({
        target: {
          name: name,
          value: file // Pasamos el objeto File
        }
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* --- CAMPOS EXISTENTES --- */}
        <div><label className="block text-red-700 font-semibold">DNI</label><input type="number" name="dni" value={formData.dni ?? ''} onChange={handleInputChange} className="w-full p-2 border border-yellow-500 rounded" required disabled={isDisabled} /></div>
        <div><label className="block text-red-700 font-semibold">Fecha de Caducidad del DNI</label><input type="date" name="fechaCaducidadDni" value={formData.fechaCaducidadDni ?? ''} onChange={handleInputChange} className="w-full p-2 border border-yellow-500 rounded" required disabled={isDisabled} /></div>
        <div><label className="block text-red-700 font-semibold">Apellido Paterno</label><input type="text" name="apellidoPaterno" value={formData.apellidoPaterno ?? ''} onChange={handleInputChange} className="w-full p-2 border border-yellow-500 rounded" required disabled={isDisabled} /></div>
        <div><label className="block text-red-700 font-semibold">Apellido Materno</label><input type="text" name="apellidoMaterno" value={formData.apellidoMaterno ?? ''} onChange={handleInputChange} className="w-full p-2 border border-yellow-500 rounded" required disabled={isDisabled} /></div>
        <div><label className="block text-red-700 font-semibold">Nombres</label><input type="text" name="nombre" value={formData.nombre ?? ''} onChange={handleInputChange} className="w-full p-2 border border-yellow-500 rounded" required disabled={isDisabled} /></div>
        <div><label className="block text-red-700 font-semibold">Fecha de Nacimiento</label><input type="date" name="fechaNacimiento" value={formData.fechaNacimiento ?? ''} onChange={handleInputChange} className="w-full p-2 border border-yellow-500 rounded" required disabled={isDisabled} /></div>
        <div><label className="block text-red-700 font-semibold">Sexo</label><select name="sexo" value={formData.sexo ?? ''} onChange={handleInputChange} className="w-full p-2 border border-yellow-500 rounded" required disabled={isDisabled}><option value="">Seleccione...</option><option value="masculino">Masculino</option><option value="femenino">Femenino</option></select></div>
        <div><label className="block text-red-700 font-semibold">Estado Civil</label><select name="estadoCivil" value={formData.estadoCivil ?? ''} onChange={handleInputChange} className="w-full p-2 border border-yellow-500 rounded" required disabled={isDisabled}><option value="">Seleccione...</option><option value="soltero">Soltero</option><option value="casado">Casado</option><option value="divorciado">Divorciado</option><option value="viudo">Viudo</option></select></div>
        <div><label className="block text-red-700 font-semibold">Nacionalidad</label><input type="text" name="nacionalidad" value={formData.nacionalidad ?? ''} onChange={handleInputChange} className="w-full p-2 border border-yellow-500 rounded" required disabled={isDisabled} /></div>
        <div><label className="block text-red-700 font-semibold">Reside en Perú</label><select name="residePeru" value={formData.residePeru ?? ''} onChange={handleInputChange} className="w-full p-2 border border-yellow-500 rounded" required disabled={isDisabled}><option value="">Seleccione...</option><option value="1">Sí</option><option value="0">No</option></select></div>
        <div><label className="block text-red-700 font-semibold">Políticamente Expuesta</label><select name="expuestaPoliticamente" value={formData.expuestaPoliticamente ?? ' '} onChange={handleInputChange} className="w-full p-2 border border-yellow-500 rounded" required disabled={isDisabled}><option value="">Seleccione...</option><option value="1">Si</option><option value="0">No</option></select></div>
        <div><label className="block text-red-700 font-semibold">Nivel Educativo</label><select name="nivelEducativo" value={formData.nivelEducativo ?? ''} onChange={handleInputChange} className="w-full p-2 border border-yellow-500 rounded" required disabled={isDisabled}><option value="">Seleccione...</option><option value="primaria">Primaria</option><option value="secundaria">Secundaria</option><option value="tecnico">Técnico</option><option value="universitario">Universitario</option><option value="postgrado">Postgrado</option></select></div>
        <div><label className="block text-red-700 font-semibold">Profesión</label><input type="text" name="profesion" value={formData.profesion ?? ''} onChange={handleInputChange} className="w-full p-2 border border-yellow-500 rounded" required disabled={isDisabled} /></div>
        <div><label className="block text-red-700 font-semibold">Teléfono Fijo</label><input type="number" name="telefonoFijo" value={formData.telefonoFijo ?? ''} onChange={handleInputChange} className="w-full p-2 border border-yellow-500 rounded" disabled={isDisabled} /></div>
        <div><label className="block text-red-700 font-semibold">Teléfono Móvil</label><input type="number" name="telefonoMovil" value={formData.telefonoMovil ?? ''} onChange={handleInputChange} className="w-full p-2 border border-yellow-500 rounded" required disabled={isDisabled} /></div>
        <div><label className="block text-red-700 font-semibold">Correo</label><input type="email" name="correo" value={formData.correo ?? ''} onChange={handleInputChange} className="w-full p-2 border border-yellow-500 rounded" required disabled={isDisabled} /></div>
        <div><label className="block text-red-700 font-semibold">Enfermedades Preexistentes</label><select name="enfermedadesPreexistentes" value={formData.enfermedadesPreexistentes ?? ''} onChange={handleInputChange} className="w-full p-2 border border-yellow-500 rounded" required disabled={isDisabled}><option value="">Seleccione...</option><option value="1">Sí</option><option value="0">No</option></select></div>
        <div><label className="block text-red-700 font-semibold">Cuenta de Ahorros</label><input type="number" name="ctaAhorros" value={formData.ctaAhorros ?? ''} onChange={handleInputChange} className="w-full p-2 border border-yellow-500 rounded" required disabled={isDisabled} /></div>
        <div><label className="block text-red-700 font-semibold">Entidad Financiera</label><input type="text" name="entidadFinanciera" value={formData.entidadFinanciera ?? ''} onChange={handleInputChange} className="w-full p-2 border border-yellow-500 rounded" required disabled={isDisabled} /></div>
        <div><label className="block text-red-700 font-semibold">Dirección Fiscal</label><input type="text" name="direccionFiscal" value={formData.direccionFiscal ?? ''} onChange={handleInputChange} className="w-full p-2 border border-yellow-500 rounded" required disabled={isDisabled} /></div>
        <div><label className="block text-red-700 font-semibold">Dirección de Correspondencia</label><input type="text" name="direccionCorrespondencia" value={formData.direccionCorrespondencia ?? ''} onChange={handleInputChange} className="w-full p-2 border border-yellow-500 rounded" required disabled={isDisabled} /></div>
        <div><label className="block text-red-700 font-semibold">Tipo de Vivienda</label><select name="tipoVivienda" value={formData.tipoVivienda ?? ''} onChange={handleInputChange} className="w-full p-2 border border-yellow-500 rounded" required disabled={isDisabled}><option value="">Seleccione...</option><option value="propia">Propia</option><option value="alquilada">Alquilada</option><option value="familiar">Familiar</option></select></div>
        <div><label className="block text-red-700 font-semibold">Tiempo de Residencia (años)</label><input type="number" name="tiempoResidencia" value={formData.tiempoResidencia ?? ''} onChange={handleInputChange} className="w-full p-2 border border-yellow-500 rounded" required disabled={isDisabled} /></div>
        <div><label className="block text-red-700 font-semibold">Referencia de Domicilio</label><input type="text" name="referenciaDomicilio" value={formData.referenciaDomicilio ?? ''} onChange={handleInputChange} className="w-full p-2 border border-yellow-500 rounded" required disabled={isDisabled} /></div>
        <div><label className="block text-red-700 font-semibold">Centro Laboral</label><input type="text" name="centroLaboral" value={formData.centroLaboral ?? ''} onChange={handleInputChange} className="w-full p-2 border border-yellow-500 rounded" required disabled={isDisabled} /></div>
        <div><label className="block text-red-700 font-semibold">Ingreso Mensual</label><input type="number" name="ingresoMensual" value={formData.ingresoMensual ?? ''} onChange={handleInputChange} className="w-full p-2 border border-yellow-500 rounded" required disabled={isDisabled} /></div>
        <div><label className="block text-red-700 font-semibold">Inicio Laboral</label><input type="date" name="inicioLaboral" value={formData.inicioLaboral ?? ''} onChange={handleInputChange} className="w-full p-2 border border-yellow-500 rounded" required disabled={isDisabled} /></div>
        <div><label className="block text-red-700 font-semibold">Situación Laboral</label><select name="situacionLaboral" value={formData.situacionLaboral ?? ''} onChange={handleInputChange} className="w-full p-2 border border-yellow-500 rounded" required disabled={isDisabled}><option value="">Seleccione...</option><option value="empleado">Empleado</option><option value="independiente">Independiente</option><option value="desempleado">Desempleado</option><option value="jubilado">Jubilado</option></select></div>
        <div><label className="block text-red-700 font-semibold">Departamento</label><select name="departamento" value={formData.departamento ?? ''} onChange={handleInputChange} className="w-full p-2 border border-yellow-500 rounded" required disabled={isDisabled}><option value="">Seleccione...</option>{departamentos.map(dep => (<option key={dep} value={dep}>{dep}</option>))}</select></div>
        <div><label className="block text-red-700 font-semibold">Provincia</label><select name="provincia" value={formData.provincia ?? ''} onChange={handleInputChange} className="w-full p-2 border border-yellow-500 rounded" required disabled={!formData.departamento || isDisabled}><option value="">Seleccione...</option>{provincias.map(prov => (<option key={prov} value={prov}>{prov}</option>))}</select></div>
        <div><label className="block text-red-700 font-semibold">Distrito</label><select name="distrito" value={formData.distrito ?? ''} onChange={handleInputChange} className="w-full p-2 border border-yellow-500 rounded" required disabled={!formData.provincia || isDisabled}><option value="">Seleccione...</option>{distritos.map(dist => (<option key={dist} value={dist}>{dist}</option>))}</select></div>
        
        {/* --- NUEVO CAMPO: FIRMA DEL CLIENTE --- */}
        <div className="col-span-1 md:col-span-2 mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <label className="block text-red-700 font-bold mb-2">Firma del Cliente</label>
            <input 
                type="file" 
                name="firmaCliente" 
                accept="image/png, image/jpeg, image/jpg" 
                onChange={handleImageChange} 
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                disabled={isDisabled}
            />
            <p className="text-xs text-gray-500 mt-1">Formatos: JPG, JPEG, PNG.</p>
            
            {/* Preview de la imagen */}
            {formData.firmaCliente && (
                <div className="mt-2">
                    <p className="text-xs font-semibold text-gray-600">Vista previa:</p>
                    <img 
                        src={typeof formData.firmaCliente === 'object' ? URL.createObjectURL(formData.firmaCliente) : formData.firmaCliente} 
                        alt="Firma Cliente" 
                        className="h-24 object-contain border border-gray-300 bg-white rounded mt-1" 
                    />
                </div>
            )}
        </div>
    </div>
  );
};

export default UsuarioForm;