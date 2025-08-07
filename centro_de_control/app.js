// GT Intelligence - Centro de Control (Versión Final Corregida y Funcional)
document.addEventListener('DOMContentLoaded', () => {
    
    const appContainer = document.getElementById('app');

    // El estado de la aplicación
    const state = {
        municipalities: [],
        metadata: {},
        currentMunicipio: null,
        chartInstance: null
    };

    // --- FUNCIONES DE RENDERIZADO Y UI ---

    const renderLoading = (message) => {
        appContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center h-screen">
                <svg class="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p class="mt-4 text-xl text-gray-400">${message}</p>
            </div>`;
    };

    const renderError = (errorMessage) => {
        appContainer.innerHTML = `
            <div class="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg" role="alert">
                <strong class="font-bold">Error:</strong>
                <span class="block sm:inline">${errorMessage}</span>
            </div>`;
    };

    // --- LÓGICA DEL DASHBOARD DE RESULTADOS ---
    const renderResultsDashboard = () => {
        const municipioData = state.currentMunicipio;

        let totalVotos = 0;
        const votosPorAlianza = {};

        municipioData.alianzas.forEach(alianza => {
            let votosAlianza = 0;
            if (alianza.candidatos && alianza.candidatos.intendente && typeof alianza.candidatos.intendente.votos === 'number') {
                 votosAlianza = alianza.candidatos.intendente.votos;
            }
            votosPorAlianza[alianza.nombre] = votosAlianza;
            totalVotos += votosAlianza;
        });

        const alianzasOrdenadas = Object.entries(votosPorAlianza).sort(([,a],[,b]) => b-a);
        const ganador = alianzasOrdenadas.length > 0 ? alianzasOrdenadas[0] : ['Sin Datos', 0];

        appContainer.innerHTML = `
            <header class="mb-8">
                 <button id="back-btn" class="text-blue-400 hover:text-blue-300 mb-4 inline-flex items-center transition-colors">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Volver a la selección
                </button>
                <h1 class="text-4xl font-bold text-white">${municipioData.nombre}</h1>
                <p class="text-lg text-gray-400">Resultados Electorales 2025</p>
            </header>

            <main class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2 bg-gray-800/50 p-6 rounded-lg">
                    <h2 class="text-2xl font-semibold mb-4 text-white">Votos por Alianza</h2>
                    <div class="bg-gray-900 p-4 rounded-lg" style="height: 400px;">
                        <canvas id="resultsChart"></canvas>
                    </div>
                </div>
                <div class="space-y-6">
                    <div class="bg-gray-800/50 p-6 rounded-lg text-center">
                        <h3 class="text-lg font-semibold text-gray-400 mb-2">Total de Votos Escrutados</h3>
                        <p class="text-4xl font-bold text-white">${totalVotos.toLocaleString('es-AR')}</p>
                    </div>
                    <div class="bg-gray-800/50 p-6 rounded-lg">
                        <h3 class="text-lg font-semibold text-gray-400 mb-3 text-center">Alianza Ganadora</h3>
                        <div class="p-4 bg-blue-900/50 rounded-lg text-center">
                            <p class="font-bold text-2xl text-white">${ganador[0]}</p>
                            <p class="text-xl text-blue-300 mt-1">${ganador[1].toLocaleString('es-AR')} votos</p>
                            <p class="text-lg text-gray-300 mt-1">${totalVotos > 0 ? ((ganador[1] / totalVotos) * 100).toFixed(2) : 0}%</p>
                        </div>
                    </div>
                </div>
            </main>
        `;

        if (state.chartInstance) {
            state.chartInstance.destroy();
        }
        const ctx = document.getElementById('resultsChart').getContext('2d');
        state.chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: alianzasOrdenadas.map(a => a[0]),
                datasets: [{
                    label: 'Votos',
                    data: alianzasOrdenadas.map(a => a[1]),
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y' }
        });

        document.getElementById('back-btn').addEventListener('click', renderWelcomeScreen);
    };

    const loadMunicipioData = async (municipioId) => {
        renderLoading('Cargando resultados detallados...');
        try {
            const response = await fetch(`http://127.0.0.1:5001/api/municipios/${municipioId}`);
            if (!response.ok) {
                throw new Error('La respuesta de la API de detalles no fue exitosa.');
            }
            const data = await response.json();
            state.currentMunicipio = data.municipio;
            renderResultsDashboard();
        } catch (error) {
            console.error("Error al cargar datos del municipio:", error);
            renderError(`No se pudieron cargar los datos del municipio seleccionado.`);
        }
    };

    // --- LÓGICA DE LA PANTALLA PRINCIPAL ---
    const renderPredictiveSearch = (container, municipalities) => {
        container.innerHTML = `
            <div class="relative">
                <input type="text" id="search-input" 
                       class="w-full px-4 py-3 rounded-lg text-white placeholder-gray-400 focus:outline-none bg-gray-700 border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500/50" 
                       placeholder="Escribe el nombre de un municipio...">
                <div id="results-list" class="absolute hidden w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto"></div>
            </div>`;

        const searchInput = document.getElementById('search-input');
        const resultsList = document.getElementById('results-list');

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            if (query.length === 0) {
                resultsList.classList.add('hidden');
                return;
            }
            const filtered = municipalities.filter(m => m.nombre.toLowerCase().includes(query));
            
            resultsList.innerHTML = '';
            if (filtered.length > 0) {
                filtered.forEach(municipio => {
                    const item = document.createElement('div');
                    item.className = 'p-3 hover:bg-blue-600 cursor-pointer transition-colors';
                    item.textContent = municipio.nombre;
                    item.addEventListener('click', () => {
                        searchInput.value = municipio.nombre;
                        resultsList.classList.add('hidden');
                        loadMunicipioData(municipio.id);
                    });
                    resultsList.appendChild(item);
                });
                resultsList.classList.remove('hidden');
            } else {
                resultsList.classList.add('hidden');
            }
        });

        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
                resultsList.classList.add('hidden');
            }
        });
    };

    const renderWelcomeScreen = () => {
        appContainer.innerHTML = `
            <header class="text-center mb-8">
                <h1 class="text-4xl font-bold text-white">GT Intelligence - Centro de Control</h1>
                <p class="text-lg text-gray-400 mt-2">Plataforma de visualización de datos electorales.</p>
            </header>
            <main>
                <div id="selector-container" class="max-w-2xl mx-auto bg-gray-800/50 p-6 rounded-lg shadow-lg">
                </div>
            </main>
            <footer class="text-center mt-12 text-sm text-gray-500">
                <p>Versión de Datos: ${state.metadata.data_version || 'Producción'}</p>
                <p>Última Actualización: ${state.metadata.last_update || new Date().toLocaleString('es-AR')}</p>
            </footer>`;

        const selectorContainer = document.getElementById('selector-container');
        // APLICANDO LA CORRECCIÓN DE LA AUDITORÍA
        renderPredictiveSearch(selectorContainer, state.municipalities);
    };

    // --- FUNCIÓN PRINCIPAL DE INICIALIZACIÓN ---
    const init = async () => {
        renderLoading('Conectando con la API de GT Intelligence...');
        try {
            const response = await fetch('http://127.0.0.1:5001/api/municipios');
            if (!response.ok) {
                throw new Error(`Error en la API: ${response.status}`);
            }
            
            const data = await response.json();
            
            state.municipalities = data.municipalities || [];
            state.metadata = data.metadata || {};

            renderWelcomeScreen();

        } catch (error) {
            console.error("Fallo al inicializar:", error);
            renderError('No se pudo cargar la lista de municipios desde el servidor.');
        }
    };

    init();
});
