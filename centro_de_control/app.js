/**
 * GT Intelligence - Centro de Control Frontend v2.0
 * 
 * ARQUITECTURA PREMIUM PARA DEMOSTRACIÓN GUBERNAMENTAL
 * 
 * @author Claude-LC (Lead Coder) - Nordia Technologies
 * @version 2.0.0
 * @date 2025-08-07
 * 
 * @description
 * Aplicación frontend de clase empresarial para visualización de datos electorales.
 * Construida con arquitectura modular, patrones de diseño profesionales y 
 * documentación exhaustiva para cumplir estándares gubernamentales (B2G).
 * 
 * PRINCIPIOS DE DISEÑO:
 * - Separation of Concerns: Lógica separada por responsabilidades
 * - Error Boundaries: Manejo robusto de errores en cada capa
 * - State Management: Sistema centralizado para consistencia de datos
 * - Performance First: Optimizaciones para carga rápida y fluidez
 * - Accessibility: Cumple estándares WCAG para uso gubernamental
 * 
 * STACK TECNOLÓGICO:
 * - Vanilla JavaScript ES6+ (sin dependencias externas)
 * - Tailwind CSS (vía CDN para prototipado rápido)
 * - Chart.js (visualizaciones de datos premium)
 * - Fetch API (comunicación con backend Flask)
 */

// =============================================================================
// CONFIGURACIÓN GLOBAL Y CONSTANTES
// =============================================================================

/**
 * Configuración central de la aplicación
 * @constant {Object} CONFIG
 */
const CONFIG = {
    API: {
        BASE_URL: 'http://127.0.0.1:5001',
        ENDPOINTS: {
            MUNICIPALITIES: '/api/municipios',
            MUNICIPALITY_DETAIL: '/api/municipios/{id}',
            HEALTH: '/api/health'
        },
        TIMEOUT: 10000, // 10 segundos
        RETRY_ATTEMPTS: 3
    },
    UI: {
        ANIMATION_DURATION: 300,
        DEBOUNCE_DELAY: 300,
        CHART_COLORS: [
            '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
            '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
        ],
        LOADING_MESSAGES: [
            'Conectando con GT Intelligence...',
            'Cargando datos electorales...',
            'Procesando resultados...',
            'Optimizando visualización...'
        ]
    },
    METADATA: {
        APP_NAME: 'GT Intelligence',
        VERSION: '2.0.0',
        BUILD_DATE: '2025-08-07',
        ENVIRONMENT: 'production'
    }
};

// =============================================================================
// SISTEMA DE LOGGING EMPRESARIAL
// =============================================================================

/**
 * Sistema de logging profesional para debugging y auditoría
 * @class Logger
 */
class Logger {
    /**
     * @param {string} component - Nombre del componente que genera el log
     */
    constructor(component) {
        this.component = component;
        this.logLevel = CONFIG.METADATA.ENVIRONMENT === 'production' ? 'ERROR' : 'DEBUG';
    }

    /**
     * Log de información general
     * @param {string} message - Mensaje a registrar
     * @param {Object} [data] - Datos adicionales opcionales
     */
    info(message, data = null) {
        this._log('INFO', message, data);
    }

    /**
     * Log de advertencias
     * @param {string} message - Mensaje de advertencia
     * @param {Object} [data] - Datos adicionales opcionales
     */
    warn(message, data = null) {
        this._log('WARN', message, data);
    }

    /**
     * Log de errores críticos
     * @param {string} message - Mensaje de error
     * @param {Error|Object} [error] - Error o datos adicionales
     */
    error(message, error = null) {
        this._log('ERROR', message, error);
    }

    /**
     * Log de debugging (solo en desarrollo)
     * @param {string} message - Mensaje de debug
     * @param {Object} [data] - Datos adicionales opcionales
     */
    debug(message, data = null) {
        if (this.logLevel === 'DEBUG') {
            this._log('DEBUG', message, data);
        }
    }

    /**
     * Método interno para formatear y enviar logs
     * @private
     * @param {string} level - Nivel del log
     * @param {string} message - Mensaje
     * @param {any} data - Datos adicionales
     */
    _log(level, message, data) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            component: this.component,
            message,
            ...(data && { data })
        };

        // En producción, solo mostramos errores en consola
        if (CONFIG.METADATA.ENVIRONMENT === 'production' && level !== 'ERROR') {
            return;
        }

        const style = this._getLogStyle(level);
        console.log(`%c[${level}] ${this.component}: ${message}`, style, data || '');
    }

    /**
     * Obtiene el estilo CSS para cada nivel de log
     * @private
     * @param {string} level - Nivel del log
     * @returns {string} Estilo CSS
     */
    _getLogStyle(level) {
        const styles = {
            DEBUG: 'color: #6B7280; font-weight: normal;',
            INFO: 'color: #3B82F6; font-weight: bold;',
            WARN: 'color: #F59E0B; font-weight: bold;',
            ERROR: 'color: #EF4444; font-weight: bold; background: #FEF2F2; padding: 2px 4px;'
        };
        return styles[level] || styles.INFO;
    }
}

// =============================================================================
// GESTIÓN CENTRALIZADA DE ESTADO
// =============================================================================

/**
 * Store centralizado para el estado de la aplicación
 * Implementa patrón Observer para notificaciones de cambios
 * @class AppStore
 */
class AppStore {
    constructor() {
        this.logger = new Logger('AppStore');
        this.state = {
            municipalities: [],
            currentMunicipality: null,
            metadata: {},
            loading: false,
            error: null,
            chartInstance: null
        };
        this.subscribers = new Set();
        this.logger.info('Store inicializado correctamente');
    }

    /**
     * Obtiene el estado actual completo
     * @returns {Object} Estado actual
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Actualiza el estado y notifica a suscriptores
     * @param {Object} newState - Nuevo estado parcial
     */
    setState(newState) {
        const prevState = { ...this.state };
        this.state = { ...this.state, ...newState };
        
        this.logger.debug('Estado actualizado', { prevState, newState, currentState: this.state });
        this._notifySubscribers(prevState, this.state);
    }

