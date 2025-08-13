/**
 * GT Intelligence - Results Dashboard Component (HYBRID VERSION)
 * Combina la sofisticación del código original con el fix del callback
 * Versión: 2.0.1 (Híbrida)
 */

import store from '../store.js';
import logger from '../logger.js';

export default class ResultsDashboardComponent {
    constructor(container, onBack) {
        this.container = container;
        this.onBack = onBack; // ← FIX: Callback almacenado correctamente
        
        // Estado del componente
        this.municipality = null;
        this.isVisible = false;
        this.chartInstance = null;
        this.chartType = 'bar'; // Default chart type
        
        // Datos procesados para el gráfico
        this.chartData = {
            alianzas: [],
            candidatos: [],
            colors: []
        };
        
        // Bind methods
        this.handleBackClick = this.handleBackClick.bind(this);
        this.switchChartType = this.switchChartType.bind(this);
        this.toggleTable = this.toggleTable.bind(this);
        
        // Subscribe to store changes
        store.subscribe('currentMunicipality', (municipality) => {
            this.municipality = municipality;
            if (this.isVisible && municipality) {
                this.render();
            }
        });
        
        logger.info('ResultsDashboardComponent initialized with callback');
    }

    show() {
        this.isVisible = true;
        this.municipality = store.getState().currentMunicipality;
        if (this.municipality) {
            this.render();
        } else {
            logger.warn('No municipality data available for results dashboard');
        }
        logger.info('Results dashboard shown');
    }

    hide() {
        this.isVisible = false;
        this.destroyChart();
        this.container.innerHTML = '';
        logger.info('Results dashboard hidden');
    }

    render() {
        if (!this.isVisible || !this.municipality) return;

        const processedData = this.processElectoralData();
        
        this.container.innerHTML = `
            <header class="mb-8">
                <button id="back-btn" class="text-blue-400 hover:text-blue-300 mb-4 inline-flex items-center transition-colors duration-200">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    Volver a la selección
                </button>
                <h1 class="text-4xl font-bold text-white">${this.municipality.nombre}</h1>
                <p class="text-lg text-gray-400">Información Electoral 2025</p>
            </header>

            <main class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Gráfico Principal con Controles -->
                <div class="lg:col-span-2 bg-gray-800/50 p-6 rounded-lg">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-2xl font-semibold text-white">Candidatos por Alianza</h2>
                        <div class="chart-controls flex space-x-2">
                            <button id="chart-type-bar" class="chart-type-btn ${this.chartType === 'bar' ? 'active bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'} px-3 py-1 text-sm rounded transition-colors duration-200">
                                Barras
                            </button>
                            <button id="chart-type-pie" class="chart-type-btn ${this.chartType === 'pie' ? 'active bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'} px-3 py-1 text-sm rounded hover:bg-gray-500 transition-colors duration-200">
                                Circular
                            </button>
                        </div>
                    </div>
                    <div class="bg-gray-900 p-4 rounded-lg" style="height: 400px;">
                        <canvas id="resultsChart"></canvas>
                    </div>
                </div>

                <!-- Panel de Estadísticas Avanzadas -->
                <div class="space-y-6">
                    <!-- Total de Alianzas -->
                    <div class="bg-gray-800/50 p-6 rounded-lg text-center">
                        <h3 class="text-lg font-semibold text-gray-400 mb-2">Total de Alianzas</h3>
                        <p class="text-4xl font-bold text-white">${this.municipality.alianzas.length}</p>
                        <p class="text-sm text-gray-500 mt-1">participantes</p>
                    </div>
                    
                    <!-- Total de Candidatos -->
                    <div class="bg-gray-800/50 p-6 rounded-lg text-center">
                        <h3 class="text-lg font-semibold text-gray-400 mb-2">Total de Candidatos</h3>
                        <p class="text-4xl font-bold text-blue-400">${processedData.totalCandidatos}</p>
                        <p class="text-sm text-gray-500 mt-1">en competencia</p>
                    </div>

                    <!-- Alianza con Más Candidatos -->
                    <div class="bg-gray-800/50 p-6 rounded-lg">
                        <h3 class="text-lg font-semibold text-gray-400 mb-3 text-center">Alianza Líder</h3>
                        ${processedData.topAlianza ? this.createTopAlianzaCard(processedData.topAlianza) : this.createNoDataCard()}
                    </div>

                    <!-- Estadísticas Adicionales -->
                    <div class="bg-gray-800/50 p-6 rounded-lg">
                        <h3 class="text-lg font-semibold text-gray-400 mb-3">Estadísticas</h3>
                        <div class="space-y-3">
                            ${this.createStatsCards(processedData)}
                        </div>
                    </div>
                </div>
            </main>

            <!-- Tabla Detallada Colapsable -->
            <section class="mt-8">
                <button id="toggle-table" class="w-full bg-gray-800/50 p-4 rounded-lg text-left hover:bg-gray-800/70 transition-colors duration-200">
                    <div class="flex justify-between items-center">
                        <h3 class="text-xl font-semibold text-white">Detalle de Alianzas y Candidatos</h3>
                        <svg id="table-chevron" class="w-5 h-5 text-gray-400 transform transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </div>
                </button>
                <div id="detailed-table" class="hidden mt-4 bg-gray-800/50 rounded-lg overflow-hidden">
                    ${this.createDetailedTable()}
                </div>
            </section>
        `;

        this.attachEventListeners();
        setTimeout(() => this.renderChart(processedData), 100);
    }

