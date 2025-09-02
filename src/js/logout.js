import React from 'react';
import { createRoot } from 'react-dom/client';
import jwtUtils from '../utilities/jwtUtils.jsx';
import { fetchWithAuth } from '../js/authToken.js';
import API_BASE_URL from '../js/urlHelper';
import LoadingScreen from '../components/Shared/LoadingScreen.jsx';

export async function logout() {
  // Crear contenedor temporal para LoadingScreen
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  try {
    // Mostrar LoadingScreen
    root.render(<LoadingScreen />);

    // Obtener el ID del refresh token desde la cookie
    const idToken = jwtUtils.getRefreshTokenIDFromCookie();

    if (idToken) {
      // Llamar al backend para eliminar la sesión
      const response = await fetchWithAuth(`${API_BASE_URL}/api/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

    } else {
      console.warn('No se encontró idToken, omitiendo llamada al backend');
    }

    // Redirigir a la página principal
    window.location.href = '/';

    // Eliminar tokens de las cookies
    jwtUtils.removeTokensFromCookie();
  } catch (error) {
    console.error('Error durante el logout:', error);
    // Eliminar tokens y redirigir incluso si falla la llamada al backend
    jwtUtils.removeTokensFromCookie();
    window.location.href = '/';
  } finally {
    // Ocultar FetchWithGif y limpiar el contenedor
    root.unmount();
    document.body.removeChild(container);
  }
}

window.logout = logout;