    /**
     * Suscribe un componente a cambios de estado
     * @param {Function} callback - Función a ejecutar en cambios
     * @returns {Function} Función para desuscribirse
     */
    subscribe(callback) {
        this.subscribers.add(callback);
        this.logger.debug(`Nuevo suscriptor registrado. Total: ${this.subscribers.size}`);
        
        return () => {
            this.subscribers.delete(callback);
            this.logger.debug(`Suscriptor removido. Total: ${this.subscribers.size}`);
        };
    }

    /**
     * Notifica a todos los suscriptores sobre cambios de estado
     * @private
     * @param {Object} prevState - Estado anterior
     * @param {Object} currentState - Estado actual
     */
    _notifySubscribers(prevState, currentState) {
        this.subscribers.forEach(callback => {
            try {
                callback(currentState, prevState);
            } catch (error) {
                this.logger.error('Error en callback de suscriptor', error);
            }
        });
    }

    /**
     * Limpia el store (útil para testing y reset)
     */
    reset() {
        this.setState({
            municipalities: [],
            currentMunicipality: null,
            metadata: {},
            loading: false,
            error: null,
            chartInstance: null
        });
        this.logger.info('Store reseteado');
    }
}

// =============================================================================
// SERVICIO DE COMUNICACIÓN CON API
// =============================================================================

/**
 * Servicio para comunicación con el backend Flask
 * Incluye retry automático, timeout y manejo de errores robusto
 * @class APIService
 */
class APIService {
    constructor() {
        this.logger = new Logger('APIService');
        this.baseURL = CONFIG.API.BASE_URL;
    }

    /**
     * Obtiene la lista completa de municipios
     * @returns {Promise<Object>} Respuesta con municipios y metadata
     * @throws {Error} Si la petición falla después de reintentos
     */
    async getMunicipalities() {
        const url = `${this.baseURL}${CONFIG.API.ENDPOINTS.MUNICIPALITIES}`;
        this.logger.info('Solicitando lista de municipios', { url });
        
        try {
            const response = await this._fetchWithRetry(url);
            const data = await response.json();
            
            this.logger.info(`Municipios obtenidos exitosamente: ${data.municipalities?.length || 0}`);
            return {
                municipalities: data.municipalities || [],
                metadata: data.metadata || {}
            };
        } catch (error) {
            this.logger.error('Error al obtener municipios', error);
            throw new Error(`No se pudieron cargar los municipios: ${error.message}`);
        }
    }

    /**
     * Obtiene los detalles completos de un municipio específico
     * @param {number} municipalityId - ID del municipio
     * @returns {Promise<Object>} Datos completos del municipio
     * @throws {Error} Si el municipio no existe o hay error de red
     */
    async getMunicipalityDetail(municipalityId) {
        const url = CONFIG.API.ENDPOINTS.MUNICIPALITY_DETAIL.replace('{id}', municipalityId);
        const fullUrl = `${this.baseURL}${url}`;
        
        this.logger.info('Solicitando detalles de municipio', { municipalityId, url: fullUrl });
        
        try {
            const response = await this._fetchWithRetry(fullUrl);
            
            if (response.status === 404) {
                throw new Error(`El municipio con ID ${municipalityId} no fue encontrado`);
            }
            
            const data = await response.json();
            this.logger.info('Detalles de municipio obtenidos exitosamente', { municipalityId });
            
            return data.municipio;
        } catch (error) {
            this.logger.error('Error al obtener detalles de municipio', { municipalityId, error });
            throw new Error(`No se pudieron cargar los detalles del municipio: ${error.message}`);
        }
    }

    /**
     * Verifica el estado de salud de la API
     * @returns {Promise<boolean>} True si la API está disponible
     */
    async healthCheck() {
        const url = `${this.baseURL}${CONFIG.API.ENDPOINTS.HEALTH}`;
        
        try {
            const response = await this._fetchWithTimeout(url, CONFIG.API.TIMEOUT / 2);
            const data = await response.json();
            
            this.logger.info('Health check exitoso', data);
            return data.status === 'ok';
        } catch (error) {
            this.logger.warn('Health check falló', error);
            return false;
        }
    }

    /**
     * Fetch con retry automático en caso de fallo
     * @private
     * @param {string} url - URL a consultar
     * @param {Object} [options] - Opciones de fetch
     * @returns {Promise<Response>} Respuesta de la petición
     */
    async _fetchWithRetry(url, options = {}) {
        let lastError;
        
        for (let attempt = 1; attempt <= CONFIG.API.RETRY_ATTEMPTS; attempt++) {
            try {
                this.logger.debug(`Intento ${attempt}/${CONFIG.API.RETRY_ATTEMPTS}`, { url });
                
                const response = await this._fetchWithTimeout(url, CONFIG.API.TIMEOUT, options);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                return response;
            } catch (error) {
                lastError = error;
                this.logger.warn(`Intento ${attempt} falló`, { url, error: error.message });
                
                // Si no es el último intento, esperamos antes del siguiente
                if (attempt < CONFIG.API.RETRY_ATTEMPTS) {
                    await this._delay(1000 * attempt); // Backoff exponencial
                }
            }
        }
        
        throw lastError;
    }

    /**
     * Fetch con timeout personalizado
     * @private
     * @param {string} url - URL a consultar
     * @param {number} timeout - Timeout en milisegundos
     * @param {Object} [options] - Opciones de fetch
     * @returns {Promise<Response>} Respuesta de la petición
     */
    async _fetchWithTimeout(url, timeout, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error(`Timeout después de ${timeout}ms`);
            }
            throw error;
        }
    }

    /**
     * Función de utilidad para delays
     * @private
     * @param {number} ms - Milisegundos de delay
     * @returns {Promise<void>}
     */
    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// =============================================================================
// COMPONENTE UI: PANTALLA DE CARGA
// =============================================================================

/**
 * Componente para mostrar estados de carga con animaciones premium
 * @class LoadingComponent
 */
class LoadingComponent {
    constructor() {
        this.logger = new Logger('LoadingComponent');
        this.currentMessageIndex = 0;
        this.messageInterval = null;
    }

