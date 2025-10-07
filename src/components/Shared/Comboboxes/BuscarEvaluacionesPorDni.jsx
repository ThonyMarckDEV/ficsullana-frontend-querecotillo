// src/components/BuscarEvaluacionesPorDni.jsx
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { getEvaluaciones } from 'services/evaluacionClienteService';

const BuscarEvaluacionesPorDni = ({ onEvaluacionesFound, onClear, variant = 'enviadas' }) => {
    const [dni, setDni] = useState('');
    const [loading, setLoading] = useState(false);

    const classes = {
        border: 'border-yellow-500',
        focus: 'focus:ring-2 focus:ring-red-500',
        button: 'bg-red-700 hover:bg-red-800'
    };

    const handleSearch = async () => {
        if (dni.length < 8) {
            toast.error('El DNI debe tener 8 o 9 dígitos.');
            return;
        }
        setLoading(true);
        try {
            const data = await getEvaluaciones(dni);
            toast.success('Evaluaciones encontradas.');
            if (onEvaluacionesFound) onEvaluacionesFound(data, dni);
        } catch (error) {
            toast.info('No se encontraron evaluaciones para este DNI.');
            if (onEvaluacionesFound) onEvaluacionesFound(null, dni);
        } finally {
            setLoading(false);
        }
    };
    
    const handleClear = () => {
        setDni('');
        if (onClear) onClear();
    };

    return (
        <div className={`flex flex-col sm:flex-row gap-4 mb-10 p-6 bg-white rounded-lg shadow-md border ${classes.border}`}>
            <input
              type="number"
              value={dni}
              onChange={(e) => setDni(e.target.value.slice(0,9))}
              placeholder="Ingrese DNI del cliente (8 a max. 9 dígitos)"
              className={`w-full p-3 border ${classes.border} rounded-lg ${classes.focus} outline-none`}
              disabled={loading}
            />
            <button type="button" onClick={handleSearch} disabled={loading} className={`w-full sm:w-auto px-8 py-3 ${classes.button} text-white font-bold rounded-lg transition-colors disabled:opacity-50`}>
                {loading ? 'Buscando...' : 'Buscar'}
            </button>
            <button type="button" onClick={handleClear} disabled={loading} className="w-full sm:w-auto px-8 py-3 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50">
                Limpiar
            </button>
        </div>
    );
};

export default BuscarEvaluacionesPorDni;