    processElectoralData() {
        if (!this.municipality || !this.municipality.alianzas) return { alianzasData: [], totalCandidatos: 0 };

        const alianzasData = this.municipality.alianzas.map(alianza => {
            const candidatos = alianza.candidatos || {};
            let totalCandidatos = 0;

            // Contar candidatos por tipo
            if (candidatos.intendente) totalCandidatos++;
            if (candidatos.viceintendente) totalCandidatos++;
            if (candidatos.concejales_titulares) totalCandidatos += candidatos.concejales_titulares.length;
            if (candidatos.concejales_suplentes) totalCandidatos += candidatos.concejales_suplentes.length;

            return {
                nombre: alianza.nombre,
                totalCandidatos,
                detalles: candidatos
            };
        }).sort((a, b) => b.totalCandidatos - a.totalCandidatos);

        const totalCandidatos = alianzasData.reduce((sum, alianza) => sum + alianza.totalCandidatos, 0);
        const promedio = alianzasData.length > 0 ? Math.round(totalCandidatos / alianzasData.length) : 0;
        const topAlianza = alianzasData.length > 0 ? alianzasData[0] : null;

        // Preparar datos para Chart.js
        this.chartData = {
            alianzas: alianzasData.map(a => a.nombre),
            candidatos: alianzasData.map(a => a.totalCandidatos),
            colors: this.generateColors(alianzasData.length)
        };

        return {
            alianzasData,
            totalCandidatos,
            promedio,
            topAlianza
        };
    }

    generateColors(count) {
        const baseColors = [
            'rgba(59, 130, 246, 0.8)',   // Blue
            'rgba(16, 185, 129, 0.8)',   // Green  
            'rgba(245, 101, 101, 0.8)',  // Red
            'rgba(251, 191, 36, 0.8)',   // Yellow
            'rgba(139, 92, 246, 0.8)',   // Purple
            'rgba(236, 72, 153, 0.8)',   // Pink
            'rgba(14, 165, 233, 0.8)',   // Sky
            'rgba(34, 197, 94, 0.8)'     // Emerald
        ];
        
        const colors = [];
        for (let i = 0; i < count; i++) {
            colors.push(baseColors[i % baseColors.length]);
        }
        return colors;
    }