    /**
     * Renderiza la pantalla de carga con mensaje rotativo
     * @param {HTMLElement} container - Contenedor donde renderizar
     * @param {string} [initialMessage] - Mensaje inicial personalizado
     */
    render(container, initialMessage = null) {
        const message = initialMessage || CONFIG.UI.LOADING_MESSAGES[0];
        
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center min-h-screen p-8">
                <div class="relative">
                    <!-- Logo/Spinner Principal -->
                    <div class="w-16 h-16 mb-6">
                        <svg class="w-full h-full animate-spin" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                    
                    <!-- Anillos de Carga Premium -->
                    <div class="absolute top-0 w-16 h-16 border-4 border-blue-500/20 rounded-full animate-pulse"></div>
                    <div class="absolute top-1 left-1 w-14 h-14 border-2 border-blue-400/40 rounded-full animate-ping"></div>
                </div>
                
                <!-- Mensaje de Estado -->
                <div class="text-center max-w-md">
                    <h2 class="text-2xl font-bold text-white mb-4">${CONFIG.METADATA.APP_NAME}</h2>
                    <p id="loading-message" class="text-xl text-gray-300 mb-2 transition-all duration-300">${message}</p>
                    <div class="w-full bg-gray-700 rounded-full h-2 mb-4">
                        <div class="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full animate-pulse" style="width: 45%"></div>
                    </div>
                    <p class="text-sm text-gray-400">Versión ${CONFIG.METADATA.VERSION} • ${CONFIG.METADATA.BUILD_DATE}</p>
                </div>
            </div>
        `;

        // Iniciar rotación de mensajes si no hay mensaje personalizado
        if (!initialMessage) {
            this._startMessageRotation();
        }

        this.logger.debug('Pantalla de carga renderizada', { message });
    }

    /**
     * Inicia la rotación automática de mensajes de carga
     * @private
     */
    _startMessageRotation() {
        this.messageInterval = setInterval(() => {
            this.currentMessageIndex = (this.currentMessageIndex + 1) % CONFIG.UI.LOADING_MESSAGES.length;
            const messageElement = document.getElementById('loading-message');
            
            if (messageElement) {
                // Animación de fade
                messageElement.style.opacity = '0';
                setTimeout(() => {
                    messageElement.textContent = CONFIG.UI.LOADING_MESSAGES[this.currentMessageIndex];
                    messageElement.style.opacity = '1';
                }, 150);
            }
        }, 2000);
    }

    /**
     * Limpia la rotación de mensajes
     */
    destroy() {
        if (this.messageInterval) {
            clearInterval(this.messageInterval);
            this.messageInterval = null;
        }
        this.logger.debug('LoadingComponent destruido');
    }
}

// =============================================================================
// COMPONENTE UI: MANEJO DE ERRORES
// =============================================================================

/**
 * Componente para mostrar errores de manera elegante y profesional
 * @class ErrorComponent
 */
class ErrorComponent {
    constructor() {
        this.logger = new Logger('ErrorComponent');
    }

    /**
     * Renderiza una pantalla de error con opciones de recuperación
     * @param {HTMLElement} container - Contenedor donde renderizar
     * @param {string} message - Mensaje de error
     * @param {Function} [onRetry] - Callback para reintento
     */
    render(container, message, onRetry = null) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center min-h-screen p-8">
                <div class="max-w-md text-center">
                    <!-- Icono de Error -->
                    <div class="w-20 h-20 mx-auto mb-6 text-red-500">
                        <svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                        </svg>
                    </div>
                    
                    <!-- Título y Mensaje -->
                    <h2 class="text-2xl font-bold text-white mb-4">Error del Sistema</h2>
                    <p class="text-gray-300 mb-6 leading-relaxed">${message}</p>
                    
                    <!-- Botones de Acción -->
                    <div class="space-y-3">
                        ${onRetry ? `
                        <button id="retry-btn" 
                                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:shadow-lg">
                            🔄 Reintentar Conexión
                        </button>
                        ` : ''}
                        
                        <button id="reload-btn" 
                                class="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200">
                            🔁 Recargar Página
                        </button>
                    </div>
                    
                    <!-- Información Técnica -->
                    <div class="mt-8 p-4 bg-gray-800/50 rounded-lg text-left">
                        <h4 class="text-sm font-semibold text-gray-400 mb-2">Información Técnica:</h4>
                        <ul class="text-xs text-gray-500 space-y-1">
                            <li>• Aplicación: ${CONFIG.METADATA.APP_NAME} v${CONFIG.METADATA.VERSION}</li>
                            <li>• Timestamp: ${new Date().toISOString()}</li>
                            <li>• Entorno: ${CONFIG.METADATA.ENVIRONMENT}</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;

        // Event Listeners
        const retryBtn = document.getElementById('retry-btn');
        const reloadBtn = document.getElementById('reload-btn');

        if (retryBtn && onRetry) {
            retryBtn.addEventListener('click', () => {
                this.logger.info('Usuario solicitó reintento');
                onRetry();
            });
        }

        if (reloadBtn) {
            reloadBtn.addEventListener('click', () => {
                this.logger.info('Usuario solicitó recarga de página');
                window.location.reload();
            });
        }

        this.logger.error('Pantalla de error renderizada', { message });
    }
}

// =============================================================================
// COMPONENTE UI: SELECTOR DE MUNICIPIOS
// =============================================================================

/**
 * Componente avanzado para selección de municipios con búsqueda predictiva
 * @class MunicipalitySelectorComponent
 */
class MunicipalitySelectorComponent {
    constructor(onSelect) {
        this.logger = new Logger('MunicipalitySelectorComponent');
        this.onSelect = onSelect;
        this.searchTimeout = null;
        this.municipalities = [];
        this.filteredMunicipalities = [];
    }

    /**
     * Renderiza el selector con búsqueda predictiva
     * @param {HTMLElement} container - Contenedor donde renderizar
     * @param {Array} municipalities - Lista de municipios disponibles
     */
    render(container, municipalities) {
        this.municipalities = municipalities;
        this.filteredMunicipalities = [...municipalities];

        container.innerHTML = `
            <div class="max-w-2xl mx-auto">
                <div class="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-700/50">
                    <!-- Header -->
                    <div class="text-center mb-8">
                        <h2 class="text-3xl font-bold text-white mb-2">Seleccionar Municipio</h2>
                        <p class="text-gray-400">Busque y seleccione el municipio para ver los resultados electorales</p>
                    </div>
                    
                    <!-- Buscador -->
                    <div class="relative mb-6">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                            </svg>
                        </div>
                        <input type="text" 
                               id="municipality-search" 
                               class="w-full pl-10 pr-4 py-4 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                               placeholder="Buscar municipio... (ej: Capital, Goya, Mercedes)"
                               autocomplete="off">
                        
                        <!-- Indicador de búsqueda -->
                        <div id="search-indicator" class="absolute right-3 top-4 hidden">
                            <div class="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                        </div>
                    </div>
                    
                    <!-- Resultados -->
                    <div id="municipality-results" class="space-y-2 max-h-80 overflow-y-auto">
                        <!-- Los resultados se cargarán aquí -->
                    </div>
                    
                    <!-- Estado sin resultados -->
                    <div id="no-results" class="hidden text-center py-8">
                        <div class="w-16 h-16 mx-auto mb-4 text-gray-500">
                            <svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0118 12a8 8 0 10-8 8 7.962 7.962 0 014.708-1.709L18 21l-3-3z"/>
                            </svg>
                        </div>
                        <h3 class="text-lg font-semibold text-gray-400 mb-2">Sin resultados</h3>
                        <p class="text-gray-500">No se encontraron municipios que coincidan con su búsqueda.</p>
                    </div>
                    
                    <!-- Footer con información -->
                    <div class="mt-6 pt-6 border-t border-gray-700 text-center">
                        <p class="text-sm text-gray-500">
                            Mostrando <span id="results-count">${municipalities.length}</span> municipios disponibles
                        </p>
                    </div>
                </div>
            </div>
        `;

        this._initializeEventListeners();
        this._renderResults();

        this.logger.info('Selector de municipios renderizado', { 
            totalMunicipalities: municipalities.length 
        });
    }

    /**
     * Inicializa los event listeners del componente
     * @private
     */
    _initializeEventListeners() {
        const searchInput = document.getElementById('municipality-search');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this._handleSearch(e.target.value));
            searchInput.addEventListener('keydown', (e) => this._handleKeyNavigation(e));
        }
    }

    /**
     * Maneja la búsqueda con debounce para mejor performance
     * @private
     * @param {string} query - Término de búsqueda
     */
    _handleSearch(query) {
        // Clear previous timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        // Show search indicator
        const indicator = document.getElementById('search-indicator');
        if (indicator) {
            indicator.classList.remove('hidden');
        }

        // Debounced search
        this.searchTimeout = setTimeout(() => {
            this._performSearch(query);
            if (indicator) {
                indicator.classList.add('hidden');
            }
        }, CONFIG.UI.DEBOUNCE_DELAY);
    }

    /**
     * Ejecuta la búsqueda filtrada
     * @private
     * @param {string} query - Término de búsqueda
     */
    _performSearch(query) {
        const normalizedQuery = query.toLowerCase().trim();
        
        if (!normalizedQuery) {
            this.filteredMunicipalities = [...this.municipalities];
        } else {
            this.filteredMunicipalities = this.municipalities.filter(municipality =>
                municipality.nombre.toLowerCase().includes(normalizedQuery)
            );
        }

        this._renderResults();
        this._updateResultsCount();

        this.logger.debug('Búsqueda ejecutada', { 
            query: normalizedQuery, 
            results: this.filteredMunicipalities.length 
        });
    }

    /**
     * Renderiza la lista de resultados filtrados
     * @private
     */
    _renderResults() {
        const resultsContainer = document.getElementById('municipality-results');
        const noResultsElement = document.getElementById('no-results');
        
        if (!resultsContainer) return;

        if (this.filteredMunicipalities.length === 0) {
            resultsContainer.innerHTML = '';
            if (noResultsElement) {
                noResultsElement.classList.remove('hidden');
            }
            return;
        }

        if (noResultsElement) {
            noResultsElement.classList.add('hidden');
        }

        resultsContainer.innerHTML = this.filteredMunicipalities.map((municipality, index) => `
            <div class="municipality-item p-4 bg-gray-700/30 hover:bg-gray-600/50 rounded-lg cursor-pointer transition-all duration-200 border border-transparent hover:border-blue-500/50 group"
                 data-municipality-id="${municipality.id}"
                 tabindex="0"
                 role="button"
                 aria-label="Seleccionar ${municipality.nombre}">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center group-hover:bg-blue-600/30 transition-colors">
                            <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold text-white group-hover:text-blue-200 transition-colors">
                                ${municipality.nombre}
                            </h3>
                            <p class="text-sm text-gray-400">ID: ${municipality.id}</p>
                        </div>
                    </div>
                    <div class="text-gray-400 group-hover:text-blue-400 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                    </div>
                </div>
            </div>
        `).join('');

        // Add click event listeners
        resultsContainer.querySelectorAll('.municipality-item').forEach(item => {
            item.addEventListener('click', () => this._handleMunicipalitySelect(item));
            item.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this._handleMunicipalitySelect(item);
                }
            });
        });
    }

    /**
     * Maneja la selección de un municipio
     * @private
     * @param {HTMLElement} item - Elemento del municipio seleccionado
     */
    _handleMunicipalitySelect(item) {
        const municipalityId = parseInt(item.dataset.municipalityId);
        const municipality = this.filteredMunicipalities.find(m => m.id === municipalityId);
        
        if (municipality) {
            this.logger.info('Municipio seleccionado', { municipality });
            this.onSelect(municipality);
        }
    }

    /**
     * Maneja la navegación por teclado
     * @private
     * @param {KeyboardEvent} e - Evento de teclado
     */
    _handleKeyNavigation(e) {
        const items = document.querySelectorAll('.municipality-item');
        const currentFocus = document.activeElement;
        const currentIndex = Array.from(items).indexOf(currentFocus);

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                const nextIndex = Math.min(currentIndex + 1, items.length - 1);
                if (items[nextIndex]) items[nextIndex].focus();
                break;
            case 'ArrowUp':
                e.preventDefault();
                const prevIndex = Math.max(currentIndex - 1, 0);
                if (items[prevIndex]) items[prevIndex].focus();
                break;
            case 'Escape':
                e.target.blur();
                break;
        }
    }

    /**
     * Actualiza el contador de resultados
     * @private
     */
    _updateResultsCount() {
        const countElement = document.getElementById('results-count');
        if (countElement) {
            countElement.textContent = this.filteredMunicipalities.length;
        }
    }
}

// =============================================================================
// COMPONENTE UI: DASHBOARD DE RESULTADOS
// =============================================================================

/**
 * Componente principal para mostrar resultados electorales con gráficos
 * @class ResultsDashboardComponent
 */
class ResultsDashboardComponent {
    constructor(store, onBack) {
        this.logger = new Logger('ResultsDashboardComponent');
        this.store = store;
        this.onBack = onBack;
        this.chartInstance = null;
    }

    /**
     * Renderiza el dashboard completo de resultados
     * @param {HTMLElement} container - Contenedor donde renderizar
     * @param {Object} municipalityData - Datos completos del municipio
     */
    render(container, municipalityData) {
        const processedData = this._processElectoralData(municipalityData);
        
        container.innerHTML = `
            <div class="min-h-screen">
                <!-- Header con navegación -->
                <header class="mb-8">
                    <button id="back-btn" 
                            class="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6 transition-colors duration-200 group">
                        <svg class="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" 
                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                        </svg>
                        <span class="font-medium">Volver a la selección</span>
                    </button>
                    
                    <div class="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 class="text-4xl font-bold text-white mb-2">${municipalityData.nombre}</h1>
                            <p class="text-lg text-gray-400">Resultados Electorales • ${new Date().getFullYear()}</p>
                        </div>
                        <div class="flex items-center space-x-4">
                            <div class="text-right">
                                <p class="text-sm text-gray-400">Última actualización</p>
                                <p class="text-white font-medium">${new Date().toLocaleDateString('es-AR')}</p>
                            </div>
                        </div>
                    </div>
                </header>

                <!-- Grid principal de resultados -->
                <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    
                    <!-- Gráfico principal (2 columnas en desktop) -->
                    <div class="xl:col-span-2">
                        <div class="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50">
                            <div class="flex items-center justify-between mb-6">
                                <h2 class="text-2xl font-semibold text-white">Distribución de Votos</h2>
                                <div class="flex items-center space-x-2">
                                    <button id="chart-type-bar" class="chart-type-btn active px-3 py-1 rounded-md text-sm font-medium transition-colors">Barras</button>
                                    <button id="chart-type-doughnut" class="chart-type-btn px-3 py-1 rounded-md text-sm font-medium transition-colors">Circular</button>
                                </div>
                            </div>
                            <div class="relative">
                                <canvas id="results-chart" class="w-full" style="height: 400px;"></canvas>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Columna lateral con estadísticas -->
                    <div class="space-y-6">
                        
                        <!-- Total de votos -->
                        <div class="bg-gradient-to-br from-blue-600/20 to-purple-600/20 p-6 rounded-2xl border border-blue-500/30">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h3 class="text-lg font-medium text-blue-200 mb-1">Total Escrutado</h3>
                                    <p class="text-3xl font-bold text-white">${processedData.totalVotes.toLocaleString('es-AR')}</p>
                                </div>
                                <div class="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                    <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Alianza ganadora -->
                        ${processedData.winner ? `
                        <div class="bg-gradient-to-br from-green-600/20 to-emerald-600/20 p-6 rounded-2xl border border-green-500/30">
                            <div class="flex items-start justify-between">
                                <div class="flex-1">
                                    <h3 class="text-lg font-medium text-green-200 mb-2">Alianza Ganadora</h3>
                                    <p class="text-xl font-bold text-white mb-2">${processedData.winner.name}</p>
                                    <div class="flex items-center space-x-4">
                                        <span class="text-2xl font-bold text-green-300">${processedData.winner.votes.toLocaleString('es-AR')}</span>
                                        <span class="text-lg text-green-200">${processedData.winner.percentage.toFixed(1)}%</span>
                                    </div>
                                </div>
                                <div class="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center ml-4">
                                    <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        ` : ''}
                        
                        <!-- Lista de todas las alianzas -->
                        <div class="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50">
                            <h3 class="text-lg font-semibold text-white mb-4">Ranking Completo</h3>
                            <div class="space-y-3">
                                ${processedData.sortedResults.map((alliance, index) => `
                                    <div class="flex items-center justify-between p-3 rounded-lg ${index === 0 ? 'bg-green-600/10 border border-green-500/20' : 'bg-gray-700/30'}">
                                        <div class="flex items-center space-x-3">
                                            <div class="w-8 h-8 rounded-full ${index === 0 ? 'bg-green-500/20 text-green-400' : index === 1 ? 'bg-yellow-500/20 text-yellow-400' : index === 2 ? 'bg-orange-500/20 text-orange-400' : 'bg-gray-600/20 text-gray-400'} flex items-center justify-center text-sm font-bold">
                                                ${index + 1}
                                            </div>
                                            <div>
                                                <p class="text-white font-medium text-sm">${alliance.name}</p>
                                                <p class="text-gray-400 text-xs">${alliance.votes.toLocaleString('es-AR')} votos</p>
                                            </div>
                                        </div>
                                        <div class="text-right">
                                            <p class="text-white font-semibold">${alliance.percentage.toFixed(1)}%</p>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Información adicional -->
                <div class="mt-8 pt-6 border-t border-gray-700">
                    <div class="flex items-center justify-between text-sm text-gray-500">
                        <p>Datos actualizados automáticamente desde GT Intelligence API</p>
                        <p>Desarrollado por Nordia Technologies • v${CONFIG.METADATA.VERSION}</p>
                    </div>
                </div>
            </div>
        `;

        this._initializeChart(processedData);
        this._initializeEventListeners();

        this.logger.info('Dashboard de resultados renderizado', { 
            municipality: municipalityData.nombre,
            totalAlliances: processedData.sortedResults.length,
            totalVotes: processedData.totalVotes
        });
    }

    /**
     * Procesa los datos electorales para visualización
     * @private
     * @param {Object} municipalityData - Datos del municipio
     * @returns {Object} Datos procesados para gráficos y estadísticas
     */
    _processElectoralData(municipalityData) {
        const results = [];
        let totalVotes = 0;

        // Procesar cada alianza
        municipalityData.alianzas.forEach(alliance => {
            let votes = 0;
            
            // Obtener votos del intendente (dato principal)
            if (alliance.candidatos?.intendente?.votos && 
                typeof alliance.candidatos.intendente.votos === 'number') {
                votes = alliance.candidatos.intendente.votos;
            }

            results.push({
                name: alliance.nombre,
                votes: votes,
                originalData: alliance
            });
            
            totalVotes += votes;
        });

        // Ordenar por votos (descendente)
        const sortedResults = results
            .sort((a, b) => b.votes - a.votes)
            .map(result => ({
                ...result,
                percentage: totalVotes > 0 ? (result.votes / totalVotes) * 100 : 0
            }));

        const winner = sortedResults.length > 0 && sortedResults[0].votes > 0 ? sortedResults[0] : null;

        return {
            sortedResults,
            totalVotes,
            winner
        };
    }

    /**
     * Inicializa el gráfico de Chart.js
     * @private
     * @param {Object} processedData - Datos procesados para el gráfico
     */
    _initializeChart(processedData) {
        const ctx = document.getElementById('results-chart');
        if (!ctx) {
            this.logger.error('No se encontró el canvas para el gráfico');
            return;
        }

        // Destruir gráfico existente si hay uno
        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        const chartData = {
            labels: processedData.sortedResults.map(result => result.name),
            datasets: [{
                label: 'Votos',
                data: processedData.sortedResults.map(result => result.votes),
                backgroundColor: CONFIG.UI.CHART_COLORS.slice(0, processedData.sortedResults.length),
                borderColor: CONFIG.UI.CHART_COLORS.slice(0, processedData.sortedResults.length),
                borderWidth: 1
            }]
        };

        this.chartInstance = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y', // Barras horizontales
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#374151',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                const percentage = processedData.totalVotes > 0 
                                    ? ((context.raw / processedData.totalVotes) * 100).toFixed(1)
                                    : '0.0';
                                return `${context.raw.toLocaleString('es-AR')} votos (${percentage}%)`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(75, 85, 99, 0.2)'
                        },
                        ticks: {
                            color: '#9CA3AF',
                            callback: function(value) {
                                return value.toLocaleString('es-AR');
                            }
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#ffffff',
                            font: {
                                weight: 'bold'
                            }
                        }
                    }
                }
            }
        });

        // Guardar instancia en el store para cleanup
        this.store.setState({ chartInstance: this.chartInstance });
    }

    /**
     * Cambia el tipo de gráfico
     * @private
     * @param {string} chartType - Tipo de gráfico ('bar' o 'doughnut')
     */
    _changeChartType(chartType) {
        if (!this.chartInstance) return;

        const currentData = this.chartInstance.data;
        
        this.chartInstance.destroy();

        const ctx = document.getElementById('results-chart');
        
        const options = chartType === 'doughnut' ? {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'right',
                    labels: {
                        color: '#ffffff',
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#374151',
                    borderWidth: 1
                }
            }
        } : this.chartInstance.options;

        this.chartInstance = new Chart(ctx, {
            type: chartType,
            data: currentData,
            options: options
        });

        this.logger.debug('Tipo de gráfico cambiado', { chartType });
    }

    /**
     * Inicializa los event listeners del dashboard
     * @private
     */
    _initializeEventListeners() {
        const backBtn = document.getElementById('back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.logger.info('Usuario volvió a la selección de municipios');
                this.onBack();
            });
        }

        // Botones de tipo de gráfico
        const barBtn = document.getElementById('chart-type-bar');
        const doughnutBtn = document.getElementById('chart-type-doughnut');

        if (barBtn) {
            barBtn.addEventListener('click', () => {
                this._changeChartType('bar');
                this._updateChartTypeButtons('bar');
            });
        }

        if (doughnutBtn) {
            doughnutBtn.addEventListener('click', () => {
                this._changeChartType('doughnut');
                this._updateChartTypeButtons('doughnut');
            });
        }
    }

    /**
     * Actualiza el estado visual de los botones de tipo de gráfico
     * @private
     * @param {string} activeType - Tipo de gráfico activo
     */
    _updateChartTypeButtons(activeType) {
        const buttons = document.querySelectorAll('.chart-type-btn');
        buttons.forEach(btn => {
            btn.classList.remove('active', 'bg-blue-600', 'text-white');
            btn.classList.add('text-gray-400', 'hover:text-white', 'hover:bg-gray-700');
        });

        const activeBtn = document.getElementById(`chart-type-${activeType}`);
        if (activeBtn) {
            activeBtn.classList.remove('text-gray-400', 'hover:text-white', 'hover:bg-gray-700');
            activeBtn.classList.add('active', 'bg-blue-600', 'text-white');
        }
    }

    /**
     * Destruye el componente y limpia recursos
     */
    destroy() {
        if (this.chartInstance) {
            this.chartInstance.destroy();
            this.chartInstance = null;
        }
        this.logger.debug('ResultsDashboardComponent destruido');
    }
}

