/**
 * GT Intelligence - Sistema de Logging Profesional
 * Versión: 2.0.0 (Modular)
 * Fecha: 2025-08-10
 */

import { CONFIG } from './config.js';

// Niveles de logging con estilos para consola del navegador
const LOG_LEVELS = {
    DEBUG: { level: 0, color: '#9CA3AF', bgColor: '#374151', prefix: '🔍' },
    INFO:  { level: 1, color: '#3B82F6', bgColor: '#1E3A8A', prefix: 'ℹ️' },
    WARN:  { level: 2, color: '#F59E0B', bgColor: '#92400E', prefix: '⚠️' },
    ERROR: { level: 3, color: '#EF4444', bgColor: '#991B1B', prefix: '❌' }
};

// Obtener nivel numérico desde configuración
const getCurrentLogLevel = () => {
    return LOG_LEVELS[CONFIG.LOGGING.LEVEL]?.level ?? 1;
};

class Logger {
    constructor() {
        this.entries = [];
        this.maxEntries = CONFIG.LOGGING.MAX_ENTRIES;
        this.enabled = CONFIG.LOGGING.ENABLED;
        this.logContainer = null;
        
        // Inicializar contenedor de logs si existe
        this.initLogContainer();
    }

    /**
     * Inicializa el contenedor de logs en el DOM si existe
     */
    initLogContainer() {
        // Intentar encontrar contenedor de logs existente
        this.logContainer = document.getElementById('logContainer');
        
        if (!this.logContainer) {
            // Si no existe, intentar crearlo automáticamente
            this.createLogContainer();
        }
    }

    /**
     * Crea automáticamente un contenedor de logs en el DOM
     */
    createLogContainer() {
        const existingContainer = document.querySelector('.log-section');
        if (existingContainer) {
            this.logContainer = existingContainer.querySelector('#logContainer') || 
                               existingContainer.querySelector('[id*="log"]');
        }
    }

    /**
     * Formatea el timestamp según configuración
     */
    formatTimestamp() {
        const now = new Date();
        if (CONFIG.LOGGING.TIMESTAMP_FORMAT === 'ISO') {
            return now.toISOString().slice(0, 19).replace('T', ' ');
        }
        return now.toLocaleString('es-AR');
    }

    /**
     * Determina el componente desde donde se hace el log
     */
    detectComponent() {
        const stack = new Error().stack;
        if (!stack) return 'unknown';
        
        const lines = stack.split('\n');
        for (let line of lines) {
            if (line.includes('.js:') && !line.includes('logger.js')) {
                const match = line.match(/([^/\\]+)\.js/);
                if (match) return match[1];
            }
        }
        return 'app';
    }

    /**
     * Crea una entrada de log estructurada
     */
    createLogEntry(level, message, component = null, data = null) {
        const timestamp = this.formatTimestamp();
        const detectedComponent = component || this.detectComponent();
        
        const entry = {
            timestamp,
            level,
            component: detectedComponent,
            message,
            data,
            id: Date.now() + Math.random()
        };

        return entry;
    }

    /**
     * Añade entrada al historial con límite de tamaño
     */
    addToHistory(entry) {
        this.entries.push(entry);
        
        // Mantener solo las últimas N entradas
        if (this.entries.length > this.maxEntries) {
            this.entries = this.entries.slice(-this.maxEntries);
        }
    }

