import { fetchWithAuth } from '../../../../js/authToken';
import API_BASE_URL from '../../../../js/urlHelper';


export const store = async (data) => {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/cliente/crear-solicitud-prestamo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Error al crear la solicitud');
  }

  return await response.json();
};