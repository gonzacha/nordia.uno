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
