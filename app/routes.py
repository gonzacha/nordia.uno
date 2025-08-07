from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify, current_app
from flask_login import login_user, logout_user, login_required, current_user
# MODIFICACIÓN: Añadimos los nuevos modelos que usará la API
from .models import User, Municipio, Alianza, Candidato
from .extensions import db
from .tasks import process_ocr_task
import os
from werkzeug.utils import secure_filename

bp = Blueprint('main', __name__)

# --- RUTAS DE USUARIO Y APP (TU CÓDIGO ORIGINAL - SIN CAMBIOS) ---

@bp.route('/')
def index():
    """
    Ruta que puede servir tanto web como API según el contexto.
    """
    # Detectar si la petición pide una respuesta JSON
    if request.headers.get('Accept') == 'application/json':
        return jsonify({
            'message': 'GT Intelligence API v1.0',
            'endpoints': {
                'municipios': url_for('main.get_municipios', _external=True),
                'health': url_for('main.api_health', _external=True)
            }
        })
    
    # Si no es una petición de API, aplicar la lógica web de siempre
    if not current_user.is_authenticated:
        return redirect(url_for('main.login'))
    
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


# --- ENDPOINT DE API PARA LISTAR MUNICIPIOS (YA LO TENÍAS) ---

@bp.route('/api/municipios', methods=['GET'])
def get_municipios():
    """
    Devuelve una lista de todos los municipios en la base de datos.
    """
    try:
        municipios_db = Municipio.query.order_by(Municipio.nombre).all()
        lista_municipios = [{'id': m.id, 'nombre': m.nombre} for m in municipios_db]
        return jsonify(municipalities=lista_municipios)
    except Exception as e:
        return jsonify(error=str(e)), 500

# --- ENDPOINT PARA OBTENER DETALLES DE UN MUNICIPIO (YA LO TENÍAS) ---

@bp.route('/api/municipios/<int:municipio_id>', methods=['GET'])
def get_municipio_detalle(municipio_id):
    """
    Devuelve los detalles completos (alianzas y candidatos) de un municipio específico.
    """
    try:
        # 1. Busca el municipio en la DB por su ID. Si no lo encuentra, devuelve un error 404.
        municipio = Municipio.query.get_or_404(municipio_id)
        
        # 2. Prepara la estructura de la respuesta
        resultado = {
            'id': municipio.id,
            'nombre': municipio.nombre,
            'alianzas': []
        }

        # 3. Recorre las alianzas relacionadas con este municipio
        for alianza in municipio.alianzas:
            alianza_data = {
                'id': alianza.id,
                'nombre': alianza.nombre,
                'candidatos': {
                    "intendente": None,
                    "viceintendente": None,
                    "concejales_titulares": [],
                    "concejales_suplentes": []
                }
            }
            
            # 4. Recorre los candidatos de cada alianza y los agrupa por cargo
            for candidato in alianza.candidatos:
                candidato_data = {
                    'id': candidato.id,
                    'nombre': candidato.nombre,
                    'dni': candidato.dni,
                    'orden': candidato.orden
                }
                if candidato.cargo in ["intendente", "viceintendente"]:
                    alianza_data['candidatos'][candidato.cargo] = candidato_data
                elif candidato.cargo in alianza_data['candidatos']:
                    alianza_data['candidatos'][candidato.cargo].append(candidato_data)
            
            resultado['alianzas'].append(alianza_data)

        # 5. Devuelve el objeto completo como JSON
        return jsonify(municipio=resultado)

    except Exception as e:
        return jsonify(error=str(e)), 500


# --- FASE 1: PREPARACIÓN PARA MIGRACIÓN A API PURA (NUEVO CÓDIGO) ---

@bp.route('/api/health', methods=['GET'])
def api_health():
    """Nueva ruta de health check para la API."""
    return jsonify({
        'status': 'ok',
        'message': 'GT Intelligence API is running',
        'version': '1.0'
    })

@bp.route('/api/dev-access', methods=['GET'])
def dev_access():
    """Ruta temporal para desarrollo - ELIMINAR en producción."""
    return jsonify({
        'message': 'API accesible sin autenticación para desarrollo',
        'endpoints': ['/api/municipios', '/api/municipios/<id>'],
        'warning': 'Esta ruta debe eliminarse en producción'
    })