#!/bin/bash

# ==============================================================================
# SCRIPT DE RESETEO Y CONSTRUCCIÓN TOTAL - GTA INTELLIGENCE
# ------------------------------------------------------------------------------
# Este script DEMUELE la estructura actual y construye la versión
# limpia y funcional del MVP desde cero.
# ==============================================================================

echo "🛑 DETENIENDO Y ELIMINANDO CUALQUIER CONTENEDOR ANTERIOR..."
docker compose down --volumes --remove-orphans 2>/dev/null

echo "🔥 FASE 1: DEMOLICIÓN CONTROLADA..."
# Borrar todo EXCEPTO este mismo script
find . -maxdepth 1 ! -name 'reset_and_build.sh' -exec rm -rf {} +
echo "✅ Terreno limpio."

echo "🚀 FASE 2: CONSTRUCCIÓN DEL ESQUELETO DEL PROYECTO..."
mkdir -p app/templates
mkdir -p logs
mkdir -p uploads

# --- requirements.txt ---
echo "-> Creando requirements.txt..."
cat << EOF > requirements.txt
Flask==2.3.3
gunicorn==21.2.0
Werkzeug==2.3.7
click==8.1.7
python-dotenv==1.0.0
Flask-SQLAlchemy==3.1.1
Flask-Migrate==4.0.5
Flask-Login==0.6.3
google-cloud-vision==3.4.0
celery==5.4.0
redis==5.0.4
EOF

# --- docker-compose.yml ---
echo "-> Creando docker-compose.yml..."
cat << EOF > docker-compose.yml
services:
  web:
    build: .
    ports:
      - "5000:5000"
    volumes:
      - .:/app
    environment:
      - FLASK_ENV=development
      - FLASK_APP=run.py
      - GOOGLE_APPLICATION_CREDENTIALS=/app/gta-credentials.json
    command: flask run --host=0.0.0.0
    depends_on:
      - redis

  redis:
    image: "redis:7-alpine"
    ports:
      - "6379:6379"

  worker:
    build: .
    command: celery -A app.tasks.celery worker --loglevel=info
    volumes:
      - .:/app
    environment:
      - GOOGLE_APPLICATION_CREDENTIALS=/app/gta-credentials.json
    depends_on:
      - redis
EOF

# --- Dockerfile ---
echo "-> Creando Dockerfile..."
cat << EOF > Dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "run:app"]
EOF

# --- run.py ---
echo "-> Creando run.py..."
cat << 'EOF' > run.py
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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
EOF

# --- app/__init__.py ---
echo "-> Creando app/__init__.py..."
cat << 'EOF' > app/__init__.py
import os
from flask import Flask
from .extensions import db, migrate, login_manager, celery
from .routes import bp
from .models import User

def create_app():
    app = Flask(__name__, template_folder='templates')
    
    app.config['SECRET_KEY'] = 'gta_super_secret_key'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///gta_app.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Configuración de Celery
    app.config.update(
        CELERY_BROKER_URL='redis://redis:6379/0',
        CELERY_RESULT_BACKEND='redis://redis:6379/0'
    )

    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    
    # Inicializar Celery
    celery.conf.update(app.config)

    app.register_blueprint(bp)

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    with app.app_context():
        db.create_all()

    return app
EOF

# --- app/extensions.py ---
echo "-> Creando app/extensions.py..."
cat << 'EOF' > app/extensions.py
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager
from celery import Celery

db = SQLAlchemy()
migrate = Migrate()
login_manager = LoginManager()
login_manager.login_view = 'main.login'

# Crear instancia de Celery
celery = Celery(__name__, broker='redis://redis:6379/0', backend='redis://redis:6379/0')
EOF

# --- app/models.py ---
echo "-> Creando app/models.py..."
cat << 'EOF' > app/models.py
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from .extensions import db

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
EOF

