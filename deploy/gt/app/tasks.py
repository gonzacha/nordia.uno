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
