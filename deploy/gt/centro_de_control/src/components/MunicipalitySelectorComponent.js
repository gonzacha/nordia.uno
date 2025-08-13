/**
 * GT Intelligence - Municipality Selector Component (HYBRID VERSION)
 * Combina la robustez del código original con el fix del callback
 * Versión: 2.0.1 (Híbrida)
 */

import store from '../store.js';
import logger from '../logger.js';

export default class MunicipalitySelectorComponent {
    constructor(container, onSelect) {
        this.container = container;
        this.onSelect = onSelect; // ← FIX: Callback almacenado correctamente
        
        // Estado del componente
        this.municipalities = [];
        this.filteredResults = [];
        this.isVisible = false;
        this.selectedIndex = -1;
        
        // Referencias DOM
        this.searchInput = null;
        this.resultsList = null;
        
        // Configuración
        this.debounceTimer = null;
        this.debounceDelay = 300;
        this.minSearchLength = 1;
        
        // Bind methods
        this.handleInput = this.handleInput.bind(this);
        this.handleKeyNavigation = this.handleKeyNavigation.bind(this);
        this.handleMunicipalityClick = this.handleMunicipalityClick.bind(this);
        
        // Subscribe to store changes
        store.subscribe('municipalities', (municipalities) => {
            this.municipalities = municipalities || [];
            if (this.isVisible) {
                this.updateMunicipalitiesList();
            }
        });
        
        logger.info('MunicipalitySelectorComponent initialized with callback');
    }

    show() {
        this.isVisible = true;
        this.municipalities = store.getState().municipalities || [];
        this.render();
        logger.info('Municipality selector shown');
    }

    hide() {
        this.isVisible = false;
        this.cleanup();
        this.container.innerHTML = '';
        logger.info('Municipality selector hidden');
    }

    render() {
        if (!this.isVisible) return;

        this.container.innerHTML = `
            <header class="text-center mb-8">
                <h1 class="text-4xl font-bold text-white">GT Intelligence - Centro de Control</h1>
                <p class="text-lg text-gray-400 mt-2">Plataforma de visualización de datos electorales.</p>
            </header>
            
            <main>
                <div class="max-w-2xl mx-auto bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-700/50">
                    <div class="text-center mb-8">
                        <h2 class="text-3xl font-bold text-white mb-2">Seleccionar Municipio</h2>
                        <p class="text-gray-400">Busque y seleccione el municipio para ver los resultados electorales</p>
                    </div>
                    
                    <!-- Search Input with Advanced Features -->
                    <div class="relative mb-6">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                            </svg>
                        </div>
                        
                        <input type="text" 
                               id="municipality-search" 
                               class="w-full pl-10 pr-12 py-4 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                               placeholder="Buscar municipio... (ej: Capital, Goya, Mercedes)"
                               autocomplete="off"
                               spellcheck="false"
                               aria-label="Buscar municipio">
                        
                        <!-- Search Indicator -->
                        <div id="search-indicator" class="absolute right-10 top-4 hidden">
                            <div class="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                        </div>
                        
                        <!-- Clear Button -->
                        <button id="clear-search" 
                                class="absolute right-3 top-4 text-gray-400 hover:text-white transition-colors duration-200 hidden"
                                aria-label="Limpiar búsqueda">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- Results Container -->
                    <div id="municipality-results" class="space-y-2 max-h-80 overflow-y-auto">
                    </div>
                    
                    <!-- No Results Message -->
                    <div id="no-results" class="hidden text-center py-8">
                        <div class="w-16 h-16 mx-auto mb-4 text-gray-500">
                            <svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0118 12a8 8 0 10-8 8 7.962 7.962 0 014.708-1.709L18 21l-3-3z"/>
                            </svg>
                        </div>
                        <h3 class="text-lg font-semibold text-gray-400 mb-2">Sin resultados</h3>
                        <p class="text-gray-500">No se encontraron municipios que coincidan con su búsqueda.</p>
                    </div>
                    
                    <!-- Footer Info -->
                    <div class="mt-6 pt-6 border-t border-gray-700 text-center">
                        <p class="text-sm text-gray-500">
                            Mostrando <span id="results-count">${this.municipalities.length}</span> de ${this.municipalities.length} municipios
                        </p>
                        <div class="mt-2 flex justify-center space-x-4 text-xs text-gray-600">
                            <span>• ↑↓ para navegar</span>
                            <span>• Enter para seleccionar</span>
                            <span>• Esc para limpiar</span>
                        </div>
                    </div>
                </div>
            </main>
            
            <footer class="text-center mt-12 text-sm text-gray-500">
                <p>GT Intelligence v2.0 - Sistema de Análisis Electoral</p>
                <p>Municipios Disponibles: ${this.municipalities.length}</p>
            </footer>
        `;

        this.attachEventListeners();
        this.renderResults();
    }

