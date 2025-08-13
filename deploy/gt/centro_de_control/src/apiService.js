/**
 * GT Intelligence - Cliente HTTP Robusto
 * Versión: 2.0.0 (Modular)
 * Fecha: 2025-08-10
 */

import { CONFIG } from './config.js';
import logger from './logger.js';

class ApiService {
    constructor() {
        this.baseURL = CONFIG.API.BASE_URL;
        this.timeout = CONFIG.API.TIMEOUT;
        this.retryAttempts = CONFIG.API.RETRY_ATTEMPTS;
        this.retryDelay = CONFIG.API.RETRY_DELAY;
        
        // Estadísticas de uso
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            retriedRequests: 0,
            averageResponseTime: 0
        };

        logger.info('ApiService initialized', 'api', {
            base_url: this.baseURL,
            timeout: this.timeout,
            retry_attempts: this.retryAttempts
        });
    }

    /**
     * Crear URL completa desde endpoint
     */
    buildURL(endpoint, params = {}) {
        let url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
        
        // Reemplazar parámetros en la URL (ej: /api/municipios/{id})
        Object.entries(params).forEach(([key, value]) => {
            url = url.replace(`{${key}}`, encodeURIComponent(value));
        });
        
        return url;
    }

    /**
     * Crear AbortController con timeout
     */
    createTimeoutController() {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
        }, this.timeout);
        
        return { controller, timeoutId };
    }

    /**
     * Delay para retry
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Determinar si un error es retryable
     */
    isRetryableError(error, response = null) {
        // Error de red (sin respuesta)
        if (!response) return true;
        
        // Códigos de estado retryables
        return CONFIG.ERRORS.RETRY_CODES.includes(response.status);
    }

    /**
     * Calcular delay exponencial para retry
     */
    calculateRetryDelay(attempt) {
        return this.retryDelay * Math.pow(2, attempt - 1);
    }

    /**
     * Realizar petición HTTP con retry automático
     */
    async request(method, endpoint, options = {}) {
        const startTime = Date.now();
        const url = this.buildURL(endpoint, options.params);
        let lastError = null;
        let response = null;

        // Configuración de la petición
        const requestConfig = {
            method: method.toUpperCase(),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...options.headers
            },
            ...options.fetchOptions
        };

        // Añadir body si es necesario
        if (options.data && ['POST', 'PUT', 'PATCH'].includes(requestConfig.method)) {
            requestConfig.body = JSON.stringify(options.data);
        }

        this.stats.totalRequests++;
        logger.apiCall(method.toUpperCase(), endpoint);

        // Intentos con retry
        for (let attempt = 1; attempt <= this.retryAttempts + 1; attempt++) {
            const { controller, timeoutId } = this.createTimeoutController();
            
            try {
                response = await fetch(url, {
                    ...requestConfig,
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                // Verificar si la respuesta es exitosa
                if (response.ok) {
                    const endTime = Date.now();
                    const responseTime = endTime - startTime;
                    
                    // Actualizar estadísticas
                    this.stats.successfulRequests++;
                    this.updateAverageResponseTime(responseTime);
                    
                    logger.apiCall(method.toUpperCase(), endpoint, response.status);
                    
                    // Parsear respuesta JSON
                    const data = await response.json();
                    return {
                        data,
                        status: response.status,
                        statusText: response.statusText,
                        headers: response.headers,
                        responseTime
                    };
                }

                // Error HTTP pero no de red
                const errorData = await response.text();
                lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
                lastError.status = response.status;
                lastError.response = errorData;

            } catch (error) {
                clearTimeout(timeoutId);
                
                if (error.name === 'AbortError') {
                    lastError = new Error(CONFIG.ERRORS.TIMEOUT_MESSAGE);
                    lastError.timeout = true;
                } else {
                    lastError = error;
                }
            }

            // Determinar si debemos hacer retry
            const shouldRetry = attempt <= this.retryAttempts && 
                              this.isRetryableError(lastError, response);

            if (shouldRetry) {
                this.stats.retriedRequests++;
                const retryDelay = this.calculateRetryDelay(attempt);
                
                logger.warn(
                    `Request failed, retrying in ${retryDelay}ms (attempt ${attempt}/${this.retryAttempts})`,
                    'api',
                    { error: lastError.message, url }
                );
                
                await this.delay(retryDelay);
            } else {
                break;
            }
        }

        // Si llegamos aquí, todos los intentos fallaron
        this.stats.failedRequests++;
        
        const finalError = lastError || new Error('Unknown error');
        logger.apiError(method.toUpperCase(), endpoint, finalError);
        
        throw finalError;
    }

    /**
     * Actualizar tiempo promedio de respuesta
     */
    updateAverageResponseTime(newTime) {
        const totalSuccessful = this.stats.successfulRequests;
        const currentAverage = this.stats.averageResponseTime;
        
        this.stats.averageResponseTime = 
            ((currentAverage * (totalSuccessful - 1)) + newTime) / totalSuccessful;
    }

    // === MÉTODOS HTTP DE CONVENIENCIA ===

    /**
     * Petición GET
     */
    async get(endpoint, params = {}, options = {}) {
        return this.request('GET', endpoint, { ...options, params });
    }

    /**
     * Petición POST
     */
    async post(endpoint, data = {}, options = {}) {
        return this.request('POST', endpoint, { ...options, data });
    }

    /**
     * Petición PUT
     */
    async put(endpoint, data = {}, options = {}) {
        return this.request('PUT', endpoint, { ...options, data });
    }

    /**
     * Petición DELETE
     */
    async delete(endpoint, options = {}) {
        return this.request('DELETE', endpoint, options);
    }

    // === MÉTODOS ESPECÍFICOS DE LA API DE GT INTELLIGENCE ===

    /**
     * Obtener lista de municipios
     */
    async getMunicipalities() {
        try {
            const response = await this.get(CONFIG.API.ENDPOINTS.MUNICIPALITIES);
            const body = response?.data || {};
            const normalized = {
                ...body,
                municipalities: body.municipalities || body.municipios || []
            };
            return normalized;
        } catch (error) {
            logger.error('Failed to fetch municipalities', 'api', error);
            throw new Error(CONFIG.ERRORS.NETWORK_MESSAGE);
        }
    }

    /**
     * Obtener detalles de un municipio específico
     */
    async getMunicipalityDetails(municipioId) {
        try {
            const response = await this.get(
                CONFIG.API.ENDPOINTS.MUNICIPALITY_DETAIL,
                { id: municipioId }
            );
            return response.data;
        } catch (error) {
            if (error.status === 404) {
                throw new Error(CONFIG.ERRORS.NOT_FOUND_MESSAGE);
            }
            logger.error(`Failed to fetch municipality ${municipioId}`, 'api', error);
            throw new Error(CONFIG.ERRORS.NETWORK_MESSAGE);
        }
    }

    /**
     * Health check de la API
     */
    async healthCheck() {
        try {
            const response = await this.get(CONFIG.API.ENDPOINTS.HEALTH);
            logger.info('API health check successful', 'api', response.data);
            return response.data;
        } catch (error) {
            logger.warn('API health check failed', 'api', error);
            throw error;
        }
    }

    /**
     * Subir archivo (manteniendo compatibilidad)
     */
    async uploadFile(file, progressCallback = null) {
        const startTime = Date.now();
        const url = this.buildURL('/upload');
        
        try {
            const formData = new FormData();
            formData.append('file', file);

            const { controller, timeoutId } = this.createTimeoutController();

            this.stats.totalRequests++;
            logger.apiCall('POST', '/upload');

            const response = await fetch(url, {
                method: 'POST',
                body: formData,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }

            const data = await response.json();
            const responseTime = Date.now() - startTime;
            
            this.stats.successfulRequests++;
            this.updateAverageResponseTime(responseTime);
            
            logger.apiCall('POST', '/upload', response.status);
            
            return {
                data,
                status: response.status,
                responseTime
            };

        } catch (error) {
            this.stats.failedRequests++;
            logger.apiError('POST', '/upload', error);
            throw error;
        }
    }

    // === MÉTODOS DE UTILIDAD Y ESTADÍSTICAS ===

    /**
     * Obtener estadísticas de uso
     */
    getStats() {
        return {
            ...this.stats,
            successRate: this.stats.totalRequests > 0 ? 
                (this.stats.successfulRequests / this.stats.totalRequests * 100).toFixed(2) + '%' : 
                '0%',
            retryRate: this.stats.totalRequests > 0 ? 
                (this.stats.retriedRequests / this.stats.totalRequests * 100).toFixed(2) + '%' : 
                '0%'
        };
    }

    /**
     * Resetear estadísticas
     */
    resetStats() {
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            retriedRequests: 0,
            averageResponseTime: 0
        };
        logger.info('API statistics reset', 'api');
    }

    /**
     * Configurar nueva URL base
     */
    setBaseURL(newBaseURL) {
        this.baseURL = newBaseURL;
        logger.info(`API base URL updated: ${newBaseURL}`, 'api');
    }

    /**
     * Configurar timeout
     */
    setTimeout(newTimeout) {
        this.timeout = newTimeout;
        logger.info(`API timeout updated: ${newTimeout}ms`, 'api');
    }

    /**
     * Test de conectividad
     */
    async testConnection() {
        try {
            await this.healthCheck();
            return true;
        } catch (error) {
            return false;
        }
    }
}

// Crear instancia global
const apiService = new ApiService();

export default apiService;
