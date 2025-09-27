#!/usr/bin/env python3
"""
CSV Processor para Nordia ISP Suite
Maneja validación, filtrado y procesamiento de archivos CSV de morosos
"""

import csv
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple, Union
from dataclasses import dataclass, asdict
from datetime import datetime
import chardet
import pandas as pd

logger = logging.getLogger(__name__)


@dataclass
class MorosoRecord:
    """Representa un registro de cliente moroso"""
    username: str
    dni: str
    nombre: str
    dias_mora: int
    monto_deuda: float
    excepcion: bool = False
    telefono: Optional[str] = None
    
    def __post_init__(self):
        """Validaciones después de inicialización"""
        if not self.username or not isinstance(self.username, str):
            raise ValueError("Username es requerido y debe ser string")
        
        if not self.dni or not isinstance(self.dni, str):
            raise ValueError("DNI es requerido y debe ser string")
            
        if not isinstance(self.dias_mora, int) or self.dias_mora < 0:
            raise ValueError("dias_mora debe ser un entero positivo")
            
        if not isinstance(self.monto_deuda, (int, float)) or self.monto_deuda < 0:
            raise ValueError("monto_deuda debe ser un número positivo")


@dataclass
class ProcessingStats:
    """Estadísticas del procesamiento"""
    total_records: int = 0
    valid_records: int = 0
    invalid_records: int = 0
    filtered_records: int = 0
    final_records: int = 0
    errors: List[str] = None
    
    def __post_init__(self):
        if self.errors is None:
            self.errors = []