# --- app/routes.py ---
echo "-> Creando app/routes.py..."
cat << 'EOF' > app/routes.py
from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify, current_app
from flask_login import login_user, logout_user, login_required, current_user
from .models import User
from .extensions import db
from .tasks import process_ocr_task
import os
from werkzeug.utils import secure_filename

bp = Blueprint('main', __name__)

@bp.route('/')
@login_required
def index():
    return render_template('dashboard.html')

@bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
    if request.method == 'POST':
        user = User.query.filter_by(username=request.form.get('username')).first()
        if user is None or not user.check_password(request.form.get('password')):
            flash('Usuario o contraseña inválidos.', 'danger')
            return redirect(url_for('main.login'))
        login_user(user)
        return redirect(url_for('main.index'))
    return render_template('login.html')

@bp.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('main.login'))

@bp.route('/upload', methods=['POST'])
@login_required
def upload():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file:
        filename = secure_filename(file.filename)
        upload_folder = os.path.join(current_app.root_path, '..', 'uploads')
        os.makedirs(upload_folder, exist_ok=True)
        filepath = os.path.join(upload_folder, filename)
        file.save(filepath)
        
        # Lanzar tarea asíncrona
        task = process_ocr_task.delay(filepath)
        return jsonify({'task_id': task.id})
    return jsonify({'error': 'File upload failed'}), 500
EOF

# --- app/tasks.py ---
echo "-> Creando app/tasks.py..."
cat << 'EOF' > app/tasks.py
from .extensions import celery
from google.cloud import vision
import os
import logging

logger = logging.getLogger(__name__)

@celery.task
def process_ocr_task(filepath):
    """Tarea de Celery para procesar una imagen con Google Cloud Vision."""
    logger.info(f"Procesando archivo: {filepath}")
    try:
        client = vision.ImageAnnotatorClient()
        with open(filepath, 'rb') as image_file:
            content = image_file.read()
        
        image = vision.Image(content=content)
        response = client.text_detection(image=image)
        
        if response.error.message:
            raise Exception(response.error.message)
            
        text = response.text_annotations[0].description if response.text_annotations else "No text found"
        logger.info("OCR completado exitosamente.")
        # Aquí podrías guardar el 'text' en la base de datos
        
    except Exception as e:
        logger.error(f"Error en la tarea de OCR: {e}", exc_info=True)
    finally:
        # Limpiar el archivo subido
        if os.path.exists(filepath):
            os.remove(filepath)
            logger.info(f"Archivo temporal eliminado: {filepath}")
    
    return text
EOF

# --- app/templates/login.html ---
echo "-> Creando app/templates/login.html..."
# (Usando el login.html que ya teníamos)
cat << 'EOF' > app/templates/login.html
<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Acceso Seguro - GTA Intelligence</title><script src="https://cdn.tailwindcss.com"></script><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"><style>body { font-family: 'Inter', sans-serif; }.gradient-bg { background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%); }.form-input { background-color: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.2); transition: all 0.3s ease; }.form-input:focus { background-color: rgba(255, 255, 255, 0.1); border: 1px solid #0066ff; box-shadow: 0 0 15px rgba(0, 102, 255, 0.5); }.btn-primary { background: linear-gradient(135deg, #0066ff, #00d4aa); transition: all 0.3s ease; box-shadow: 0 10px 20px -10px rgba(0, 102, 255, 0.5); }.btn-primary:hover { transform: translateY(-3px); box-shadow: 0 10px 30px -10px rgba(0, 102, 255, 0.8); }.glass-card { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); }</style></head><body class="gradient-bg text-white"><div class="min-h-screen flex items-center justify-center p-4"><div class="w-full max-w-md"><div class="glass-card rounded-2xl p-8 shadow-2xl"><div class="text-center mb-8"><h1 class="text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">GTA Intelligence</h1><p class="text-gray-400 mt-2">Acceso Exclusivo a la Plataforma</p></div>{% with messages = get_flashed_messages(with_categories=true) %}{% if messages %}{% for category, message in messages %}<div class="bg-{{ 'red' if category == 'danger' else 'green' }}-500/20 text-{{ 'red' if category == 'danger' else 'green' }}-300 border border-{{ 'red' if category == 'danger' else 'green' }}-500/30 text-sm rounded-lg p-3 mb-4" role="alert">{{ message }}</div>{% endfor %}{% endif %}{% endwith %}<form action="{{ url_for('main.login') }}" method="POST"><div class="space-y-6"><div><label for="username" class="block text-sm font-medium text-gray-300 mb-2">Usuario</label><input type="text" id="username" name="username" required class="form-input w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 focus:outline-none" placeholder="ej: nodia.cto"></div><div><label for="password" class="block text-sm font-medium text-gray-300 mb-2">Contraseña</label><input type="password" id="password" name="password" required class="form-input w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 focus:outline-none" placeholder="••••••••••••"></div></div><div class="mt-8"><button type="submit" class="btn-primary w-full py-3 rounded-lg font-bold text-white uppercase tracking-wider">Ingresar</button></div></form></div></div></div></body></html>
EOF

