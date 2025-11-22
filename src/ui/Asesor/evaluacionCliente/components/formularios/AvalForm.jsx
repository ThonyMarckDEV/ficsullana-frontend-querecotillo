import React from 'react';
import peruData from 'utilities/PeruData/PeruData';

const AvalForm = ({ formData, handleInputChange, isDisabled }) => {
  const departamentos = Object.keys(peruData);
  const provincias = formData.departamentoAval ? Object.keys(peruData[formData.departamentoAval] || {}) : [];
  const distritos = (formData.departamentoAval && formData.provinciaAval) ? (peruData[formData.departamentoAval][formData.provinciaAval] || []) : [];

  // Función auxiliar para manejar la imagen
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const { name } = e.target;
    if (file) {
      handleInputChange({
        target: {
          name: name,
          value: file
        }
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* --- CAMPOS EXISTENTES --- */}
      <div><label className="block text-red-700 font-semibold">DNI del Aval</label><input type="number" name="dniAval" value={formData.dniAval ?? ''} onChange={handleInputChange} className="w-full p-2 border border-yellow-500 rounded" required disabled={isDisabled} /></div>
      <div><label className="block text-red-700 font-semibold">Apellido Paterno del Aval</label><input type="text" name="apellidoPaternoAval" value={formData.apellidoPaternoAval ?? ''} onChange={handleInputChange} className="w-full p-2 border border-yellow-500 rounded" required disabled={isDisabled} /></div>
      <div><label className="block text-red-700 font-semibold">Apellido Materno del Aval</label><input type="text" name="apellidoMaternoAval" value={formData.apellidoMaternoAval ?? ''} onChange={handleInputChange} className="w-full p-2 border border-yellow-500 rounded" required disabled={isDisabled} /></div>
      <div><label className="block text-red-700 font-semibold">Nombres del Aval</label><input type="text" name="nombresAval" value={formData.nombresAval ?? ''} onChange={handleInputChange} className="w-full p-2 border border-yellow-500 rounded" required disabled={isDisabled} /></div>
      <div><label className="block text-red-700 font-semibold">Teléfono Fijo del Aval</label><input type="number" name="telefonoFijoAval" value={formData.telefonoFijoAval ?? ''} onChange={handleInputChange} className="w-full p-2 border border-yellow-500 rounded" disabled={isDisabled} /></div>
      <div><label className="block text-red-700 font-semibold">Teléfono Móvil del Aval</label><input type="number" name="telefonoMovilAval" value={formData.telefonoMovilAval ?? ''} onChange={handleInputChange} className="w-full p-2 border border-yellow-500 rounded" required disabled={isDisabled} /></div>
      <div><label className="block text-red-700 font-semibold">Dirección del Aval</label><input type="text" name="direccionAval" value={formData.direccionAval ?? ''} onChange={handleInputChange} className="w-full p-2 border border-yellow-500 rounded" required disabled={isDisabled} /></div>
      <div><label className="block text-red-700 font-semibold">Referencia de Domicilio del Aval</label><input type="text" name="referenciaDomicilioAval" value={formData.referenciaDomicilioAval ?? ''} onChange={handleInputChange} className="w-full p-2 border border-yellow-500 rounded" disabled={isDisabled} /></div>
      <div><label className="block text-red-700 font-semibold">Departamento del Aval</label><select name="departamentoAval" value={formData.departamentoAval ?? ''} onChange={handleInputChange} className="w-full p-2 border border-yellow-500 rounded" required disabled={isDisabled}><option value="">Seleccione...</option>{departamentos.map(dep => (<option key={dep} value={dep}>{dep}</option>))}</select></div>
      <div><label className="block text-red-700 font-semibold">Provincia del Aval</label><select name="provinciaAval" value={formData.provinciaAval ?? ''} onChange={handleInputChange} className="w-full p-2 border border-yellow-500 rounded" required disabled={!formData.departamentoAval || isDisabled}><option value="">Seleccione...</option>{provincias.map(prov => (<option key={prov} value={prov}>{prov}</option>))}</select></div>
      <div><label className="block text-red-700 font-semibold">Distrito del Aval</label><select name="distritoAval" value={formData.distritoAval ?? ''} onChange={handleInputChange} className="w-full p-2 border border-yellow-500 rounded" required disabled={!formData.provinciaAval || isDisabled}><option value="">Seleccione...</option>{distritos.map(dist => (<option key={dist} value={dist}>{dist}</option>))}</select></div>
      <div><label className="block text-red-700 font-semibold">Relación con el Cliente</label><input type="text" name="relacionClienteAval" value={formData.relacionClienteAval ?? ''} onChange={handleInputChange} className="w-full p-2 border border-yellow-500 rounded" required disabled={isDisabled} /></div>
      
      {/* --- NUEVO CAMPO: FIRMA DEL AVAL --- */}
      <div className="col-span-1 md:col-span-2 mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <label className="block text-red-700 font-bold mb-2">Firma del Aval</label>
          <input 
              type="file" 
              name="firmaAval" 
              accept="image/png, image/jpeg, image/jpg" 
              onChange={handleImageChange} 
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
              disabled={isDisabled}
          />
          <p className="text-xs text-gray-500 mt-1">Formatos: JPG, JPEG, PNG.</p>

          {/* Preview de la imagen */}
          {formData.firmaAval && (
              <div className="mt-2">
                  <p className="text-xs font-semibold text-gray-600">Vista previa:</p>
                  <img 
                      src={typeof formData.firmaAval === 'object' ? URL.createObjectURL(formData.firmaAval) : formData.firmaAval} 
                      alt="Firma Aval" 
                      className="h-24 object-contain border border-gray-300 bg-white rounded mt-1" 
                  />
              </div>
          )}
      </div>
    </div>
  );
};

export default AvalForm;