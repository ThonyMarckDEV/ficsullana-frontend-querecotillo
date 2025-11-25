import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; 
import API_BASE_URL from 'js/urlHelper';
import logoFic from 'assets/img/Logo_FICSULLANA.png'; 
import { getFirmasEvaluacion } from 'services/evaluacionClienteService';

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
    if (!isOpen || !data) return null;

    const clienteDatos = data.cliente?.datos || {};
    const negocio = data.datos_negocio || {};
    const inventario = negocio.detalle_inventario || [];
    const familia = data.unidad_familiar || {};
    const garantias = data.garantias || [];
    const aval = data.aval;
    const credito = data; 

    const currency = (val) => val ? `S/ ${parseFloat(val).toFixed(2)}` : 'S/ 0.00';

    // --- GENERAR PDF ---
    const generatePDF = async () => {
        const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

        let firmasBase64 = { firma_cliente: null, firma_aval: null };
        try {
            const response = await getFirmasEvaluacion(data.id);
            if(response) firmasBase64 = response;
        } catch (error) {
            console.error("Error obteniendo firmas:", error);
        }

        // Header
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        try {
            const logoBase64 = await getImageData(logoFic);
            if (logoBase64) doc.addImage(logoBase64, 'PNG', 10, 2, 50, 30); 
            else doc.text("Fic Sullana", 12, 20);
        } catch (e) { doc.text("Fic Sullana", 12, 20); }
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.text("FORMATO DE SOLICITUD DE CRÉDITO", 80, 20);
        doc.setFontSize(8);
        doc.text(`FECHA: ${new Date().toLocaleDateString()}`, 170, 20);

        let currentY = 40; 
        
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
            const textValue = String(value || "").substring(0, 40); 
            doc.text(textValue, x + 1, y + 7); 
        };

        // 1. DATOS PERSONALES
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

        // 2. FAMILIA Y NEGOCIO
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text("A. De la Unidad Familiar", 10, currentY + 4);
        
        // Aumentamos altura del cuadro familiar para que quepan las IFIs
        const boxHeightFamilia = 50; 
        doc.rect(10, currentY + 5, 90, boxHeightFamilia); 
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        let innerY = currentY + 10;
        doc.text(`1. Miembros: ${familia.numero_miembros || 0}`, 12, innerY); innerY += 5;
        doc.text(`2. Gastos Alimentación: ${currency(familia.gastos_alimentacion)}`, 12, innerY); innerY += 5;
        doc.text(`3. Gastos Educación: ${currency(familia.gastos_educacion)}`, 12, innerY); innerY += 5;
        doc.text(`4. Gastos Servicios: ${currency(familia.gastos_servicios)}`, 12, innerY); innerY += 5;
        doc.text(`5. Gastos Salud: ${currency(familia.gastos_salud)}`, 12, innerY); innerY += 5;
        doc.text(`6. Deudas IFIs: ${familia.tiene_deudas_ifis ? 'SI' : 'NO'}`, 12, innerY); innerY += 5;

        // --- DETALLE DE DEUDAS IFIS EN PDF ---
        if (familia.tiene_deudas_ifis) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7);
            doc.text("Detalle de Deudas:", 12, innerY); innerY += 4;
            doc.setFont("helvetica", "normal");
            
            if(familia.ifi_1_nombre) {
                doc.text(`- ${familia.ifi_1_nombre}: ${currency(familia.ifi_1_cuota)}`, 15, innerY); innerY += 3.5;
            }
            if(familia.ifi_2_nombre) {
                doc.text(`- ${familia.ifi_2_nombre}: ${currency(familia.ifi_2_cuota)}`, 15, innerY); innerY += 3.5;
            }
            if(familia.ifi_3_nombre) {
                doc.text(`- ${familia.ifi_3_nombre}: ${currency(familia.ifi_3_cuota)}`, 15, innerY);
            }
        }

        // B. Negocio
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text("B. Del Negocio (Resumen)", 105, currentY + 4);
        doc.rect(105, currentY + 5, 95, boxHeightFamilia); 
        
        let innerYNeg = currentY + 10;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text(`Giro: ${negocio.otros_ingresos_sector || 'Comercio'}`, 108, innerYNeg); innerYNeg += 5;
        doc.text(`Ventas Diarias: ${currency(negocio.ventas_diarias)}`, 108, innerYNeg); innerYNeg += 5;
        doc.text(`Efectivo Actual: ${currency(negocio.monto_efectivo)}`, 108, innerYNeg); innerYNeg += 5;
        doc.text(`Activo Fijo: ${currency(negocio.valor_actual_activo_fijo)}`, 108, innerYNeg); innerYNeg += 5;
        doc.text(`Última Compra: ${currency(negocio.monto_ultima_compra)}`, 108, innerYNeg); innerYNeg += 5;
        doc.text(`Gastos Operativos: ${currency(negocio.gastos_operativos_variables)}`, 108, innerYNeg); innerYNeg += 5;
        doc.text(`Cuentas x Cobrar: ${currency(negocio.cuentas_por_cobrar_monto)}`, 108, innerYNeg); innerYNeg += 5;
        doc.text(`Zona: ${negocio.zona_ubicacion || '-'}`, 108, innerYNeg);

        currentY += (boxHeightFamilia + 10); 

        // 3. SOLICITUD
        currentY = drawSectionTitle("3. SOLICITUD DE CRÉDITO", currentY);
        drawField("Producto", credito.producto, 10, currentY, 40);
        drawField("Monto Solicitado", currency(credito.montoPrestamo), 50, currentY, 35);
        drawField("Plazo (Cuotas)", `${credito.cuotas} (${credito.periodoCredito})`, 85, currentY, 35);
        drawField("Tasa %", `${credito.tasaInteres}%`, 120, currentY, 20);
        drawField("Modalidad", credito.modalidadCredito, 140, currentY, 60);
        currentY += 8;
        drawField("Destino del Crédito", credito.destinoCredito, 10, currentY, 190);
        currentY += 12;

        // 4. GARANTIAS
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

        // 5. AVAL
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

        // 7. FIRMAS
        if (currentY > 240) {
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
            } catch (error) { console.warn(error); }
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
                } catch (error) { console.warn(error); }
            }
            doc.text("AVAL DE CRÉDITO", 135, signatureBoxY + 32);
            doc.text(`${aval.nombresAval} ${aval.apellidoPaternoAval}`, 115, signatureBoxY + 36);
            doc.text(`DNI: ${aval.dniAval}`, 115, signatureBoxY + 39);
        }

        doc.save(`Solicitud_Credito_${clienteDatos.dni}.pdf`);
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
                        <img src={fullUrl} alt={`Imagen ${titulo}`} className="max-h-full max-w-full object-contain"
                            onError={(e) => { e.target.src = ''; e.target.alt = 'Error al cargar imagen'; }} />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col animate-fadeIn">
                <div className="flex justify-between items-center p-6 border-b bg-gray-50 rounded-t-lg">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold text-gray-800">Detalle de Evaluación #{data.id}</h2>
                            {data.estado === 1 && (
                                <button onClick={generatePDF} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded shadow-sm text-sm font-bold transition-all transform hover:scale-105" title="Descargar Solicitud en PDF">
                                    <PdfIcon /> Generar Solicitud PDF
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
                    
                    {/* SECCIÓN 1: CRÉDITO */}
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

                    {/* SECCIÓN 2: UNIDAD FAMILIAR COMPLETA */}
                    <section>
                        <h3 className="text-lg font-bold text-yellow-700 border-b border-yellow-200 pb-2 mb-3">2. Unidad Familiar y Gastos</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                            
                            {/* Columna Izquierda: Gastos Generales */}
                            <div className="space-y-2">
                                <h4 className="font-bold text-yellow-800 border-b border-yellow-200 pb-1 mb-2">Gastos del Hogar</h4>
                                <div><span className="font-semibold text-gray-600">Carga Familiar:</span> {familia.numero_miembros} miembros</div>
                                <div><span className="font-semibold text-gray-600">Alimentación:</span> {currency(familia.gastos_alimentacion)}</div>
                                <div><span className="font-semibold text-gray-600">Servicios:</span> {currency(familia.gastos_servicios)}</div>
                                <div><span className="font-semibold text-gray-600">Movilidad:</span> {currency(familia.gastos_movilidad)}</div>
                            </div>

                            {/* Columna Derecha: Salud y Educación */}
                            <div className="space-y-2">
                                <h4 className="font-bold text-yellow-800 border-b border-yellow-200 pb-1 mb-2">Salud y Educación</h4>
                                <div>
                                    <span className="font-semibold text-gray-600">Educación ({currency(familia.gastos_educacion)}):</span>
                                    <p className="text-xs text-gray-500 italic ml-2">{familia.detalle_educacion || 'Sin detalle'}</p>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-600">Salud ({currency(familia.gastos_salud)} - {familia.frecuencia_salud}):</span>
                                    <p className="text-xs text-gray-500 italic ml-2">{familia.detalle_salud || 'Sin detalle'}</p>
                                </div>
                            </div>

                            {/* Bloque Completo: Deudas IFIs */}
                            <div className="col-span-1 md:col-span-2 mt-2 pt-2 border-t border-yellow-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="font-bold text-gray-700">Deudas Sistema Financiero:</span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${familia.tiene_deudas_ifis ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                        {familia.tiene_deudas_ifis ? 'SÍ TIENE' : 'NO TIENE'}
                                    </span>
                                </div>
                                {familia.tiene_deudas_ifis === 1 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-white p-2 rounded border border-yellow-200">
                                        {familia.ifi_1_nombre && (
                                            <div className="text-xs p-1 bg-gray-50 rounded">
                                                <span className="font-bold block">{familia.ifi_1_nombre}</span>
                                                <span className="text-red-600">Cuota: {currency(familia.ifi_1_cuota)}</span>
                                            </div>
                                        )}
                                        {familia.ifi_2_nombre && (
                                            <div className="text-xs p-1 bg-gray-50 rounded">
                                                <span className="font-bold block">{familia.ifi_2_nombre}</span>
                                                <span className="text-red-600">Cuota: {currency(familia.ifi_2_cuota)}</span>
                                            </div>
                                        )}
                                        {familia.ifi_3_nombre && (
                                            <div className="text-xs p-1 bg-gray-50 rounded">
                                                <span className="font-bold block">{familia.ifi_3_nombre}</span>
                                                <span className="text-red-600">Cuota: {currency(familia.ifi_3_cuota)}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* SECCIÓN 3: NEGOCIO COMPLETO */}
                    <section>
                        <h3 className="text-lg font-bold text-gray-700 border-b pb-2 mb-3">3. Datos del Negocio e Inventario</h3>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            {/* Panel Izquierdo: Operatividad */}
                            <div className="bg-gray-50 p-4 rounded border text-sm space-y-3">
                                <h4 className="font-bold text-gray-800 border-b pb-1">Operatividad y Ubicación</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <div><span className="font-semibold block">Zona Ubicación:</span> {negocio.zona_ubicacion}</div>
                                    <div><span className="font-semibold block">Atención:</span> {negocio.modalidad_atencion}</div>
                                    <div><span className="font-semibold block">Ventas Diarias:</span> <span className="text-green-700 font-bold">{currency(negocio.ventas_diarias)}</span></div>
                                    <div><span className="font-semibold block">Promedio Ventas:</span> {currency(negocio.promedio_ventas_pdt)}</div>
                                </div>
                                <div className="border-t pt-2">
                                    <span className="font-semibold block mb-1">Activo Fijo ({currency(negocio.valor_actual_activo_fijo)}):</span>
                                    <p className="text-xs italic text-gray-600 bg-white p-2 rounded border">{negocio.detalle_activo_fijo || 'No especificado'}</p>
                                </div>
                            </div>

                            {/* Panel Derecho: Finanzas y Créditos */}
                            <div className="bg-gray-50 p-4 rounded border text-sm space-y-3">
                                <h4 className="font-bold text-gray-800 border-b pb-1">Finanzas y Crédito</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <div><span className="font-semibold block text-red-600">Gastos Op. Var:</span> {currency(negocio.gastos_operativos_variables)}</div>
                                    <div><span className="font-semibold block text-red-600">Gastos Adm. Fijos:</span> {currency(negocio.gastos_administrativos_fijos)}</div>
                                    <div><span className="font-semibold block">Efectivo Caja:</span> {currency(negocio.monto_efectivo)} (Dias: {negocio.dias_efectivo})</div>
                                    <div><span className="font-semibold block">Última Compra:</span> {negocio.fecha_ultima_compra} ({currency(negocio.monto_ultima_compra)})</div>
                                </div>
                                
                                {/* Cuentas por Cobrar */}
                                <div className="bg-blue-50 p-2 rounded border border-blue-100 mt-2">
                                    <span className="font-bold text-blue-800 block text-xs mb-1">CUENTAS POR COBRAR</span>
                                    <div className="flex justify-between items-center text-xs">
                                        <span>Monto: <b>{currency(negocio.cuentas_por_cobrar_monto)}</b></span>
                                        <span>Clientes: <b>{negocio.cuentas_por_cobrar_num_clientes}</b></span>
                                        <span>Recup: <b>{negocio.tiempo_recuperacion}</b></span>
                                    </div>
                                </div>

                                {/* Otros Ingresos */}
                                <div className="bg-green-50 p-2 rounded border border-green-100 mt-1">
                                    <div className="flex justify-between items-center text-xs mb-1">
                                        <span className="font-bold text-green-800">OTROS INGRESOS ({negocio.otros_ingresos_frecuencia})</span>
                                        <span className="font-bold text-green-700">{currency(negocio.otros_ingresos_monto)}</span>
                                    </div>
                                    <p className="text-xs text-gray-600 italic leading-tight">Sector: {negocio.otros_ingresos_sector} - {negocio.sustento_otros_ingresos}</p>
                                </div>
                            </div>
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

                    {/* SECCIÓN 4: GARANTÍAS (IGUAL) */}
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

                    {/* SECCIÓN 5: AVAL (IGUAL) */}
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

                    {/* SECCIÓN 6: FIRMAS */}
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
    );
};

export default EvaluacionDetailModal;