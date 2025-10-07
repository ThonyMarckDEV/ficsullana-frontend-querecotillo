/**
 * Función utilitaria para manejar la respuesta de las llamadas a fetch.
 * Lee el cuerpo de la respuesta como JSON y lanza el objeto completo
 * si el estado HTTP no es satisfactorio (response.ok es false).
 * * @param {Response} response - La promesa de respuesta devuelta por fetch.
 * @returns {Promise<Object>} El cuerpo de la respuesta parseado como JSON.
 * @throws {Object} El objeto JSON de la respuesta de error del servidor.
 */
export const handleResponse = async (response) => {
    // Siempre leemos el cuerpo de la respuesta, sin importar el estado.
    const result = await response.json(); 

    if (!response.ok) {
        // Lanzamos el objeto JSON directamente para que el catch del componente
        // reciba el objeto de error del backend (ej: { msg: "...", errors: "..." })
        throw result; 
    }

    return result;
};