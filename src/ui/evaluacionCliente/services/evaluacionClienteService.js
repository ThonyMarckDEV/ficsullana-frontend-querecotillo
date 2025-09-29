// src/services/solicitudService.js
import { fetchWithAuth } from '../../../js/authToken';
import API_BASE_URL from '../../../js/urlHelper';

const createSolicitud = async (dataToSend, pdfFile) => {
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

// NUEVA: Para obtener los datos del cliente para el formulario de edición
export const getClienteParaCorregir = async (dni) => {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/evaluaciones/cliente/${dni}`);
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.msg || 'Error al cargar los datos del cliente');
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

export default createSolicitud;