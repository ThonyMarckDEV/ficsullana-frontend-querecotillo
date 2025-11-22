import React from 'react';

const UnidadFamiliarForm = ({ formData, handleInputChange, isDisabled }) => {

    // Helper para manejar el Checkbox (convierte true/false a 1/0 para Laravel)
    const handleCheckboxChange = (e) => {
        const isChecked = e.target.checked;
        handleInputChange({
            target: {
                name: e.target.name,
                value: isChecked ? 1 : 0
            }
        });
    };

    return (
        <div className="space-y-4">
            {/* --- SECCIÓN A: DATOS BÁSICOS Y GASTOS FIJOS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-red-700 font-semibold">Número de Miembros</label>
                    <input
                        type="number"
                        name="numero_miembros"
                        value={formData.numero_miembros ?? ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-yellow-500 rounded"
                        disabled={isDisabled}
                        required // <--- OBLIGATORIO
                    />
                </div>
                <div>
                    <label className="block text-red-700 font-semibold">Gastos de Alimentación (S/.)</label>
                    <input
                        type="number"
                        step="0.01"
                        name="gastos_alimentacion"
                        value={formData.gastos_alimentacion ?? ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-yellow-500 rounded"
                        disabled={isDisabled}
                        required // <--- OBLIGATORIO
                    />
                </div>
                
                {/* Gastos Servicios y Movilidad */}
                <div>
                    <label className="block text-red-700 font-semibold">Gastos de Servicios (Luz, Agua, etc)</label>
                    <input
                        type="number"
                        step="0.01"
                        name="gastos_servicios"
                        value={formData.gastos_servicios ?? ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-yellow-500 rounded"
                        disabled={isDisabled}
                        required // <--- OBLIGATORIO
                    />
                </div>
                <div>
                    <label className="block text-red-700 font-semibold">Gastos de Movilidad</label>
                    <input
                        type="number"
                        step="0.01"
                        name="gastos_movilidad"
                        value={formData.gastos_movilidad ?? ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-yellow-500 rounded"
                        disabled={isDisabled}
                        required // <--- OBLIGATORIO
                    />
                </div>
            </div>

            <hr className="border-yellow-200 my-2" />

            {/* --- SECCIÓN B: EDUCACIÓN --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-red-700 font-semibold">Gastos de Educación (S/.)</label>
                    <input
                        type="number"
                        step="0.01"
                        name="gastos_educacion"
                        value={formData.gastos_educacion ?? ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-yellow-500 rounded"
                        disabled={isDisabled}
                        required // <--- OBLIGATORIO
                    />
                </div>
                <div>
                    <label className="block text-red-700 font-semibold">Detalle Educación (Escolar/Univ)</label>
                    <input
                        type="text"
                        name="detalle_educacion"
                        value={formData.detalle_educacion ?? ''}
                        onChange={handleInputChange}
                        placeholder="Ej: 1 hijo en universidad, 1 en colegio..."
                        className="w-full p-2 border border-yellow-500 rounded"
                        disabled={isDisabled}
                        required // <--- OBLIGATORIO
                    />
                </div>
            </div>

            <hr className="border-yellow-200 my-2" />

            {/* --- SECCIÓN C: DEUDAS IFIS (CONDICIONAL) --- */}
            <div className="bg-yellow-50 p-3 rounded border border-yellow-100">
                <div className="flex items-center mb-3">
                    <input
                        type="checkbox"
                        id="tiene_deudas_ifis"
                        name="tiene_deudas_ifis"
                        checked={formData.tiene_deudas_ifis === 1}
                        onChange={handleCheckboxChange}
                        className="w-5 h-5 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                        disabled={isDisabled}
                        // NO REQUIRED: Es un checkbox, puede ir marcado o no.
                    />
                    <label htmlFor="tiene_deudas_ifis" className="ml-2 block text-red-700 font-bold cursor-pointer select-none">
                        ¿Cuenta con deudas en otras IFIS (Instituciones Financieras)?
                    </label>
                </div>

                {/* Se muestran solo si el checkbox está marcado */}
                {/* NOTA: Estos campos son condicionales. Al renderizarse solo cuando el check está activo, el 'required' solo aplicará si son visibles. */}
                {formData.tiene_deudas_ifis === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
                        {/* IFI 1 */}
                        <div className="p-2 border border-dashed border-yellow-400 rounded bg-white">
                            <p className="font-bold text-gray-600 text-sm mb-2">IFI 01</p>
                            <input
                                type="text"
                                name="ifi_1_nombre"
                                placeholder="Nombre Entidad"
                                value={formData.ifi_1_nombre ?? ''}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded mb-2 text-sm"
                                disabled={isDisabled}
                                required // <--- Si activa deudas, debe llenar al menos la IFI 1
                            />
                            <input
                                type="number"
                                step="0.01"
                                name="ifi_1_cuota"
                                placeholder="Monto Cuota"
                                value={formData.ifi_1_cuota ?? ''}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded text-sm"
                                disabled={isDisabled}
                                required // <--- Si activa deudas, debe llenar al menos la IFI 1
                            />
                        </div>

                        {/* IFI 2 (Opcionales, el usuario podría tener solo 1 deuda) */}
                        <div className="p-2 border border-dashed border-yellow-400 rounded bg-white">
                            <p className="font-bold text-gray-600 text-sm mb-2">IFI 02</p>
                            <input
                                type="text"
                                name="ifi_2_nombre"
                                placeholder="Nombre Entidad"
                                value={formData.ifi_2_nombre ?? ''}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded mb-2 text-sm"
                                disabled={isDisabled}
                            />
                            <input
                                type="number"
                                step="0.01"
                                name="ifi_2_cuota"
                                placeholder="Monto Cuota"
                                value={formData.ifi_2_cuota ?? ''}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded text-sm"
                                disabled={isDisabled}
                            />
                        </div>

                        {/* IFI 3 (Opcional) */}
                        <div className="p-2 border border-dashed border-yellow-400 rounded bg-white">
                            <p className="font-bold text-gray-600 text-sm mb-2">IFI 03</p>
                            <input
                                type="text"
                                name="ifi_3_nombre"
                                placeholder="Nombre Entidad"
                                value={formData.ifi_3_nombre ?? ''}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded mb-2 text-sm"
                                disabled={isDisabled}
                            />
                            <input
                                type="number"
                                step="0.01"
                                name="ifi_3_cuota"
                                placeholder="Monto Cuota"
                                value={formData.ifi_3_cuota ?? ''}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded text-sm"
                                disabled={isDisabled}
                            />
                        </div>
                    </div>
                )}
            </div>

            <hr className="border-yellow-200 my-2" />

            {/* --- SECCIÓN D: SALUD --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-red-700 font-semibold">Gastos de Salud (S/.)</label>
                    <input
                        type="number"
                        step="0.01"
                        name="gastos_salud"
                        value={formData.gastos_salud ?? ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-yellow-500 rounded"
                        disabled={isDisabled}
                        required // <--- OBLIGATORIO
                    />
                </div>
                <div>
                    <label className="block text-red-700 font-semibold">Frecuencia Salud</label>
                    <select
                        name="frecuencia_salud"
                        value={formData.frecuencia_salud ?? ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-yellow-500 rounded"
                        disabled={isDisabled}
                        required // <--- OBLIGATORIO
                    >
                        <option value="">Seleccione...</option>
                        <option value="mensual">Mensual</option>
                        <option value="semanal">Semanal</option>
                        <option value="esporadico">Esporádico</option>
                        <option value="anual">Anual</option>
                    </select>
                </div>
                <div>
                    <label className="block text-red-700 font-semibold">Detalle Salud</label>
                    <input
                        type="text"
                        name="detalle_salud"
                        placeholder="Situación actual..."
                        value={formData.detalle_salud ?? ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-yellow-500 rounded"
                        disabled={isDisabled}
                        required // <--- OBLIGATORIO
                    />
                </div>
            </div>
        </div>
    );
};

export default UnidadFamiliarForm;