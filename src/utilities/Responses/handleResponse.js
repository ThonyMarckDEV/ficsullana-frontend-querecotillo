/**
 * Procesa la respuesta de fetch y la ESTANDARIZA.
 * Siempre devuelve o lanza un objeto con un formato predecible.
 */
export const handleResponse = async (response) => {
    const result = await response.json();

    if (!response.ok) {
        // La lógica de error ya está bien, no necesita cambios.
        const error = {
            type: 'error',
            message: result.message || 'Ocurrió un error inesperado.',
            details: result.errors ? Object.values(result.errors).flat() : undefined,
        };
        throw error;
    }

    // ÉXITO: Crea y devuelve nuestro objeto de éxito estándar.
    const success = {
        type: 'success',
        message: result.message || 'Operación realizada con éxito.',
        data: result.data,
        pagination: result.pagination,
        summary: result.summary,
    };
    return success;
};