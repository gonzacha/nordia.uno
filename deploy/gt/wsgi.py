"""
GT Intelligence - WSGI Entry Point
Para uso con CloudPanel y Gunicorn en producción
"""
import os
import sys
import socket

# Agregar el directorio actual al path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Configurar variables de entorno para producción
os.environ.setdefault('FLASK_ENV', 'production')
os.environ.setdefault('FLASK_DEBUG', 'False')

# Importar y crear la aplicación
from app import create_app

application = create_app()

def _get_requested_port(default_port: int = 5001) -> int:
    val = os.getenv("PORT") or os.getenv("FLASK_RUN_PORT")
    if val:
        try:
            return int(val)
        except ValueError:
            pass
    return default_port

def _find_free_port(start_port: int) -> int:
    for port in range(start_port, start_port + 20):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            try:
                s.bind(("0.0.0.0", port))
            except OSError:
                continue
            return port
    return start_port

if __name__ == "__main__":
    requested = _get_requested_port(5001)
    port = _find_free_port(requested)
    if port != requested:
        print(f"Puerto {requested} en uso. Iniciando en {port}…")
    # Log de salud minimalista en arranque (prod/local)
    print(f"[GT] Flask WSGI iniciando en http://localhost:{port} - health: /api/health")
    # Alinear con entorno de desarrollo: sin reloader y con threading
    application.run(host='0.0.0.0', port=port, debug=False, use_reloader=False, threaded=True)
