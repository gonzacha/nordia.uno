from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify, current_app, send_from_directory, abort
from flask_login import login_user, logout_user, login_required, current_user
# MODIFICACIÓN: Añadimos los nuevos modelos que usará la API
from .models import User, Municipio, Alianza, Candidato, Telegrama, Validacion
from .extensions import db
from .tasks import process_ocr_task
import os
from werkzeug.utils import secure_filename

bp = Blueprint('main', __name__)

# --- RUTAS DE USUARIO Y APP (TU CÓDIGO ORIGINAL - SIN CAMBIOS) ---

@bp.route('/')
def index():
    """Servir el frontend ES6 modular como dashboard principal."""
    frontend_dir = os.path.join(current_app.root_path, '..', 'centro_de_control')
    index_path = os.path.join(frontend_dir, 'index.html')
    if not os.path.exists(index_path):
        return jsonify({
            'error': 'Frontend no encontrado',
            'detail': index_path
        }), 500
    return send_from_directory(frontend_dir, 'index.html')

# Rutas para servir assets del frontend modular (sin interferir con /api/*)
@bp.route('/index.html')
def serve_index_html():
    frontend_dir = os.path.join(current_app.root_path, '..', 'centro_de_control')
    return send_from_directory(frontend_dir, 'index.html')

@bp.route('/style.css')
def serve_style_css():
    frontend_dir = os.path.join(current_app.root_path, '..', 'centro_de_control')
    return send_from_directory(frontend_dir, 'style.css')

@bp.route('/src/<path:filename>')
def serve_frontend_src(filename):
    # Evitar capturar rutas de la API
    if filename.startswith('api/'):
        abort(404)
    src_dir = os.path.join(current_app.root_path, '..', 'centro_de_control', 'src')
    return send_from_directory(src_dir, filename)

def login():
    return redirect(url_for('main.index'))

@bp.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('main.index'))

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

# --- RUTAS DE DASHBOARD DE OPERADOR ---

@bp.route('/operator')
@login_required
def operator_dashboard():
    """Dashboard de operador para validación de telegramas."""
    estado = request.args.get('estado')
    municipio = request.args.get('municipio')
    query = Telegrama.query
    if estado:
        query = query.filter_by(estado=estado)
    if municipio:
        query = query.filter_by(municipio=municipio)

    telegramas = (
        query.order_by(Telegrama.prioridad.desc(), Telegrama.created_at).all()
    )

    return render_template(
        'operator_dashboard.html',
        telegramas=telegramas,
        estado=estado,
        municipio=municipio,
    )

@bp.route('/telegramas/<int:telegrama_id>')
@login_required
def validar_telegrama(telegrama_id):
    """Vista de validación lado a lado para un telegrama específico."""
    telegrama = Telegrama.query.get_or_404(telegrama_id)
    return render_template('validacion.html', telegrama=telegrama)

@bp.route('/telegramas/<int:telegrama_id>/accion', methods=['POST'])
@login_required
def accion_telegrama(telegrama_id):
    """Procesar acciones del operador sobre un telegrama."""
    telegrama = Telegrama.query.get_or_404(telegrama_id)
    accion = request.form.get('accion')
    comentario = request.form.get('comentario')

    if accion == 'aprobar':
        telegrama.estado = 'ok'
    elif accion == 'rechazar':
        telegrama.estado = 'error'
    elif accion == 'reprocesar':
        telegrama.estado = 'pendiente'
    elif accion == 'corregir':
        for key in request.form:
            if key.startswith('datos[') and key.endswith(']'):
                field = key[6:-1]
                if telegrama.datos is None:
                    telegrama.datos = {}
                telegrama.datos[field] = request.form.get(key)
        telegrama.estado = 'ok'

    validacion = Validacion(
        telegrama=telegrama,
        operador=current_user,
        estado=accion,
        comentario=comentario,
    )
    db.session.add(validacion)
    db.session.commit()
    flash('Telegrama actualizado', 'success')
    return redirect(url_for('main.operator_dashboard'))

@bp.route('/api/telegramas/counts', methods=['GET'])
def telegram_counts():
    """API para contadores en tiempo real del dashboard."""
    counts = {
        'pendiente': Telegrama.query.filter_by(estado='pendiente').count(),
        'dudoso': Telegrama.query.filter_by(estado='dudoso').count(),
        'error': Telegrama.query.filter_by(estado='error').count(),
        'ok': Telegrama.query.filter_by(estado='ok').count(),
    }
    return jsonify(counts)

@bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.operator_dashboard'))
    if request.method == 'POST':
        user = User.query.filter_by(username=request.form.get('username')).first()
        if user is None or not user.check_password(request.form.get('password')):
            flash('Usuario o contraseña inválidos.', 'danger')
            return redirect(url_for('main.login'))
        login_user(user)
        return redirect(url_for('main.operator_dashboard'))
    return render_template('login.html')

@bp.route('/admin-login', methods=['GET', 'POST'])
def admin_login():
    if current_user.is_authenticated:
        return redirect(url_for('main.operator'))
    if request.method == 'POST':
        user = User.query.filter_by(username=request.form.get('username')).first()
        if user is None or not user.check_password(request.form.get('password')):
            flash('Usuario o contraseña inválidos.', 'danger')
            return redirect(url_for('main.admin_login'))
        login_user(user)
        return redirect(url_for('main.operator'))
    return render_template('login.html')
