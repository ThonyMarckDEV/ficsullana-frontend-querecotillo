// src/services/evaluacionClienteService.js (actualizado)

import { fetchWithAuth } from 'js/authToken';
import API_BASE_URL from 'js/urlHelper';

import { handleResponse } from 'utilities/Responses/handleResponse'; 

export const showClientByDNI = async (dni) => {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/cliente/${dni}`, {
    method: 'GET',
  });
  return handleResponse(response);
};

export default showClientByDNI;