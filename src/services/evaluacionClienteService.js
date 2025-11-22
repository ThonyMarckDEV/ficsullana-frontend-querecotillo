import { fetchWithAuth } from 'js/authToken';
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse';

/**
 * Crea una nueva evaluación enviando datos complejos y archivos.
 * @param {object} formDataObj - Objeto con toda la estructura del formulario (usuario, aval, datosNegocio, etc).
 */
const createEvaluacion = async (formDataObj) => {
    const formData = new FormData();

    // 1. EXTRACCIÓN DE ARCHIVOS
    // Buscamos los archivos en el objeto y los adjuntamos al FormData con las claves que espera Laravel
    
    // Firma Cliente
    if (formDataObj.usuario?.firmaCliente instanceof File) {
        formData.append('firmaCliente', formDataObj.usuario.firmaCliente);
    }
    
    // Firma Aval
    if (formDataObj.aval?.firmaAval instanceof File) {
        formData.append('firmaAval', formDataObj.aval.firmaAval);
    }

    // Fotos del Negocio (Apuntes y Activo Fijo)
    if (formDataObj.datosNegocio?.fotoApuntesCobranza instanceof File) {
        formData.append('fotoApuntesCobranza', formDataObj.datosNegocio.fotoApuntesCobranza);
    }

    if (formDataObj.datosNegocio?.fotoActivoFijo instanceof File) {
        formData.append('fotoActivoFijo', formDataObj.datosNegocio.fotoActivoFijo);
    }

    // 2. LIMPIEZA DEL JSON
    // Clonamos el objeto para no modificar el estado original de React
    const dataClean = JSON.parse(JSON.stringify(formDataObj));

    // Eliminamos las propiedades que contenían archivos para no enviarlos como texto vacío o [object File] dentro del JSON
    delete dataClean.usuario.firmaCliente;
    if (dataClean.aval) delete dataClean.aval.firmaAval;
    if (dataClean.datosNegocio) {
        delete dataClean.datosNegocio.fotoApuntesCobranza;
        delete dataClean.datosNegocio.fotoActivoFijo;
    }

    // 3. EMPAQUETADO DEL JSON
    // Laravel decodificará este string en el FormRequest usando json_decode
    formData.append('data', JSON.stringify(dataClean));

    // 4. PETICIÓN AL BACKEND
    // Nota: Al usar FormData, el navegador establece automáticamente el 'Content-Type' a 'multipart/form-data' con el boundary correcto.
    // No debemos forzar 'Content-Type': 'application/json' aquí.
    const response = await fetchWithAuth(`${API_BASE_URL}/api/evaluaciones/create`, { // Ajustado a REST standard, o usa /create si tu ruta lo exige
        method: 'POST',
        headers: {
            'Accept': 'application/json', // Crucial para recibir errores en JSON y no HTML
        },
        body: formData,
    });

    return handleResponse(response);
};

export const updateEvaluacion = async (evaluacionId, data) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/evaluaciones/update/${evaluacionId}`, { // Ajustado a REST standard
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(data),
    });
    
    return handleResponse(response);
};

export const updateStatusEvaluacion = async (evaluacionId, data) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/evaluaciones/status/${evaluacionId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(data),
    });
    
    return handleResponse(response);
};

export const getEvaluaciones = async (dni) => {
    if (!dni || (dni.length < 8 || dni.length > 9)) {
        throw new Error('Por favor, ingrese un DNI válido de 8 o 9 dígitos.');
    }

    const response = await fetchWithAuth(`${API_BASE_URL}/api/evaluaciones?dni=${dni}`, { // Ajustado query param
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        }
    });

    return handleResponse(response);
};

export const correctEvaluacion = async (evaluacionId, data) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/evaluaciones/correct/${evaluacionId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(data),
    });

    return handleResponse(response);
};

export default createEvaluacion;