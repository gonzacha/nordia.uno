import os
from flask import Flask
from flask_cors import CORS
from .extensions import db, migrate, login_manager, celery
from .routes import bp
from .models import User

def create_app():
    app = Flask(__name__, template_folder='templates')
    
    # --- CONFIGURACIÓN DE CORS PARA DESARROLLO/INTEGRACIÓN + PRODUCCIÓN ---
    # Permitimos llamadas a /api/* desde los orígenes locales de dev y producción
    CORS(
        app,
        resources={r"/api/*": {"origins": [
            "http://localhost:8080",
            "http://127.0.0.1:8080",
            "http://localhost:5001",
            "http://127.0.0.1:5001",
            "https://gt.nordia.uno"  # ← AGREGADO para producción
        ]}},
        supports_credentials=True
    )
    
    # --- CONFIGURACIÓN REBRANDING ---
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'gt_super_secret_key')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///gt_app.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['DEBUG'] = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    
    # Configuración de Celery
    app.config.update(
        CELERY_BROKER_URL=os.environ.get('CELERY_BROKER_URL', 'redis://redis:6379/0'),
        CELERY_RESULT_BACKEND=os.environ.get('CELERY_RESULT_BACKEND', 'redis://redis:6379/0')
    )

    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    
    celery.conf.update(app.config)
    app.register_blueprint(bp)

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    # Solo crear tablas en desarrollo o si no existen
    with app.app_context():
        if app.config['DEBUG'] or not os.path.exists('instance/gt_app.db'):
            db.create_all()

    return app