    createTopAlianzaCard(alianza) {
        return `
            <div class="p-4 bg-blue-900/50 rounded-lg text-center border border-blue-700/30">
                <div class="mb-2">
                    <svg class="w-8 h-8 mx-auto text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                </div>
                <p class="font-bold text-xl text-white mb-1">${alianza.nombre}</p>
                <p class="text-lg text-blue-300">${alianza.totalCandidatos} candidatos</p>
                <p class="text-sm text-gray-400 mt-1">Mayor número de postulantes</p>
            </div>
        `;
    }

    createNoDataCard() {
        return `
            <div class="p-4 bg-gray-700/50 rounded-lg text-center">
                <svg class="w-8 h-8 mx-auto text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0120 12a8 8 0 10-2.343 5.657l2.343 2.343"/>
                </svg>
                <p class="text-gray-400">Sin datos disponibles</p>
            </div>
        `;
    }

    createStatsCards(data) {
        return `
            <div class="flex justify-between items-center p-3 bg-gray-700/50 rounded">
                <span class="text-gray-300">Promedio por alianza</span>
                <span class="font-bold text-white">${data.promedio}</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-gray-700/50 rounded">
                <span class="text-gray-300">Última actualización</span>
                <span class="font-bold text-white text-xs">${new Date().toLocaleString('es-AR')}</span>
            </div>
        `;
    }

    createDetailedTable() {
        return `
            <div class="space-y-4 p-6">
                ${this.municipality.alianzas.map((alianza, index) => `
                    <div class="bg-gray-700/50 p-4 rounded-lg">
                        <div class="flex items-center justify-between mb-3">
                            <h3 class="text-xl font-bold text-white">${alianza.nombre}</h3>
                            <span class="inline-flex items-center justify-center w-8 h-8 rounded-full ${index === 0 ? 'bg-yellow-600' : index === 1 ? 'bg-gray-500' : index === 2 ? 'bg-orange-600' : 'bg-gray-700'} text-white font-bold text-sm">
                                ${index + 1}
                            </span>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            ${this.renderCandidatosByTipo(alianza.candidatos)}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderCandidatosByTipo(candidatos) {
        const tipos = [
            { key: 'intendente', label: 'Intendente', color: 'bg-red-900/50' },
            { key: 'viceintendente', label: 'Viceintendente', color: 'bg-orange-900/50' },
            { key: 'concejales_titulares', label: 'Concejales Titulares', color: 'bg-blue-900/50' },
            { key: 'concejales_suplentes', label: 'Concejales Suplentes', color: 'bg-purple-900/50' }
        ];

        return tipos.map(tipo => {
            const data = candidatos[tipo.key];
            let content = '';

            if (tipo.key === 'intendente' || tipo.key === 'viceintendente') {
                content = data ? `<p class="text-white font-medium text-sm">${data.nombre}</p>` : 
                              '<p class="text-gray-400 italic text-sm">No asignado</p>';
            } else {
                const lista = data || [];
                content = lista.length > 0 ? 
                    lista.map(c => `<p class="text-white text-xs mb-1">${c.nombre}</p>`).join('') :
                    '<p class="text-gray-400 italic text-xs">No asignados</p>';
            }

            return `
                <div class="${tipo.color} p-3 rounded border border-gray-600/30">
                    <h4 class="text-xs font-semibold text-gray-300 mb-2 uppercase">${tipo.label}</h4>
                    ${content}
                </div>
            `;
        }).join('');
    }

    renderChart(data) {
        this.destroyChart();

        if (data.alianzasData.length === 0) {
            logger.warn('No data available for chart');
            return;
        }

        const ctx = document.getElementById('resultsChart');
        if (!ctx) {
            logger.error('Canvas element not found for chart');
            return;
        }

        try {
            const chartConfig = {
                type: this.chartType,
                data: {
                    labels: this.chartData.alianzas,
                    datasets: [{
                        label: 'Número de Candidatos',
                        data: this.chartData.candidatos,
                        backgroundColor: this.chartType === 'pie' ? this.chartData.colors : 'rgba(59, 130, 246, 0.6)',
                        borderColor: this.chartType === 'pie' ? this.chartData.colors.map(c => c.replace('0.8', '1')) : 'rgba(59, 130, 246, 1)',
                        borderWidth: 2,
                        borderRadius: this.chartType === 'bar' ? 4 : 0
                    }]
                },
                options: this.getChartOptions()
            };

            this.chartInstance = new Chart(ctx, chartConfig);
            logger.info(`Chart rendered successfully: ${this.chartType}`);
        } catch (error) {
            logger.error('Failed to render chart', error);
        }
    }

    getChartOptions() {
        const baseOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: this.chartType === 'pie',
                    position: 'bottom',
                    labels: {
                        color: '#F9FAFB',
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    titleColor: '#F9FAFB',
                    bodyColor: '#F9FAFB',
                    borderColor: '#374151',
                    borderWidth: 1
                }
            }
        };

