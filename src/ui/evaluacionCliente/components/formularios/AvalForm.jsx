// src/pages/components/Formularios/AvalForm.jsx
import React from 'react';
import peruData from 'utilities/PeruData/PeruData';

// 1. Recibe la nueva prop 'isDisabled'
const AvalForm = ({ formData, handleInputChange, isDisabled }) => {
  const departamentos = Object.keys(peruData);
  const provincias = formData.departamentoAval ? Object.keys(peruData[formData.departamentoAval] || {}) : [];
  const distritos = (formData.departamentoAval && formData.provinciaAval) ? (peruData[formData.departamentoAval][formData.provinciaAval] || []) : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-red-700 font-semibold">DNI del Aval</label>
        <input
          type="number"
          name="dniAval"
          value={formData.dniAval ?? ''}
          onChange={handleInputChange}
          className="w-full p-2 border border-yellow-500 rounded"
          required
          disabled={isDisabled} // <-- 2. AÑADIDO
        />
      </div>
      <div>
        <label className="block text-red-700 font-semibold">Apellido Paterno del Aval</label>
        <input
          type="text"
          name="apellidoPaternoAval"
          value={formData.apellidoPaternoAval ?? ''}
          onChange={handleInputChange}
          className="w-full p-2 border border-yellow-500 rounded"
          required
          disabled={isDisabled} // <-- AÑADIDO
        />
      </div>
      <div>
        <label className="block text-red-700 font-semibold">Apellido Materno del Aval</label>
        <input
          type="text"
          name="apellidoMaternoAval"
          value={formData.apellidoMaternoAval ?? ''}
          onChange={handleInputChange}
          className="w-full p-2 border border-yellow-500 rounded"
          required
          disabled={isDisabled} // <-- AÑADIDO
        />
      </div>
      <div>
        <label className="block text-red-700 font-semibold">Nombres del Aval</label>
        <input
          type="text"
          name="nombresAval"
          value={formData.nombresAval ?? ''}
          onChange={handleInputChange}
          className="w-full p-2 border border-yellow-500 rounded"
          required
          disabled={isDisabled} // <-- AÑADIDO
        />
      </div>
      <div>
        <label className="block text-red-700 font-semibold">Teléfono Fijo del Aval</label>
        <input
          type="number"
          name="telefonoFijoAval"
          value={formData.telefonoFijoAval ?? ''}
          onChange={handleInputChange}
          className="w-full p-2 border border-yellow-500 rounded"
          disabled={isDisabled} // <-- AÑADIDO
        />
      </div>
      <div>
        <label className="block text-red-700 font-semibold">Teléfono Móvil del Aval</label>
        <input
          type="number"
          name="telefonoMovilAval"
          value={formData.telefonoMovilAval ?? ''}
          onChange={handleInputChange}
          className="w-full p-2 border border-yellow-500 rounded"
          required
          disabled={isDisabled} // <-- AÑADIDO
        />
      </div>
      <div>
        <label className="block text-red-700 font-semibold">Dirección del Aval</label>
        <input
          type="text"
          name="direccionAval"
          value={formData.direccionAval ?? ''}
          onChange={handleInputChange}
          className="w-full p-2 border border-yellow-500 rounded"
          required
          disabled={isDisabled} // <-- AÑADIDO
        />
      </div>
      <div>
        <label className="block text-red-700 font-semibold">Referencia de Domicilio del Aval</label>
        <input
          type="text"
          name="referenciaDomicilioAval"
          value={formData.referenciaDomicilioAval ?? ''}
          onChange={handleInputChange}
          className="w-full p-2 border border-yellow-500 rounded"
          disabled={isDisabled} // <-- AÑADIDO
        />
      </div>
      <div>
        <label className="block text-red-700 font-semibold">Departamento del Aval</label>
        <select
          name="departamentoAval"
          value={formData.departamentoAval ?? ''}
          onChange={handleInputChange}
          className="w-full p-2 border border-yellow-500 rounded"
          required
          disabled={isDisabled} // <-- AÑADIDO
        >
          <option value="">Seleccione...</option>
          {departamentos.map(dep => (<option key={dep} value={dep}>{dep}</option>))}
        </select>
      </div>
      <div>
        <label className="block text-red-700 font-semibold">Provincia del Aval</label>
        <select
          name="provinciaAval"
          value={formData.provinciaAval ?? ''}
          onChange={handleInputChange}
          className="w-full p-2 border border-yellow-500 rounded"
          required
          disabled={!formData.departamentoAval || isDisabled} // <-- AÑADIDO
        >
          <option value="">Seleccione...</option>
          {provincias.map(prov => (<option key={prov} value={prov}>{prov}</option>))}
        </select>
      </div>
      <div>
        <label className="block text-red-700 font-semibold">Distrito del Aval</label>
        <select
          name="distritoAval"
          value={formData.distritoAval ?? ''}
          onChange={handleInputChange}
          className="w-full p-2 border border-yellow-500 rounded"
          required
          disabled={!formData.provinciaAval || isDisabled} // <-- AÑADIDO
        >
          <option value="">Seleccione...</option>
          {distritos.map(dist => (<option key={dist} value={dist}>{dist}</option>))}
        </select>
      </div>
      <div>
        <label className="block text-red-700 font-semibold">Relación con el Cliente</label>
        <input
          type="text"
          name="relacionClienteAval"
          value={formData.relacionClienteAval ?? ''}
          onChange={handleInputChange}
          className="w-full p-2 border border-yellow-500 rounded"
          required
          disabled={isDisabled} // <-- AÑADIDO
        />
      </div>
    </div>
  );
};

export default AvalForm;