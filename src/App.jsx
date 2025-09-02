//import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';

//Contextos


//Componentes Globales
import { ToastContainer } from 'react-toastify';

// Layout
import MainLayout from "./layouts/MainLayout";

// UIS AUTH
import ErrorPage from './components/ErrorPage';
import ErrorPage401 from './components/ErrorPage401';
import Login from './ui/auth/Login/Login.jsx';

// UIS ADMIN


// UIS Cliente
import HomeCliente from './ui/cliente/home';

// Utilities
import ProtectedRouteHome from './utilities/ProtectedRouteHome';
import ProtectedRouteCliente from './utilities/ProtectedRouteCliente.jsx';


function AppContent() {

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/"  element={<ProtectedRouteHome element={<Login />}  />} />

      {/* Cliente con Sidebar */}
      <Route
        path="/cliente"
        element={
          <ProtectedRouteCliente
            element={
              <MainLayout>
                <HomeCliente />
              </MainLayout>
            }
          />
        }
      />

      {/* Ruta de error */}
      <Route path="/*" element={<ErrorPage />} />
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