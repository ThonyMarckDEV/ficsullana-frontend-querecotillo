import { fetchWithAuth } from '../../../js/authToken';
import API_BASE_URL from '../../../js/urlHelper';


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

export default getEvaluaciones;