import React, { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; 
import API_BASE_URL from 'js/urlHelper';
import logoFic from 'assets/img/Logo_FICSULLANA.png'; 
import { getFirmasEvaluacion } from 'services/evaluacionClienteService';
import ViewPdfModal from 'components/Shared/Modals/ViewPdfModal'; 

const PdfIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
);

const getImageData = (url) => {
    return new Promise((resolve) => {
        if (!url) { resolve(null); return; }
        const img = new Image();
        img.src = url;
        img.crossOrigin = "Anonymous"; 
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => resolve(null);
    });
};

const buildUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path; 
    const cleanBase = API_BASE_URL.replace(/\/$/, ''); 
    const cleanPath = path.startsWith('/') ? path : `/${path}`; 
    return `${cleanBase}${cleanPath}`;
};

const EvaluacionDetailModal = ({ isOpen, onClose, data }) => {
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [pdfBlobUrl, setPdfBlobUrl] = useState(null);

    if (!isOpen || !data) return null;

    const clienteDatos = data.cliente?.datos || {};
    const negocio = data.datos_negocio || {};
    const inventario = negocio.detalle_inventario || [];
    const familia = data.unidad_familiar || {};
    const garantias = data.garantias || [];
    const aval = data.aval;
    const credito = data; 

    const currency = (val) => val ? `S/ ${parseFloat(val).toFixed(2)}` : 'S/ 0.00';

    const generatePDF = async () => {
        const doc = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });

        // 1. OBTENER FIRMAS
        let firmasBase64 = { firma_cliente: null, firma_aval: null };
        try {
            const response = await getFirmasEvaluacion(data.id);
            if(response) firmasBase64 = response;
        } catch (error) {
            console.error("Error obteniendo firmas", error);
        }

        // --- ENCABEZADO ---
        doc.setFont("helvetica", "bold");
        
        // 1. LOGO: Arriba del todo, esquina izquierda
        try {
            const logoBase64 = await getImageData(logoFic);
            if (logoBase64) {
                // x=10, y=5 (Bien arriba)
                // w=60, h=25 (Tamaño rectangular legible)
               doc.addImage(logoBase64, 'PNG', 10, 2, 60, 45);
            } else {
                doc.text("Fic Sullana", 10, 20);
            }
        } catch (e) {
            doc.text("Fic Sullana", 10, 20);
        }
        
        // 2. TÍTULO: Debajo del logo y CENTRADO en la página
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        // x=105 es el centro de una hoja A4 (210mm ancho), align: 'center' centra el texto en ese punto
        doc.text("FORMATO DE SOLICITUD DE CRÉDITO", 105, 40, { align: "center" });
        
        // 3. INICIO CONTENIDO: Dejamos espacio después del título
        let currentY = 50; 
        
        const drawSectionTitle = (title, y) => {
            doc.setFillColor(230, 230, 230); 
            doc.rect(10, y, 190, 6, 'F');
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.setTextColor(0);
            doc.text(title, 12, y + 4.5);
            return y + 6;
        };

        const drawField = (label, value, x, y, w, h = 8) => {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(6);
            doc.rect(x, y, w, h); 
            doc.text(label, x + 1, y + 2.5); 
            
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8); 
            
            const textValue = String(value || "");
            doc.text(textValue, x + 1, y + 6, { maxWidth: w - 2 });
        };

        // --- 1. DATOS PERSONALES ---
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

        // --- 2. FAMILIA Y NEGOCIO ---
        const boxHeight = familia.tiene_deudas_ifis ? 45 : 35; 

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text("A. De la Unidad Familiar", 10, currentY + 4);
        doc.rect(10, currentY + 5, 90, boxHeight); 
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        let innerY = currentY + 10;
        const col1X = 12;
        
        doc.text(`1. Miembros: ${familia.numero_miembros || 0}`, col1X, innerY); innerY += 4.5;
        doc.text(`2. Alimentos: ${currency(familia.gastos_alimentacion)}`, col1X, innerY); innerY += 4.5;
        doc.text(`3. Educación: ${currency(familia.gastos_educacion)}`, col1X, innerY); innerY += 4.5;
        doc.text(`4. Servicios: ${currency(familia.gastos_servicios)}`, col1X, innerY); innerY += 4.5;
        doc.text(`5. Salud: ${currency(familia.gastos_salud)}`, col1X, innerY); innerY += 4.5;
        
        if (familia.tiene_deudas_ifis) {
            doc.setFont("helvetica", "bold");
            doc.text("Deudas Financieras (IFIs):", col1X, innerY); innerY += 4;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7);
            
            if(familia.ifi_1_nombre) {
                doc.text(`- ${familia.ifi_1_nombre}: ${currency(familia.ifi_1_cuota)}`, col1X, innerY); innerY += 3.5;
            }
            if(familia.ifi_2_nombre) {
                doc.text(`- ${familia.ifi_2_nombre}: ${currency(familia.ifi_2_cuota)}`, col1X, innerY); innerY += 3.5;
            }
            if(familia.ifi_3_nombre) {
                doc.text(`- ${familia.ifi_3_nombre}: ${currency(familia.ifi_3_cuota)}`, col1X, innerY);
            }
        } else {
             doc.text(`6. Deudas IFIs: NO`, col1X, innerY);
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text("B. Del Negocio (Resumen)", 105, currentY + 4);
        doc.rect(105, currentY + 5, 95, boxHeight); 
        
        innerY = currentY + 10;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        const col2X = 108;
        
        doc.text(`Ventas Diarias: ${currency(negocio.ventas_diarias)}`, col2X, innerY); innerY += 5;
        doc.text(`Efectivo Actual: ${currency(negocio.monto_efectivo)}`, col2X, innerY); innerY += 5;
        doc.text(`Activo Fijo: ${currency(negocio.valor_actual_activo_fijo)}`, col2X, innerY); innerY += 5;
        
        const compraText = `Última Compra: ${currency(negocio.monto_ultima_compra)} (${negocio.fecha_ultima_compra})`;
        doc.text(compraText, col2X, innerY, { maxWidth: 90 }); 
        innerY += 5;
        
        doc.text(`Gastos Operativos: ${currency(negocio.gastos_operativos_variables)}`, col2X, innerY);

        currentY += boxHeight + 10; 

        // --- 3. SOLICITUD ---
        currentY = drawSectionTitle("3. SOLICITUD DE CRÉDITO", currentY);
        drawField("Producto", credito.producto, 10, currentY, 40);
        drawField("Monto Solicitado", currency(credito.montoPrestamo), 50, currentY, 35);
        drawField("Plazo (Cuotas)", `${credito.cuotas} (${credito.periodoCredito})`, 85, currentY, 35);
        drawField("Tasa %", `${credito.tasaInteres}%`, 120, currentY, 20);
        drawField("Modalidad", credito.modalidadCredito, 140, currentY, 60);
        currentY += 8;
        drawField("Destino del Crédito", credito.destinoCredito, 10, currentY, 190);
        currentY += 12;

        // --- 4. GARANTIAS ---
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
            doc.text((g.descripcion_bien || ""), 40, currentY + 4, { maxWidth: 95 });
            doc.text(currency(g.valor_comercial), 140, currentY + 4);
            doc.text(currency(g.valor_realizacion), 170, currentY + 4);
            currentY += 6;
        });
        currentY += 5;

        // --- 5. AVAL ---
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

        // --- 7. FIRMAS ---
        if (currentY > 230) {
            doc.addPage();
            currentY = 20;
        } else {
            currentY += 10; 
        }

        currentY = drawSectionTitle("7. FIRMA DE LOS SOLICITANTES", currentY);
        const signatureBoxY = currentY + 10;
        
        // FIRMA CLIENTE
        doc.rect(20, signatureBoxY, 80, 40); 
        if (firmasBase64.firma_cliente) {
            try {
                doc.addImage(firmasBase64.firma_cliente, 'PNG', 30, signatureBoxY + 2, 60, 25);
            } catch (error) {}
        }
        
        doc.setFontSize(8);
        doc.text("TITULAR DE CRÉDITO", 45, signatureBoxY + 32);
        doc.text(`${clienteDatos.nombre} ${clienteDatos.apellidoPaterno}`, 25, signatureBoxY + 36);
        doc.text(`DNI: ${clienteDatos.dni}`, 25, signatureBoxY + 39);

        // FIRMA AVAL
        if (aval) {
            doc.rect(110, signatureBoxY, 80, 40);
            if (firmasBase64.firma_aval) {
                try {
                     doc.addImage(firmasBase64.firma_aval, 'PNG', 120, signatureBoxY + 2, 60, 25);
                } catch (error) {}
            }
            doc.text("AVAL DE CRÉDITO", 135, signatureBoxY + 32);
            doc.text(`${aval.nombresAval} ${aval.apellidoPaternoAval}`, 115, signatureBoxY + 36);
            doc.text(`DNI: ${aval.dniAval}`, 115, signatureBoxY + 39);
        }

        // --- FECHA AL FINAL ---
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        const fechaActual = new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' });
        doc.text(`Fecha de emisión: ${fechaActual}`, 190, signatureBoxY + 50, { align: "right" });

        const blob = doc.output('bloburl');
        setPdfBlobUrl(blob);
        setShowPdfModal(true);
    };

    const RenderImagen = ({ titulo, url, descripcion, isSignature = false }) => {
        const fullUrl = buildUrl(url); 
        return (
            <div className="border rounded-lg p-4 flex flex-col items-center justify-center bg-white shadow-sm h-full">
                <h4 className="font-bold text-gray-700 mb-2 border-b w-full text-center pb-1">{titulo}</h4>
                {descripcion && <p className="text-xs text-gray-500 mb-3 text-center">{descripcion}</p>}
                {fullUrl ? (
                    <div className="w-full h-48 flex items-center justify-center overflow-hidden border border-gray-200 rounded bg-gray-50 cursor-pointer hover:opacity-90 transition-opacity" 
                         onClick={() => window.open(fullUrl, '_blank')}>
                        <img 
                            src={fullUrl} 
                            alt={`Imagen ${titulo}`} 
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => { 
                                e.target.src = ''; 
                                e.target.alt = 'Error al cargar imagen'; 
                            }}
                        />
                    </div>
                ) : (
                    <div className={`w-full ${isSignature ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'} border rounded p-3 text-center`}>
                        <div className="text-3xl mb-1">{isSignature ? '❌' : '📷'}</div>
                        <p className={`font-bold ${isSignature ? 'text-red-600' : 'text-gray-400'} text-sm mb-1`}>
                            {isSignature ? 'SIN FIRMA DIGITAL' : 'Sin Imagen'}
                        </p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 overflow-y-auto">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col animate-fadeIn">
                    <div className="flex justify-between items-center p-6 border-b bg-gray-50 rounded-t-lg">
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold text-gray-800">Detalle de Evaluación #{data.id}</h2>
                                {data.estado === 1 && (
                                    <button 
                                        onClick={generatePDF}
                                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded shadow-sm text-sm font-bold transition-all transform hover:scale-105"
                                        title="Ver Solicitud en PDF"
                                    >
                                        <PdfIcon />
                                        Ver Solicitud PDF
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

                    <div className="p-6 overflow-y-auto space-y-8">
                        <section>
                             <h3 className="text-lg font-bold text-blue-800 border-b border-blue-200 pb-2 mb-3 flex items-center gap-2">1. Crédito Solicitado</h3>
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
                        
                        <section>
                            <h3 className="text-lg font-bold text-yellow-700 border-b border-yellow-200 pb-2 mb-3">2. Unidad Familiar</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8 text-sm bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                                <div><span className="font-semibold text-gray-600">Carga Familiar:</span> {familia.numero_miembros} miembros</div>
                                <div><span className="font-semibold text-gray-600">Alimentación:</span> {currency(familia.gastos_alimentacion)}</div>
                                <div><span className="font-semibold text-gray-600">Servicios:</span> {currency(familia.gastos_servicios)}</div>
                                <div><span className="font-semibold text-gray-600">Educación:</span> {currency(familia.gastos_educacion)}</div>
                                <div><span className="font-semibold text-gray-600">Salud:</span> {currency(familia.gastos_salud)}</div>
                                <div className="col-span-1 md:col-span-3 border-t border-yellow-200 pt-3 mt-1">
                                    <span className="font-bold text-gray-700 block mb-1">Deudas Financieras (IFIs):</span>
                                    {familia.tiene_deudas_ifis ? (
                                        <ul className="list-disc pl-5 text-gray-700">
                                            {familia.ifi_1_nombre && <li>{familia.ifi_1_nombre} - Cuota: <span className="font-bold">{currency(familia.ifi_1_cuota)}</span></li>}
                                            {familia.ifi_2_nombre && <li>{familia.ifi_2_nombre} - Cuota: <span className="font-bold">{currency(familia.ifi_2_cuota)}</span></li>}
                                            {familia.ifi_3_nombre && <li>{familia.ifi_3_nombre} - Cuota: <span className="font-bold">{currency(familia.ifi_3_cuota)}</span></li>}
                                        </ul>
                                    ) : (
                                        <span className="text-green-600 font-semibold">No registra deudas en IFIs</span>
                                    )}
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-lg font-bold text-gray-700 border-b pb-2 mb-3">3. Negocio e Inventario</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6 bg-gray-50 p-4 rounded border">
                                <div><span className="font-semibold text-gray-600 block">Ventas Diarias:</span> <span className="text-green-700 font-bold">{currency(negocio.ventas_diarias)}</span></div>
                                <div><span className="font-semibold text-gray-600 block">Efectivo:</span> {currency(negocio.monto_efectivo)}</div>
                                <div><span className="font-semibold text-gray-600 block">Activo Fijo:</span> {currency(negocio.valor_actual_activo_fijo)}</div>
                                <div><span className="font-semibold text-gray-600 block">Gastos Op.:</span> {currency(negocio.gastos_operativos_variables)}</div>
                                <div className="col-span-2"><span className="font-semibold text-gray-600">Última Compra:</span> {negocio.fecha_ultima_compra} ({currency(negocio.monto_ultima_compra)})</div>
                            </div>
                            <div className="mb-6">
                                <h4 className="font-semibold text-gray-700 mb-3 text-sm border-l-4 border-blue-500 pl-2">Evidencias Fotográficas</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <RenderImagen titulo="Apuntes de Cobranza" descripcion="Evidencia de Cuentas por Cobrar" url={negocio.url_foto_cobranza} />
                                    <RenderImagen titulo="Activo Fijo" descripcion={`Valor ref: ${currency(negocio.valor_actual_activo_fijo)}`} url={negocio.url_foto_activo_fijo} />
                                </div>
                            </div>
                            <h4 className="font-semibold text-gray-700 mb-2 text-sm ml-1">Detalle de Inventario</h4>
                            <div className="overflow-hidden border rounded-lg shadow-sm">
                                <table className="min-w-full text-sm text-left">
                                    <thead className="bg-gray-100 font-bold text-gray-600">
                                        <tr>
                                            <th className="p-3">Producto</th><th className="p-3">P. Compra</th><th className="p-3">P. Venta</th><th className="p-3">Stock</th><th className="p-3 text-right">Total Est.</th>
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
                                        )) : (<tr><td colSpan="5" className="p-4 text-center text-gray-400 italic">Sin inventario registrado</td></tr>)}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section>
                             <h3 className="text-lg font-bold text-gray-700 border-b pb-2 mb-3">4. Garantías</h3>
                             <div className="grid gap-4 md:grid-cols-2">
                                 {garantias.length > 0 ? garantias.map((g, idx) => (
                                     <div key={idx} className="border border-l-4 border-l-green-500 rounded-lg p-4 shadow-sm bg-white">
                                          <div className="flex justify-between items-start mb-2">
                                              <p className="font-bold text-gray-800 text-lg">{g.clase_garantia}</p>
                                              <span className={`text-xs px-2 py-1 rounded font-bold ${g.es_declaracion_jurada ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{g.es_declaracion_jurada ? 'Declaración Jurada' : 'Garantía Real'}</span>
                                          </div>
                                          <p className="text-sm text-gray-600 mb-3 italic">"{g.descripcion_bien}"</p>
                                          <div className="grid grid-cols-2 gap-2 text-xs border-t pt-2">
                                              <div><span className="text-gray-500 block">V. Comercial</span><span className="font-bold">{currency(g.valor_comercial)}</span></div>
                                              {parseFloat(g.valor_realizacion) > 0 && (<div><span className="text-gray-500 mr-1">V. Realización:</span><span className="font-bold">{currency(g.valor_realizacion)}</span></div>)}
                                          </div>
                                     </div>
                                 )) : <p className="text-gray-500 text-sm col-span-2 bg-gray-50 p-4 rounded text-center">No hay garantías registradas.</p>}
                             </div>
                        </section>

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

                        <section className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-800 border-b border-gray-300 pb-2 mb-4">6. Validación de Firmas</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <RenderImagen titulo="Firma del Cliente" descripcion={`${clienteDatos.nombre || ''} ${clienteDatos.apellidoPaterno || ''}`} url={clienteDatos.url_firma} isSignature={true} />
                                {aval ? <RenderImagen titulo="Firma del Aval" descripcion={`${aval.nombresAval || ''} ${aval.apellidoPaternoAval || ''}`} url={aval.url_firma} isSignature={true} /> : <div className="border rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 h-full text-gray-400"><p>No aplica Aval</p></div>}
                            </div>
                        </section>
                    </div>

                    <div className="p-4 border-t flex justify-end bg-gray-50 rounded-b-lg">
                        <button onClick={onClose} className="px-6 py-2 bg-gray-800 text-white rounded-md font-bold hover:bg-gray-900 transition-colors shadow-lg">Cerrar Detalle</button>
                    </div>
                </div>
            </div>

            <ViewPdfModal 
                isOpen={showPdfModal} 
                onClose={() => setShowPdfModal(false)} 
                pdfUrl={pdfBlobUrl} 
            />
        </>
    );
};

export default EvaluacionDetailModal;