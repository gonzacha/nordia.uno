/**
 * GT Intelligence - Loading Component
 * Versión: 2.0.0 (Modular)
 * Fecha: 2025-08-10
 */

import { CONFIG } from '../config.js';
import logger from '../logger.js';
import store from '../store.js';

class LoadingComponent {
    constructor() {
        this.container = null;
        this.currentMessageIndex = 0;
        this.messageInterval = null;
        this.observerId = null;
        
        // Configuración de animaciones
        this.rotationSpeed = CONFIG.UI.ANIMATION_DURATION;
        this.messageChangeInterval = 2000; // Cambiar mensaje cada 2 segundos
        
        this.init();
    }

    /**
     * Inicialización del componente
     */
    init() {
        // Suscribirse a cambios en el estado de loading
        this.observerId = store.subscribe('isLoading', (isLoading) => {
            if (isLoading) {
                this.show();
            } else {
                this.hide();
            }
        }, 'loading_component');

        // También suscribirse a cambios en el mensaje de loading
        store.subscribe('loadingMessage', (message) => {
            this.updateMessage(message);
        }, 'loading_component_message');

        logger.componentMount('LoadingComponent');
    }

    /**
     * Crear el HTML del componente de loading
     */
    createLoadingHTML() {
        return `
            <div class="flex flex-col items-center justify-center h-screen">
                <!-- Spinner SVG animado -->
                <div class="loading-spinner">
                    <svg class="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
                
                <!-- Mensaje de carga -->
                <div class="loading-message mt-4">
                    <p class="text-xl text-gray-400 text-center animate-pulse" id="loading-text">
                        ${store.getState('loadingMessage') || CONFIG.UI.LOADING_MESSAGES[0]}
                    </p>
                </div>
                
                <!-- Barra de progreso opcional (futura funcionalidad) -->
                <div class="loading-progress mt-6 w-64 hidden">
                    <div class="bg-gray-700 rounded-full h-2">
                        <div class="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out" style="width: 0%" id="progress-bar"></div>
                    </div>
                    <p class="text-sm text-gray-500 mt-2 text-center" id="progress-text">Preparando...</p>
                </div>
                
                <!-- Indicador de pasos (futura funcionalidad) -->
                <div class="loading-steps mt-8 hidden">
                    <div class="flex space-x-2">
                        <div class="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                        <div class="w-2 h-2 bg-blue-400 rounded-full animate-ping" style="animation-delay: 0.2s"></div>
                        <div class="w-2 h-2 bg-blue-300 rounded-full animate-ping" style="animation-delay: 0.4s"></div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Mostrar componente de loading
     */
    show() {
        const appContainer = document.getElementById('app');
        if (!appContainer) {
            logger.error('App container not found', 'LoadingComponent');
            return;
        }

        // Crear y mostrar loading
        appContainer.innerHTML = this.createLoadingHTML();
        this.container = appContainer.querySelector('.flex.flex-col.items-center.justify-center.h-screen');
        
        // Iniciar rotación de mensajes si hay múltiples
        this.startMessageRotation();
        
        logger.debug('Loading component shown', 'LoadingComponent', {
            message: store.getState('loadingMessage')
        });
    }

    /**
     * Ocultar componente de loading
     */
    hide() {
        // Detener rotación de mensajes
        this.stopMessageRotation();
        
        // El contenido se reemplazará por otro componente,
        // no necesitamos hacer nada específico aquí
        
        logger.debug('Loading component hidden', 'LoadingComponent');
    }

    /**
     * Actualizar mensaje de loading
     */
    updateMessage(message) {
        if (!this.container) return;
        
        const textElement = this.container.querySelector('#loading-text');
        if (textElement && message) {
            // Animación de fade para cambio suave
            textElement.style.opacity = '0.5';
            
            setTimeout(() => {
                textElement.textContent = message;
                textElement.style.opacity = '1';
            }, 150);
            
            logger.debug(`Loading message updated: ${message}`, 'LoadingComponent');
        }
    }

    /**
     * Iniciar rotación automática de mensajes
     */
    startMessageRotation() {
        const messages = CONFIG.UI.LOADING_MESSAGES;
        if (messages.length <= 1) return;
        
        // Si ya hay un mensaje específico en el store, no rotar
        if (store.getState('loadingMessage')) return;
        
        this.currentMessageIndex = 0;
        
        this.messageInterval = setInterval(() => {
            this.currentMessageIndex = (this.currentMessageIndex + 1) % messages.length;
            const newMessage = messages[this.currentMessageIndex];
            this.updateMessage(newMessage);
        }, this.messageChangeInterval);
        
        logger.debug('Message rotation started', 'LoadingComponent', {
            messages_count: messages.length,
            interval: this.messageChangeInterval
        });
    }

    /**
     * Detener rotación de mensajes
     */
    stopMessageRotation() {
        if (this.messageInterval) {
            clearInterval(this.messageInterval);
            this.messageInterval = null;
            logger.debug('Message rotation stopped', 'LoadingComponent');
        }
    }

    /**
     * Mostrar progreso específico (funcionalidad futura)
     */
    showProgress(percentage, text = null) {
        if (!this.container) return;
        
        const progressContainer = this.container.querySelector('.loading-progress');
        const progressBar = this.container.querySelector('#progress-bar');
        const progressText = this.container.querySelector('#progress-text');
        
        if (progressContainer && progressBar) {
            progressContainer.classList.remove('hidden');
            progressBar.style.width = `${Math.max(0, Math.min(100, percentage))}%`;
            
            if (progressText && text) {
                progressText.textContent = text;
            }
            
            logger.debug(`Progress updated: ${percentage}%`, 'LoadingComponent', { text });
        }
    }

    /**
     * Ocultar barra de progreso
     */
    hideProgress() {
        if (!this.container) return;
        
        const progressContainer = this.container.querySelector('.loading-progress');
        if (progressContainer) {
            progressContainer.classList.add('hidden');
        }
    }

    /**
     * Mostrar indicador de pasos (funcionalidad futura)
     */
    showSteps() {
        if (!this.container) return;
        
        const stepsContainer = this.container.querySelector('.loading-steps');
        if (stepsContainer) {
            stepsContainer.classList.remove('hidden');
        }
    }

    /**
     * Ocultar indicador de pasos
     */
    hideSteps() {
        if (!this.container) return;
        
        const stepsContainer = this.container.querySelector('.loading-steps');
        if (stepsContainer) {
            stepsContainer.classList.add('hidden');
        }
    }

    /**
     * Configurar tipo de loading personalizado
     */
    setLoadingType(type) {
        switch (type) {
            case 'simple':
                this.hideProgress();
                this.hideSteps();
                break;
            case 'progress':
                this.showProgress(0);
                this.hideSteps();
                break;
            case 'steps':
                this.hideProgress();
                this.showSteps();
                break;
            default:
                // Tipo por defecto (simple)
                this.hideProgress();
                this.hideSteps();
        }
        
        logger.debug(`Loading type set to: ${type}`, 'LoadingComponent');
    }

    /**
     * Mostrar loading con configuración específica
     */
    showWithConfig(config = {}) {
        const {
            message = null,
            type = 'simple',
            progress = null,
            progressText = null
        } = config;

        // Actualizar mensaje en el store si se proporciona
        if (message) {
            store.setState('loadingMessage', message);
        }

        // Activar loading
        store.setState('isLoading', true);

        // Configurar tipo después de que se muestre
        setTimeout(() => {
            this.setLoadingType(type);
            
            if (type === 'progress' && progress !== null) {
                this.showProgress(progress, progressText);
            }
        }, 100);
    }

    /**
     * Cleanup al destruir el componente
     */
    destroy() {
        this.stopMessageRotation();
        
        if (this.observerId) {
            store.unsubscribe('isLoading', this.observerId);
            store.unsubscribe('loadingMessage', this.observerId + '_message');
        }
        
        this.container = null;
        
        logger.componentUnmount('LoadingComponent');
    }

    /**
     * Métodos estáticos de conveniencia para uso desde otros componentes
     */
    static show(message = null) {
        if (message) {
            store.setState('loadingMessage', message);
        }
        store.setState('isLoading', true);
    }

    static hide() {
        store.setState('isLoading', false);
        store.setState('loadingMessage', '');
    }

    static updateMessage(message) {
        store.setState('loadingMessage', message);
    }
}

export default LoadingComponent;