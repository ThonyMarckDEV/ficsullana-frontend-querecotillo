import React from 'react';

const DatosNegocioForm = ({ formData, handleInputChange, isDisabled }) => {
  // Inicializar el array de inventario si no existe
  const inventario = formData.detalleInventario || [];

  // --- HELPER PARA CHECKBOXES (1/0) ---
  const handleCheckboxChange = (e) => {
    handleInputChange({
      target: { name: e.target.name, value: e.target.checked ? 1 : 0 }
    });
  };

  // --- HELPER PARA ARCHIVOS (Fotos) ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleInputChange({
        target: { name: e.target.name, value: file }
      });
    }
  };

  // --- LOGICA PARA TABLA DINÁMICA (INVENTARIO) ---
  
  // 1. Agregar nueva fila vacía
  const addProducto = () => {
    const nuevoProducto = {
      nombre_producto: '',
      unidad_medida: '',
      precio_compra_unitario: 0,
      precio_venta_unitario: 0,
      margen_ganancia: 0,
      cantidad_inventario: 0,
      precio_total_estimado: 0
    };
    const nuevoInventario = [...inventario, nuevoProducto];
    // Enviamos el array completo al padre
    handleInputChange({ target: { name: 'detalleInventario', value: nuevoInventario } });
  };

  // 2. Eliminar fila
  const removeProducto = (index) => {
    const nuevoInventario = inventario.filter((_, i) => i !== index);
    handleInputChange({ target: { name: 'detalleInventario', value: nuevoInventario } });
  };

  // 3. Editar celda de una fila
  const handleProductChange = (index, field, value) => {
    const nuevoInventario = [...inventario];
    nuevoInventario[index] = { ...nuevoInventario[index], [field]: value };

    // Auto-cálculo: Total = Precio Compra * Cantidad
    if (field === 'precio_compra_unitario' || field === 'cantidad_inventario') {
        const pCompra = parseFloat(nuevoInventario[index].precio_compra_unitario) || 0;
        const cant = parseFloat(nuevoInventario[index].cantidad_inventario) || 0;
        nuevoInventario[index].precio_total_estimado = (pCompra * cant).toFixed(2);
    }

    handleInputChange({ target: { name: 'detalleInventario', value: nuevoInventario } });
  };

  return (
    <div className="space-y-6">
      
      {/* --- SECCIÓN B: OTROS INGRESOS --- */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="text-blue-800 font-bold mb-4 border-b border-blue-200 pb-2">B. De los Otros Ingresos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label-form">Sector Económico</label>
            <input type="text" name="otros_ingresos_sector" value={formData.otros_ingresos_sector ?? ''} onChange={handleInputChange} className="input-form" disabled={isDisabled} />
          </div>
          <div>
            <label className="label-form">Tiempo en el rubro</label>
            <input type="text" name="otros_ingresos_tiempo" value={formData.otros_ingresos_tiempo ?? ''} onChange={handleInputChange} className="input-form" disabled={isDisabled} />
          </div>
          <div>
            <label className="label-form">Monto Ingreso (S/.)</label>
            <input type="number" name="otros_ingresos_monto" value={formData.otros_ingresos_monto ?? ''} onChange={handleInputChange} className="input-form" disabled={isDisabled} />
          </div>
          <div>
            <label className="label-form">Frecuencia</label>
            <input type="text" name="otros_ingresos_frecuencia" value={formData.otros_ingresos_frecuencia ?? ''} onChange={handleInputChange} className="input-form" disabled={isDisabled} placeholder="Ej: Mensual" />
          </div>
          <div className="md:col-span-2 flex items-center mt-6">
             <input type="checkbox" name="depende_otros_ingresos" checked={formData.depende_otros_ingresos === 1} onChange={handleCheckboxChange} className="w-5 h-5 text-blue-600" disabled={isDisabled} />
             <span className="ml-2 font-medium text-gray-700">¿Depende de estos otros ingresos?</span>
          </div>
          <div className="md:col-span-3">
            <label className="label-form">Sustento (Detalle)</label>
            <textarea name="sustento_otros_ingresos" value={formData.sustento_otros_ingresos ?? ''} onChange={handleInputChange} className="input-form h-20" disabled={isDisabled}></textarea>
          </div>
        </div>
      </div>

      {/* --- SECCIÓN C: BALANCE Y RESULTADOS --- */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
         <h3 className="text-gray-800 font-bold mb-4 border-b border-gray-300 pb-2">C. Balance y Estado de Resultados</h3>
         
         {/* 1. Ubicación y Ventas */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
                <label className="label-form">Zona Ubicación</label>
                <input type="text" name="zona_ubicacion" value={formData.zona_ubicacion ?? ''} onChange={handleInputChange} className="input-form" disabled={isDisabled} />
            </div>
            <div>
                <label className="label-form">Modalidad Atención</label>
                <input type="text" name="modalidad_atencion" value={formData.modalidad_atencion ?? ''} onChange={handleInputChange} className="input-form" disabled={isDisabled} />
            </div>
            <div>
                <label className="label-form">Ventas Diarias (S/.)</label>
                <input type="number" name="ventas_diarias" value={formData.ventas_diarias ?? ''} onChange={handleInputChange} className="input-form font-bold text-green-700" disabled={isDisabled} />
            </div>
         </div>

         {/* 2. Compras */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
                <label className="label-form">Fecha Última Compra</label>
                <input type="date" name="fecha_ultima_compra" value={formData.fecha_ultima_compra ?? ''} onChange={handleInputChange} className="input-form" disabled={isDisabled} />
            </div>
            <div>
                <label className="label-form">Monto Última Compra</label>
                <input type="number" name="monto_ultima_compra" value={formData.monto_ultima_compra ?? ''} onChange={handleInputChange} className="input-form" disabled={isDisabled} />
            </div>
            <div>
                <label className="label-form">Variación vs Mes Anterior</label>
                <input type="text" name="variacion_compras_mes_anterior" value={formData.variacion_compras_mes_anterior ?? ''} onChange={handleInputChange} className="input-form" disabled={isDisabled} />
            </div>
         </div>

         <hr className="border-gray-300 my-4"/>

         {/* 3. TABLA DINÁMICA DE INVENTARIO */}
         <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
                <label className="text-red-700 font-bold text-lg">Detalle de Productos / Inventario</label>
                <button type="button" onClick={addProducto} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm font-bold" disabled={isDisabled}>
                   + Agregar Producto
                </button>
            </div>
            
            <div className="overflow-x-auto border rounded-lg shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">U. Medida</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">P. Compra</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">P. Venta</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total (S/.)</th>
                            <th className="px-3 py-2"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {inventario.length === 0 && (
                            <tr><td colSpan="7" className="text-center py-4 text-gray-400">No hay productos registrados</td></tr>
                        )}
                        {inventario.map((item, index) => (
                            <tr key={index}>
                                <td className="p-1"><input type="text" className="w-full border-gray-300 rounded text-sm p-1" value={item.nombre_producto} onChange={(e) => handleProductChange(index, 'nombre_producto', e.target.value)} disabled={isDisabled}/></td>
                                <td className="p-1"><input type="text" className="w-full border-gray-300 rounded text-sm p-1" value={item.unidad_medida} onChange={(e) => handleProductChange(index, 'unidad_medida', e.target.value)} disabled={isDisabled}/></td>
                                <td className="p-1"><input type="number" className="w-full border-gray-300 rounded text-sm p-1" value={item.precio_compra_unitario} onChange={(e) => handleProductChange(index, 'precio_compra_unitario', e.target.value)} disabled={isDisabled}/></td>
                                <td className="p-1"><input type="number" className="w-full border-gray-300 rounded text-sm p-1" value={item.precio_venta_unitario} onChange={(e) => handleProductChange(index, 'precio_venta_unitario', e.target.value)} disabled={isDisabled}/></td>
                                <td className="p-1"><input type="number" className="w-full border-gray-300 rounded text-sm p-1" value={item.cantidad_inventario} onChange={(e) => handleProductChange(index, 'cantidad_inventario', e.target.value)} disabled={isDisabled}/></td>
                                <td className="p-1"><input type="number" className="w-full border-gray-300 bg-gray-100 rounded text-sm p-1 font-bold text-gray-700" value={item.precio_total_estimado} readOnly /></td>
                                <td className="p-1 text-center">
                                    <button type="button" onClick={() => removeProducto(index)} className="text-red-500 hover:text-red-700 font-bold" disabled={isDisabled}>✕</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
         </div>

         <hr className="border-gray-300 my-4"/>

         {/* 4. Cobranzas y Activos Fijos */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cobranzas */}
            <div className="bg-yellow-50 p-3 rounded border border-yellow-100">
                <h4 className="font-bold text-yellow-800 mb-2">8. Cuentas por Cobrar</h4>
                <div className="grid grid-cols-2 gap-2 mb-2">
                    <input type="number" name="cuentas_por_cobrar_monto" placeholder="Monto Total" value={formData.cuentas_por_cobrar_monto ?? ''} onChange={handleInputChange} className="input-form" disabled={isDisabled} />
                    <input type="number" name="cuentas_por_cobrar_num_clientes" placeholder="# Clientes" value={formData.cuentas_por_cobrar_num_clientes ?? ''} onChange={handleInputChange} className="input-form" disabled={isDisabled} />
                </div>
                <input type="text" name="tiempo_recuperacion" placeholder="Tiempo Recuperación" value={formData.tiempo_recuperacion ?? ''} onChange={handleInputChange} className="input-form mb-2" disabled={isDisabled} />
                
                <label className="block text-xs font-bold text-gray-500 mb-1">Foto Apuntes Cobranza:</label>
                <input type="file" name="foto_apuntes_cobranza" accept="image/*" onChange={handleFileChange} className="text-xs w-full" disabled={isDisabled} />
                {formData.foto_apuntes_cobranza && <span className="text-xs text-green-600 block mt-1">Archivo seleccionado</span>}
            </div>

            {/* Activo Fijo */}
            <div className="bg-green-50 p-3 rounded border border-green-100">
                <h4 className="font-bold text-green-800 mb-2">9. Activo Fijo</h4>
                <textarea name="detalle_activo_fijo" placeholder="Detalle del activo..." value={formData.detalle_activo_fijo ?? ''} onChange={handleInputChange} className="input-form h-16 mb-2" disabled={isDisabled} />
                <input type="number" name="valor_actual_activo_fijo" placeholder="Valor Actual (S/.)" value={formData.valor_actual_activo_fijo ?? ''} onChange={handleInputChange} className="input-form mb-2" disabled={isDisabled} />
                
                <label className="block text-xs font-bold text-gray-500 mb-1">Foto Activo Fijo:</label>
                <input type="file" name="foto_activo_fijo" accept="image/*" onChange={handleFileChange} className="text-xs w-full" disabled={isDisabled} />
                {formData.foto_activo_fijo && <span className="text-xs text-green-600 block mt-1">Archivo seleccionado</span>}
            </div>
         </div>

         {/* 5. Gastos y Efectivo */}
         <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label className="label-form">Efectivo Actual (S/.)</label>
                <input type="number" name="monto_efectivo" value={formData.monto_efectivo ?? ''} onChange={handleInputChange} className="input-form" disabled={isDisabled} />
            </div>
            <div>
                <label className="label-form">Gastos Adm. Fijos</label>
                <input type="number" name="gastos_administrativos_fijos" value={formData.gastos_administrativos_fijos ?? ''} onChange={handleInputChange} className="input-form" disabled={isDisabled} />
            </div>
            <div>
                <label className="label-form">Gastos Op. Variables</label>
                <input type="number" name="gastos_operativos_variables" value={formData.gastos_operativos_variables ?? ''} onChange={handleInputChange} className="input-form" disabled={isDisabled} />
            </div>
         </div>

      </div>

      {/* Estilos utilitarios incrustados para este componente */}
      <style>{`
        .label-form { display: block; font-size: 0.875rem; font-weight: 600; color: #b91c1c; margin-bottom: 0.25rem; }
        .input-form { width: 100%; padding: 0.5rem; border: 1px solid #eab308; border-radius: 0.25rem; font-size: 0.95rem; }
        .input-form:disabled { background-color: #f3f4f6; border-color: #d1d5db; color: #6b7280; }
      `}</style>
    </div>
  );
};

export default DatosNegocioForm;