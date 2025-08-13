// GT Intelligence - app.js (FIXED VERSION)
import store from './store.js';
import logger from './logger.js';
import apiService from './apiService.js';
import LoadingComponent from './components/LoadingComponent.js';
import ErrorComponent from './components/ErrorComponent.js';
import MunicipalitySelectorComponent from './components/MunicipalitySelectorComponent.js';
import ResultsDashboardComponent from './components/ResultsDashboardComponent.js';

class GTIntelligenceApp {
    constructor() {
        this.appContainer = document.getElementById('app');
        this.components = {};
        this.currentView = 'loading';
        
        // Bind methods to maintain context
        this.showMunicipalitySelector = this.showMunicipalitySelector.bind(this);
        this.showResultsDashboard = this.showResultsDashboard.bind(this);
        this.handleMunicipalitySelect = this.handleMunicipalitySelect.bind(this);
        this.handleBackToSelector = this.handleBackToSelector.bind(this);
        
        this.init();
    }

    async init() {
        logger.info('GT Intelligence App initializing...');
        
        try {
            // Initialize all components with proper callbacks
            this.initializeComponents();
            
            // Load municipalities data
            await this.loadInitialData();
            
            // Show initial view
            this.showMunicipalitySelector();
            
            logger.info('GT Intelligence App initialized successfully');
            
        } catch (error) {
            logger.error('Failed to initialize GT Intelligence App', error);
            this.showError('Error al inicializar la aplicación');
        }
    }

    initializeComponents() {
        // Loading component
        this.components.loading = new LoadingComponent(this.appContainer);
        
        // Error component  
        this.components.error = new ErrorComponent(this.appContainer);
        
        // Municipality selector with onSelect callback
        this.components.municipalitySelector = new MunicipalitySelectorComponent(
            this.appContainer,
            this.handleMunicipalitySelect // ← FIX: Passing the callback here
        );
        
        // Results dashboard with onBack callback
        this.components.resultsDashboard = new ResultsDashboardComponent(
            this.appContainer,
            this.handleBackToSelector // ← Callback for back button
        );
        
        logger.info('All components initialized with callbacks');
    }

    async loadInitialData() {
        this.showLoading('Cargando municipios...');
        
        try {
            const resp = await apiService.getMunicipalities();
            const municipalities = Array.isArray(resp?.municipalities) ? resp.municipalities : [];

            store.updateState({ municipalities });
            logger.info(`Loaded ${municipalities.length} municipalities`);
        } catch (error) {
            logger.error('Failed to load municipalities', error);
            throw error;
        }
    }

    // Event handlers
    async handleMunicipalitySelect(municipalityId) {
        logger.info(`Municipality selected: ${municipalityId}`);
        
        try {
            this.showLoading('Cargando datos del municipio...');
            
            const data = await apiService.getMunicipalityDetails(municipalityId);
            store.updateState({ currentMunicipality: data.municipio });
            
            this.showResultsDashboard();
            
        } catch (error) {
            logger.error('Failed to load municipality details', error);
            this.showError('Error al cargar los datos del municipio');
        }
    }

    handleBackToSelector() {
        logger.info('Returning to municipality selector');
        store.updateState({ currentMunicipality: null });
        this.showMunicipalitySelector();
    }

    // View management
    showLoading(message = 'Cargando...') {
        this.hideAllComponents();
        this.components.loading.show(message);
        this.currentView = 'loading';
    }

    showError(message) {
        this.hideAllComponents();
        this.components.error.show(message);
        this.currentView = 'error';
    }

    showMunicipalitySelector() {
        this.hideAllComponents();
        this.components.municipalitySelector.show();
        this.currentView = 'selector';
        logger.info('Municipality selector view active');
    }

    showResultsDashboard() {
        this.hideAllComponents();
        this.components.resultsDashboard.show();
        this.currentView = 'results';
        logger.info('Results dashboard view active');
    }

    hideAllComponents() {
        Object.values(this.components).forEach(component => {
            if (component && typeof component.hide === 'function') {
                component.hide();
            }
        });
    }
}

// Initialize app reliably even if DOMContentLoaded already fired
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.gtApp = new GTIntelligenceApp();
    });
} else {
    window.gtApp = new GTIntelligenceApp();
}