    attachEventListeners() {
        // Search input
        this.searchInput = document.getElementById('municipality-search');
        if (this.searchInput) {
            this.searchInput.addEventListener('input', this.handleInput);
            this.searchInput.addEventListener('keydown', this.handleKeyNavigation);
        }

        // Clear button
        const clearButton = document.getElementById('clear-search');
        if (clearButton) {
            // Guardar referencia para uso consistente
            this.clearButton = clearButton;
            clearButton.addEventListener('click', () => {
                this.searchInput.value = '';
                this.clearButton.classList.add('hidden');
                this.performSearch('');
                this.searchInput.focus();
            });
        }

        // Click outside to deselect
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.municipality-item')) {
                this.selectedIndex = -1;
                this.updateSelection();
            }
        });
    }

    handleInput(e) {
        const query = e.target.value.trim();
        
        // Show/hide clear button
        const clearButton = document.getElementById('clear-search');
        if (clearButton) {
            if (query.length > 0) {
                clearButton.classList.remove('hidden');
            } else {
                clearButton.classList.add('hidden');
            }
        }

        // Show search indicator
        const indicator = document.getElementById('search-indicator');
        if (indicator) {
            indicator.classList.remove('hidden');
        }

        // Debounced search
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        this.debounceTimer = setTimeout(() => {
            this.performSearch(query);
            if (indicator) {
                indicator.classList.add('hidden');
            }
        }, this.debounceDelay);
    }

    handleKeyNavigation(e) {
        const items = document.querySelectorAll('.municipality-item');
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.selectedIndex = Math.min(this.selectedIndex + 1, items.length - 1);
                this.updateSelection();
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
                this.updateSelection();
                break;
                
            case 'Enter':
                e.preventDefault();
                if (this.selectedIndex >= 0 && items[this.selectedIndex]) {
                    this.handleMunicipalityClick({ target: items[this.selectedIndex] });
                }
                break;
                
            case 'Escape':
                this.searchInput.value = '';
                this.selectedIndex = -1;
                this.performSearch('');
                break;
        }
    }

    performSearch(query) {
        const normalizedQuery = query.toLowerCase();
        
        if (!normalizedQuery) {
            this.filteredResults = [...this.municipalities];
        } else {
            this.filteredResults = this.municipalities.filter(municipality =>
                municipality.nombre.toLowerCase().includes(normalizedQuery)
            );
        }

        this.selectedIndex = -1;
        this.renderResults();
        this.updateResultsCount();

        logger.debug('Search performed', { 
            query: normalizedQuery, 
            results: this.filteredResults.length 
        });
    }

    renderResults() {
        const resultsContainer = document.getElementById('municipality-results');
        const noResultsElement = document.getElementById('no-results');
        
        if (!resultsContainer) return;

        if (this.filteredResults.length === 0) {
            resultsContainer.innerHTML = '';
            if (noResultsElement) {
                noResultsElement.classList.remove('hidden');
            }
            return;
        }

        if (noResultsElement) {
            noResultsElement.classList.add('hidden');
        }

        resultsContainer.innerHTML = this.filteredResults.map((municipality, index) => `
            <div class="municipality-item p-4 bg-gray-700/30 hover:bg-gray-600/50 rounded-lg cursor-pointer transition-all duration-200 border border-transparent group"
                 data-municipality-id="${municipality.id}"
                 data-municipality-name="${municipality.nombre}"
                 data-index="${index}"
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

        // Attach click listeners
        resultsContainer.querySelectorAll('.municipality-item').forEach(item => {
            item.addEventListener('click', this.handleMunicipalityClick);
            item.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleMunicipalityClick(e);
                }
            });
        });
    }

    updateSelection() {
        const items = document.querySelectorAll('.municipality-item');
        
        items.forEach((item, index) => {
            if (index === this.selectedIndex) {
                item.classList.add('border-blue-500', 'bg-gray-600/50');
                item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            } else {
                item.classList.remove('border-blue-500', 'bg-gray-600/50');
            }
        });
    }

    handleMunicipalityClick(e) {
        const item = e.target.closest('.municipality-item');
        if (!item) return;

        const municipalityId = parseInt(item.dataset.municipalityId);
        const municipalityName = item.dataset.municipalityName;
        
        logger.info('Municipality selected', { 
            id: municipalityId, 
            name: municipalityName 
        });
        
        // ← FIX: Verificar que el callback existe antes de llamarlo
        if (typeof this.onSelect === 'function') {
            this.onSelect(municipalityId);
        } else {
            logger.error('onSelect callback is not a function', this.onSelect);
        }
    }

    updateMunicipalitiesList() {
        this.performSearch(this.searchInput?.value || '');
    }

    updateResultsCount() {
        const countElement = document.getElementById('results-count');
        if (countElement) {
            countElement.textContent = this.filteredResults.length;
        }
    }

    cleanup() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }
        
        this.searchInput = null;
        this.resultsList = null;
        this.selectedIndex = -1;
    }

    destroy() {
        this.cleanup();
        this.hide();
        logger.info('MunicipalitySelectorComponent destroyed');
    }

    getStats() {
        return {
            isVisible: this.isVisible,
            municipalitiesCount: this.municipalities.length,
            filteredResults: this.filteredResults.length,
            selectedIndex: this.selectedIndex,
            currentQuery: this.searchInput?.value || ''
        };
    }
}
