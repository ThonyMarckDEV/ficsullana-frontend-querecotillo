import React, { useState } from 'react';
import { store } from './services/prestamoService';
import LoadingScreen from '../../../components/Shared/LoadingScreen';

const SolicitarPrestamo = () => {
  const [formData, setFormData] = useState({
    monto: '',
    frecuencia: '1', // Default to Semanal
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsLoading(true);

    try {
      const response = await store(formData);
      setMessage('Solicitud enviada con éxito');
      // Clear the form after successful submission
      setFormData({
        monto: '',
        frecuencia: '1',
      });
    } catch (err) {
      setError('Error al enviar la solicitud: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 max-w-lg mx-auto">
      {isLoading && <LoadingScreen />}
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Solicitar Préstamo
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="monto" className="block text-sm font-medium text-gray-700">
            Monto
          </label>
          <input
            type="number"
            id="monto"
            name="monto"
            value={formData.monto}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
            placeholder="Ingrese el monto"
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="frecuencia" className="block text-sm font-medium text-gray-700">
            Frecuencia de Pago
          </label>
          <select
            id="frecuencia"
            name="frecuencia"
            value={formData.frecuencia}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
            required
            disabled={isLoading}
          >
            <option value="1">Semanal</option>
            <option value="2">Catorcenal</option>
            <option value="3">Mensual</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-red-400"
          disabled={isLoading}
        >
          Enviar Solicitud
        </button>
      </form>
      {message && <p className="mt-4 text-yellow-600">{message}</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}
    </div>
  );
};

export default SolicitarPrestamo;