//import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';

//Contextos


//Componentes Globales
import { ToastContainer } from 'react-toastify';

// Layout
import SidebarLayout from "./layouts/SidebarLayout.jsx";

// UIS AUTH
import ErrorPage404 from './components/ErrorPage404.jsx';
import ErrorPage401 from './components/ErrorPage401';
import Login from './ui/auth/Login/Login.jsx';

//UIS SUPERADMIN
import HomeSuperAdmin from './ui/superadmin/home';

// UIS ADMIN


// UIS Cliente
import HomeCliente from './ui/cliente/home';
import SolicitarPrestamo from './ui/cliente/SolicitarPrestamo/SolicitarPrestamo';

// Utilities
import ProtectedRouteHome from './utilities/ProtectedRouteHome';
import ProtectedRouteCliente from './utilities/ProtectedRouteCliente';
import ProtectedRouteSuperAdmin from './utilities/ProtectedRouteSuperAdmin';


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
        {/* Ruta Home (cuando solo pones /cliente) */}
        <Route index element={<HomeSuperAdmin />} />

        {/* Ruta Solicitar Préstamo */}
        {/* <Route path="solicitar-prestamo" element={<SolicitarPrestamo />} /> */}

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
        <Route index element={<HomeCliente />} />

        {/* Ruta Solicitar Préstamo */}
        <Route path="solicitar-prestamo" element={<SolicitarPrestamo />} />

        {/* Aquí agregas más módulos */}

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