// src/components/CreditoForm.jsx
import React from 'react';

//                                                            <-- CAMBIA ESTA LÍNEA
const CreditoForm = ({ formData, handleInputChange, isEditable = true }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-red-700 font-semibold">Producto</label>
        <input
          type="text"
          name="producto"
          value={formData.producto || ''}
          onChange={handleInputChange}
          disabled={!isEditable} // Esta lógica ahora funciona perfecto
          className="w-full p-2 border border-yellow-500 rounded disabled:bg-gray-100 disabled:cursor-not-allowed"
          required
        />
      </div>
      {/* ... el resto de los inputs no cambian, ya que todos dependen de "isEditable" ... */}
       <div>
        <label className="block text-red-700 font-semibold">Monto del Préstamo</label>
        <input
          type="number"
          name="montoPrestamo"
          value={formData.montoPrestamo || ''}
          onChange={handleInputChange}
          disabled={!isEditable}
          className="w-full p-2 border border-yellow-500 rounded disabled:bg-gray-100 disabled:cursor-not-allowed"
          required
        />
      </div>
      <div>
        <label className="block text-red-700 font-semibold">Tasa de Interés (%)</label>
        <input
          type="number"
          name="tasaInteres"
          value={formData.tasaInteres || ''}
          onChange={handleInputChange}
          disabled={!isEditable}
          className="w-full p-2 border border-yellow-500 rounded disabled:bg-gray-100 disabled:cursor-not-allowed"
          required
        />
      </div>
      <div>
        <label className="block text-red-700 font-semibold">Cuotas</label>
        <input
          type="number"
          name="cuotas"
          value={formData.cuotas || ''}
          onChange={handleInputChange}
          disabled={!isEditable}
          className="w-full p-2 border border-yellow-500 rounded disabled:bg-gray-100 disabled:cursor-not-allowed"
          required
        />
      </div>
      <div>
        <label className="block text-red-700 font-semibold">Modalidad</label>
        <select
          name="modalidadCredito"
          value={formData.modalidadCredito || ''}
          onChange={handleInputChange}
          disabled={!isEditable}
          className="w-full p-2 border border-yellow-500 rounded disabled:bg-gray-100 disabled:cursor-not-allowed"
          required
        >
          <option value="">Seleccione...</option>
          <option value="nuevo">NUEVO</option>
          <option value="consaldo">CON SALDO</option>
          <option value="reprogramado">REPROGRAMADO</option>
          <option value="refinanciado">REFINANCIADO</option>
          <option value="recurrente">RECURRENTE</option>
        </select>
      </div>
      <div>
        <label className="block text-red-700 font-semibold">Destino del Crédito</label>
        <input
          type="text"
          name="destinoCredito"
          value={formData.destinoCredito || ''}
          onChange={handleInputChange}
          disabled={!isEditable}
          className="w-full p-2 border border-yellow-500 rounded disabled:bg-gray-100 disabled:cursor-not-allowed"
          required
        />
      </div>
      <div>
        <label className="block text-red-700 font-semibold">Período del Crédito</label>
        <select
          name="periodoCredito"
          value={formData.periodoCredito || ''}
          onChange={handleInputChange}
          disabled={!isEditable}
          className="w-full p-2 border border-yellow-500 rounded disabled:bg-gray-100 disabled:cursor-not-allowed"
          required
        >
          <option value="">Seleccione...</option>
          <option value="mensual">Mensual</option>
          <option value="catorcenal">Catorcenal</option>
          <option value="semanal">Semanal</option>
        </select>
      </div>
    </div>
  );
};

export default CreditoForm;