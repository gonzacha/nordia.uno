#!/usr/bin/env python3
"""
Test Script para CSV Processor - Nordia ISP Suite
Suite completa de tests para el procesador de archivos CSV de morosos
"""

import sys
import os
import tempfile
import json
from pathlib import Path
from typing import List, Dict, Any
import argparse
import time

# Add app to path
sys.path.append(str(Path(__file__).parent.parent))

try:
    from app.core.csv_processor import CSVProcessor, MorosoRecord, generate_sample_csv
    from rich.console import Console
    from rich.table import Table
    from rich.panel import Panel
    from rich.progress import Progress, SpinnerColumn, TextColumn
    from rich.text import Text
    import pandas as pd
    import chardet
except ImportError as e:
    print(f"❌ Error importando dependencias: {e}")
    print("Instala las dependencias con: pip install -r requirements.txt")
    sys.exit(1)

console = Console()


class CSVProcessorTester:
    """Tester completo para CSVProcessor"""
    
    def __init__(self):
        self.tests_passed = 0
        self.tests_failed = 0
        self.test_results = []
        self.temp_files = []
    
    def cleanup(self):
        """Limpia archivos temporales"""
        for temp_file in self.temp_files:
            try:
                if Path(temp_file).exists():
                    os.remove(temp_file)
            except:
                pass
    
    def create_temp_csv(self, content: str, encoding: str = 'utf-8') -> str:
        """Crea un archivo CSV temporal"""
        fd, path = tempfile.mkstemp(suffix='.csv')
        self.temp_files.append(path)
        
        with os.fdopen(fd, 'w', encoding=encoding) as f:
            f.write(content)
        
        return path
    
    def assert_test(self, condition: bool, test_name: str, details: str = ""):
        """Registra el resultado de un test"""
        if condition:
            self.tests_passed += 1
            status = "✅ PASS"
            color = "green"
        else:
            self.tests_failed += 1
            status = "❌ FAIL"
            color = "red"
        
        self.test_results.append({
            'name': test_name,
            'status': status,
            'details': details,
            'passed': condition
        })
        
        console.print(f"{status} {test_name}", style=color)
        if details and not condition:
            console.print(f"    {details}", style="dim red")
    
    def test_basic_initialization(self):
        """Test inicialización básica del processor"""
        console.print("\n🧪 [bold cyan]Test: Inicialización Básica[/bold cyan]")
        
        try:
            processor = CSVProcessor()
            self.assert_test(
                processor.min_dias_mora == 1,
                "Valor por defecto min_dias_mora",
                f"Esperado: 1, Obtenido: {processor.min_dias_mora}"
            )
            
            processor = CSVProcessor(min_dias_mora=30, max_invalid_percentage=5.0)
            self.assert_test(
                processor.min_dias_mora == 30 and processor.max_invalid_percentage == 5.0,
                "Configuración personalizada",
                f"min_dias_mora: {processor.min_dias_mora}, max_invalid_percentage: {processor.max_invalid_percentage}"
            )
            
        except Exception as e:
            self.assert_test(False, "Inicialización del processor", str(e))
    
    def test_moroso_record_validation(self):
        """Test validación de MorosoRecord"""
        console.print("\n🧪 [bold cyan]Test: Validación MorosoRecord[/bold cyan]")
        
        # Registro válido
        try:
            record = MorosoRecord(
                username="test.user",
                dni="12345678",
                nombre="Test User",
                dias_mora=30,
                monto_deuda=15000.50
            )
            self.assert_test(True, "Creación de registro válido")
        except Exception as e:
            self.assert_test(False, "Creación de registro válido", str(e))
        
        # Registro con username vacío
        try:
            record = MorosoRecord(
                username="",
                dni="12345678",
                nombre="Test User",
                dias_mora=30,
                monto_deuda=15000.50
            )
            self.assert_test(False, "Validación username vacío", "Debería fallar pero no falló")
        except ValueError:
            self.assert_test(True, "Validación username vacío")
        except Exception as e:
            self.assert_test(False, "Validación username vacío", str(e))
        
        # Registro con dias_mora negativo
        try:
            record = MorosoRecord(
                username="test.user",
                dni="12345678",
                nombre="Test User",
                dias_mora=-5,
                monto_deuda=15000.50
            )
            self.assert_test(False, "Validación dias_mora negativo", "Debería fallar pero no falló")
        except ValueError:
            self.assert_test(True, "Validación dias_mora negativo")
        except Exception as e:
            self.assert_test(False, "Validación dias_mora negativo", str(e))
    
    def test_csv_parsing_valid(self):
        """Test parsing de CSV válido"""
        console.print("\n🧪 [bold cyan]Test: Parsing CSV Válido[/bold cyan]")
        
        # CSV bien formado
        csv_content = """username,dni,nombre,dias_mora,monto_deuda,excepcion,telefono
juan.perez,12345678,Juan Pérez,45,15000.50,false,+5493794123456
maria.gonzalez,23456789,María González,32,8500.25,false,
carlos.martinez,34567890,Carlos Martínez,67,22000.00,true,+5493794234567"""
        
        temp_file = self.create_temp_csv(csv_content)
        
        try:
            processor = CSVProcessor(min_dias_mora=1)
            records = processor.process_csv(temp_file)
            
            self.assert_test(len(records) == 2, "Número correcto de registros procesados", 
                           f"Esperado: 2 (1 filtrado por excepción), Obtenido: {len(records)}")
            
            self.assert_test(records[0].username == "juan.perez", "Datos del primer registro",
                           f"Username: {records[0].username}")
            
            self.assert_test(records[1].dias_mora == 32, "Datos numéricos correctos",
                           f"Días mora: {records[1].dias_mora}")
            
        except Exception as e:
            self.assert_test(False, "Procesamiento de CSV válido", str(e))
    
    def test_csv_parsing_invalid(self):
        """Test parsing de CSV con errores"""
        console.print("\n🧪 [bold cyan]Test: Parsing CSV con Errores[/bold cyan]")
        
        # CSV con columnas faltantes
        csv_content_missing_cols = """username,dias_mora,monto_deuda
juan.perez,45,15000.50"""
        
        temp_file = self.create_temp_csv(csv_content_missing_cols)
        
        try:
            processor = CSVProcessor()
            records = processor.process_csv(temp_file)
            self.assert_test(False, "Detección de columnas faltantes", "Debería fallar pero no falló")
        except ValueError as e:
            self.assert_test("Faltan columnas" in str(e), "Detección de columnas faltantes")
        except Exception as e:
            self.assert_test(False, "Detección de columnas faltantes", str(e))
        
        # CSV con datos inválidos pero no demasiados errores
        csv_content_some_invalid = """username,dni,nombre,dias_mora,monto_deuda,excepcion,telefono
juan.perez,12345678,Juan Pérez,45,15000.50,false,+5493794123456
invalid.user,,Invalid User,abc,xyz,false,
maria.gonzalez,23456789,María González,32,8500.25,false,"""
        
        temp_file = self.create_temp_csv(csv_content_some_invalid)
        
        try:
            processor = CSVProcessor(min_dias_mora=1, max_invalid_percentage=50.0)
            records = processor.process_csv(temp_file)
            self.assert_test(len(records) == 2, "Procesamiento con algunos registros inválidos",
                           f"Esperado: 2 registros válidos, Obtenido: {len(records)}")
        except Exception as e:
            self.assert_test(False, "Procesamiento con algunos registros inválidos", str(e))
    
    def test_encoding_detection(self):
        """Test detección de encoding"""
        console.print("\n🧪 [bold cyan]Test: Detección de Encoding[/bold cyan]")
        
        # CSV con caracteres especiales en latin-1
        csv_content_latin1 = """username,dni,nombre,dias_mora,monto_deuda
josé.garcía,12345678,José García,30,15000.50
maría.lópez,23456789,María López,45,12000.75"""
        
        temp_file = self.create_temp_csv(csv_content_latin1, encoding='latin-1')
        
        try:
            processor = CSVProcessor(auto_detect_encoding=True)
            detected_encoding = processor.detect_encoding(Path(temp_file))
            self.assert_test(detected_encoding is not None, "Detección de encoding",
                           f"Encoding detectado: {detected_encoding}")
            
            # Intentar procesar con detección automática
            records = processor.process_csv(temp_file)
            self.assert_test(len(records) == 2, "Procesamiento con encoding detectado",
                           f"Registros procesados: {len(records)}")
            
        except Exception as e:
            self.assert_test(False, "Detección y procesamiento de encoding", str(e))
    
    def test_filtering_logic(self):
        """Test lógica de filtrado"""
        console.print("\n🧪 [bold cyan]Test: Lógica de Filtrado[/bold cyan]")
        
        csv_content = """username,dni,nombre,dias_mora,monto_deuda,excepcion
user1,11111111,User One,15,5000.00,false
user2,22222222,User Two,45,15000.00,false
user3,33333333,User Three,67,22000.00,true
user4,44444444,User Four,89,35000.00,false
user5,55555555,User Five,25,7500.00,false"""
        
        temp_file = self.create_temp_csv(csv_content)
        
        try:
            # Filtro por días mínimos de mora
            processor = CSVProcessor(min_dias_mora=30)
            records = processor.process_csv(temp_file)
            
            expected_usernames = {"user2", "user4"}  # user3 excluido por excepción, user1 y user5 por días
            actual_usernames = {record.username for record in records}
            
            self.assert_test(actual_usernames == expected_usernames, 
                           "Filtrado por días de mora y excepciones",
                           f"Esperado: {expected_usernames}, Obtenido: {actual_usernames}")
            
        except Exception as e:
            self.assert_test(False, "Lógica de filtrado", str(e))
    
    def test_export_functionality(self):
        """Test funcionalidad de exportación"""
        console.print("\n🧪 [bold cyan]Test: Funcionalidad de Exportación[/bold cyan]")
        
        try:
            # Crear algunos registros de prueba
            records = [
                MorosoRecord("user1", "11111111", "User One", 30, 5000.00),
                MorosoRecord("user2", "22222222", "User Two", 45, 15000.00)
            ]
            
            processor = CSVProcessor()
            
            # Exportar a archivo temporal
            fd, export_path = tempfile.mkstemp(suffix='.csv')
            os.close(fd)
            self.temp_files.append(export_path)
            
            success = processor.export_to_csv(records, export_path)
            self.assert_test(success, "Exportación exitosa")
            
            # Verificar que el archivo se creó y tiene contenido
            if Path(export_path).exists():
                with open(export_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    self.assert_test('username' in content and 'user1' in content,
                                   "Contenido del archivo exportado",
                                   f"Contenido: {content[:100]}...")
            else:
                self.assert_test(False, "Archivo exportado existe")
                
        except Exception as e:
            self.assert_test(False, "Funcionalidad de exportación", str(e))
    
    def test_statistics_generation(self):
        """Test generación de estadísticas"""
        console.print("\n🧪 [bold cyan]Test: Generación de Estadísticas[/bold cyan]")
        
        csv_content = """username,dni,nombre,dias_mora,monto_deuda,excepcion
user1,11111111,User One,15,5000.00,false
invalid.user,,Invalid User,abc,xyz,false
user2,22222222,User Two,45,15000.00,false
user3,33333333,User Three,67,22000.00,true"""
        
        temp_file = self.create_temp_csv(csv_content)
        
        try:
            processor = CSVProcessor(min_dias_mora=30, max_invalid_percentage=50.0)
            records = processor.process_csv(temp_file)
            stats = processor.get_stats_summary()
            
            self.assert_test('total_records' in stats, "Estadísticas contienen total_records")
            self.assert_test('valid_records' in stats, "Estadísticas contienen valid_records")
            self.assert_test('final_records' in stats, "Estadísticas contienen final_records")
            self.assert_test(stats['total_records'] == 4, "Total records correcto",
                           f"Esperado: 4, Obtenido: {stats['total_records']}")
            self.assert_test(stats['final_records'] == 1, "Final records correcto",
                           f"Esperado: 1, Obtenido: {stats['final_records']}")
            
        except Exception as e:
            self.assert_test(False, "Generación de estadísticas", str(e))
    
    def test_sample_csv_data(self):
        """Test con archivo CSV de muestra real"""
        console.print("\n🧪 [bold cyan]Test: Archivo CSV de Muestra[/bold cyan]")
        
        sample_path = Path(__file__).parent.parent / "data" / "sample_morosos.csv"
        
        if not sample_path.exists():
            self.assert_test(False, "Archivo de muestra existe", f"No encontrado: {sample_path}")
            return
        
        try:
            processor = CSVProcessor(min_dias_mora=30)
            records = processor.process_csv(sample_path)
            stats = processor.get_stats_summary()
            
            self.assert_test(len(records) > 0, "Procesamiento archivo de muestra",
                           f"Registros procesados: {len(records)}")
            
            self.assert_test(stats['success_rate'] > 80, "Alta tasa de éxito",
                           f"Tasa de éxito: {stats['success_rate']:.1f}%")
            
            # Verificar que todos los registros cumplen criterios
            valid_criteria = all(
                record.dias_mora >= 30 and not record.excepcion 
                for record in records
            )
            self.assert_test(valid_criteria, "Registros cumplen criterios de filtrado")
            
        except Exception as e:
            self.assert_test(False, "Procesamiento archivo de muestra", str(e))
    
    def run_performance_test(self):
        """Test de rendimiento básico"""
        console.print("\n🚀 [bold cyan]Test de Rendimiento[/bold cyan]")
        
        # Generar CSV grande en memoria
        large_csv_lines = ["username,dni,nombre,dias_mora,monto_deuda,excepcion,telefono"]
        for i in range(1000):
            large_csv_lines.append(f"user{i:04d},{20000000+i:08d},User {i},{30+i%100},{5000+i*10}.50,false,+54937941{i:05d}")
        
        large_csv_content = "\n".join(large_csv_lines)
        temp_file = self.create_temp_csv(large_csv_content)
        
        try:
            processor = CSVProcessor(min_dias_mora=50)
            
            start_time = time.time()
            records = processor.process_csv(temp_file)
            end_time = time.time()
            
            processing_time = end_time - start_time
            records_per_second = len(records) / processing_time if processing_time > 0 else 0
            
            self.assert_test(processing_time < 5.0, "Tiempo de procesamiento razonable",
                           f"Tiempo: {processing_time:.2f}s para 1000 registros")
            
            self.assert_test(len(records) > 0, "Procesamiento de dataset grande",
                           f"Registros procesados: {len(records)} en {processing_time:.2f}s ({records_per_second:.1f} rec/s)")
            
        except Exception as e:
            self.assert_test(False, "Test de rendimiento", str(e))
    
    def run_all_tests(self):
        """Ejecuta todos los tests"""
        console.print(Panel.fit("🧪 [bold green]INICIANDO TEST SUITE CSV PROCESSOR[/bold green]"))
        
        try:
            self.test_basic_initialization()
            self.test_moroso_record_validation()
            self.test_csv_parsing_valid()
            self.test_csv_parsing_invalid()
            self.test_encoding_detection()
            self.test_filtering_logic()
            self.test_export_functionality()
            self.test_statistics_generation()
            self.test_sample_csv_data()
            self.run_performance_test()
            
        finally:
            self.cleanup()
        
        # Mostrar resumen
        self.show_summary()
    
    def show_summary(self):
        """Muestra resumen de resultados"""
        total_tests = self.tests_passed + self.tests_failed
        success_rate = (self.tests_passed / total_tests * 100) if total_tests > 0 else 0
        
        # Crear tabla de resultados
        table = Table(title="📊 Resumen de Tests")
        table.add_column("Test", style="white")
        table.add_column("Estado", justify="center")
        table.add_column("Detalles", style="dim")
        
        for result in self.test_results:
            status_style = "green" if result['passed'] else "red"
            table.add_row(
                result['name'],
                Text(result['status'], style=status_style),
                result['details'][:80] + "..." if len(result['details']) > 80 else result['details']
            )
        
        console.print(table)
        
        # Panel de resumen
        if self.tests_failed == 0:
            summary_style = "bold green"
            summary_text = f"🎉 TODOS LOS TESTS PASARON\n✅ {self.tests_passed} tests exitosos"
        else:
            summary_style = "bold yellow" if success_rate >= 80 else "bold red"
            summary_text = f"📊 RESULTADOS MIXTOS\n✅ {self.tests_passed} exitosos | ❌ {self.tests_failed} fallidos\n📈 Tasa de éxito: {success_rate:.1f}%"
        
        console.print(Panel.fit(summary_text, title="📋 Resumen Final", style=summary_style))


def main():
    """Función principal"""
    parser = argparse.ArgumentParser(description="Test Suite para CSV Processor")
    parser.add_argument("--verbose", "-v", action="store_true", help="Salida verbosa")
    parser.add_argument("--quick", action="store_true", help="Ejecutar solo tests rápidos")
    
    args = parser.parse_args()
    
    if args.verbose:
        console.print("[dim]Iniciando tests en modo verboso...[/dim]")
    
    tester = CSVProcessorTester()
    
    try:
        tester.run_all_tests()
    except KeyboardInterrupt:
        console.print("\n[yellow]Tests interrumpidos por el usuario[/yellow]")
        tester.cleanup()
        sys.exit(1)
    except Exception as e:
        console.print(f"[red]Error ejecutando tests: {e}[/red]")
        tester.cleanup()
        sys.exit(1)


if __name__ == "__main__":
    main()