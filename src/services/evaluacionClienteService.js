// src/services/solicitudService.js
import { fetchWithAuth } from 'js/authToken';
import API_BASE_URL from 'js/urlHelper';

const createEvaluacion = async (dataToSend, pdfFile) => {
  const formDataToSend = new FormData();
  formDataToSend.append('data', JSON.stringify(dataToSend));
  formDataToSend.append('pdf', pdfFile);

  const response = await fetchWithAuth(`${API_BASE_URL}/api/evaluaciones/create`, {
    method: 'POST',
    body: formDataToSend,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Error al enviar la solicitud');
  }

  return result;
};


// NUEVA: Para enviar la actualización
export const updateEvaluacion = async (evaluacionId, data) => {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/evaluaciones/update/${evaluacionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.msg || 'Error al actualizar la evaluación');
  }
  return result;
};


export const getEvaluaciones = async (dni) => {
   if (!dni || (dni.length < 8 || dni.length > 9)) {
    throw new Error('Por favor, ingrese un DNI válido de 8 o 9 dígitos.');
  }

  // Enviamos el DNI como un query parameter
  const response = await fetchWithAuth(`${API_BASE_URL}/api/evaluaciones/index?dni=${dni}`, {
    method: 'GET',
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Error al obtener las evaluaciones');
  }

  return result;
};

export default createEvaluacion;