    /**
     * Renderiza logs en el DOM si el contenedor existe
     */
    renderToDOM(entry) {
        if (!this.logContainer) return;

        const logElement = document.createElement('div');
        logElement.className = 'log-entry';
        logElement.style.cssText = `
            font-family: 'Courier New', monospace;
            font-size: 0.85rem;
            padding: 2px 0;
            color: ${LOG_LEVELS[entry.level].color};
            border-left: 2px solid ${LOG_LEVELS[entry.level].color};
            padding-left: 8px;
            margin-bottom: 1px;
        `;

        // Formato JSON estructurado como en el original
        const logData = {
            time: entry.timestamp,
            level: entry.level,
            name: `gt_${entry.component}`,
            message: entry.message
        };

        if (entry.data) {
            logData.data = entry.data;
        }

        logElement.textContent = JSON.stringify(logData);
        
        this.logContainer.appendChild(logElement);
        
        // Auto-scroll al final
        this.logContainer.scrollTop = this.logContainer.scrollHeight;
        
        // Limpiar entradas viejas del DOM
        const maxDOMEntries = 50;
        while (this.logContainer.children.length > maxDOMEntries) {
            this.logContainer.removeChild(this.logContainer.firstChild);
        }
    }

    /**
     * Método principal de logging
     */
    log(level, message, component = null, data = null) {
        if (!this.enabled) return;
        
        const levelConfig = LOG_LEVELS[level];
        if (!levelConfig || levelConfig.level < getCurrentLogLevel()) {
            return;
        }

        const entry = this.createLogEntry(level, message, component, data);
        
        // Añadir al historial
        this.addToHistory(entry);
        
        // Log a consola del navegador con estilo
        const consoleMethod = level === 'ERROR' ? 'error' : 
                             level === 'WARN' ? 'warn' : 'log';
        
        console[consoleMethod](
            `%c${levelConfig.prefix} ${entry.timestamp} [${entry.component}]%c ${message}`,
            `color: ${levelConfig.color}; font-weight: bold;`,
            'color: inherit;',
            data || ''
        );
        
        // Renderizar en DOM si existe contenedor
        this.renderToDOM(entry);
    }

    // Métodos de conveniencia
    debug(message, component = null, data = null) {
        this.log('DEBUG', message, component, data);
    }

    info(message, component = null, data = null) {
        this.log('INFO', message, component, data);
    }

    warn(message, component = null, data = null) {
        this.log('WARN', message, component, data);
    }

    error(message, component = null, data = null) {
        this.log('ERROR', message, component, data);
    }

    /**
     * Logs específicos para diferentes operaciones
     */
    apiCall(method, url, status = null) {
        const message = status ? 
            `${method} ${url} → ${status}` : 
            `${method} ${url}`;
        this.info(message, 'api');
    }

    apiError(method, url, error) {
        this.error(`${method} ${url} failed: ${error.message}`, 'api', error);
    }

    componentMount(componentName) {
        this.debug(`Component mounted: ${componentName}`, componentName);
    }

    componentUnmount(componentName) {
        this.debug(`Component unmounted: ${componentName}`, componentName);
    }

    userAction(action, details = null) {
        this.info(`User action: ${action}`, 'user', details);
    }

    /**
     * Métodos de utilidad
     */
    clear() {
        this.entries = [];
        if (this.logContainer) {
            this.logContainer.innerHTML = '';
        }
        this.info('Log history cleared', 'logger');
    }

    getHistory(level = null) {
        if (!level) return [...this.entries];
        return this.entries.filter(entry => entry.level === level);
    }

    exportLogs() {
        const logsData = {
            exported_at: this.formatTimestamp(),
            app_version: CONFIG.METADATA.VERSION,
            total_entries: this.entries.length,
            logs: this.entries
        };
        
        return JSON.stringify(logsData, null, 2);
    }

    /**
     * Configuración dinámica
     */
    setLevel(level) {
        if (LOG_LEVELS[level]) {
            CONFIG.LOGGING.LEVEL = level;
            this.info(`Log level changed to: ${level}`, 'logger');
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        this.info(`Logging ${this.enabled ? 'enabled' : 'disabled'}`, 'logger');
    }
}

// Crear instancia global
const logger = new Logger();

// Log inicial del sistema
logger.info(`GT Intelligence Logger initialized`, 'logger', {
    version: CONFIG.METADATA.VERSION,
    level: CONFIG.LOGGING.LEVEL,
    max_entries: CONFIG.LOGGING.MAX_ENTRIES
});

export default logger;