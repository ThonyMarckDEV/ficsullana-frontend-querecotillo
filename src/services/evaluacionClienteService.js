import { fetchWithAuth } from 'js/authToken';
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse';

/**
 * Crea una nueva evaluación enviando datos complejos y archivos.
 * @param {object} formDataObj - Objeto con toda la estructura del formulario.
 */
const createEvaluacion = async (formDataObj) => {
    const formData = new FormData();

    // 1. EXTRACCIÓN DE ARCHIVOS
    if (formDataObj.usuario?.firmaCliente instanceof File) {
        formData.append('firmaCliente', formDataObj.usuario.firmaCliente);
    }
    if (formDataObj.aval?.firmaAval instanceof File) {
        formData.append('firmaAval', formDataObj.aval.firmaAval);
    }
    if (formDataObj.datosNegocio?.fotoApuntesCobranza instanceof File) {
        formData.append('fotoApuntesCobranza', formDataObj.datosNegocio.fotoApuntesCobranza);
    }
    if (formDataObj.datosNegocio?.fotoActivoFijo instanceof File) {
        formData.append('fotoActivoFijo', formDataObj.datosNegocio.fotoActivoFijo);
    }

    // 2. LIMPIEZA DEL JSON
    const dataClean = JSON.parse(JSON.stringify(formDataObj));
    delete dataClean.usuario.firmaCliente;
    if (dataClean.aval) delete dataClean.aval.firmaAval;
    if (dataClean.datosNegocio) {
        delete dataClean.datosNegocio.fotoApuntesCobranza;
        delete dataClean.datosNegocio.fotoActivoFijo;
    }

    // 3. EMPAQUETADO DEL JSON
    formData.append('data', JSON.stringify(dataClean));

    const response = await fetchWithAuth(`${API_BASE_URL}/api/evaluaciones/create`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
        },
        body: formData,
    });

    return handleResponse(response);
};

export const updateEvaluacion = async (evaluacionId, data) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/evaluaciones/update/${evaluacionId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(data),
    });
    
    return handleResponse(response);
};

export const getEvaluacionDetail = async (evaluacionId) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/evaluaciones/show/${evaluacionId}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        }
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

// --- AQUÍ ESTABA EL ERROR ---
// Modificado para permitir búsqueda vacía (listar todo)
export const getEvaluaciones = async (dni = '') => {
    // Solo validamos longitud SI se ha escrito algo en el filtro
    if (dni && (dni.length < 8 || dni.length > 9)) {
        throw new Error('Por favor, ingrese un DNI válido de 8 o 9 dígitos.');
    }

    // Construcción dinámica de la URL
    const url = dni 
        ? `${API_BASE_URL}/api/evaluaciones/index?dni=${dni}` 
        : `${API_BASE_URL}/api/evaluaciones/index`;

    const response = await fetchWithAuth(url, { 
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