// =============================================================================
// APLICACIÓN PRINCIPAL
// =============================================================================

/**
 * Aplicación principal GT Intelligence
 * Coordina todos los componentes y maneja el flujo de la aplicación
 * @class GTIntelligenceApp
 */
class GTIntelligenceApp {
    constructor() {
        this.logger = new Logger('GTIntelligenceApp');
        this.store = new AppStore();
        this.apiService = new APIService();
        this.loadingComponent = new LoadingComponent();
        this.errorComponent = new ErrorComponent();
        this.selectorComponent = null;
        this.dashboardComponent = null;
        this.appContainer = null;
        
        this.currentView = 'loading'; // loading, selector, dashboard, error
    }

    /**
     * Inicializa la aplicación
     * @param {string} containerId - ID del contenedor principal
     */
    async init(containerId = 'app') {
        this.appContainer = document.getElementById(containerId);
        
        if (!this.appContainer) {
            throw new Error(`Contenedor '${containerId}' no encontrado en el DOM`);
        }

        this.logger.info('Iniciando GT Intelligence Application', {
            version: CONFIG.METADATA.VERSION,
            environment: CONFIG.METADATA.ENVIRONMENT,
            buildDate: CONFIG.METADATA.BUILD_DATE
        });

        // Verificar dependencias
        await this._checkDependencies();

        // Cargar datos iniciales
        await this._loadInitialData();
    }

