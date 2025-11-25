import React from 'react';
import API_BASE_URL from 'js/urlHelper'

const EvaluacionDetailModal = ({ isOpen, onClose, data }) => {
    if (!isOpen || !data) return null;

    // --- MAPEO DE DATOS ---
    // Aseguramos acceder a la estructura correcta según tu JSON
    const clienteDatos = data.cliente?.datos || {}; // Accedemos a datos dentro de cliente
    const negocio = data.datos_negocio || {};
    const inventario = negocio.detalle_inventario || [];
    const familia = data.unidad_familiar || {};
    const garantias = data.garantias || [];
    const aval = data.aval;

    // Formateador de moneda
    const currency = (val) => val ? `S/ ${parseFloat(val).toFixed(2)}` : 'S/ 0.00';

    // --- COMPONENTE INTERNO PARA MOSTRAR FIRMA ---
    const RenderFirma = ({ titulo, url, nombre }) => {
        // Construir URL completa si existe ruta relativa
        const fullUrl = url ? `${API_BASE_URL}${url}` : null;

        return (
            <div className="border rounded-lg p-4 flex flex-col items-center justify-center bg-white shadow-sm h-full">
                <h4 className="font-bold text-gray-700 mb-2 border-b w-full text-center pb-1">
                    {titulo}
                </h4>
                <p className="text-xs text-gray-500 mb-3">{nombre}</p>

                {fullUrl ? (
                    <div className="w-full h-40 flex items-center justify-center overflow-hidden border border-gray-200 rounded bg-gray-50">
                        <img 
                            src={fullUrl} 
                            alt={`Firma ${titulo}`} 
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => { e.target.src = ''; e.target.alt = 'Error al cargar imagen'; }}
                        />
                    </div>
                ) : (
                    <div className="w-full bg-red-50 border border-red-200 rounded p-3 text-center animate-pulse">
                        <div className="text-3xl mb-1">❌</div>
                        <p className="font-bold text-red-600 text-sm mb-1">SIN FIRMA DIGITAL</p>
                        <p className="text-xs text-red-500 italic">
                            Sugerencia: Rechazar con observación <br/>
                            <strong>"Agregar firma del {titulo.toLowerCase()}"</strong>
                        </p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col animate-fadeIn">
                
                {/* HEADER */}
                <div className="flex justify-between items-center p-6 border-b bg-gray-50 rounded-t-lg">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Detalle de Evaluación #{data.id}</h2>
                        <p className="text-sm text-gray-500">
                            Producto: <span className="font-semibold text-gray-700">{data.producto}</span> | 
                            Cliente: <span className="font-semibold text-gray-700">{clienteDatos.nombre} {clienteDatos.apellidoPaterno}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-600 font-bold text-3xl transition-colors">&times;</button>
                </div>

                {/* BODY (Scrollable) */}
                <div className="p-6 overflow-y-auto space-y-8">

                    {/* 1. CRÉDITO */}
                    <section>
                        <h3 className="text-lg font-bold text-blue-800 border-b border-blue-200 pb-2 mb-3 flex items-center gap-2">
                            1. Crédito Solicitado
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <div><span className="font-semibold text-gray-600 block">Monto:</span> <span className="text-lg font-bold text-blue-700">{currency(data.montoPrestamo)}</span></div>
                            <div><span className="font-semibold text-gray-600 block">Cuotas:</span> {data.cuotas} ({data.periodoCredito})</div>
                            <div><span className="font-semibold text-gray-600 block">Tasa:</span> {data.tasaInteres}%</div>
                            <div><span className="font-semibold text-gray-600 block">Modalidad:</span> {data.modalidadCredito}</div>
                            <div className="col-span-2 md:col-span-4 mt-2 pt-2 border-t border-blue-200">
                                <span className="font-semibold text-gray-600">Destino:</span> {data.destinoCredito}
                            </div>
                        </div>
                    </section>

                    {/* 2. UNIDAD FAMILIAR */}
                    <section>
                        <h3 className="text-lg font-bold text-yellow-700 border-b border-yellow-200 pb-2 mb-3">2. Unidad Familiar</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8 text-sm bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                            <div><span className="font-semibold text-gray-600">Carga Familiar:</span> {familia.numero_miembros} miembros</div>
                            <div><span className="font-semibold text-gray-600">Deudas IFIs:</span> {familia.tiene_deudas_ifis ? 'SÍ' : 'NO'}</div>
                            <div><span className="font-semibold text-gray-600">Alimentación:</span> {currency(familia.gastos_alimentacion)}</div>
                            <div><span className="font-semibold text-gray-600">Servicios:</span> {currency(familia.gastos_servicios)}</div>
                            <div><span className="font-semibold text-gray-600">Educación:</span> {currency(familia.gastos_educacion)}</div>
                            <div><span className="font-semibold text-gray-600">Salud:</span> {currency(familia.gastos_salud)}</div>
                        </div>
                    </section>

                    {/* 3. NEGOCIO E INVENTARIO */}
                    <section>
                        <h3 className="text-lg font-bold text-gray-700 border-b pb-2 mb-3">3. Negocio e Inventario</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6 bg-gray-50 p-4 rounded border">
                            <div><span className="font-semibold text-gray-600 block">Ventas Diarias:</span> <span className="text-green-700 font-bold">{currency(negocio.ventas_diarias)}</span></div>
                            <div><span className="font-semibold text-gray-600 block">Efectivo:</span> {currency(negocio.monto_efectivo)}</div>
                            <div><span className="font-semibold text-gray-600 block">Activo Fijo:</span> {currency(negocio.valor_actual_activo_fijo)}</div>
                            <div><span className="font-semibold text-gray-600 block">Gastos Op.:</span> {currency(negocio.gastos_operativos_variables)}</div>
                            <div className="col-span-2"><span className="font-semibold text-gray-600">Última Compra:</span> {negocio.fecha_ultima_compra} ({currency(negocio.monto_ultima_compra)})</div>
                        </div>

                        {/* Tabla Inventario */}
                        <div className="overflow-hidden border rounded-lg shadow-sm">
                            <table className="min-w-full text-sm text-left">
                                <thead className="bg-gray-100 font-bold text-gray-600">
                                    <tr>
                                        <th className="p-3">Producto</th>
                                        <th className="p-3">P. Compra</th>
                                        <th className="p-3">P. Venta</th>
                                        <th className="p-3">Stock</th>
                                        <th className="p-3 text-right">Total Est.</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {inventario.length > 0 ? inventario.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="p-3 text-gray-800 font-medium">{item.nombre_producto}</td>
                                            <td className="p-3">{currency(item.precio_compra_unitario)}</td>
                                            <td className="p-3">{currency(item.precio_venta_unitario)}</td>
                                            <td className="p-3">{parseFloat(item.cantidad_inventario)} {item.unidad_medida}</td>
                                            <td className="p-3 text-right font-bold text-green-700">{currency(item.precio_total_estimado)}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="5" className="p-4 text-center text-gray-400 italic">Sin inventario registrado</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* 4. GARANTÍAS */}
                    <section>
                        <h3 className="text-lg font-bold text-gray-700 border-b pb-2 mb-3">4. Garantías</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            {garantias.length > 0 ? garantias.map((g, idx) => (
                                <div key={idx} className="border border-l-4 border-l-green-500 rounded-lg p-4 shadow-sm bg-white">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="font-bold text-gray-800 text-lg">{g.clase_garantia}</p>
                                        <span className={`text-xs px-2 py-1 rounded font-bold ${g.es_declaracion_jurada ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {g.es_declaracion_jurada ? 'Declaración Jurada' : 'Garantía Real'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3 italic">"{g.descripcion_bien}"</p>
                                    <div className="grid grid-cols-2 gap-2 text-xs border-t pt-2">
                                        <div><span className="text-gray-500 block">V. Comercial</span><span className="font-bold">{g.valor_comercial}</span></div>
                                        {parseFloat(g.valor_realizacion) > 0 && (
                                            <div><span className="text-gray-500 mr-1">V. Realización:</span><span className="font-bold">{g.valor_realizacion}</span></div>
                                        )}
                                    </div>
                                </div>
                            )) : <p className="text-gray-500 text-sm col-span-2 bg-gray-50 p-4 rounded text-center">No hay garantías registradas.</p>}
                        </div>
                    </section>

                    {/* 5. AVAL (Si existe) */}
                    {aval && (
                        <section>
                            <h3 className="text-lg font-bold text-purple-700 border-b border-purple-200 pb-2 mb-3">5. Datos del Aval</h3>
                            <div className="text-sm bg-purple-50 p-4 rounded-lg border border-purple-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><span className="font-semibold text-gray-600 block">Nombre:</span> {aval.nombresAval} {aval.apellidoPaternoAval}</div>
                                <div><span className="font-semibold text-gray-600 block">DNI:</span> {aval.dniAval}</div>
                                <div><span className="font-semibold text-gray-600 block">Celular:</span> {aval.telefonoMovilAval}</div>
                                <div><span className="font-semibold text-gray-600 block">Dirección:</span> {aval.direccionAval}</div>
                            </div>
                        </section>
                    )}

                    {/* 6. FIRMAS (NUEVA SECCIÓN) */}
                    <section className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-800 border-b border-gray-300 pb-2 mb-4">
                            6. Validación de Firmas
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Firma Cliente */}
                            <RenderFirma 
                                titulo="Firma del Cliente" 
                                nombre={`${clienteDatos.nombre || ''} ${clienteDatos.apellidoPaterno || ''}`}
                                url={clienteDatos.url_firma} 
                            />

                            {/* Firma Aval (Solo si existe aval) */}
                            {aval ? (
                                <RenderFirma 
                                    titulo="Firma del Aval" 
                                    nombre={`${aval.nombresAval || ''} ${aval.apellidoPaternoAval || ''}`}
                                    url={aval.url_firma} 
                                />
                            ) : (
                                <div className="border rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 h-full text-gray-400">
                                    <p>No aplica Aval</p>
                                </div>
                            )}

                        </div>
                    </section>

                </div>

                {/* FOOTER */}
                <div className="p-4 border-t flex justify-end bg-gray-50 rounded-b-lg">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-800 text-white rounded-md font-bold hover:bg-gray-900 transition-colors shadow-lg"
                    >
                        Cerrar Detalle
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EvaluacionDetailModal;