//import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';

//Contextos


//Componentes Globales
import { ToastContainer } from 'react-toastify';

// Layout
import SidebarLayout from "layouts/SidebarLayout";

// UIS AUTH
import ErrorPage404 from 'components/ErrorPage404';
import ErrorPage401 from 'components/ErrorPage401';
import Login from 'ui/auth/Login/Login';

//UI HOME
import Home from 'ui/home/Home';

//UIS SUPERADMIN


// UIS ADMIN


// UIS CLIENTE
import MisEvaluacionesCliente from 'ui/Cliente/misEvaluaciones/MisEvaluaciones';

//UIS ASESOR
import EvaluacionCliente from 'ui/Asesor/evaluacionCliente/EvaluacionCliente';
import EvaluacionesEnviadas from 'ui/Asesor/evaluacionesEnviadas/EvaluacionesEnviadas';
import CorregirEvaluacion from 'ui/Asesor/evaluacionCliente/CorregirEvaluacion';

//UIS JEFE NEGOCIOS
import EvaluacionesClientes from 'ui/JefeNegocios/evaluacionesClientes/EvaluacionesClientes';


// Utilities
import ProtectedRouteHome from 'utilities/ProtectedRoutes/ProtectedRouteHome';
import ProtectedRouteCliente from 'utilities/ProtectedRoutes/ProtectedRouteCliente';
import ProtectedRouteSuperAdmin from 'utilities/ProtectedRoutes/ProtectedRouteSuperAdmin';
import ProtectedRouteAsesor from 'utilities/ProtectedRoutes/ProtectedRouteAsesor';
import ProtectedRouteJefeNegocios from 'utilities/ProtectedRoutes/ProtectedRouteJefeNegocios';



function AppContent() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route
        path="/"
        element={<ProtectedRouteHome element={<Login />} />}
      />

      {/* RUTAS SUPER ADMIN */}
      <Route
        path="/superadmin"
        element={
          <ProtectedRouteSuperAdmin element={<SidebarLayout />} />
        }
      >
        {/* Ruta Home (cuando solo pones /superadmin) */}
        <Route index element={<Home />} />

        {/* Ruta Solicitar Préstamo */}
        

        {/* Aquí agregas más módulos */}

      </Route>



      {/* RUTAS CLIENTE */}
      <Route
        path="/cliente"
        element={
          <ProtectedRouteCliente element={<SidebarLayout />} />
        }
      >
        {/* Ruta Home (cuando solo pones /cliente) */}
        <Route index element={<Home />} />

       
        {/* Ruta para ver mis evaluaciones */}
         <Route path="mis-evaluaciones" element={<MisEvaluacionesCliente />} />

      </Route>


      {/* RUTAS ASESOR */}
      <Route
        path="/asesor"
        element={
          <ProtectedRouteAsesor element={<SidebarLayout />} />
        }
      >
        {/* Ruta Home (cuando solo pones /asesor) */}
        <Route index element={<Home />} />

        {/* Ruta Evaluación de Cliente */}
        <Route path="evaluacion-cliente" element={<EvaluacionCliente />} />
        <Route path="evaluacion-cliente/:dniCliente" element={<CorregirEvaluacion />} />
        {/* Ruta para Evaluaciones Enviadas */}
        <Route path="evaluaciones-enviadas" element={<EvaluacionesEnviadas />} />

      </Route>


      {/* RUTAS JEFE NEGOCIOS */}
      <Route
        path="/jefe-negocios"
        element={
          <ProtectedRouteJefeNegocios element={<SidebarLayout />} />
        }
      >
        {/* Ruta Home (cuando solo pones /jefe-negocios) */}
        <Route index element={<Home />} />

        {/* Ruta Evaluaciones de Clientes */}
        <Route path="evaluaciones-clientes" element={<EvaluacionesClientes />} />

      </Route>




      {/* Ruta de error */}
      <Route path="/*" element={<ErrorPage404 />} />
      <Route path="/401" element={<ErrorPage401 />} />
    </Routes>
  );
}


function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <AppContent />
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
}

export default App;