# --- app/templates/dashboard.html ---
echo "-> Creando app/templates/dashboard.html..."
# (Usando el dashboard.html que ya teníamos)
cat << 'EOF' > app/templates/dashboard.html
<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Dashboard - GTA OCR System</title><style>*{ margin: 0; padding: 0; box-sizing: border-box; }body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f0f2f5; min-height: 100vh; padding: 20px; }.container { max-width: 1400px; margin: 0 auto; }.header { background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%); color: white; padding: 20px 30px; border-radius: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }.main-content { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }.card { background: white; border-radius: 15px; padding: 30px; box-shadow: 0 5px 15px rgba(0,0,0,0.05); }.log-section { grid-column: 1 / -1; background: #1a1a1a; border-radius: 15px; padding: 20px; color: #00ff00; font-family: 'Courier New', monospace; font-size: 0.9rem; max-height: 300px; overflow-y: auto; }.btn { background: linear-gradient(135deg, #3498db, #2980b9); color: white; border: none; padding: 12px 25px; border-radius: 10px; cursor: pointer; font-size: 1rem; font-weight: 600; transition: all 0.3s ease; text-decoration: none; display: block; text-align: center; }.btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(52, 152, 219, 0.4); }.btn-logout { background: linear-gradient(135deg, #e74c3c, #c0392b); }.ocr-result { background: #f8f9fa; border-radius: 10px; padding: 20px; margin-top: 20px; border-left: 4px solid #28a745; }.spinner { border: 4px solid rgba(0, 0, 0, 0.1); width: 36px; height: 36px; border-radius: 50%; border-left-color: #3498db; animation: spin 1s ease infinite; margin: 20px auto; }@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style></head><body><div class="container"><header class="header"><div><h1 style="font-size: 1.5rem; font-weight: bold;">🚀 GTA OCR Dashboard</h1><p style="opacity: 0.9;">Bienvenido, {{ current_user.username }}</p></div><a href="{{ url_for('main.logout') }}" class="btn btn-logout"><i data-lucide="log-out" style="width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin-right: 8px;"></i>Cerrar Sesión</a></header><div class="main-content"><div class="card"><form id="upload-form"><input type="file" id="file-input" name="file" accept="image/*" style="display: none;"><div class="upload-zone" style="text-align: center; padding: 20px; border: 2px dashed #dee2e6; border-radius: 10px; cursor: pointer;" onclick="document.getElementById('file-input').click();"><div class="upload-icon" style="width: 60px; height: 60px; margin: 0 auto 15px; background: #3498db; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;"><i data-lucide="upload" style="width: 30px; height: 30px;"></i></div><h3>Procesar Telegrama Real</h3><p style="font-size: 0.9rem; color: #6c757d; margin-top: 10px;">Haz clic aquí para seleccionar una imagen</p><p id="file-name" style="font-size: 0.8rem; color: #28a745; margin-top: 5px; font-weight: bold;"></p></div><button type="submit" class="btn" style="width: 100%; margin-top: 20px;">Procesar Imagen Seleccionada</button></form></div><div class="card"><h3>📊 Resultados del Procesamiento</h3><div id="resultsContainer"><p id="resultsPlaceholder" style="color: #6c757d; text-align: center; margin-top: 20px;">Los resultados del OCR aparecerán aquí...</p><div class="spinner" id="loadingSpinner" style="display: none;"></div><div id="ocrResults" style="display: none;"><div class="ocr-result"><h4>📝 Texto Extraído por la IA</h4><pre id="extractedText" style="white-space: pre-wrap; font-family: 'Courier New', monospace; margin-top: 10px;"></pre></div></div></div></div><div class="log-section"><h3 style="color: #00ff00; margin-bottom: 15px;">📋 Logs del Frontend</h3><div id="logContainer"></div></div></div></div><script src="https://cdnjs.cloudflare.com/ajax/libs/lucide/0.263.1/umd/lucide.js"></script><script>lucide.createIcons();const uploadForm=document.getElementById("upload-form"),fileInput=document.getElementById("file-input"),logContainer=document.getElementById("logContainer"),fileNameDisplay=document.getElementById("file-name"),placeholder=document.getElementById("resultsPlaceholder"),spinner=document.getElementById("loadingSpinner"),resultsDiv=document.getElementById("ocrResults"),extractedText=document.getElementById("extractedText");let isProcessing=!1;function logToConsole(e,t="INFO"){const o=new Date().toISOString().slice(0,19).replace("T"," "),n=document.createElement("div");n.textContent=`{"time": "${o}", "level": "${t}", "name": "gta_frontend", "message": "${e}"}`,logContainer.appendChild(n),logContainer.scrollTop=logContainer.scrollHeight}fileInput.addEventListener("change",()=>{fileNameDisplay.textContent=fileInput.files.length>0?`Seleccionado: ${fileInput.files[0].name}`:""}),uploadForm.addEventListener("submit",async function(e){e.preventDefault(),isProcessing?logToConsole("Ya hay un proceso en curso.","WARN"):fileInput.files[0]?(isProcessing=!0,logToConsole(`Enviando archivo: ${fileInput.files[0].name}`),placeholder.style.display="none",resultsDiv.style.display="none",spinner.style.display="block",(()=>{const e=new FormData;e.append("file",fileInput.files[0]);try{fetch("{{ url_for('main.upload') }}",{method:"POST",body:e}).then(e=>e.json()).then(e=>{spinner.style.display="none",e.task_id?(logToConsole(`Procesamiento en cola. ID de tarea: ${e.task_id}`),logToConsole("Revisa la terminal del worker para ver el resultado del OCR.")):(logToConsole(`Error del servidor: ${e.error||"Error desconocido"}`,"ERROR"),placeholder.textContent=`Error: ${e.error||"No se pudo procesar."}`,placeholder.style.display="block")})}catch(e){console.error("Error en el fetch:",e),spinner.style.display="none",logToConsole(`Error de conexión: ${e.message}`,"ERROR"),placeholder.textContent="Error de conexión con el servidor.",placeholder.style.display="block"}finally{isProcessing=!1}})()):logToConsole("Por favor, selecciona un archivo primero.","ERROR")}),logToConsole("Dashboard cargado. Sistema listo.");</script></body></html>
EOF

echo "✅ FASE 2 COMPLETADA: Estructura del proyecto creada exitosamente."
echo ""
echo "---"
echo "➡️  PRÓXIMOS PASOS:"
echo "1. Asegúrate de tener un archivo 'gta-credentials.json' en esta carpeta."
echo "2. Levanta el sistema: docker compose up --build"
echo "3. En OTRA terminal, crea tu usuario: docker compose exec web flask create-admin <usuario> <email> <contraseña>"
echo "4. Abre http://localhost:5000 en tu navegador."

