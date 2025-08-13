import os
import socket
from app import create_app
from app.extensions import db
from app.models import User
import click

app = create_app()

@app.cli.command("create-admin")
@click.argument("username")
@click.argument("email")
@click.argument("password")
def create_admin_user(username, email, password):
    with app.app_context():
        if User.query.filter_by(username=username).first():
            print(f"Usuario {username} ya existe.")
            return
        user = User(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        print(f"Usuario admin '{username}' creado exitosamente.")

def _get_requested_port(default_port: int = 5001) -> int:
    # Permitir configurar el puerto vía variables de entorno comunes
    val = os.getenv("PORT") or os.getenv("FLASK_RUN_PORT")
    if val:
        try:
            return int(val)
        except ValueError:
            pass
    return default_port


def _find_free_port(start_port: int) -> int:
    # Si el puerto solicitado está ocupado, buscamos el siguiente disponible
    for port in range(start_port, start_port + 20):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            try:
                s.bind(("0.0.0.0", port))
            except OSError:
                continue
            return port
    return start_port


if __name__ == '__main__':
    requested = _get_requested_port(5001)
    port = _find_free_port(requested)
    if port != requested:
        print(f"Puerto {requested} en uso. Iniciando en {port}…")
    # Log de salud minimalista en arranque (dev)
    print(f"[GT] Flask dev server iniciando en http://localhost:{port} - health: /api/health")
    # Evitar el reloader en dev para prevenir sockets duplicados que pueden colgar conexiones
    # y habilitar threading para que una operación lenta no bloquee todas las peticiones.
    app.run(host='0.0.0.0', port=port, debug=False, use_reloader=False, threaded=True)
