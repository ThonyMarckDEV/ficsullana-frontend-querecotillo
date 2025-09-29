import { fetchWithAuth } from 'js/authToken';
import API_BASE_URL from 'js/urlHelper';

/**
 * Busca todos los datos de un cliente existente por su DNI.
 * @param {string} dni El DNI del cliente a buscar.
 * @returns {Promise<object>} Los datos del cliente encontrado.
 */
export const buscarClientePorDni = async (dni) => {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/evaluaciones/cliente/${dni}`);
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.msg || 'Error al cargar los datos del cliente');
  }
  return result;
};

export default buscarClientePorDni;