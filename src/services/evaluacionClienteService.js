import { fetchWithAuth } from 'js/authToken';
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse';

/**
 * Crea una nueva evaluación.
 * * CORRECCIÓN: Ahora acepta directamente el FormData que viene del componente.
 * Ya no intenta re-procesar archivos ni convertir a JSON string manualmente,
 * porque el componente 'NuevaEvaluacion.jsx' ya hizo ese trabajo.
 * * @param {FormData} formData - El objeto FormData listo para enviar.
 */
const createEvaluacion = async (formData) => {
    // Ya no creamos un 'new FormData()' aquí, usamos el que nos llega.
    
    const response = await fetchWithAuth(`${API_BASE_URL}/api/evaluaciones/create`, {
        method: 'POST',
        body: formData,
    });

    return handleResponse(response);
};

export const updateEvaluacion = async (evaluacionId, data) => {
    // Detectamos si es FormData (tiene archivos) o JSON normal
    const isFormData = data instanceof FormData;

    // Si es FormData, usamos POST para evitar problemas de PHP con PUT + Archivos
    // Si es JSON, mantenemos PUT (o lo que soporte tu API)
    const method = isFormData ? 'POST' : 'PUT';

    const headers = {
        'Accept': 'application/json',
    };

    // IMPORTANTE: Solo agregamos Content-Type si es JSON.
    // Si es FormData, dejamos que el navegador ponga 'multipart/form-data; boundary=...'
    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetchWithAuth(`${API_BASE_URL}/api/evaluaciones/update/${evaluacionId}`, {
        method: method,
        headers: headers,
        // Si es FormData se manda directo, si es objeto se stringifea
        body: isFormData ? data : JSON.stringify(data),
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