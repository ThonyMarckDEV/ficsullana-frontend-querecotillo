import { fetchWithAuth } from '../../../js/authToken';
import API_BASE_URL from '../../../js/urlHelper';


export const getEvaluaciones = async () => {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/evaluaciones/index`, {
    method: 'GET',
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Error al obtener las evaluaciones');
  }

  return result;
};


export default getEvaluaciones;