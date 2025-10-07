import React from 'react';
import { Navigate } from 'react-router-dom';
import jwtUtils from 'utilities/jwtUtils';

const ProtectedRoute = ({ element }) => {
  // Obtener el JWT desde localStorage
  const refresh_token = jwtUtils.getRefreshTokenFromCookie();
  
  if (refresh_token) {
    const rol = jwtUtils.getUserRole(refresh_token); // Extraer el rol del token

     // Redirigir según el rol del usuario
     switch (rol) {
      case 'cliente':
        return <Navigate to="/cliente" />;
      case 'asesor':
        return <Navigate to="/asesor" />;
      case 'auditor':
        return <Navigate to="/auditor" />;
      case 'admin':
        return <Navigate to="/admin" />;
      case 'superadmin':
        return <Navigate to="/superadmin" />;
      case 'cajero':
        return <Navigate to="/cajero" />;
      default:
        return element;
    }
  }

  // Si no hay token, se muestra el elemento original
  return element;
};

export default ProtectedRoute;