    /**
     * Verifica que todas las dependencias estén disponibles
     * @private
     */
    async _checkDependencies() {
        this.loadingComponent.render(this.appContainer, 'Verificando dependencias del sistema...');

        // Verificar Chart.js
        if (typeof Chart === 'undefined') {
            throw new Error('Chart.js no está cargado. Verifique que el script esté incluido.');
        }

        // Health check de la API
        const isAPIHealthy = await this.apiService.healthCheck();
        if (!isAPIHealthy) {
            this.logger.warn('API health check falló, pero continuando con la carga');
        }

        this.logger.info('Dependencias verificadas correctamente');
    }

    /**
     * Carga los datos iniciales de municipios
     * @private
     */
    async _loadInitialData() {
        try {
            this.loadingComponent.render(this.appContainer, 'Cargando municipios disponibles...');
            
            const data = await this.apiService.getMunicipalities();
            
            this.store.setState({
                municipalities: data.municipalities,
                metadata: data.metadata,
                loading: false,
                error: null
            });

            this._showMunicipalitySelector();

        } catch (error) {
            this.logger.error('Error al cargar datos iniciales', error);
            this._showError(error.message, () => this._loadInitialData());
        }
    }

    /**
     * Muestra el selector de municipios
     * @private
     */
    _showMunicipalitySelector() {
        this.currentView = 'selector';
        const { municipalities } = this.store.getState();

        if (municipalities.length === 0) {
            this._showError('No hay municipios disponibles en el sistema');
            return;
        }

        // Crear componente selector
        this.selectorComponent = new MunicipalitySelectorComponent(
            (municipality) => this._loadMunicipalityDetails(municipality)
        );

        // Renderizar pantalla de selección
        this.appContainer.innerHTML = `
            <div class="min-h-screen py-8">
                <!-- Header -->
                <header class="text-center mb-12">
                    <div class="mb-6">
                        <h1 class="text-5xl font-black text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            ${CONFIG.METADATA.APP_NAME}
                        </h1>
                        <p class="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                            Plataforma de inteligencia electoral para la visualización y análisis de datos electorales en tiempo real
                        </p>
                    </div>
                    <div class="flex justify-center items-center space-x-6 text-sm text-gray-500">
                        <span>• Versión ${CONFIG.METADATA.VERSION}</span>
                        <span>• ${municipalities.length} municipios disponibles</span>
                        <span>• Última actualización: ${new Date().toLocaleDateString('es-AR')}</span>
                    </div>
                </header>

                <!-- Selector Container -->
                <main id="selector-container">
                    <!-- El componente selector se renderizará aquí -->
                </main>

                <!-- Footer -->
                <footer class="mt-16 text-center">
                    <div class="max-w-4xl mx-auto px-4">
                        <div class="border-t border-gray-800 pt-8">
                            <p class="text-gray-500 text-sm">
                                Desarrollado por <span class="text-blue-400 font-semibold">Nordia Technologies</span> 
                                • Datos provistos por GT Intelligence API
                            </p>
                            <div class="mt-4 flex justify-center items-center space-x-4 text-xs text-gray-600">
                                <span>Build: ${CONFIG.METADATA.BUILD_DATE}</span>
                                <span>•</span>
                                <span>Entorno: ${CONFIG.METADATA.ENVIRONMENT}</span>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        `;

        const selectorContainer = document.getElementById('selector-container');
        this.selectorComponent.render(selectorContainer, municipalities);

        this.logger.info('Selector de municipios mostrado', { totalMunicipalities: municipalities.length });
    }

