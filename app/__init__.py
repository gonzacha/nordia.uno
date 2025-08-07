import os
from flask import Flask
from flask_cors import CORS
from .extensions import db, migrate, login_manager, celery
from .routes import bp
from .models import User

def create_app():
    app = Flask(__name__, template_folder='templates')
    
    # --- CONFIGURACIÓN DE CORS ESPECÍFICA Y SEGURA ---
    # Permite peticiones a las rutas /api/* únicamente desde el origen http://localhost:8080
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:8080"}})
    
    # --- REBRANDING APLICADO ---
    app.config['SECRET_KEY'] = 'gt_super_secret_key'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///gt_app.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Configuración de Celery
    app.config.update(
        CELERY_BROKER_URL='redis://redis:6379/0',
        CELERY_RESULT_BACKEND='redis://redis:6379/0'
    )

    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    
    celery.conf.update(app.config)
    app.register_blueprint(bp)

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    with app.app_context():
        db.create_all()

    return app
