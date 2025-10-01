import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import jwtUtils from 'utilities/jwtUtils';
import LoadingScreen from 'components/Shared/LoadingScreen';
import LoginForm from './components/LoginForm';
import ForgotPasswordForm from './components/ForgotPasswordForm';
import ErrorsUtility from 'utilities/ErrorsUtility';
import loginimg from 'assets/img/login.jpg';

import authService from './services/authService';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [dni, setDni] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await authService.login(username, password, rememberMe);

      const { access_token, refresh_token, idRefreshToken: refresh_token_id } = result;

      const accessTokenExpiration = '; path=/; Secure; SameSite=Strict';
      const refreshTokenExpiration = rememberMe
        ? `; expires=${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString()}; path=/; Secure; SameSite=Strict`
        : '; path=/; Secure; SameSite=Strict';

      const refreshTokenIDExpiration = rememberMe
        ? `; expires=${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString()}; path=/; Secure; SameSite=Strict`
        : '; path=/; Secure; SameSite=Strict';

      document.cookie = `access_token=${access_token}${accessTokenExpiration}`;
      document.cookie = `refresh_token=${refresh_token}${refreshTokenExpiration}`;
      document.cookie = `refresh_token_id=${refresh_token_id}${refreshTokenIDExpiration}`;

      const rol = jwtUtils.getUserRole(access_token);

      switch (rol) {
        case 'superadmin':
          toast.success(`Login exitoso!!`);
          setTimeout(() => navigate('/superadmin'), 1500);
          break;
        case 'admin':
          toast.success(`Login exitoso!!`);
          setTimeout(() => navigate('/admin'), 1500);
          break;
        case 'cliente':
          toast.success(`Login exitoso!!`);
          setTimeout(() => navigate('/cliente'), 1500);
          break;
        case 'asesor':
          toast.success(`Login exitoso!!`);
          setTimeout(() => navigate('/asesor'), 1500);
          break;
        case 'auditor':
          toast.success(`Login exitoso!!`);
          setTimeout(() => navigate('/auditor'), 1500);
          break;
        case 'cajero':
          toast.success(`Login exitoso!!`);
          setTimeout(() => navigate('/cajero'), 1500);
          break;
        case 'jefe_negocios':
          toast.success(`Login exitoso!!`);
          setTimeout(() => navigate('/jefe-negocios'), 1500);
          break;   
        default:
          console.error('Rol no reconocido:', rol);
          toast.error(`Rol no reconocido: ${rol}`);
      }
    } catch (error) {
      if (error.response) {
        const errorMessage = ErrorsUtility.getErrorMessage(error.response.data);
        toast.error(errorMessage);
      } else {
        console.error('Error al intentar iniciar sesión:', error);
        toast.error('Error interno del servidor. Por favor, inténtelo de nuevo más tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authService.forgotPassword(dni);
      toast.success('Se ha enviado un enlace de restablecimiento a tu correo.');
      setTimeout(() => setShowForgotPassword(false), 1500);
    } catch (error) {
      if (error.response) {
        const errorMessage = ErrorsUtility.getErrorMessage(error.response.data);
        toast.error(errorMessage);
      } else {
        console.error('Error al solicitar restablecimiento de contraseña:', error);
        toast.error('Error interno del servidor. Por favor, inténtelo de nuevo más tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  return  (
  <div className="relative min-h-screen w-full bg-gray-100 flex flex-col items-center justify-start p-4 overflow-hidden">
      {/* 🔴 Header centrado arriba */}
      <h1 className="text-5xl font-extrabold mt-8 mb-6 text-center">
        <span className="text-yellow-500">FIC</span>
        <span className="text-red-600">SULLANA</span>
      </h1>
    
      {/* Wave Background */}
      <div className="absolute bottom-0 left-0 right-0 z-0">
        <svg
          className="w-full h-48 sm:h-56 md:h-64 lg:h-80"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="#dc2626"
            fillOpacity="1"
            d="M0,192L48,176C96,160,192,128,288,138.7C384,149,480,202,576,213.3C672,224,768,192,864,181.3C960,171,1056,181,1152,192C1248,203,1344,213,1392,218.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>

      <ToastContainer />
      {/* Main Content */}
        <div className="max-w-5xl w-full bg-white rounded-lg shadow-lg flex overflow-hidden relative z-10 mt-10 lg:mt-20">
          {/* Left Side - Image */}
          <div className="hidden lg:block w-1/2">
            <img
              src={loginimg}
              alt="Login background"
              className="object-cover w-full h-full"
            />
          </div>

          {/* Right Side - Form */}
          <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:p-12 flex flex-col items-center mt-6 lg:mt-10">
            {/* Header */}
            <h3 className="text-2xl sm:text-2xl lg:text-4xl font-extrabold text-red-600 mb-6 text-center">
              QUERECOTILLO
            </h3>

            {loading ? (
              <LoadingScreen />
            ) : showForgotPassword ? (
              <ForgotPasswordForm
                dni={dni}
                setDni={setDni}
                handleForgotPassword={handleForgotPassword}
                setShowForgotPassword={setShowForgotPassword}
              />
            ) : (
              <LoginForm
                username={username}
                setUsername={setUsername}
                password={password}
                setPassword={setPassword}
                handleLogin={handleLogin}
                rememberMe={rememberMe}
                setRememberMe={setRememberMe}
                setShowForgotPassword={setShowForgotPassword}
              />
            )}
          </div>
        </div>
      

    </div>
  );
};

export default Login;