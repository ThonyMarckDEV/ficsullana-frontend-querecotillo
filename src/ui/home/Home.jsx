import React, { useEffect, useState } from "react";
import jwtUtils from "utilities/jwtUtils";

const Home = () => {
  const [rol, setRol] = useState(null);

  useEffect(() => {
    const token = jwtUtils.getAccessTokenFromCookie();

    if (token) {
      try {
        const rol = jwtUtils.getUserRole(token);
        setRol(rol);
      } catch (error) {
        console.error("Error decodificando token:", error);
      }
    }
  }, []);

  return (
    <div className="flex-1 p-6">
      <h1 className="text-2xl font-bold text-gray-800">
        Bienvenido al Home
      </h1>

      {rol === "superadmin" && (
        <p className="mt-4 text-indigo-600 font-semibold">
          Contenido para superadministradores.
        </p>
      )}

      {rol === "admin" && (
        <p className="mt-4 text-green-600 font-semibold">
          Panel exclusivo para administradores.
        </p>
      )}

      {rol === "cliente" && (
        <p className="mt-4 text-blue-500 font-semibold">
          Contenido para clientes.
        </p>
      )}

      {rol === "asesor" && (
        <p className="mt-4 text-purple-500 font-semibold">
          Herramientas de asesor.
        </p>
      )}

      {rol === "auditor" && (
        <p className="mt-4 text-orange-500 font-semibold">
          Panel de auditoría.
        </p>
      )}

      {rol === "cajero" && (
        <p className="mt-4 text-pink-500 font-semibold">
          Herramientas de caja.
        </p>
      )}

      {rol === "jefe_negocios" && (
        <p className="mt-4 text-gray-500 font-semibold">
          Herramientas de jefe negocios.
        </p>
      )}

      {!rol && (
        <p className="mt-4 text-red-600 font-semibold">
          No se encontró un rol válido.
        </p>
      )}
    </div>
  );
};

export default Home;
