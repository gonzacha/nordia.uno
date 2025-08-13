/**
 * GT Intelligence - Error Component
 * Versión: 2.0.0 (Modular)
 * Fecha: 2025-08-10
 */

import { CONFIG } from '../config.js';
import logger from '../logger.js';
import store from '../store.js';
import apiService from '../apiService.js';

class ErrorComponent {
    constructor() {
        this.container = null;
        this.observerId = null;
        this.retryAttempts = 0;
        this.maxRetryAttempts = 3;
        this.retryCallback = null;
        
        this.init();
    }

    /**
     * Inicialización del componente
     */
    init() {
        // Suscribirse a cambios en el estado de error
        this.observerId = store.subscribe('error', (error) => {
            if (error) {
                this.show(error);
            } else {
                this.hide();
            }
        }, 'error_component');

        logger.componentMount('ErrorComponent');
    }

    /**
     * Crear el HTML del componente de error
     */
    createErrorHTML(errorMessage, errorType = 'generic') {
        const errorConfig = this.getErrorConfig(errorType);
        
        return `
            <div class="flex flex-col items-center justify-center h-screen p-4">
                <div class="max-w-md w-full bg-red-900/20 border border-red-700/50 rounded-lg p-6 text-center">
                    <!-- Icono de error -->
                    <div class="error-icon mb-4">
                        ${errorConfig.icon}
                    </div>
                    
                    <!-- Título del error -->
                    <h2 class="text-xl font-bold text-red-300 mb-3">
                        ${errorConfig.title}
                    </h2>
                    
                    <!-- Mensaje del error -->
                    <div class="error-message mb-6">
                        <p class="text-red-200 leading-relaxed">
                            ${this.sanitizeErrorMessage(errorMessage)}
                        </p>
                    </div>
                    
                    <!-- Botones de acción -->
                    <div class="error-actions space-y-3">
                        ${this.createActionButtons(errorType)}
                    </div>
                    
                    <!-- Información adicional colapsable -->
                    <div class="error-details mt-6">
                        <button id="toggle-details" class="text-sm text-red-400 hover:text-red-300 transition-colors underline">
                            Mostrar detalles técnicos
                        </button>
                        <div id="error-details-content" class="hidden mt-3 p-3 bg-red-950/50 rounded text-xs text-red-300 text-left">
                            <div class="technical-details">
                                <p><strong>Timestamp:</strong> ${new Date().toLocaleString('es-AR')}</p>
                                <p><strong>Versión:</strong> ${CONFIG.METADATA.VERSION}</p>
                                <p><strong>Error Type:</strong> ${errorType}</p>
                                <p><strong>Retry Attempts:</strong> ${this.retryAttempts}/${this.maxRetryAttempts}</p>
                                ${this.getApiStats()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Obtener configuración específica por tipo de error
     */
    getErrorConfig(errorType) {
        const configs = {
            network: {
                title: 'Error de Conexión',
                icon: `<svg class="w-16 h-16 text-red-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-12.728 12.728m0-12.728l12.728 12.728M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>`
            },
            timeout: {
                title: 'Tiempo de Espera Agotado',
                icon: `<svg class="w-16 h-16 text-red-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>`
            },
            notfound: {
                title: 'Datos No Encontrados',
                icon: `<svg class="w-16 h-16 text-red-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0120 12a8 8 0 10-2.343 5.657l2.343 2.343"/>
                </svg>`
            },
            server: {
                title: 'Error del Servidor',
                icon: `<svg class="w-16 h-16 text-red-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"/>
                </svg>`
            },
            generic: {
                title: 'Error Inesperado',
                icon: `<svg class="w-16 h-16 text-red-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z"/>
                </svg>`
            }
        };

        return configs[errorType] || configs.generic;
    }

    /**
     * Crear botones de acción según el tipo de error
     */
    createActionButtons(errorType) {
        let buttons = '';

        // Botón de retry (siempre disponible si hay callback)
        if (this.retryCallback && this.retryAttempts < this.maxRetryAttempts) {
            buttons += `
                <button id="retry-button" class="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
                    <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                    Reintentar ${this.retryAttempts > 0 ? `(${this.retryAttempts}/${this.maxRetryAttempts})` : ''}
                </button>
            `;
        }

        // Botón de home/reset
        buttons += `
            <button id="home-button" class="w-full bg-gray-600 hover:bg-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
                <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
                Volver al Inicio
            </button>
        `;

        // Botón de test de conectividad para errores de red
        if (errorType === 'network' || errorType === 'timeout') {
            buttons += `
                <button id="test-connection-button" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
                    <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Probar Conexión
                </button>
            `;
        }

        return buttons;
    }

    /**
     * Sanitizar mensaje de error para mostrar al usuario
     */
    sanitizeErrorMessage(message) {
        // Convertir mensajes técnicos a mensajes amigables
        const friendlyMessages = {
            'fetch': CONFIG.ERRORS.NETWORK_MESSAGE,
            'timeout': CONFIG.ERRORS.TIMEOUT_MESSAGE,
            'not found': CONFIG.ERRORS.NOT_FOUND_MESSAGE,
            '404': CONFIG.ERRORS.NOT_FOUND_MESSAGE,
            '500': 'Error interno del servidor. Intenta nuevamente.',
            '502': 'Servidor temporalmente no disponible.',
            '503': 'Servicio temporalmente no disponible.'
        };

        const lowerMessage = message.toLowerCase();
        
        for (const [key, friendlyMessage] of Object.entries(friendlyMessages)) {
            if (lowerMessage.includes(key)) {
                return friendlyMessage;
            }
        }

        return message || CONFIG.ERRORS.DEFAULT_MESSAGE;
    }

    /**
     * Determinar tipo de error basado en el mensaje
     */
    determineErrorType(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('fetch') || lowerMessage.includes('network')) {
            return 'network';
        }
        if (lowerMessage.includes('timeout') || lowerMessage.includes('tiempo')) {
            return 'timeout';
        }
        if (lowerMessage.includes('404') || lowerMessage.includes('not found')) {
            return 'notfound';
        }
        if (lowerMessage.includes('500') || lowerMessage.includes('502') || lowerMessage.includes('503')) {
            return 'server';
        }
        
        return 'generic';
    }

    /**
     * Obtener estadísticas de la API para detalles técnicos
     */
    getApiStats() {
        const stats = apiService.getStats();
        return `
            <p><strong>API Stats:</strong></p>
            <ul class="text-xs ml-4 mt-1">
                <li>• Success Rate: ${stats.successRate}</li>
                <li>• Total Requests: ${stats.totalRequests}</li>
                <li>• Avg Response Time: ${Math.round(stats.averageResponseTime)}ms</li>
            </ul>
        `;
    }

    /**
     * Mostrar componente de error
     */
    show(errorMessage, retryCallback = null) {
        const appContainer = document.getElementById('app');
        if (!appContainer) {
            logger.error('App container not found', 'ErrorComponent');
            return;
        }

        this.retryCallback = retryCallback;
        const errorType = this.determineErrorType(errorMessage);
        
        // Crear y mostrar error
        appContainer.innerHTML = this.createErrorHTML(errorMessage, errorType);
        this.container = appContainer.querySelector('.flex.flex-col.items-center.justify-center.h-screen');
        
        // Configurar event listeners
        this.setupEventListeners();
        
        logger.error(`Error displayed: ${errorMessage}`, 'ErrorComponent', {
            type: errorType,
            retry_attempts: this.retryAttempts
        });
    }

    /**
     * Configurar event listeners para los botones
     */
    setupEventListeners() {
        if (!this.container) return;

        // Botón de retry
        const retryButton = this.container.querySelector('#retry-button');
        if (retryButton && this.retryCallback) {
            retryButton.addEventListener('click', async () => {
                this.retryAttempts++;
                
                // Deshabilitar botón mientras se intenta
                retryButton.disabled = true;
                retryButton.innerHTML = `
                    <svg class="w-5 h-5 inline-block mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                    Reintentando...
                `;

                try {
                    await this.retryCallback();
                    // Si el retry es exitoso, el error se limpiará automáticamente
                    this.retryAttempts = 0;
                } catch (error) {
                    // Si falla, mostrar el nuevo error
                    store.setError(error);
                }
            });
        }

        // Botón de home
        const homeButton = this.container.querySelector('#home-button');
        if (homeButton) {
            homeButton.addEventListener('click', () => {
                store.clearError();
                store.showWelcomeScreen();
                this.retryAttempts = 0;
                logger.userAction('error_return_home');
            });
        }

        // Botón de test de conexión
        const testButton = this.container.querySelector('#test-connection-button');
        if (testButton) {
            testButton.addEventListener('click', async () => {
                testButton.disabled = true;
                testButton.innerHTML = `
                    <svg class="w-5 h-5 inline-block mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Probando...
                `;

                try {
                    const isConnected = await apiService.testConnection();
                    
                    if (isConnected) {
                        testButton.innerHTML = `
                            <svg class="w-5 h-5 inline-block mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            Conexión OK
                        `;
                        setTimeout(() => {
                            store.clearError();
                            store.showWelcomeScreen();
                        }, 1500);
                    } else {
                        testButton.innerHTML = `
                            <svg class="w-5 h-5 inline-block mr-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                            Sin Conexión
                        `;
                        testButton.disabled = false;
                    }
                } catch (error) {
                    testButton.innerHTML = `
                        <svg class="w-5 h-5 inline-block mr-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                        Error de Prueba
                    `;
                    testButton.disabled = false;
                }
            });
        }

        // Toggle de detalles técnicos
        const toggleButton = this.container.querySelector('#toggle-details');
        const detailsContent = this.container.querySelector('#error-details-content');
        
        if (toggleButton && detailsContent) {
            toggleButton.addEventListener('click', () => {
                const isHidden = detailsContent.classList.contains('hidden');
                
                if (isHidden) {
                    detailsContent.classList.remove('hidden');
                    toggleButton.textContent = 'Ocultar detalles técnicos';
                } else {
                    detailsContent.classList.add('hidden');
                    toggleButton.textContent = 'Mostrar detalles técnicos';
                }
                
                logger.userAction('error_toggle_details', { shown: isHidden });
            });
        }
    }

    /**
     * Ocultar componente de error
     */
    hide() {
        this.container = null;
        this.retryAttempts = 0;
        this.retryCallback = null;
        
        logger.debug('Error component hidden', 'ErrorComponent');
    }

    /**
     * Cleanup al destruir el componente
     */
    destroy() {
        if (this.observerId) {
            store.unsubscribe('error', this.observerId);
        }
        
        this.container = null;
        this.retryCallback = null;
        
        logger.componentUnmount('ErrorComponent');
    }

    /**
     * Métodos estáticos de conveniencia
     */
    static show(errorMessage, retryCallback = null) {
        store.setError(errorMessage);
        // El retryCallback se puede configurar a través de una instancia
    }

    static hide() {
        store.clearError();
    }
}

export default ErrorComponent;