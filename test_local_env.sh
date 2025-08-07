#!/bin/bash

# ==============================================================================
# Script de Test Local para GT Intelligence (v1.1)
#
# Este script verifica que todos los componentes (backend y frontend)
# estén correctamente configurados y listos para funcionar en el entorno local.
# v1.1: Se corrige la verificación de dependencias para que no sea sensible
#       a mayúsculas y minúsculas (case-insensitive).
# ==============================================================================

# --- Funciones de Ayuda para Colores ---
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✅ ÉXITO:${NC} $1"
}

print_error() {
    echo -e "${RED}❌ ERROR:${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️ AVISO:${NC} $1"
}

print_info() {
    echo -e "\n--- $1 ---"
}

# --- Limpieza de Procesos Anteriores ---
cleanup() {
    print_info "Limpiando procesos de servidores anteriores"
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID > /dev/null 2>&1
        echo "Servidor Backend (PID: $BACKEND_PID) detenido."
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID > /dev/null 2>&1
        echo "Servidor Frontend (PID: $FRONTEND_PID) detenido."
    fi
    # Forzar la detención de cualquier proceso que pueda haber quedado en los puertos
    lsof -t -i:5001 | xargs kill -9 > /dev/null 2>&1
    lsof -t -i:8080 | xargs kill -9 > /dev/null 2>&1
}
trap cleanup EXIT

# ==============================================================================
# --- INICIO DEL TEST ---
# ==============================================================================

print_info "INICIANDO TEST LOCAL DE GT INTELLIGENCE"

# --- TEST 1: ENTORNO DEL BACKEND ---
print_info "Verificando el Backend (Flask)"

# 1.1 Verificar Entorno Virtual
if [ ! -d "venv" ]; then
    print_error "No se encontró la carpeta del entorno virtual 'venv'. Asegúrate de estar en la raíz del proyecto."
    exit 1
fi
source venv/bin/activate
print_success "Entorno virtual activado."

# 1.2 Verificar Dependencias (CORREGIDO)
if ! pip list | grep -i -q Flask-Cors; then # Se añadió -i para ignorar mayúsculas/minúsculas
    print_error "La dependencia 'Flask-Cors' no está instalada. Ejecuta 'pip install flask-cors'."
    exit 1
fi
print_success "Dependencias clave del backend están instaladas."

# 1.3 Iniciar Servidor Backend en segundo plano
echo "Iniciando servidor Flask en el puerto 5001..."
python3 run.py &
BACKEND_PID=$!
sleep 3 # Darle tiempo para que arranque

# 1.4 Verificar si el Backend está vivo
if ! curl -s http://127.0.0.1:5001/api/health > /dev/null; then
    print_error "El servidor Backend no respondió en el puerto 5001. Revisa la terminal en busca de errores de arranque."
    exit 1
fi
print_success "El servidor Backend está respondiendo en el puerto 5001."

# 1.5 Verificar Configuración de CORS
CORS_HEADER=$(curl -s -I -H "Origin: http://localhost:8080" http://127.0.0.1:5001/api/health | grep -i "Access-Control-Allow-Origin")
if [ -z "$CORS_HEADER" ]; then
    print_error "El servidor Backend no está enviando la cabecera de CORS. Revisa la configuración en 'app/__init__.py'."
    exit 1
fi
print_success "El servidor Backend está configurado correctamente para CORS."


# --- TEST 2: ENTORNO DEL FRONTEND ---
print_info "Verificando el Frontend (Servidor Estático)"

# 2.1 Verificar Directorio y Archivos
if [ ! -d "centro_de_control" ] || [ ! -f "centro_de_control/index.html" ]; then
    print_error "No se encontró la carpeta 'centro_de_control' o su archivo 'index.html'."
    exit 1
fi
print_success "La estructura de archivos del frontend es correcta."

# 2.2 Iniciar Servidor Frontend en segundo plano
echo "Iniciando servidor Frontend en el puerto 8080..."
(cd centro_de_control && python3 -m http.server 8080) &
FRONTEND_PID=$!
sleep 2 # Darle tiempo para que arranque

# 2.3 Verificar si el Frontend está vivo
if ! curl -s http://localhost:8080 > /dev/null; then
    print_error "El servidor Frontend no respondió en el puerto 8080."
    exit 1
fi
print_success "El servidor Frontend está respondiendo en el puerto 8080."


# --- CONCLUSIÓN ---
print_info "RESULTADO FINAL DEL TEST"
print_success "¡Todo el entorno local parece estar configurado correctamente!"
print_warning "Los servidores se han iniciado en segundo plano para que puedas probar en el navegador."
print_warning "Para detenerlos, cierra esta terminal o ejecuta: kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "Puedes abrir tu navegador en http://localhost:8080"
echo ""

# Mantener el script vivo para que los procesos en segundo plano no mueran
wait
