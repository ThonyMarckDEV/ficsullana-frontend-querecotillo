// src/components/AvalForm.jsx
import React from 'react';
import peruData from '../../../../utilities/PeruData/PeruData';

const AvalForm = ({ formData, handleInputChange }) => {
  const departamentos = Object.keys(peruData);
  const provincias = formData.departamentoAval ? Object.keys(peruData[formData.departamentoAval] || {}) : [];
  const distritos = (formData.departamentoAval && formData.provinciaAval) ? (peruData[formData.departamentoAval][formData.provinciaAval] || []) : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-red-700 font-semibold">DNI del Aval</label>
        <input
          type="text"
          name="dniAval"
          value={formData.dniAval || ''}
          onChange={(e) => {
            const value = e.target.value.slice(0, 9);
            handleInputChange({ target: { name: "dniAval", value } });
          }}
          className="w-full p-2 border border-yellow-500 rounded"
          required
        />
      </div>
      <div>
        <label className="block text-red-700 font-semibold">Apellido Paterno del Aval</label>
        <input
          type="text"
          name="apellidoPaternoAval"
          value={formData.apellidoPaternoAval || ''}
          onChange={(e) => {
            const value = e.target.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "");
            handleInputChange({ target: { name: "apellidoPaternoAval", value } });
          }}
          className="w-full p-2 border border-yellow-500 rounded"
          required
        />
      </div>
      <div>
        <label className="block text-red-700 font-semibold">Apellido Materno del Aval</label>
        <input
          type="text"
          name="apellidoMaternoAval"
          value={formData.apellidoMaternoAval || ''}
          onChange={(e) => {
            const value = e.target.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "");
            handleInputChange({ target: { name: "apellidoMaternoAval", value } });
          }}
          className="w-full p-2 border border-yellow-500 rounded"
          required
        />
      </div>
      <div>
        <label className="block text-red-700 font-semibold">Nombres del Aval</label>
        <input
          type="text"
          name="nombresAval"
          value={formData.nombresAval || ''}
          onChange={(e) => {
            const value = e.target.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "");
            handleInputChange({ target: { name: "nombresAval", value } });
          }}
          className="w-full p-2 border border-yellow-500 rounded"
          required
        />
      </div>
      <div>
        <label className="block text-red-700 font-semibold">Teléfono Fijo del Aval</label>
        <input
          type="number"
          name="telefonoFijoAval"
          value={formData.telefonoFijoAval || ''}
          onChange={handleInputChange}
          className="w-full p-2 border border-yellow-500 rounded"
        />
      </div>
      <div>
        <label className="block text-red-700 font-semibold">Teléfono Móvil del Aval</label>
        <input
          type="number"
          name="telefonoMovilAval"
          value={formData.telefonoMovilAval || ''}
          onChange={handleInputChange}
          className="w-full p-2 border border-yellow-500 rounded"
          required
        />
      </div>
      <div>
        <label className="block text-red-700 font-semibold">Dirección del Aval</label>
        <input
          type="text"
          name="direccionAval"
          value={formData.direccionAval || ''}
          onChange={handleInputChange}
          className="w-full p-2 border border-yellow-500 rounded"
          required
        />
      </div>
      <div>
        <label className="block text-red-700 font-semibold">Referencia de Domicilio del Aval</label>
        <input
          type="text"
          name="referenciaDomicilioAval"
          value={formData.referenciaDomicilioAval || ''}
          onChange={handleInputChange}
          className="w-full p-2 border border-yellow-500 rounded"
        />
      </div>
      <div>
        <label className="block text-red-700 font-semibold">Departamento del Aval</label>
        <select
          name="departamentoAval"
          value={formData.departamentoAval || ''}
          onChange={handleInputChange}
          className="w-full p-2 border border-yellow-500 rounded"
          required
        >
          <option value="">Seleccione...</option>
          {departamentos.map(dep => (
            <option key={dep} value={dep}>{dep}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-red-700 font-semibold">Provincia del Aval</label>
        <select
          name="provinciaAval"
          value={formData.provinciaAval || ''}
          onChange={handleInputChange}
          className="w-full p-2 border border-yellow-500 rounded"
          required
          disabled={!formData.departamentoAval}
        >
          <option value="">Seleccione...</option>
          {provincias.map(prov => (
            <option key={prov} value={prov}>{prov}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-red-700 font-semibold">Distrito del Aval</label>
        <select
          name="distritoAval"
          value={formData.distritoAval || ''}
          onChange={handleInputChange}
          className="w-full p-2 border border-yellow-500 rounded"
          required
          disabled={!formData.provinciaAval}
        >
          <option value="">Seleccione...</option>
          {distritos.map(dist => (
            <option key={dist} value={dist}>{dist}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-red-700 font-semibold">Relación con el Cliente</label>
        <input
          type="text"
          name="relacionAval"
          value={formData.relacionAval || ''}
          onChange={(e) => {
            const value = e.target.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "");
            handleInputChange({ target: { name: "relacionAval", value } });
          }}
          className="w-full p-2 border border-yellow-500 rounded"
          required
        />
      </div>
    </div>
  );
};

export default AvalForm;