    /**
     * Carga y muestra los detalles de un municipio
     * @private
     * @param {Object} municipality - Municipio seleccionado
     */
    async _loadMunicipalityDetails(municipality) {
        try {
            this.currentView = 'loading';
            this.loadingComponent.render(
                this.appContainer, 
                `Cargando resultados de ${municipality.nombre}...`
            );

            const municipalityData = await this.apiService.getMunicipalityDetail(municipality.id);
            
            this.store.setState({
                currentMunicipality: municipalityData,
                loading: false,
                error: null
            });

            this._showResultsDashboard(municipalityData);

        } catch (error) {
            this.logger.error('Error al cargar detalles del municipio', { municipality, error });
            this._showError(
                `No se pudieron cargar los detalles de ${municipality.nombre}: ${error.message}`,
                () => this._showMunicipalitySelector()
            );
        }
    }

    /**
     * Muestra el dashboard de resultados
     * @private
     * @param {Object} municipalityData - Datos completos del municipio
     */
    _showResultsDashboard(municipalityData) {
        this.currentView = 'dashboard';

        // Limpiar componente anterior si existe
        if (this.dashboardComponent) {
            this.dashboardComponent.destroy();
        }

        // Crear nuevo componente dashboard
        this.dashboardComponent = new ResultsDashboardComponent(
            this.store,
            () => this._showMunicipalitySelector()
        );

        this.dashboardComponent.render(this.appContainer, municipalityData);

        this.logger.info('Dashboard de resultados mostrado', { 
            municipality: municipalityData.nombre,
            alliances: municipalityData.alianzas?.length || 0
        });
    }

