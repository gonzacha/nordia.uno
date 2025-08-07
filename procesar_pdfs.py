import os
import json
import pathlib
import PyPDF2
import google.generativeai as genai
import time

# --- CONFIGURACIÓN ---
# Pega tu API Key aquí. Para más seguridad, es mejor usar variables de entorno.
# Por ahora, la pegamos aquí para que sea más fácil.
# ¡IMPORTANTE! No subas este archivo a GitHub con tu API Key visible.
GEMINI_API_KEY = "AIzaSyCTdOfxMS4Byw2an456t2QcN7lbOyk8Ijk"

# Rutas a nuestras carpetas y archivos
BASE_DIR = pathlib.Path(__file__).parent.resolve()
PDFS_DIR = BASE_DIR / "data_source_pdfs"
OUTPUT_JSON_PATH = BASE_DIR / "data" / "datos_provinciales_completos.json"

# Configuración del modelo de IA
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

def extract_text_from_pdf(pdf_path):
    """Extrae el texto de un archivo PDF."""
    try:
        with open(pdf_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            text = ""
            for page in reader.pages:
                text += page.extract_text()
            return text
    except Exception as e:
        print(f"  ❌ Error al leer el PDF {pdf_path.name}: {e}")
        return None

def get_json_from_gemini(text, pdf_name):
    """Envía el texto a la API de Gemini y le pide que devuelva un JSON estructurado."""
    # Extraemos el nombre de la localidad del nombre del archivo para guiar a la IA
    locality_name = pdf_name.split('-', 1)[1].replace('.pdf', '').replace('-', ' ').upper()
    
    prompt = f"""
    Analiza el siguiente texto extraído de un documento PDF oficial de Corrientes, Argentina, que corresponde a la localidad de {locality_name}.

    Extrae todas las alianzas/partidos y sus candidatos para cada cargo (Intendente, Viceintendente, Concejales Titulares y Suplentes) con sus nombres completos y DNI.

    Estructura el resultado en un único objeto JSON. El formato debe ser este, y solo este:

    {{
      "nombre_localidad": "{locality_name}",
      "alianzas": [
        {{
          "nombre_alianza": "NOMBRE DE LA ALIANZA/PARTIDO",
          "candidatos": {{
            "intendente": {{ "nombre": "NOMBRE COMPLETO", "dni": "NUMERO" }},
            "viceintendente": {{ "nombre": "NOMBRE COMPLETO", "dni": "NUMERO" }},
            "concejales_titulares": [
              {{ "orden": 1, "nombre": "NOMBRE COMPLETO", "dni": "NUMERO" }}
            ]
          }}
        }}
      ]
    }}

    Texto extraído del PDF:
    ---
    {text}
    ---

    Si un cargo no está presente, omite la clave o déjala como null. Normaliza los nombres a mayúsculas y limpia los DNI para que solo contengan números. Devuelve solo el código JSON, sin explicaciones adicionales.
    """
    
    try:
        response = model.generate_content(prompt)
        # Limpiamos la respuesta para asegurarnos de que sea solo JSON
        json_text = response.text.strip().replace("```json", "").replace("```", "")
        return json.loads(json_text)
    except Exception as e:
        print(f"  ❌ Error en la API de Gemini o al procesar el JSON para {pdf_name}: {e}")
        return None

def main():
    """Función principal que orquesta todo el proceso."""
    print("🚀 Iniciando el procesador automático de PDFs electorales...")
    
    pdf_files = sorted([f for f in PDFS_DIR.iterdir() if f.suffix == '.pdf'])
    total_files = len(pdf_files)
    print(f"📂 Se encontraron {total_files} archivos PDF para procesar.")
    
    todos_los_municipios = []
    
    for i, pdf_path in enumerate(pdf_files):
        print(f"\n[{i+1}/{total_files}] Procesando: {pdf_path.name}...")
        
        # 1. Extraer texto del PDF
        print("  - Extrayendo texto...")
        texto = extract_text_from_pdf(pdf_path)
        
        if texto:
            # 2. Enviar a Gemini para obtener el JSON
            print("  - Enviando a la IA para análisis...")
            municipio_data = get_json_from_gemini(texto, pdf_path.name)
            
            if municipio_data:
                todos_los_municipios.append(municipio_data)
                print(f"  ✅ ¡Éxito! Datos para '{municipio_data.get('nombre_localidad')}' procesados.")
        
        # Pausa para no saturar la API
        time.sleep(1) 

    # 3. Guardar el resultado consolidado
    final_json = {
        "provincia": "Corrientes",
        "eleccion": "Municipal 2025",
        "municipios": todos_los_municipios
    }
    
    with open(OUTPUT_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(final_json, f, ensure_ascii=False, indent=2)
        
    print(f"\n🎉 ¡Proceso completado! Se han procesado {len(todos_los_municipios)} municipios.")
    print(f"📄 El archivo consolidado se ha guardado en: {OUTPUT_JSON_PATH}")

if __name__ == "__main__":
    main()