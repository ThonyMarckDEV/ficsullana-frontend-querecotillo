import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; 
import API_BASE_URL from 'js/urlHelper';
import logoFic from 'assets/img/Logo_FICSULLANA.png';

const PdfIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
);

// --- HELPER PARA CONVERTIR IMAGEN A BASE64 ---
const getImageData = (url) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous'; // Importante para imágenes externas (CORS)
        img.src = url;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => {
            console.warn(`No se pudo cargar la imagen: ${url}`);
            resolve(null); // Resolvemos con null para no romper el flujo
        };
    });
};

const EvaluacionDetailModal = ({ isOpen, onClose, data }) => {
    if (!isOpen || !data) return null;

    const clienteDatos = data.cliente?.datos || {};
    const negocio = data.datos_negocio || {};
    const inventario = negocio.detalle_inventario || [];
    const familia = data.unidad_familiar || {};
    const garantias = data.garantias || [];
    const aval = data.aval;
    const credito = data; 

    const currency = (val) => val ? `S/ ${parseFloat(val).toFixed(2)}` : 'S/ 0.00';

    // --- FUNCIÓN GENERADORA DE PDF (AHORA ASÍNCRONA) ---
    const generatePDF = async () => {
        const doc = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });

        // Configuración de fuentes
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);

 // --- ENCABEZADO (LOGO E IMAGEN) ---
        try {
            // Intentamos cargar el logo local
            const logoBase64 = await getImageData(logoFic);
            if (logoBase64) {
                // AJUSTE DE LOGO: Más alto (30) y centrado. Posición Y=2 para aprovechar margen superior.
                doc.addImage(logoBase64, 'PNG', 10, 2, 50, 30); 
            } else {
                // Fallback si no carga el logo
                doc.text("Fic Sullana", 12, 20);
            }
        } catch (e) {
            console.error("Error logo PDF", e);
            doc.text("Fic Sullana", 12, 20);
        }
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.text("FORMATO DE SOLICITUD DE CRÉDITO", 80, 18);
        doc.setFontSize(8);
        doc.text(`FECHA: ${new Date().toLocaleDateString()}`, 170, 18);

        // --- HELPER PARA DIBUJAR CAJAS Y TEXTO ---
        let currentY = 28;
        
        const drawSectionTitle = (title, y) => {
            doc.setFillColor(200, 200, 200); 
            doc.rect(10, y, 190, 6, 'F');
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.setTextColor(0);
            doc.text(title, 12, y + 4.5);
            return y + 6;
        };

        const drawField = (label, value, x, y, w) => {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7);
            doc.rect(x, y, w, 8); 
            doc.text(label, x + 1, y + 3); 
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            const textValue = String(value || "").substring(0, 35); 
            doc.text(textValue, x + 1, y + 7); 
        };

        // ================= SECCIÓN 1: DATOS PERSONALES =================
        currentY = drawSectionTitle("1. DATOS PERSONALES DEL SOLICITANTE", currentY);
        
        drawField("Doc. Identidad", clienteDatos.dni, 10, currentY, 30);
        drawField("Apellido Paterno", clienteDatos.apellidoPaterno, 40, currentY, 50);
        drawField("Apellido Materno", clienteDatos.apellidoMaterno, 90, currentY, 50);
        drawField("Nombres", clienteDatos.nombre, 140, currentY, 60);
        currentY += 8;

        drawField("Fecha Nacimiento", clienteDatos.fechaNacimiento, 10, currentY, 30);
        drawField("Sexo", clienteDatos.sexo, 40, currentY, 20);
        drawField("Estado Civil", clienteDatos.estadoCivil, 60, currentY, 30);
        drawField("Nacionalidad", clienteDatos.nacionalidad, 90, currentY, 30);
        drawField("Celular", clienteDatos.contactos?.[0]?.telefonoMovil || "", 120, currentY, 30);
        drawField("Correo", clienteDatos.contactos?.[0]?.correo || "", 150, currentY, 50);
        currentY += 8;

        const direccion = clienteDatos.direcciones?.[0] || {};
        drawField("Dirección", direccion.direccionFiscal || "", 10, currentY, 100);
        drawField("Distrito", direccion.distrito || "", 110, currentY, 30);
        drawField("Provincia", direccion.provincia || "", 140, currentY, 30);
        drawField("Dpto", direccion.departamento || "", 170, currentY, 30);
        currentY += 8;
        
        drawField("Tipo Vivienda", direccion.tipoVivienda || "", 10, currentY, 40);
        const empleo = clienteDatos.empleos?.[0] || {};
        drawField("Centro Laboral", empleo.centroLaboral || "", 50, currentY, 70);
        drawField("Ingreso Mensual", currency(empleo.ingresoMensual), 120, currentY, 40);
        drawField("Situación Lab.", empleo.situacionLaboral || "", 160, currentY, 40);
        currentY += 10; 

        // ================= SECCIÓN 2: UNIDAD FAMILIAR Y NEGOCIO =================
        const startYSec2 = currentY;
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text("A. De la Unidad Familiar", 10, currentY + 4);
        doc.rect(10, currentY + 5, 90, 35); 
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        let innerY = currentY + 10;
        doc.text(`1. Miembros: ${familia.numero_miembros || 0}`, 12, innerY); innerY += 5;
        doc.text(`2. Gastos Alimentación: ${currency(familia.gastos_alimentacion)}`, 12, innerY); innerY += 5;
        doc.text(`3. Gastos Educación: ${currency(familia.gastos_educacion)}`, 12, innerY); innerY += 5;
        doc.text(`4. Gastos Servicios: ${currency(familia.gastos_servicios)}`, 12, innerY); innerY += 5;
        doc.text(`5. Gastos Salud: ${currency(familia.gastos_salud)}`, 12, innerY); innerY += 5;
        doc.text(`6. Deudas IFIs: ${familia.tiene_deudas_ifis ? 'SI' : 'NO'}`, 12, innerY);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text("B. Del Negocio (Resumen)", 105, currentY + 4);
        doc.rect(105, currentY + 5, 95, 35); 

        innerY = currentY + 10;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text(`Ventas Diarias: ${currency(negocio.ventas_diarias)}`, 108, innerY); innerY += 5;
        doc.text(`Efectivo Actual: ${currency(negocio.monto_efectivo)}`, 108, innerY); innerY += 5;
        doc.text(`Activo Fijo: ${currency(negocio.valor_actual_activo_fijo)}`, 108, innerY); innerY += 5;
        doc.text(`Última Compra: ${currency(negocio.monto_ultima_compra)} (${negocio.fecha_ultima_compra})`, 108, innerY); innerY += 5;
        doc.text(`Gastos Operativos: ${currency(negocio.gastos_operativos_variables)}`, 108, innerY);
        
        currentY += 45; 

        // ================= SECCIÓN 3: SOLICITUD DE CRÉDITO =================
        currentY = drawSectionTitle("3. SOLICITUD DE CRÉDITO", currentY);
        
        drawField("Producto", credito.producto, 10, currentY, 40);
        drawField("Monto Solicitado", currency(credito.montoPrestamo), 50, currentY, 35);
        drawField("Plazo (Cuotas)", `${credito.cuotas} (${credito.periodoCredito})`, 85, currentY, 35);
        drawField("Tasa %", `${credito.tasaInteres}%`, 120, currentY, 20);
        drawField("Modalidad", credito.modalidadCredito, 140, currentY, 60);
        currentY += 8;
        drawField("Destino del Crédito", credito.destinoCredito, 10, currentY, 190);
        currentY += 12;

        // ================= SECCIÓN 4: GARANTÍAS =================
        currentY = drawSectionTitle("4. GARANTÍAS DEL SOLICITANTE", currentY);
        
        doc.setFontSize(7);
        doc.setFillColor(240, 240, 240);
        doc.rect(10, currentY, 190, 6, 'F');
        doc.setFont("helvetica", "bold");
        doc.text("Clase", 12, currentY + 4);
        doc.text("Descripción del Bien", 40, currentY + 4);
        doc.text("Valor Comercial", 140, currentY + 4);
        doc.text("Valor Realización", 170, currentY + 4);
        currentY += 6;

        garantias.forEach(g => {
            doc.setFont("helvetica", "normal");
            doc.rect(10, currentY, 190, 6);
            doc.text(g.clase_garantia || "", 12, currentY + 4);
            doc.text((g.descripcion_bien || "").substring(0, 60), 40, currentY + 4);
            doc.text(currency(g.valor_comercial), 140, currentY + 4);
            doc.text(currency(g.valor_realizacion), 170, currentY + 4);
            currentY += 6;
        });
        currentY += 5;

        // ================= SECCIÓN 5: DATOS DEL AVAL =================
        if (aval) {
            currentY = drawSectionTitle("5. DATOS PERSONALES DEL AVAL", currentY);
            drawField("DNI / RUC", aval.dniAval, 10, currentY, 30);
            drawField("Nombres y Apellidos", `${aval.nombresAval} ${aval.apellidoPaternoAval} ${aval.apellidoMaternoAval}`, 40, currentY, 110);
            drawField("Celular", aval.telefonoMovilAval, 150, currentY, 50);
            currentY += 8;
            drawField("Dirección", aval.direccionAval, 10, currentY, 100);
            drawField("Referencia", aval.referenciaDomicilioAval, 110, currentY, 90);
            currentY += 10;
        } else {
             currentY = drawSectionTitle("5. DATOS PERSONALES DEL AVAL", currentY);
             doc.setFont("helvetica", "italic");
             doc.text("NO APLICA AVAL", 15, currentY + 5);
             currentY += 10;
        }

        // ================= SECCIÓN 7: FIRMAS =================
        if (currentY > 240) {
            doc.addPage();
            currentY = 20;
        } else {
            currentY += 10; 
        }

        currentY = drawSectionTitle("7. FIRMA DE LOS SOLICITANTES", currentY);
        
        const signatureBoxY = currentY + 10;
        
        // --- FIRMA CLIENTE ---
        doc.rect(20, signatureBoxY, 80, 40); // Caja Firma Cliente (más grande)
        
        // Descargar e insertar Firma Cliente
        if (clienteDatos.url_firma) {
            try {
                const firmaClienteImg = await getImageData(`${API_BASE_URL}${clienteDatos.url_firma}`);
                if (firmaClienteImg) {
                    // Centrar firma en el recuadro (x=20, y=signatureBoxY, w=80, h=40)
                    // Añadimos margen interno
                    doc.addImage(firmaClienteImg, 'PNG', 30, signatureBoxY + 2, 60, 25);
                }
            } catch (error) {
                console.error("Error cargando firma cliente", error);
            }
        }

        doc.setFontSize(8);
        doc.text("TITULAR DE CRÉDITO", 45, signatureBoxY + 32);
        doc.text(`${clienteDatos.nombre} ${clienteDatos.apellidoPaterno}`, 25, signatureBoxY + 36);
        doc.text(`DNI: ${clienteDatos.dni}`, 25, signatureBoxY + 39);

        // --- FIRMA AVAL (si existe) ---
        if (aval) {
            doc.rect(110, signatureBoxY, 80, 40); // Caja Firma Aval
            
            // Descargar e insertar Firma Aval
            if (aval.url_firma) {
                try {
                    const firmaAvalImg = await getImageData(`${API_BASE_URL}${aval.url_firma}`);
                    if (firmaAvalImg) {
                         doc.addImage(firmaAvalImg, 'PNG', 120, signatureBoxY + 2, 60, 25);
                    }
                } catch (error) {
                    console.error("Error cargando firma aval", error);
                }
            }

            doc.text("AVAL DE CRÉDITO", 135, signatureBoxY + 32);
            doc.text(`${aval.nombresAval} ${aval.apellidoPaternoAval}`, 115, signatureBoxY + 36);
            doc.text(`DNI: ${aval.dniAval}`, 115, signatureBoxY + 39);
        }

        // --- PIE DE PÁGINA ---
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.text('Generado por Sistema de Créditos - Fic Sullana', 10, 290);
            doc.text(`Página ${i} de ${pageCount}`, 190, 290, { align: 'right' });
        }

        doc.save(`Solicitud_Credito_${clienteDatos.dni}.pdf`);
    };

    const RenderImagen = ({ titulo, url, descripcion, isSignature = false }) => {
        const fullUrl = url ? `${API_BASE_URL}${url}` : null;
        return (
            <div className="border rounded-lg p-4 flex flex-col items-center justify-center bg-white shadow-sm h-full">
                <h4 className="font-bold text-gray-700 mb-2 border-b w-full text-center pb-1">
                    {titulo}
                </h4>
                {descripcion && <p className="text-xs text-gray-500 mb-3 text-center">{descripcion}</p>}
                {fullUrl ? (
                    <div className="w-full h-48 flex items-center justify-center overflow-hidden border border-gray-200 rounded bg-gray-50 cursor-pointer hover:opacity-90 transition-opacity" 
                         onClick={() => window.open(fullUrl, '_blank')}>
                        <img 
                            src={fullUrl} 
                            alt={`Imagen ${titulo}`} 
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => { e.target.src = ''; e.target.alt = 'Error al cargar imagen'; }}
                        />
                    </div>
                ) : (
                    <div className={`w-full ${isSignature ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'} border rounded p-3 text-center`}>
                        <div className="text-3xl mb-1">{isSignature ? '❌' : '📷'}</div>
                        <p className={`font-bold ${isSignature ? 'text-red-600' : 'text-gray-400'} text-sm mb-1`}>
                            {isSignature ? 'SIN FIRMA DIGITAL' : 'Sin Imagen'}
                        </p>
                        {isSignature && (
                            <p className="text-xs text-red-500 italic">
                                Sugerencia: Rechazar con observación <br/>
                                <strong>"Agregar firma del {titulo.toLowerCase()}"</strong>
                            </p>
                        )}
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
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold text-gray-800">Detalle de Evaluación #{data.id}</h2>
                            
                            {/* BOTÓN GENERAR PDF - SOLO SI ESTADO ES 1 (Aceptada/Aprobada) */}
                            {data.estado === 1 && (
                                <button 
                                    onClick={generatePDF}
                                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded shadow-sm text-sm font-bold transition-all transform hover:scale-105"
                                    title="Descargar Solicitud en PDF"
                                >
                                    <PdfIcon />
                                    Generar Solicitud PDF
                                </button>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
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

                        {/* Evidencias Fotográficas del Negocio */}
                        <div className="mb-6">
                            <h4 className="font-semibold text-gray-700 mb-3 text-sm border-l-4 border-blue-500 pl-2">Evidencias Fotográficas</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <RenderImagen 
                                    titulo="Apuntes de Cobranza"
                                    descripcion="Evidencia de Cuentas por Cobrar"
                                    url={negocio.url_foto_cobranza}
                                />
                                <RenderImagen 
                                    titulo="Activo Fijo"
                                    descripcion={`Valor ref: ${currency(negocio.valor_actual_activo_fijo)}`}
                                    url={negocio.url_foto_activo_fijo}
                                />
                            </div>
                        </div>

                        {/* Tabla Inventario */}
                        <h4 className="font-semibold text-gray-700 mb-2 text-sm ml-1">Detalle de Inventario</h4>
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
                                        <div><span className="text-gray-500 block">V. Comercial</span><span className="font-bold">{currency(g.valor_comercial)}</span></div>
                                        {parseFloat(g.valor_realizacion) > 0 && (
                                            <div><span className="text-gray-500 mr-1">V. Realización:</span><span className="font-bold">{currency(g.valor_realizacion)}</span></div>
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

                    {/* 6. FIRMAS */}
                    <section className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-800 border-b border-gray-300 pb-2 mb-4">
                            6. Validación de Firmas
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Firma Cliente */}
                            <RenderImagen 
                                titulo="Firma del Cliente" 
                                descripcion={`${clienteDatos.nombre || ''} ${clienteDatos.apellidoPaterno || ''}`}
                                url={clienteDatos.url_firma} 
                                isSignature={true}
                            />
                            {/* Firma Aval (Solo si existe aval) */}
                            {aval ? (
                                <RenderImagen 
                                    titulo="Firma del Aval" 
                                    descripcion={`${aval.nombresAval || ''} ${aval.apellidoPaternoAval || ''}`}
                                    url={aval.url_firma} 
                                    isSignature={true}
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