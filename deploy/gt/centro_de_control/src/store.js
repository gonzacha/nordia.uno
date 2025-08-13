/**
 * GT Intelligence - Estado Centralizado con Observer Pattern
 * Versión: 2.0.0 (Modular)
 * Fecha: 2025-08-10
 */

import { CONFIG } from './config.js';
import logger from './logger.js';

class Store {
    constructor() {
        // Estado principal de la aplicación
        this.state = {
            // Datos de municipios
            municipalities: [],
            // Mantener compatibilidad con componentes: ambos nombres
            currentMunicipio: null,
            currentMunicipality: null,
            metadata: {},
            
            // Estado de UI
            isLoading: false,
            loadingMessage: '',
            error: null,
            currentView: 'welcome', // 'welcome' | 'results'
            
            // Chart.js instance para limpieza
            chartInstance: null,
            
            // Configuración de búsqueda
            searchQuery: '',
            searchResults: [],
            
            // Estado de la aplicación
            appInitialized: false,
            apiConnected: false
        };

        // Observadores registrados
        this.observers = new Map();
        
        // Inicializar
        this.init();
    }

    /**
     * Inicialización del store
     */
    init() {
        logger.info('Store initialized', 'store', {
            initial_state: Object.keys(this.state)
        });
    }

    /**
     * Suscribirse a cambios en el estado
     * @param {string} key - Clave del estado a observar (o '*' para todos)
     * @param {Function} callback - Función a ejecutar cuando cambie
     * @param {string} observerId - ID único del observador
     */
    subscribe(key, callback, observerId = null) {
        const id = observerId || `${key}_${Date.now()}_${Math.random()}`;
        
        if (!this.observers.has(key)) {
            this.observers.set(key, new Map());
        }
        
        this.observers.get(key).set(id, callback);
        
        logger.debug(`Observer registered: ${id} for key: ${key}`, 'store');
        
        return id; // Retorna ID para poder desuscribirse
    }

    /**
     * Desuscribirse de cambios
     * @param {string} key - Clave del estado
     * @param {string} observerId - ID del observador
     */
    unsubscribe(key, observerId) {
        if (this.observers.has(key)) {
            const deleted = this.observers.get(key).delete(observerId);
            if (deleted) {
                logger.debug(`Observer unregistered: ${observerId}`, 'store');
            }
        }
    }

    /**
     * Notificar a observadores sobre cambios
     * @param {string} key - Clave que cambió
     * @param {*} newValue - Nuevo valor
     * @param {*} oldValue - Valor anterior
     */
    notify(key, newValue, oldValue) {
        // Notificar observadores específicos de esta key
        if (this.observers.has(key)) {
            this.observers.get(key).forEach((callback, observerId) => {
                try {
                    callback(newValue, oldValue, key);
                } catch (error) {
                    logger.error(`Observer error: ${observerId}`, 'store', error);
                }
            });
        }

        // Notificar observadores globales (key '*')
        if (this.observers.has('*')) {
            this.observers.get('*').forEach((callback, observerId) => {
                try {
                    callback(this.state, key, newValue, oldValue);
                } catch (error) {
                    logger.error(`Global observer error: ${observerId}`, 'store', error);
                }
            });
        }
    }

    /**
     * Actualizar estado de forma reactiva
     * @param {string} key - Clave del estado
     * @param {*} value - Nuevo valor
     */
    setState(key, value) {
        const oldValue = this.state[key];
        
        // Solo actualizar si el valor realmente cambió
        if (oldValue !== value) {
            this.state[key] = value;
            this.notify(key, value, oldValue);
            
            logger.debug(`State updated: ${key}`, 'store', {
                old_value: oldValue,
                new_value: value
            });
        }
    }

    /**
     * Obtener valor del estado
     * @param {string} key - Clave del estado
     */
    getState(key) {
        return this.state[key];
    }

    /**
     * Obtener todo el estado (copia para evitar mutaciones)
     */
    getAllState() {
        return { ...this.state };
    }

    /**
     * Actualizar múltiples valores del estado
     * @param {Object} updates - Objeto con las actualizaciones
     */
    updateState(updates) {
        const changes = [];
        
        Object.entries(updates).forEach(([key, value]) => {
            if (this.state[key] !== value) {
                const oldValue = this.state[key];
                this.state[key] = value;
                changes.push({ key, value, oldValue });
            }
        });

        // Notificar todos los cambios
        changes.forEach(({ key, value, oldValue }) => {
            this.notify(key, value, oldValue);
        });

        if (changes.length > 0) {
            logger.info(`Batch state update: ${changes.length} changes`, 'store');
        }
    }

