import React from 'react';

const GarantiasForm = ({ formData, handleInputChange, isDisabled }) => {
    // Aseguramos que sea un array
    const garantias = formData || [];

    // 1. Agregar nueva garantía vacía
    const addGarantia = () => {
        const nuevaGarantia = {
            es_declaracion_jurada: 1, // Por defecto marcado como Decl. Jurada
            moneda: 'PEN',
            clase_garantia: '',
            documento_garantia: '',
            tipo_garantia: '',
            descripcion_bien: '',
            direccion_bien: '',
            monto_garantia: 0,
            valor_comercial: 0,
            valor_realizacion: 0,
            ficha_registral: '',
            fecha_ultima_valuacion: ''
        };
        // Enviamos el array actualizado al padre
        const nuevoArray = [...garantias, nuevaGarantia];
        handleInputChange({ target: { name: 'garantias', value: nuevoArray } });
    };

    // 2. Eliminar garantía
    const removeGarantia = (index) => {
        const nuevoArray = garantias.filter((_, i) => i !== index);
        handleInputChange({ target: { name: 'garantias', value: nuevoArray } });
    };

    // 3. Editar campo de una fila
    const handleRowChange = (index, field, value) => {
        const nuevoArray = [...garantias];
        nuevoArray[index] = { ...nuevoArray[index], [field]: value };
        handleInputChange({ target: { name: 'garantias', value: nuevoArray } });
    };

    // 4. Manejo Exclusivo de Checkboxes (Declaración vs Real)
    const handleTypeChange = (index, isDeclaracionJurada) => {
        const nuevoArray = [...garantias];
        // Si isDeclaracionJurada es true, el valor es 1, sino 0
        nuevoArray[index].es_declaracion_jurada = isDeclaracionJurada ? 1 : 0;
        handleInputChange({ target: { name: 'garantias', value: nuevoArray } });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-gray-800 font-bold">Listado de Bienes / Garantías</h3>
                <button 
                    type="button" 
                    onClick={addGarantia} 
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm font-bold shadow"
                    disabled={isDisabled}
                >
                    + Agregar Garantía
                </button>
            </div>

            <div className="overflow-x-auto border rounded-lg shadow-sm bg-white">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-2 py-2 text-left font-bold text-gray-700 min-w-[150px]">Tipo (Seleccione uno)</th>
                            <th className="px-2 py-2 text-left font-medium text-gray-500 min-w-[80px]">Moneda</th>
                            <th className="px-2 py-2 text-left font-medium text-gray-500 min-w-[120px]">Clase</th>
                            <th className="px-2 py-2 text-left font-medium text-gray-500 min-w-[120px]">Documento</th>
                            <th className="px-2 py-2 text-left font-medium text-gray-500 min-w-[200px]">Descripción del Bien</th>
                            <th className="px-2 py-2 text-left font-medium text-gray-500 min-w-[150px]">Dirección</th>
                            <th className="px-2 py-2 text-left font-medium text-gray-500 min-w-[100px]">V. Comercial</th>
                            <th className="px-2 py-2 text-left font-medium text-gray-500 min-w-[100px]">V. Realización</th>
                            <th className="px-2 py-2"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {garantias.length === 0 && (
                            <tr><td colSpan="9" className="text-center py-6 text-gray-400">No hay garantías registradas.</td></tr>
                        )}
                        {garantias.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                {/* TIPO: CHECKBOXES EXCLUYENTES */}
                                <td className="px-2 py-2 align-top">
                                    <div className="flex flex-col gap-1">
                                        <label className="flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={item.es_declaracion_jurada === 1} 
                                                onChange={() => handleTypeChange(index, true)}
                                                disabled={isDisabled}
                                                className="form-checkbox text-blue-600 h-4 w-4"
                                            />
                                            <span className="ml-2 text-xs">Dec. Jurada</span>
                                        </label>
                                        <label className="flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={item.es_declaracion_jurada === 0} 
                                                onChange={() => handleTypeChange(index, false)}
                                                disabled={isDisabled}
                                                className="form-checkbox text-blue-600 h-4 w-4"
                                            />
                                            <span className="ml-2 text-xs">Garantía Real</span>
                                        </label>
                                    </div>
                                </td>

                                <td className="px-2 py-2 align-top">
                                    <select 
                                        value={item.moneda} 
                                        onChange={(e) => handleRowChange(index, 'moneda', e.target.value)}
                                        className="w-full border-gray-300 rounded text-xs p-1"
                                        disabled={isDisabled}
                                        required // <--- OBLIGATORIO
                                    >
                                        <option value="PEN">S/.</option>
                                        <option value="USD">$</option>
                                    </select>
                                </td>

                                <td className="px-2 py-2 align-top">
                                    <input type="text" placeholder="Ej: Inmueble" value={item.clase_garantia} onChange={(e) => handleRowChange(index, 'clase_garantia', e.target.value)} className="w-full border-gray-300 rounded text-xs p-1" disabled={isDisabled} required /> 
                                </td>
                                <td className="px-2 py-2 align-top">
                                    <input type="text" placeholder="Ej: Título" value={item.documento_garantia} onChange={(e) => handleRowChange(index, 'documento_garantia', e.target.value)} className="w-full border-gray-300 rounded text-xs p-1" disabled={isDisabled} required />
                                </td>
                                <td className="px-2 py-2 align-top">
                                    <textarea rows="2" placeholder="Descripción..." value={item.descripcion_bien} onChange={(e) => handleRowChange(index, 'descripcion_bien', e.target.value)} className="w-full border-gray-300 rounded text-xs p-1" disabled={isDisabled} required />
                                </td>
                                <td className="px-2 py-2 align-top">
                                    <input type="text" placeholder="Dirección..." value={item.direccion_bien} onChange={(e) => handleRowChange(index, 'direccion_bien', e.target.value)} className="w-full border-gray-300 rounded text-xs p-1" disabled={isDisabled} required />
                                </td>
                                
                                {/* Montos */}
                                <td className="px-2 py-2 align-top">
                                    <input type="number" placeholder="0.00" value={item.valor_comercial} onChange={(e) => handleRowChange(index, 'valor_comercial', e.target.value)} className="w-full border-gray-300 rounded text-xs p-1" disabled={isDisabled} required />
                                </td>
                                <td className="px-2 py-2 align-top">
                                    <input type="number" placeholder="0.00" value={item.valor_realizacion} onChange={(e) => handleRowChange(index, 'valor_realizacion', e.target.value)} className="w-full border-gray-300 rounded text-xs p-1" disabled={isDisabled} required />
                                </td>

                                <td className="px-2 py-2 text-center align-top">
                                    <button 
                                        type="button" 
                                        onClick={() => removeGarantia(index)} 
                                        className="text-red-500 hover:text-red-700 font-bold bg-red-50 p-1 rounded"
                                        disabled={isDisabled}
                                    >
                                        ✕
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GarantiasForm;