    /**
     * Muestra una pantalla de error con opción de reintento
     * @private
     * @param {string} message - Mensaje de error
     * @param {Function} [onRetry] - Función de reintento opcional
     */
    _showError(message, onRetry = null) {
        this.currentView = 'error';
        
        this.store.setState({
            loading: false,
            error: message
        });

        this.errorComponent.render(this.appContainer, message, onRetry);
        
        this.logger.error('Pantalla de error mostrada', { message });
    }

    /**
     * Maneja errores globales de la aplicación
     * @private
     * @param {Error} error - Error capturado
     */
    _handleGlobalError(error) {
        this.logger.error('Error global capturado', error);
        
        const userMessage = error.message || 'Ha ocurrido un error inesperado en el sistema';
        this._showError(userMessage, () => this.init());
    }

    /**
     * Limpia todos los recursos de la aplicación
     */
    destroy() {
        this.logger.info('Destruyendo aplicación GT Intelligence');

        // Limpiar componentes
        if (this.loadingComponent) {
            this.loadingComponent.destroy();
        }

        if (this.dashboardComponent) {
            this.dashboardComponent.destroy();
        }

        // Limpiar gráfico del store
        const { chartInstance } = this.store.getState();
        if (chartInstance) {
            chartInstance.destroy();
        }

        // Reset del store
        this.store.reset();

        this.logger.info('Aplicación destruida correctamente');
    }
}