class CSVProcessor:
    """Procesador principal de archivos CSV de morosos"""
    
    # Columnas requeridas en el CSV
    REQUIRED_COLUMNS = ['username', 'dni', 'nombre', 'dias_mora', 'monto_deuda']
    OPTIONAL_COLUMNS = ['excepcion', 'telefono']
    ALL_COLUMNS = REQUIRED_COLUMNS + OPTIONAL_COLUMNS
    
    # Encodings soportados
    SUPPORTED_ENCODINGS = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']
    
    def __init__(self, 
                 min_dias_mora: int = 1, 
                 max_invalid_percentage: float = 10.0,
                 auto_detect_encoding: bool = True):
        """
        Inicializa el procesador CSV
        
        Args:
            min_dias_mora: Días mínimos de mora para incluir en el resultado
            max_invalid_percentage: % máximo de registros inválidos permitido
            auto_detect_encoding: Si detectar automáticamente el encoding
        """
        self.min_dias_mora = min_dias_mora
        self.max_invalid_percentage = max_invalid_percentage
        self.auto_detect_encoding = auto_detect_encoding
        self.stats = ProcessingStats()
        
        logger.info(f"CSVProcessor inicializado: min_dias_mora={min_dias_mora}")
    
    def detect_encoding(self, file_path: Path) -> str:
        """
        Detecta el encoding de un archivo CSV
        
        Args:
            file_path: Ruta al archivo CSV
            
        Returns:
            Encoding detectado o 'utf-8' por defecto
        """
        try:
            with open(file_path, 'rb') as f:
                raw_data = f.read()
                result = chardet.detect(raw_data)
                detected_encoding = result.get('encoding', 'utf-8')
                confidence = result.get('confidence', 0)
                
                logger.info(f"Encoding detectado: {detected_encoding} (confianza: {confidence:.2f})")
                
                # Si la confianza es muy baja, usar utf-8
                if confidence < 0.7:
                    logger.warning(f"Confianza baja en encoding detectado, usando utf-8")
                    return 'utf-8'
                
                return detected_encoding
                
        except Exception as e:
            logger.error(f"Error detectando encoding: {e}")
            return 'utf-8'
    
    def read_csv_with_encoding(self, file_path: Path, encoding: str = None) -> pd.DataFrame:
        """
        Lee un archivo CSV probando diferentes encodings
        
        Args:
            file_path: Ruta al archivo CSV
            encoding: Encoding específico a usar
            
        Returns:
            DataFrame de pandas con los datos
            
        Raises:
            ValueError: Si no se puede leer el archivo con ningún encoding
        """
        if encoding:
            encodings_to_try = [encoding]
        elif self.auto_detect_encoding:
            detected = self.detect_encoding(file_path)
            encodings_to_try = [detected] + [enc for enc in self.SUPPORTED_ENCODINGS if enc != detected]
        else:
            encodings_to_try = self.SUPPORTED_ENCODINGS
        
        for enc in encodings_to_try:
            try:
                logger.info(f"Intentando leer CSV con encoding: {enc}")
                df = pd.read_csv(file_path, encoding=enc)
                logger.info(f"CSV leído exitosamente con encoding: {enc}")
                return df
                
            except UnicodeDecodeError as e:
                logger.warning(f"Fallo encoding {enc}: {e}")
                continue
            except Exception as e:
                logger.error(f"Error leyendo CSV con {enc}: {e}")
                continue
        
        raise ValueError(f"No se pudo leer el archivo {file_path} con ningún encoding soportado")
    
    def validate_columns(self, df: pd.DataFrame) -> Tuple[bool, List[str]]:
        """
        Valida que el DataFrame tenga las columnas requeridas
        
        Args:
            df: DataFrame a validar
            
        Returns:
            Tupla (es_válido, errores)
        """
        errors = []
        columns = set(df.columns.str.lower())
        required = set(col.lower() for col in self.REQUIRED_COLUMNS)
        
        missing = required - columns
        if missing:
            errors.append(f"Faltan columnas requeridas: {', '.join(missing)}")
        
        return len(errors) == 0, errors
    
    def parse_record(self, row: pd.Series) -> Optional[MorosoRecord]:
        """
        Convierte una fila del CSV en un MorosoRecord
        
        Args:
            row: Fila del DataFrame
            
        Returns:
            MorosoRecord o None si hay errores
        """
        try:
            # Normalizar nombres de columnas
            row_dict = {k.lower(): v for k, v in row.to_dict().items()}
            
            # Campos requeridos
            username = str(row_dict.get('username', '')).strip()
            dni = str(row_dict.get('dni', '')).strip()
            nombre = str(row_dict.get('nombre', '')).strip()
            
            # Conversión de tipos numéricos
            try:
                dias_mora = int(float(row_dict.get('dias_mora', 0)))
            except (ValueError, TypeError):
                raise ValueError(f"dias_mora inválido: {row_dict.get('dias_mora')}")
            
            try:
                monto_deuda = float(row_dict.get('monto_deuda', 0))
            except (ValueError, TypeError):
                raise ValueError(f"monto_deuda inválido: {row_dict.get('monto_deuda')}")
            
            # Campos opcionales
            excepcion_raw = row_dict.get('excepcion', False)
            if isinstance(excepcion_raw, str):
                excepcion = excepcion_raw.lower() in ['true', '1', 'si', 'yes', 'sí']
            else:
                excepcion = bool(excepcion_raw)
            
            telefono = row_dict.get('telefono')
            if telefono and not pd.isna(telefono):
                telefono = str(telefono).strip()
            else:
                telefono = None
            
            return MorosoRecord(
                username=username,
                dni=dni,
                nombre=nombre,
                dias_mora=dias_mora,
                monto_deuda=monto_deuda,
                excepcion=excepcion,
                telefono=telefono
            )
            
        except Exception as e:
            logger.warning(f"Error parseando registro: {e}")
            return None
    
    def filter_records(self, records: List[MorosoRecord]) -> List[MorosoRecord]:
        """
        Filtra registros según criterios configurados
        
        Args:
            records: Lista de registros a filtrar
            
        Returns:
            Lista de registros filtrados
        """
        filtered = []
        
        for record in records:
            # Filtro por días mínimos de mora
            if record.dias_mora < self.min_dias_mora:
                logger.debug(f"Filtrado por días mora: {record.username} ({record.dias_mora} días)")
                continue
            
            # Filtro por excepción
            if record.excepcion:
                logger.debug(f"Filtrado por excepción: {record.username}")
                continue
            
            filtered.append(record)
        
        self.stats.filtered_records = len(records) - len(filtered)
        logger.info(f"Registros filtrados: {self.stats.filtered_records}")
        
        return filtered
    
    def process_csv(self, file_path: Union[str, Path], encoding: str = None) -> List[MorosoRecord]:
        """
        Procesa un archivo CSV completo
        
        Args:
            file_path: Ruta al archivo CSV
            encoding: Encoding específico (opcional)
            
        Returns:
            Lista de registros válidos y filtrados
            
        Raises:
            ValueError: Si hay demasiados errores o el archivo no es válido
        """
        file_path = Path(file_path)
        if not file_path.exists():
            raise ValueError(f"Archivo no encontrado: {file_path}")
        
        logger.info(f"Iniciando procesamiento de: {file_path}")
        
        # Reiniciar estadísticas
        self.stats = ProcessingStats()
        
        # Leer CSV
        df = self.read_csv_with_encoding(file_path, encoding)
        self.stats.total_records = len(df)
        logger.info(f"Total registros leídos: {self.stats.total_records}")
        
        # Validar columnas
        valid_columns, column_errors = self.validate_columns(df)
        if not valid_columns:
            self.stats.errors.extend(column_errors)
            raise ValueError(f"CSV inválido: {'; '.join(column_errors)}")
        
        # Procesar registros
        valid_records = []
        invalid_records = []
        
        for idx, row in df.iterrows():
            record = self.parse_record(row)
            if record:
                valid_records.append(record)
            else:
                invalid_records.append(f"Fila {idx + 2}")  # +2 por header y índice 0
        
        self.stats.valid_records = len(valid_records)
        self.stats.invalid_records = len(invalid_records)
        
        # Verificar porcentaje de errores
        if self.stats.total_records > 0:
            error_percentage = (self.stats.invalid_records / self.stats.total_records) * 100
            if error_percentage > self.max_invalid_percentage:
                error_msg = f"Demasiados errores: {error_percentage:.1f}% (máximo: {self.max_invalid_percentage}%)"
                self.stats.errors.append(error_msg)
                raise ValueError(error_msg)
        
        # Filtrar registros
        filtered_records = self.filter_records(valid_records)
        self.stats.final_records = len(filtered_records)
        
        logger.info(f"Procesamiento completado: {self.stats.final_records} registros finales")
        
        return filtered_records
    
    def export_to_csv(self, records: List[MorosoRecord], output_path: Union[str, Path], 
                      encoding: str = 'utf-8') -> bool:
        """
        Exporta registros a un archivo CSV
        
        Args:
            records: Lista de registros a exportar
            output_path: Ruta del archivo de salida
            encoding: Encoding para el archivo de salida
            
        Returns:
            True si la exportación fue exitosa
        """
        try:
            output_path = Path(output_path)
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(output_path, 'w', newline='', encoding=encoding) as csvfile:
                if not records:
                    logger.warning("No hay registros para exportar")
                    return True
                
                fieldnames = list(asdict(records[0]).keys())
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                
                writer.writeheader()
                for record in records:
                    writer.writerow(asdict(record))
            
            logger.info(f"Exportados {len(records)} registros a: {output_path}")
            return True
            
        except Exception as e:
            logger.error(f"Error exportando CSV: {e}")
            return False
    
    def get_stats_summary(self) -> Dict[str, Any]:
        """
        Obtiene un resumen de las estadísticas de procesamiento
        
        Returns:
            Diccionario con estadísticas
        """
        return {
            'timestamp': datetime.now().isoformat(),
            'total_records': self.stats.total_records,
            'valid_records': self.stats.valid_records,
            'invalid_records': self.stats.invalid_records,
            'filtered_records': self.stats.filtered_records,
            'final_records': self.stats.final_records,
            'success_rate': (self.stats.valid_records / max(self.stats.total_records, 1)) * 100,
            'errors': self.stats.errors,
            'config': {
                'min_dias_mora': self.min_dias_mora,
                'max_invalid_percentage': self.max_invalid_percentage,
                'auto_detect_encoding': self.auto_detect_encoding
            }
        }


