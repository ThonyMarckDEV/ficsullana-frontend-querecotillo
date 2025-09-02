import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../../js/urlHelper';
import jwtUtils from '../../../utilities/jwtUtils';
import LoadingScreen from '../../../components/Shared/LoadingScreen';
import LoginForm from './components/LoginForm';
import ErrorsUtility from '../../../utilities/ErrorsUtility';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import piuraimg from '../../../assets/img/piuralogin.jpeg';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/login`, 
        { username, 
          password,
          remember_me: rememberMe
        }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = response.data;

      const access_token = result.access_token;
      const refresh_token = result.refresh_token;
      const refresh_token_id = result.idRefreshToken;

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

      if (rol === 'cliente') {
        toast.success(`Login exitoso!!`);
        setTimeout(() => {
          navigate('/cliente');
        }, 1500);
      } else if (rol === 'manager') {
        toast.success(`Login exitoso!!`);
        setTimeout(() => {
          navigate('/encargado');
        }, 1500);
      } else if (rol === 'admin') {
        toast.success(`Login exitoso!!`);
        setTimeout(() => {
          navigate('/admin');
        }, 1500);
      } else {
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

  return (
    <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center p-4">
      <ToastContainer />
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg flex overflow-hidden">
        {/* Left Side - Image */}
        <div className="hidden md:block w-1/2">
          <img
            src={piuraimg}
            alt="Login background"
            className="object-cover w-full h-full"
          />
        </div>
        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 flex items-center justify-center">
          {loading ? (
            <LoadingScreen />
          ) : (
            <LoginForm 
              username={username}
              setUsername={setUsername}
              password={password}
              setPassword={setPassword}
              handleLogin={handleLogin}
              rememberMe={rememberMe}
              setRememberMe={setRememberMe}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;