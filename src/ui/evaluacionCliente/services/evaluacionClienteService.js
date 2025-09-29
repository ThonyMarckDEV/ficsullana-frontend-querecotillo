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

export default createSolicitud;