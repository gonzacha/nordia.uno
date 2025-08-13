import json
import os
from app import create_app, db
from app.models import Municipio, Alianza, Candidato

# --- CONFIGURACIÓN ---
# Creamos una instancia de la aplicación Flask para tener acceso a la base de datos
app = create_app()

# Obtenemos la ruta absoluta del directorio donde se encuentra este script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Construimos la ruta al archivo JSON provincial completo
JSON_FILE_PATH = os.path.join(BASE_DIR, 'data', 'datos_provinciales_completos.json')

def limpiar_base_de_datos():
    """
    Borra todos los datos existentes en las tablas electorales para evitar duplicados.
    """
    print("--- [LIMPIANDO TABLAS ELECTORALES EXISTENTES] ---")
    # Borramos en orden inverso para respetar las dependencias (foreign keys)
    db.session.query(Candidato).delete()
    db.session.query(Alianza).delete()
    db.session.query(Municipio).delete()
    db.session.commit()
    print("✅ Tablas limpiadas con éxito.")

def cargar_datos_desde_json():
    """
    Abre y carga el contenido del archivo JSON provincial.
    """
    if not os.path.exists(JSON_FILE_PATH):
        print(f"❌ ERROR: No se encontró el archivo de datos en: {JSON_FILE_PATH}")
        return None
    
    with open(JSON_FILE_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    return data.get('municipios', [])

def poblar_base_de_datos():
    """
    Lee los datos del JSON y los inserta en la base de datos.
    """
    with app.app_context():
        
        limpiar_base_de_datos()
        
        municipios_data = cargar_datos_desde_json()
        if not municipios_data:
            return

        print("\n--- [INICIANDO CARGA DE DATOS EN LA BASE DE DATOS] ---")
        total_municipios = len(municipios_data)
        
        for i, municipio_data in enumerate(municipios_data):
            nombre_municipio = municipio_data.get('nombre_localidad')
            if not nombre_municipio:
                continue

            print(f"[{i+1}/{total_municipios}] Procesando municipio: {nombre_municipio}...")

            # 1. Crear el objeto Municipio
            nuevo_municipio = Municipio(nombre=nombre_municipio)
            db.session.add(nuevo_municipio)

            # 2. Iterar sobre las alianzas de ese municipio
            for alianza_data in municipio_data.get('alianzas', []):
                nueva_alianza = Alianza(
                    nombre=alianza_data.get('nombre_alianza'),
                    municipio=nuevo_municipio # Asignamos la relación
                )
                db.session.add(nueva_alianza)

                # 3. Iterar sobre los candidatos de esa alianza
                candidatos_data = alianza_data.get('candidatos', {})
                
                # Procesar cada tipo de cargo
                cargos = {
                    "intendente": [candidatos_data.get("intendente")],
                    "viceintendente": [candidatos_data.get("viceintendente")],
                    "concejales_titulares": candidatos_data.get("concejales_titulares", []),
                    "concejales_suplentes": candidatos_data.get("concejales_suplentes", [])
                }
                
                for cargo, lista_candidatos in cargos.items():
                    if not lista_candidatos:
                        continue
                    
                    for candidato_info in lista_candidatos:
                        # Verificamos que el candidato_info no sea nulo Y que tenga un nombre
                        if not candidato_info or not candidato_info.get('nombre'):
                            continue  # Si no tiene nombre, lo ignoramos y pasamos al siguiente
                        
                        nuevo_candidato = Candidato(
                            nombre=candidato_info.get('nombre'),
                            dni=candidato_info.get('dni'),
                            cargo=cargo,
                            orden=candidato_info.get('orden'),
                            alianza=nueva_alianza # Asignamos la relación
                        )
                        db.session.add(nuevo_candidato)

        # 4. Guardar todos los cambios en la base de datos
        print("\n💾 Guardando todos los cambios en la base de datos...")
        db.session.commit()
        print("🎉 ¡Éxito! La base de datos ha sido poblada con los datos de toda la provincia.")

if __name__ == "__main__":
    poblar_base_de_datos()