def generate_sample_csv(output_path: Union[str, Path], num_records: int = 50) -> bool:
    """
    Genera un archivo CSV de muestra con datos de prueba
    
    Args:
        output_path: Ruta donde guardar el archivo
        num_records: Número de registros a generar
        
    Returns:
        True si se generó exitosamente
    """
    import random
    from faker import Faker
    
    fake = Faker('es_AR')  # Español Argentina
    
    try:
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        records = []
        for i in range(num_records):
            # Generar datos realistas
            nombre = fake.name()
            username = nombre.lower().replace(' ', '.').replace('á', 'a').replace('é', 'e').replace('í', 'i').replace('ó', 'o').replace('ú', 'u')
            dni = str(fake.random_int(min=20000000, max=45000000))
            dias_mora = random.choices(
                [random.randint(1, 30), random.randint(31, 60), random.randint(61, 120), random.randint(121, 365)],
                weights=[40, 30, 20, 10]
            )[0]
            monto_deuda = round(random.uniform(5000, 50000), 2)
            excepcion = random.choice([True, False, False, False])  # 25% probabilidad
            telefono = fake.phone_number() if random.choice([True, False]) else None
            
            record = MorosoRecord(
                username=username,
                dni=dni,
                nombre=nombre,
                dias_mora=dias_mora,
                monto_deuda=monto_deuda,
                excepcion=excepcion,
                telefono=telefono
            )
            records.append(record)
        
        # Exportar con CSVProcessor
        processor = CSVProcessor()
        success = processor.export_to_csv(records, output_path)
        
        if success:
            logger.info(f"Archivo de muestra generado: {output_path} ({num_records} registros)")
        
        return success
        
    except Exception as e:
        logger.error(f"Error generando CSV de muestra: {e}")
        return False


if __name__ == "__main__":
    # Configurar logging
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    
    # Ejemplo de uso
    processor = CSVProcessor(min_dias_mora=30)
    
    # Generar archivo de muestra
    sample_path = Path("data/sample_morosos.csv")
    if generate_sample_csv(sample_path, 25):
        print(f"✅ Archivo de muestra generado: {sample_path}")
        
        # Procesar el archivo generado
        try:
            records = processor.process_csv(sample_path)
            stats = processor.get_stats_summary()
            
            print(f"\n📊 Estadísticas de procesamiento:")
            print(f"   Total registros: {stats['total_records']}")
            print(f"   Registros válidos: {stats['valid_records']}")
            print(f"   Registros filtrados: {stats['filtered_records']}")
            print(f"   Registros finales: {stats['final_records']}")
            print(f"   Tasa de éxito: {stats['success_rate']:.1f}%")
            
            # Exportar registros filtrados
            output_path = Path("output/morosos_filtrados.csv")
            if processor.export_to_csv(records, output_path):
                print(f"✅ Registros filtrados exportados: {output_path}")
                
        except Exception as e:
            print(f"❌ Error procesando CSV: {e}")
    else:
        print("❌ Error generando archivo de muestra")