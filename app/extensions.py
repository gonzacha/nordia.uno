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
