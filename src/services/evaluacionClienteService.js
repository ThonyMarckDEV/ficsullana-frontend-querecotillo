// src/services/evaluacionClienteService.js

import { fetchWithAuth } from 'js/authToken';
import API_BASE_URL from 'js/urlHelper';

// Función estandarizada para manejar la respuesta
const handleResponse = async (response) => {
    // Siempre leemos el cuerpo de la respuesta, sin importar el estado.
    const result = await response.json(); 

    if (!response.ok) {
        // Lanzamos el objeto JSON directamente para que el catch del componente
        // reciba { msg: "...", errors: "..." }
        throw result; 
    }

    return result;
};


const createEvaluacion = async (dataToSend, pdfFile) => {
    const formDataToSend = new FormData();
    formDataToSend.append('data', JSON.stringify(dataToSend));
    formDataToSend.append('pdf', pdfFile);

    const response = await fetchWithAuth(`${API_BASE_URL}/api/evaluaciones/create`, {
        method: 'POST',
        body: formDataToSend,
    });

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
    
    return handleResponse(response);
};


export const getEvaluaciones = async (dni) => {
    if (!dni || (dni.length < 8 || dni.length > 9)) {
        // En este caso, sigue siendo mejor lanzar un Error de JS ya que es una validación de frontend.
        throw new Error('Por favor, ingrese un DNI válido de 8 o 9 dígitos.');
    }

    // Enviamos el DNI como un query parameter
    const response = await fetchWithAuth(`${API_BASE_URL}/api/evaluaciones/index?dni=${dni}`, {
        method: 'GET',
    });

    return handleResponse(response);
};

export default createEvaluacion;