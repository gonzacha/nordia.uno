/**
 * GT Intelligence - Configuración Centralizada
 * Versión: 2.0.0 (Modular) - Optimizada para Producción
 * Fecha: 2025-08-11
 */

export const CONFIG = {
    // Configuración de API - DETECCIÓN AUTOMÁTICA DE ENTORNO
    API: {
        // BASE_URL dinámico: detecta automáticamente el entorno
        BASE_URL: (() => {
            if (typeof window === 'undefined') return 'http://127.0.0.1:5001';
            
            // Detectar entorno de producción
            if (window.location.hostname === 'gt.nordia.uno') {
                return 'https://gt.nordia.uno';
            }
            
            // Permitir override manual vía window.__API_BASE_URL__
            if (window.__API_BASE_URL__) {
                return window.__API_BASE_URL__;
            }
            
            // Default para desarrollo local
            return window.location.origin.includes(':5001') 
                ? window.location.origin 
                : 'http://127.0.0.1:5001';
        })(),
        
        ENDPOINTS: {
            MUNICIPALITIES: '/api/municipios',
            MUNICIPALITY_DETAIL: '/api/municipios/{id}',
            HEALTH: '/api/health'
        },
        TIMEOUT: 10000,
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1000
    },

    // Configuración de UI
    UI: {
        ANIMATION_DURATION: 300,
        DEBOUNCE_DELAY: 300,
        CHART_COLORS: [
            '#3B82F6', // blue-500
            '#EF4444', // red-500
            '#10B981', // emerald-500
            '#F59E0B', // amber-500
            '#8B5CF6', // violet-500
            '#06B6D4', // cyan-500
            '#EC4899', // pink-500
            '#84CC16', // lime-500
            '#F97316', // orange-500
            '#6366F1'  // indigo-500
        ],
        LOADING_MESSAGES: [
            'Conectando con GT Intelligence...',
            'Cargando datos electorales...',
            'Procesando resultados...',
            'Optimizando visualización...',
            'Preparando dashboard...',
            'Sincronizando con servidor...'
        ],
        SEARCH_MIN_LENGTH: 1,
        RESULTS_MAX_HEIGHT: '60vh',
        CHART_HEIGHT: 400
    },

    // Configuración de Chart.js
    CHART: {
        DEFAULT_OPTIONS: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    titleColor: '#F9FAFB',
                    bodyColor: '#F9FAFB',
                    borderColor: '#374151',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(75, 85, 99, 0.3)'
                    },
                    ticks: {
                        color: '#9CA3AF'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(75, 85, 99, 0.3)'
                    },
                    ticks: {
                        color: '#9CA3AF'
                    }
                }
            }
        }
    },

    // Metadatos de la aplicación
    METADATA: {
        APP_NAME: 'GT Intelligence',
        VERSION: '2.0.0',
        BUILD_DATE: '2025-08-11',
        ENVIRONMENT: typeof window !== 'undefined' && window.location.hostname === 'gt.nordia.uno' ? 'production' : 'development',
        AUTHOR: 'GT Team',
        DESCRIPTION: 'Centro de Control Electoral - Provincia de Corrientes'
    },

    // Configuración de logs - Menos verbose en producción
    LOGGING: {
        ENABLED: true,
        LEVEL: typeof window !== 'undefined' && window.location.hostname === 'gt.nordia.uno' ? 'ERROR' : 'INFO',
        MAX_ENTRIES: 100,
        TIMESTAMP_FORMAT: 'ISO'
    },

    // Configuración de errores
    ERRORS: {
        RETRY_CODES: [500, 502, 503, 504],
        TIMEOUT_MESSAGE: 'Tiempo de espera agotado. Intenta nuevamente.',
        NETWORK_MESSAGE: 'Error de conexión con el servidor.',
        DEFAULT_MESSAGE: 'Ha ocurrido un error inesperado.',
        NOT_FOUND_MESSAGE: 'No se encontraron datos para el municipio seleccionado.'
    },

    // URLs de ayuda y documentación
    SUPPORT: {
        DOCS_URL: 'https://docs.gt-intelligence.com',
        CONTACT_EMAIL: 'support@gt-intelligence.com',
        VERSION_CHECK_URL: 'https://api.gt-intelligence.com/version'
    }
};

// Log de configuración cargada (solo en desarrollo)
if (CONFIG.METADATA.ENVIRONMENT === 'development') {
    console.log(`🎯 GT Intelligence Config loaded for: ${CONFIG.METADATA.ENVIRONMENT}`);
    console.log(`📡 API URL: ${CONFIG.API.BASE_URL}`);
}