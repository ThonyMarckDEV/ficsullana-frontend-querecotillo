import React from 'react';
import { Navigate } from 'react-router-dom';
import jwtUtils from 'utilities/jwtUtils';

const ProtectedRouteJefeNegocios = ({ element }) => {
  // Obtener el JWT desde localStorage
  const refresh_token = jwtUtils.getRefreshTokenFromCookie();


  if (!refresh_token) {
    return <Navigate to="/404" />;
  }

  const rol = jwtUtils.getUserRole(refresh_token);

  if (rol !== 'jefe_negocios') {
    return <Navigate to="/404" />;
  }

  // Si hay token, se muestra el elemento original
  return element;

};

export default ProtectedRouteJefeNegocios;
