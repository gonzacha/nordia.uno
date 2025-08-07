from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from .extensions import db

# --- MODELO DE USUARIOS (EXISTENTE) ---
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

# --- NUEVOS MODELOS ELECTORALES ---

class Municipio(db.Model):
    __tablename__ = 'municipios'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), unique=True, nullable=False)
    
    # Relación: Un municipio tiene muchas alianzas
    alianzas = db.relationship('Alianza', back_populates='municipio', cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Municipio {self.nombre}>'

class Alianza(db.Model):
    __tablename__ = 'alianzas'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(200), nullable=False)
    
    municipio_id = db.Column(db.Integer, db.ForeignKey('municipios.id'), nullable=False)
    
    # Relación: Una alianza pertenece a un municipio
    municipio = db.relationship('Municipio', back_populates='alianzas')
    # Relación: Una alianza tiene muchos candidatos
    candidatos = db.relationship('Candidato', back_populates='alianza', cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Alianza {self.nombre} en {self.municipio.nombre}>'

class Candidato(db.Model):
    __tablename__ = 'candidatos'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(200), nullable=False)
    dni = db.Column(db.String(20), nullable=True)
    cargo = db.Column(db.String(50), nullable=False) # ej: "intendente", "concejales_titulares"
    orden = db.Column(db.Integer, nullable=True) # Para concejales
    
    alianza_id = db.Column(db.Integer, db.ForeignKey('alianzas.id'), nullable=False)
    
    # Relación: Un candidato pertenece a una alianza
    alianza = db.relationship('Alianza', back_populates='candidatos')

    def __repr__(self):
        return f'<Candidato {self.nombre} ({self.cargo})>'