import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { showClientByDNI } from 'services/clienteService';

const BuscarClientePorDni = ({ onClientFound, onClear }) => {
    const [dni, setDni] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (dni.length < 8) {
            toast.error('El DNI debe tener 8 o 9 dígitos.');
            return;
        }
        setLoading(true);
        try {
            const data = await showClientByDNI(dni);
            toast.success('Cliente encontrado. Se han cargado sus datos.');
            if (onClientFound) onClientFound(data);
        } catch (error) {
            toast.info('Cliente no encontrado. Puede registrarlo como nuevo.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleClear = () => {
        setDni('');
        if (onClear) onClear();
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-10 p-6 bg-white rounded-lg shadow-md border border-yellow-500">
            <input
              type="number"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              placeholder="Buscar cliente existente por DNI"
              className="w-full p-3 border border-yellow-500 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            />
            <button type="button" onClick={handleSearch} disabled={loading} className="w-full sm:w-auto px-8 py-3 bg-red-700 text-white font-bold rounded-lg hover:bg-red-800 transition-colors disabled:opacity-50">
                {loading ? 'Buscando...' : 'Buscar'}
            </button>
            <button type="button" onClick={handleClear} className="w-full sm:w-auto px-8 py-3 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors">
                Limpiar / Nuevo
            </button>
        </div>
    );
};

export default BuscarClientePorDni;