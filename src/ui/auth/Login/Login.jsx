import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import jwtUtils from '../../../utilities/jwtUtils';
import LoadingScreen from '../../../components/Shared/LoadingScreen';
import LoginForm from './components/LoginForm';
import ForgotPasswordForm from './components/ForgotPasswordForm';
import ErrorsUtility from '../../../utilities/ErrorsUtility';
import loginimg from '../../../assets/img/login.jpg';

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
        case 'cliente':
          toast.success(`Login exitoso!!`);
          setTimeout(() => navigate('/cliente'), 1500);
          break;
        case 'manager':
          toast.success(`Login exitoso!!`);
          setTimeout(() => navigate('/encargado'), 1500);
          break;
        case 'admin':
          toast.success(`Login exitoso!!`);
          setTimeout(() => navigate('/admin'), 1500);
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

  return (
    <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center p-4">
      <ToastContainer />
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg flex overflow-hidden">
        {/* Left Side - Image */}
        <div className="hidden md:block w-1/2">
          <img
            src={loginimg}
            alt="Login background"
            className="object-cover w-full h-full"
          />
        </div>
        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 flex items-center justify-center">
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