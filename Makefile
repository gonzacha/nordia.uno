# Nordia · Inteligencia Situacional - Makefile
# Utilidades legacy para scripts y backend histórico

.PHONY: help install run test clean format lint setup

# Variables
VENV = venv
PYTHON = $(VENV)/bin/python
PIP = $(VENV)/bin/pip
PYTEST = $(VENV)/bin/pytest
BLACK = $(VENV)/bin/black
FLAKE8 = $(VENV)/bin/flake8

# Comando por defecto
help:
	@echo "════════════════════════════════════════════════════════════════"
	@echo "     NORDIA · INTELIGENCIA SITUACIONAL - COMANDOS MAKE (LEGACY)"
	@echo "════════════════════════════════════════════════════════════════"
	@echo ""
	@echo "Comandos de Setup:"
	@echo "  make install     - Instalar dependencias y configurar entorno"
	@echo "  make setup       - Setup completo (install + config inicial)"
	@echo ""
	@echo "Comandos de Desarrollo:"
	@echo "  make run         - Ejecutar script principal de cortes"
	@echo "  make test        - Ejecutar suite completo de tests"
	@echo "  make format      - Formatear código con Black"
	@echo "  make lint        - Verificar calidad de código"
	@echo ""
	@echo "Comandos de Utilidad:"
	@echo "  make clean       - Limpiar archivos temporales"
	@echo "  make validate    - Validar archivo CSV de prueba"
	@echo "  make demo        - Ejecutar demo con datos fake"
	@echo ""
	@echo "Comandos de Producción:"
	@echo "  make backup      - Crear backup de configuración"
	@echo "  make health      - Verificar salud del sistema"
	@echo "════════════════════════════════════════════════════════════════"

# Instalación completa del entorno
install:
	@echo "🔧 Instalando dependencias..."
	python3 -m venv $(VENV)
	$(PIP) install --upgrade pip
	$(PIP) install -r requirements.txt
	@echo "✅ Dependencias instaladas correctamente"

# Setup completo del proyecto
setup: install
	@echo "🚀 Configurando proyecto..."
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "📝 Archivo .env creado desde .env.example"; \
		echo "⚠️  IMPORTANTE: Edita .env con tus credenciales reales"; \
	fi
	@mkdir -p logs output backup data
	@echo "📁 Directorios necesarios creados"
	@echo "✅ Setup completo finalizado"

# Ejecutar script principal
run:
	@echo "🚀 Ejecutando CLI legacy de Nordia..."
	$(PYTHON) scripts/cut_service.py --help

# Ejecutar con datos de prueba en modo dry-run
demo:
	@echo "🎮 Ejecutando demo con datos fake..."
	$(PYTHON) scripts/cut_service.py \
		--csv data/sample_morosos.csv \
		--router 192.168.1.1 \
		--mode dry-run \
		--min-days 30

# Ejecutar tests
test:
	@echo "🧪 Ejecutando tests..."
	$(PYTEST) -v --cov=app --cov-report=html
	@echo "📊 Reporte de cobertura generado en htmlcov/"

# Tests específicos
test-unit:
	$(PYTEST) tests/unit/ -v

test-integration:
	$(PYTEST) tests/integration/ -v

# Formatear código
format:
	@echo "✨ Formateando código con Black..."
	$(BLACK) app/ scripts/ tests/
	@echo "✅ Código formateado"

# Verificar calidad de código
lint:
	@echo "🔍 Verificando calidad de código..."
	$(FLAKE8) app/ scripts/ --max-line-length=88
	@echo "✅ Verificación completada"

# Validar CSV de prueba
validate:
	@echo "📊 Validando archivo CSV de prueba..."
	$(PYTHON) scripts/validate_csv.py --file data/sample_morosos.csv

# Verificar conexión Mikrotik
test-connection:
	@echo "🌐 Verificando conexión Mikrotik..."
	$(PYTHON) scripts/test_mikrotik.py

# Limpiar archivos temporales
clean:
	@echo "🧹 Limpiando archivos temporales..."
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	find . -type f -name "*.log" -delete
	rm -rf .pytest_cache/ .coverage htmlcov/ .mypy_cache/
	@echo "✅ Limpieza completada"

# Crear backup de configuración
backup:
	@echo "💾 Creando backup..."
	@mkdir -p backup
	@timestamp=$$(date +%Y%m%d_%H%M%S); \
	tar -czf backup/nordia_backup_$$timestamp.tar.gz \
		--exclude=venv \
		--exclude=logs \
		--exclude=output \
		--exclude=backup \
		.
	@echo "✅ Backup creado en backup/"

# Health check del sistema
health:
	@echo "🩺 Verificando salud del sistema..."
	$(PYTHON) scripts/health_check.py

# Generar documentación
docs:
	@echo "📚 Generando documentación..."
	@mkdir -p docs/api
	$(PYTHON) -m pydoc -w app
	@echo "✅ Documentación generada"

# Comandos de desarrollo avanzado
dev-install: install
	$(PIP) install pytest-watch ipython jupyter
	@echo "🛠️  Herramientas de desarrollo instaladas"

# Watch tests (requiere pytest-watch)
test-watch:
	$(VENV)/bin/ptw

# Servidor Jupyter para exploración
jupyter:
	$(VENV)/bin/jupyter notebook

# Build para distribución
build:
	@echo "📦 Construyendo paquete..."
	$(PYTHON) setup.py sdist bdist_wheel
	@echo "✅ Paquete construido en dist/"