        if (this.chartType === 'bar') {
            return {
                ...baseOptions,
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            color: '#ffffff',
                            stepSize: 1
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        ticks: {
                            color: '#ffffff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            };
        }

        return baseOptions;
    }

    attachEventListeners() {
        // Back button
        const backBtn = document.getElementById('back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', this.handleBackClick);
        }

        // Chart type buttons
        const barBtn = document.getElementById('chart-type-bar');
        const pieBtn = document.getElementById('chart-type-pie');
        
        if (barBtn) {
            barBtn.addEventListener('click', () => this.switchChartType('bar'));
        }
        
        if (pieBtn) {
            pieBtn.addEventListener('click', () => this.switchChartType('pie'));
        }

        // Table toggle
        const toggleBtn = document.getElementById('toggle-table');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', this.toggleTable);
        }
    }

    switchChartType(type) {
        this.chartType = type;
        
        // Update button states
        const barBtn = document.getElementById('chart-type-bar');
        const pieBtn = document.getElementById('chart-type-pie');
        
        [barBtn, pieBtn].forEach(btn => {
            btn.classList.remove('active', 'bg-blue-600', 'text-white');
            btn.classList.add('bg-gray-600', 'text-gray-300');
        });
        
        const activeBtn = type === 'bar' ? barBtn : pieBtn;
        activeBtn.classList.remove('bg-gray-600', 'text-gray-300');
        activeBtn.classList.add('active', 'bg-blue-600', 'text-white');
        
        // Re-render chart
        const processedData = this.processElectoralData();
        this.renderChart(processedData);
        
        logger.info(`Chart type switched to: ${type}`);
    }

    toggleTable() {
        const table = document.getElementById('detailed-table');
        const chevron = document.getElementById('table-chevron');
        
        if (table && chevron) {
            const isHidden = table.classList.contains('hidden');
            
            if (isHidden) {
                table.classList.remove('hidden');
                chevron.style.transform = 'rotate(180deg)';
            } else {
                table.classList.add('hidden');
                chevron.style.transform = 'rotate(0deg)';
            }
            
            logger.info(`Table toggled: ${isHidden ? 'shown' : 'hidden'}`);
        }
    }

    handleBackClick() {
        logger.info('Back button clicked');
        if (typeof this.onBack === 'function') {
            this.onBack();
        } else {
            logger.error('onBack callback is not a function');
        }
    }

    destroyChart() {
        if (this.chartInstance) {
            this.chartInstance.destroy();
            this.chartInstance = null;
            logger.info('Chart destroyed');
        }
    }

    destroy() {
        this.destroyChart();
        this.hide();
        logger.info('ResultsDashboardComponent destroyed');
    }

    getStats() {
        const data = this.processElectoralData();
        return {
            isVisible: this.isVisible,
            municipalityName: this.municipality?.nombre,
            totalCandidatos: data.totalCandidatos,
            alianzasCount: this.municipality?.alianzas?.length || 0,
            chartType: this.chartType,
            topAlianza: data.topAlianza?.nombre
        };
    }
}