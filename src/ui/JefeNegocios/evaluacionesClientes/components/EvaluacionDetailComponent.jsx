import React, { useState, useEffect } from 'react';
import { correctEvaluacion, getEvaluacionDetail } from 'services/evaluacionClienteService'; // <--- Importamos getEvaluacionDetail
import { toast } from 'react-toastify';
import EvaluacionDetailModal from './modals/EvaluacionDetailModal'; // <--- Importamos el Modal

const EvaluacionDetailComponent = ({ evaluacion, onUpdateSuccess, onApprove, onReject, isLoading, isPending }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    // Estados para el Modal de detalle
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [detailData, setDetailData] = useState(null);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);

    useEffect(() => {
        if (evaluacion) {
            setFormData({
                producto: evaluacion.producto || '',
                montoPrestamo: evaluacion.montoPrestamo || 0,
                tasaInteres: evaluacion.tasaInteres || 0,
                cuotas: evaluacion.cuotas || 1,
                modalidadCredito: evaluacion.modalidadCredito || '',
                destinoCredito: evaluacion.destinoCredito || '',
                periodoCredito: evaluacion.periodoCredito || '',
            });
        }
    }, [evaluacion]);

    // ... (handleInputChange y handleSaveChanges se mantienen igual) ...
    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'number' ? parseFloat(value) : value 
        }));
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            await correctEvaluacion(evaluacion.id, formData);
            toast.success('¡Evaluación corregida con éxito!');
            setIsEditing(false);
            if (onUpdateSuccess) onUpdateSuccess();
        } catch (error) {
            toast.error(`Error al guardar: ${error.message || 'Revise los datos'}`);
        } finally {
            setIsSaving(false);
        }
    };

    // --- LÓGICA PARA VER DETALLE ---
    const handleViewDetails = async () => {
        setIsLoadingDetail(true);
        try {
            // Llamamos al endpoint show
            const fullData = await getEvaluacionDetail(evaluacion.id);
            setDetailData(fullData);
            setIsModalOpen(true);
        } catch (error) {
            toast.error("Error al cargar los detalles completos.");
            console.error(error);
        } finally {
            setIsLoadingDetail(false);
        }
    };

    const renderField = (label, name, value, type = 'text', options) => (
        <div className="grid grid-cols-3 gap-4 items-center mb-2">
            <label className="font-semibold text-gray-600 col-span-1">{label}:</label>
            <div className="col-span-2">
                {isEditing ? (
                    <input
                        type={type}
                        name={name}
                        value={formData[name]}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        {...options}
                    />
                ) : (
                    <span className="text-gray-800">{value}</span>
                )}
            </div>
        </div>
    );
    
    const borderColorClass = {
        0: 'border-l-yellow-500', 
        1: 'border-l-green-500',  
        2: 'border-l-red-500',    
    }[evaluacion.estado];

    return (
        <div className={`bg-white p-6 rounded-lg shadow-md mb-4 border-l-4 ${borderColorClass}`}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">{isEditing ? 'Editando Evaluación...' : evaluacion.producto}</h3>
                
                {/* BOTÓN VER DETALLE */}
                <button 
                    onClick={handleViewDetails}
                    disabled={isLoadingDetail}
                    className="text-sm text-blue-600 hover:text-blue-800 underline font-semibold flex items-center gap-1"
                >
                    {isLoadingDetail ? 'Cargando...' : 'Ver Detalle Completo 👁️'}
                </button>
            </div>

            {renderField('Monto Préstamo', 'montoPrestamo', `S/ ${evaluacion.montoPrestamo}`, 'number', { min: 0, step: 0.01 })}
            {renderField('Tasa Interés', 'tasaInteres', `${evaluacion.tasaInteres}%`, 'number', { min: 0 })}
            {renderField('Cuotas', 'cuotas', evaluacion.cuotas, 'number', { min: 1 })}
            {renderField('Modalidad', 'modalidadCredito', evaluacion.modalidadCredito)}
            {renderField('Destino', 'destinoCredito', evaluacion.destinoCredito)}
            {renderField('Periodo', 'periodoCredito', evaluacion.periodoCredito)}

            {evaluacion.observaciones && (
                <p className="text-red-600 mt-2"><strong>Observaciones:</strong> {evaluacion.observaciones}</p>
            )}

            {isPending && (
                <div className="mt-6 pt-4 border-t flex justify-between items-center">
                    {isEditing ? (
                        <div className="flex gap-2">
                            <button 
                                onClick={handleSaveChanges} 
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-wait" 
                                disabled={isSaving || isLoading}
                            >
                                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                            <button 
                                onClick={() => setIsEditing(false)} 
                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-400" 
                                disabled={isSaving || isLoading}
                            >
                                Cancelar
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600" disabled={isLoading}>
                            Editar
                        </button>
                    )}

                    <div className="flex gap-2">
                        <button 
                            onClick={() => onApprove(evaluacion.id)} 
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed" 
                            disabled={isLoading || isEditing}
                        >
                            {isLoading ? '...' : 'Aprobar'}
                        </button>
                        <button 
                            onClick={() => onReject(evaluacion)} 
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed" 
                            disabled={isLoading || isEditing}
                        >
                            {isLoading ? '...' : 'Rechazar'}
                        </button>
                    </div>
                </div>
            )}

            {/* Renderizado del Modal */}
            <EvaluacionDetailModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                data={detailData} 
            />
        </div>
    );
};

export default EvaluacionDetailComponent;