import { toast } from 'react-toastify';

export const useToast = () => {
    
    const showToast = (payload, type) => {
        let message = '';

        if (!payload) {
            message = 'Ocurrió un error desconocido.';
        } else if (typeof payload === 'string') {
            // Maneja un mensaje de string simple
            message = payload;
        } 
        
        // --- LÓGICA CLAVE DE PRIORIDAD ---
        else {
            if (payload.msg) {
                // SIEMPRE usa 'msg' si está presente, ya sea éxito o error, pues suele ser el detalle.
                message = payload.msg;
            } else if (payload.errors) {
                // Usa 'errors' solo como fallback si 'msg' no existe
                message = payload.errors;
            } else {
                // Último recurso
                message = 'Error en el servidor al procesar la solicitud.';
            }
        }
        // ---------------------------------

        // Llamar a la función toast de react-toastify
        switch (type) {
            case 'success':
                toast.success(message);
                break;
            case 'error':
                toast.error(message);
                break;
            case 'info':
                toast.info(message);
                break;
            case 'warning':
                toast.warn(message);
                break;
            default:
                toast(message);
        }
    };

    return { showToast };
};