    // === MÉTODOS DE CONVENIENCIA PARA EL DOMINIO DE LA APLICACIÓN ===

    /**
     * Configurar datos de municipios
     */
    setMunicipalities(municipalities, metadata = {}) {
        this.updateState({
            municipalities,
            metadata,
            apiConnected: true
        });
        
        logger.info(`Municipalities loaded: ${municipalities.length}`, 'store');
    }

    /**
     * Configurar municipio actual
     */
    setCurrentMunicipio(municipio) {
        // Actualiza ambos alias para compatibilidad
        this.setState('currentMunicipio', municipio);
        this.setState('currentMunicipality', municipio);
        this.setState('currentView', 'results');
        
        logger.userAction('municipio_selected', { 
            name: municipio?.nombre,
            id: municipio?.id 
        });
    }

    /**
     * Alias: configurar municipio actual usando key en inglés
     */
    setCurrentMunicipality(municipio) {
        this.setCurrentMunicipio(municipio);
    }

    /**
     * Mostrar pantalla de bienvenida
     */
    showWelcomeScreen() {
        this.updateState({
            currentView: 'welcome',
            currentMunicipio: null,
            searchQuery: '',
            searchResults: []
        });
        
        logger.userAction('navigation_home');
    }

    /**
     * Configurar estado de carga
     */
    setLoading(isLoading, message = '') {
        // Usar mensaje aleatorio si no se proporciona uno
        const loadingMessage = message || this.getRandomLoadingMessage();
        
        this.updateState({
            isLoading,
            loadingMessage,
            error: null // Limpiar errores al cargar
        });
        
        if (isLoading) {
            logger.info(`Loading started: ${loadingMessage}`, 'store');
        } else {
            logger.info('Loading finished', 'store');
        }
    }

    /**
     * Configurar estado de error
     */
    setError(error, context = null) {
        const errorMessage = typeof error === 'string' ? error : error.message;
        
        this.updateState({
            error: errorMessage,
            isLoading: false
        });
        
        logger.error(`App error: ${errorMessage}`, 'store', {
            context,
            full_error: error
        });
    }

    /**
     * Limpiar error
     */
    clearError() {
        this.setState('error', null);
    }

    /**
     * Configurar búsqueda
     */
    setSearch(query, results = []) {
        this.updateState({
            searchQuery: query,
            searchResults: results
        });
        
        if (query) {
            logger.userAction('search', { 
                query, 
                results_count: results.length 
            });
        }
    }

    /**
     * Configurar instancia de Chart.js
     */
    setChartInstance(chartInstance) {
        // Destruir instancia anterior si existe
        if (this.state.chartInstance) {
            this.state.chartInstance.destroy();
            logger.debug('Previous chart instance destroyed', 'store');
        }
        
        this.setState('chartInstance', chartInstance);
        
        if (chartInstance) {
            logger.debug('New chart instance created', 'store');
        }
    }

    /**
     * Marcar aplicación como inicializada
     */
    setAppInitialized(initialized = true) {
        this.setState('appInitialized', initialized);
        
        if (initialized) {
            logger.info(`GT Intelligence initialized - v${CONFIG.METADATA.VERSION}`, 'store');
        }
    }

    // === MÉTODOS DE UTILIDAD ===

    /**
     * Obtener mensaje de carga aleatorio
     */
    getRandomLoadingMessage() {
        const messages = CONFIG.UI.LOADING_MESSAGES;
        return messages[Math.floor(Math.random() * messages.length)];
    }

    /**
     * Resetear estado a valores iniciales
     */
    reset() {
        const initialState = {
            municipalities: [],
            currentMunicipio: null,
            currentMunicipality: null,
            metadata: {},
            isLoading: false,
            loadingMessage: '',
            error: null,
            currentView: 'welcome',
            chartInstance: null,
            searchQuery: '',
            searchResults: [],
            appInitialized: false,
            apiConnected: false
        };

        // Destruir chart si existe
        if (this.state.chartInstance) {
            this.state.chartInstance.destroy();
        }

        this.state = initialState;
        this.notify('*', this.state, null);
        
        logger.info('Store reset to initial state', 'store');
    }

    /**
     * Obtener estadísticas del store
     */
    getStats() {
        const observerCounts = {};
        this.observers.forEach((callbacks, key) => {
            observerCounts[key] = callbacks.size;
        });

        return {
            state_keys: Object.keys(this.state).length,
            observers: observerCounts,
            municipalities_count: this.state.municipalities.length,
            current_view: this.state.currentView,
            is_loading: this.state.isLoading,
            has_error: !!this.state.error
        };
    }
}

// Crear instancia global del store
const store = new Store();

// Logging inicial
logger.info('Global store created', 'store', store.getStats());

export default store;
