// src/services/evaluacionClienteService.js (actualizado)

import { fetchWithAuth } from 'js/authToken';
import API_BASE_URL from 'js/urlHelper';

import { handleResponse } from 'utilities/Responses/handleResponse'; 


const createEvaluacion = async (dataToSend, pdfFile) => {
    const formDataToSend = new FormData();
    formDataToSend.append('data', JSON.stringify(dataToSend));
    formDataToSend.append('pdf', pdfFile);

    const response = await fetchWithAuth(`${API_BASE_URL}/api/evaluaciones/create`, {
        method: 'POST',
        body: formDataToSend,
    });

    // Usamos la utilidad
    return handleResponse(response);
};

export const updateEvaluacion = async (evaluacionId, data) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/evaluaciones/update/${evaluacionId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    
    // Usamos la utilidad
    return handleResponse(response);
};

export const updateStatusEvaluacion = async (evaluacionId, data) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/evaluaciones/status/${evaluacionId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    
    // Usamos la utilidad
    return handleResponse(response);
};

export const getEvaluaciones = async (dni) => {
    if (!dni || (dni.length < 8 || dni.length > 9)) {
        // La validación de frontend se mantiene aquí.
        throw new Error('Por favor, ingrese un DNI válido de 8 o 9 dígitos.');
    }

    const response = await fetchWithAuth(`${API_BASE_URL}/api/evaluaciones/index?dni=${dni}`, {
        method: 'GET',
    });

    // Usamos la utilidad
    return handleResponse(response);
};


/**
 * Corrige los datos específicos de una evaluación.
 * @param {number} evaluacionId - El ID de la evaluación a corregir.
 * @param {object} data - Los datos a actualizar.
 * @returns {Promise<any>}
 */
export const correctEvaluacion = async (evaluacionId, data) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/evaluaciones/correct/${evaluacionId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(data),
    });

    // Usamos la misma utilidad de manejo de respuestas
    return handleResponse(response);
};

export default createEvaluacion;