// =============================================================================
// INICIALIZACIÓN Y MANEJO GLOBAL DE ERRORES
// =============================================================================

/**
 * Función principal de inicialización
 * Se ejecuta cuando el DOM está completamente cargado
 */
document.addEventListener('DOMContentLoaded', async () => {
    const logger = new Logger('Main');
    
    try {
        logger.info('🚀 Iniciando GT Intelligence Centro de Control', {
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            url: window.location.href
        });

        // Verificar dependencias críticas del DOM
        const appContainer = document.getElementById('app');
        if (!appContainer) {
            throw new Error('Elemento #app no encontrado en el DOM');
        }

        // Verificar que Chart.js esté disponible
        if (typeof Chart === 'undefined') {
            throw new Error('Chart.js no está disponible. Verifique que el script esté cargado.');
        }

        // Crear e inicializar la aplicación
        window.gtApp = new GTIntelligenceApp();
        await window.gtApp.init('app');

        logger.info('✅ GT Intelligence inicializado correctamente');

    } catch (error) {
        logger.error('❌ Error fatal durante la inicialización', error);
        
        // Mostrar error de inicialización en el DOM
        const appContainer = document.getElementById('app');
        if (appContainer) {
            appContainer.innerHTML = `
                <div class="flex flex-col items-center justify-center min-h-screen p-8 text-center">
                    <div class="max-w-md">
                        <div class="w-20 h-20 mx-auto mb-6 text-red-500">
                            <svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                            </svg>
                        </div>
                        <h1 class="text-2xl font-bold text-white mb-4">Error de Inicialización</h1>
                        <p class="text-gray-300 mb-6">${error.message}</p>
                        <button onclick="window.location.reload()" 
                                class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                            🔄 Recargar Página
                        </button>
                        <div class="mt-6 p-4 bg-gray-800/50 rounded-lg text-left">
                            <h4 class="text-sm font-semibold text-gray-400 mb-2">Información Técnica:</h4>
                            <ul class="text-xs text-gray-500 space-y-1">
                                <li>• Error: ${error.name || 'Error'}</li>
                                <li>• Timestamp: ${new Date().toISOString()}</li>
                                <li>• User Agent: ${navigator.userAgent.substring(0, 50)}...</li>
                            </ul>
                        </div>
                    </div>
                </div>
            `;
        }
    }
});

/**
 * Manejo global de errores no capturados
 */
window.addEventListener('error', (event) => {
    const logger = new Logger('GlobalErrorHandler');
    logger.error('Error global no capturado', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    });
});

/**
 * Manejo global de promesas rechazadas
 */
window.addEventListener('unhandledrejection', (event) => {
    const logger = new Logger('GlobalErrorHandler');
    logger.error('Promesa rechazada no manejada', {
        reason: event.reason,
        promise: event.promise
    });
});

/**
 * Limpieza al cerrar/recargar la página
 */
window.addEventListener('beforeunload', () => {
    const logger = new Logger('Main');
    logger.info('Página cerrándose, limpiando recursos...');
    
    if (window.gtApp) {
        window.gtApp.destroy();
    }
});

// =============================================================================
// UTILIDADES GLOBALES PARA DEBUGGING (SOLO EN DESARROLLO)
// =============================================================================

if (CONFIG.METADATA.ENVIRONMENT !== 'production') {
    /**
     * Utilidades de debugging disponibles en la consola del navegador
     */
    window.gtDebug = {
        /**
         * Obtiene el estado actual de la aplicación
         */
        getState() {
            return window.gtApp ? window.gtApp.store.getState() : null;
        },
        
        /**
         * Obtiene la configuración actual
         */
        getConfig() {
            return CONFIG;
        },
        
        /**
         * Fuerza un cambio de vista
         */
        forceView(view) {
            if (window.gtApp) {
                switch(view) {
                    case 'selector':
                        window.gtApp._showMunicipalitySelector();
                        break;
                    case 'loading':
                        window.gtApp.loadingComponent.render(window.gtApp.appContainer);
                        break;
                    default:
                        console.warn('Vista no reconocida:', view);
                }
            }
        },
        
        /**
         * Simula un error para testing
         */
        simulateError(message = 'Error de prueba') {
            if (window.gtApp) {
                window.gtApp._showError(message);
            }
        },
        
        /**
         * Reinicia la aplicación
         */
        restart() {
            if (window.gtApp) {
                window.gtApp.destroy();
                window.gtApp.init('app');
            }
        }
    };
    
    console.log('🛠️ GT Intelligence Debug Utils disponibles en window.gtDebug');
    console.log('Comandos disponibles: getState(), getConfig(), forceView(), simulateError(), restart()');
}