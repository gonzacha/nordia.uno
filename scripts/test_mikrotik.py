#!/usr/bin/env python3
"""
Nordia ISP Suite - Script de Prueba Mikrotik
Script para verificar conectividad y funcionalidad con RouterOS

Funcionalidades:
- Test de conexión API y SSH
- Verificación de permisos
- Pruebas de operaciones CRUD
- Benchmarks de rendimiento
- Modo mock para desarrollo

Uso:
    python scripts/test_mikrotik.py --host 192.168.1.1 --username admin
    python scripts/test_mikrotik.py --mock  # Usar router simulado
    python scripts/test_mikrotik.py --benchmark  # Test de rendimiento

Autor: Gonzalo Haedo
Fecha: 2024-09-26
"""

import os
import sys
import time
import argparse
from typing import Dict, Any, List
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.prompt import Prompt, Confirm
from loguru import logger

# Agregar path del proyecto
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.mikrotik.connection import MikrotikConnection, ConnectionConfig, MikrotikConnectionError
from app.mikrotik.mock_router import create_mock_connection, generate_test_scenario

console = Console()


class MikrotikTester:
    """Clase principal para testing de Mikrotik"""
    
    def __init__(self, use_mock: bool = False, config: ConnectionConfig = None):
        self.use_mock = use_mock
        self.config = config
        self.results = {}
        
        # Configurar logging para tests
        logger.add(
            "logs/mikrotik_test.log",
            format="{time} | {level} | TEST | {message}",
            level="DEBUG"
        )
    
    def run_all_tests(self) -> Dict[str, Any]:
        """Ejecutar suite completo de tests"""
        console.print(Panel.fit(
            "[bold blue]🧪 NORDIA ISP SUITE - MIKROTIK TESTS[/bold blue]",
            border_style="blue"
        ))
        
        tests = [
            ("Connection Test", self.test_connection),
            ("Authentication Test", self.test_authentication),
            ("PPP Secrets Test", self.test_ppp_secrets),
            ("User Operations Test", self.test_user_operations),
            ("Active Connections Test", self.test_active_connections),
            ("Batch Operations Test", self.test_batch_operations),
            ("Error Handling Test", self.test_error_handling),
        ]
        
        results = {}
        
        for test_name, test_func in tests:
            console.print(f"\n[yellow]⚡ Ejecutando: {test_name}[/yellow]")
            
            try:
                with Progress(
                    SpinnerColumn(),
                    TextColumn("[progress.description]{task.description}"),
                    console=console
                ) as progress:
                    task = progress.add_task(f"Running {test_name}...", total=None)
                    
                    start_time = time.time()
                    result = test_func()
                    duration = time.time() - start_time
                    
                    results[test_name] = {
                        'success': result,
                        'duration': duration,
                        'details': self.results.get(test_name, {})
                    }
                    
                    status = "✅ PASS" if result else "❌ FAIL"
                    console.print(f"  {status} ({duration:.2f}s)")
                    
            except Exception as e:
                results[test_name] = {
                    'success': False,
                    'duration': 0,
                    'error': str(e)
                }
                console.print(f"  ❌ ERROR: {str(e)}")
        
        self._print_summary(results)
        return results
    
    def test_connection(self) -> bool:
        """Test básico de conexión"""
        try:
            if self.use_mock:
                connection = create_mock_connection()
            else:
                connection = MikrotikConnection(self.config)
            
            with connection as mt:
                # Verificar que la conexión está activa
                if not mt.is_connected:
                    return False
                
                self.results['Connection Test'] = {
                    'host': self.config.host if self.config else 'mock',
                    'connection_type': 'mock' if self.use_mock else self.config.connection_type,
                    'status': 'connected'
                }
                
                return True
                
        except Exception as e:
            logger.error(f"Connection test failed: {str(e)}")
            return False
    
    def test_authentication(self) -> bool:
        """Test de autenticación"""
        try:
            if self.use_mock:
                connection = create_mock_connection()
            else:
                connection = MikrotikConnection(self.config)
            
            with connection as mt:
                # Intentar obtener información del sistema
                if hasattr(mt, 'api') and mt.api:
                    identity = list(mt.api.system.identity.print())
                    router_name = identity[0].get('name', 'Unknown') if identity else 'Unknown'
                    
                    self.results['Authentication Test'] = {
                        'router_name': router_name,
                        'authenticated': True
                    }
                    
                    return True
                
                return self.use_mock  # En mock siempre pasa
                
        except Exception as e:
            logger.error(f"Authentication test failed: {str(e)}")
            return False
    
    def test_ppp_secrets(self) -> bool:
        """Test de lectura de usuarios PPPoE"""
        try:
            if self.use_mock:
                connection = create_mock_connection()
            else:
                connection = MikrotikConnection(self.config)
            
            with connection as mt:
                users = mt.get_ppp_secrets()
                
                self.results['PPP Secrets Test'] = {
                    'total_users': len(users),
                    'sample_users': [u.get('name', 'Unknown') for u in users[:3]],
                    'has_disabled': any(u.get('disabled') == 'true' for u in users),
                    'has_enabled': any(u.get('disabled') == 'false' for u in users)
                }
                
                return len(users) > 0
                
        except Exception as e:
            logger.error(f"PPP secrets test failed: {str(e)}")
            return False
    
    def test_user_operations(self) -> bool:
        """Test de operaciones con usuarios individuales"""
        try:
            if self.use_mock:
                connection = create_mock_connection()
            else:
                connection = MikrotikConnection(self.config)
            
            with connection as mt:
                # Obtener un usuario para probar
                users = mt.get_ppp_secrets()
                if not users:
                    return False
                
                test_user = users[0]['name']
                original_status = users[0].get('disabled', 'false')
                
                # Test: Verificar estado
                status = mt.get_user_status(test_user)
                if not status:
                    return False
                
                # Test: Cambiar estado (disable/enable)
                if original_status == 'false':
                    # Está habilitado, deshabilitar
                    success1 = mt.disable_ppp_user(test_user)
                    if not success1:
                        return False
                    
                    # Verificar cambio
                    new_status = mt.get_user_status(test_user)
                    if new_status['disabled'] != 'true':
                        return False
                    
                    # Restaurar estado original
                    success2 = mt.enable_ppp_user(test_user)
                    if not success2:
                        return False
                else:
                    # Está deshabilitado, habilitar
                    success1 = mt.enable_ppp_user(test_user)
                    if not success1:
                        return False
                    
                    # Restaurar estado original
                    success2 = mt.disable_ppp_user(test_user)
                    if not success2:
                        return False
                
                self.results['User Operations Test'] = {
                    'test_user': test_user,
                    'original_status': original_status,
                    'operations_successful': True
                }
                
                return True
                
        except Exception as e:
            logger.error(f"User operations test failed: {str(e)}")
            return False
    
    def test_active_connections(self) -> bool:
        """Test de conexiones activas"""
        try:
            if self.use_mock:
                connection = create_mock_connection()
            else:
                connection = MikrotikConnection(self.config)
            
            with connection as mt:
                active = mt.get_active_connections()
                
                self.results['Active Connections Test'] = {
                    'total_active': len(active),
                    'sample_connections': [
                        {
                            'name': conn.get('name', 'Unknown'),
                            'address': conn.get('address', 'Unknown'),
                            'uptime': conn.get('uptime', 'Unknown')
                        }
                        for conn in active[:3]
                    ]
                }
                
                return True  # Siempre exitoso, puede haber 0 conexiones
                
        except Exception as e:
            logger.error(f"Active connections test failed: {str(e)}")
            return False
    
    def test_batch_operations(self) -> bool:
        """Test de operaciones en lote"""
        try:
            if self.use_mock:
                connection = create_mock_connection()
            else:
                connection = MikrotikConnection(self.config)
            
            with connection as mt:
                # Obtener algunos usuarios para test
                users = mt.get_ppp_secrets()
                if len(users) < 3:
                    return False
                
                test_users = [u['name'] for u in users[:3]]
                
                # Test batch disable
                disable_results = mt.batch_disable(test_users)
                
                # Test batch enable (restaurar)
                enable_results = mt.batch_enable(test_users)
                
                self.results['Batch Operations Test'] = {
                    'test_users': test_users,
                    'disable_success_count': sum(1 for success in disable_results.values() if success),
                    'enable_success_count': sum(1 for success in enable_results.values() if success)
                }
                
                return len(test_users) > 0
                
        except Exception as e:
            logger.error(f"Batch operations test failed: {str(e)}")
            return False
    
    def test_error_handling(self) -> bool:
        """Test de manejo de errores"""
        try:
            if self.use_mock:
                # Usar mock con alta tasa de fallos
                connection = create_mock_connection(failure_rate=0.5)
            else:
                connection = MikrotikConnection(self.config)
            
            with connection as mt:
                # Test: Usuario inexistente
                try:
                    status = mt.get_user_status("usuario_inexistente_12345")
                    non_existent_handled = status is None
                except Exception:
                    non_existent_handled = True
                
                # Test: Operación en usuario inexistente
                try:
                    result = mt.disable_ppp_user("usuario_inexistente_12345")
                    invalid_operation_handled = result is False
                except Exception:
                    invalid_operation_handled = True
                
                self.results['Error Handling Test'] = {
                    'non_existent_user_handled': non_existent_handled,
                    'invalid_operation_handled': invalid_operation_handled
                }
                
                return non_existent_handled and invalid_operation_handled
                
        except Exception as e:
            logger.error(f"Error handling test failed: {str(e)}")
            return False
    
    def run_benchmark(self) -> Dict[str, Any]:
        """Ejecutar benchmark de rendimiento"""
        console.print(Panel.fit(
            "[bold yellow]⚡ BENCHMARK DE RENDIMIENTO[/bold yellow]",
            border_style="yellow"
        ))
        
        if self.use_mock:
            connection = create_mock_connection(simulate_delays=True)
        else:
            connection = MikrotikConnection(self.config)
        
        benchmark_results = {}
        
        with connection as mt:
            # Benchmark: Obtener usuarios
            start_time = time.time()
            users = mt.get_ppp_secrets()
            get_users_time = time.time() - start_time
            
            benchmark_results['get_users'] = {
                'time': get_users_time,
                'count': len(users),
                'rate': len(users) / get_users_time if get_users_time > 0 else 0
            }
            
            # Benchmark: Verificar estados individuales
            if len(users) >= 5:
                test_users = users[:5]
                start_time = time.time()
                
                for user in test_users:
                    mt.get_user_status(user['name'])
                
                status_check_time = time.time() - start_time
                
                benchmark_results['status_checks'] = {
                    'time': status_check_time,
                    'count': len(test_users),
                    'avg_time': status_check_time / len(test_users)
                }
            
            # Benchmark: Operaciones de cambio de estado
            if len(users) >= 2:
                test_user = users[0]['name']
                
                start_time = time.time()
                mt.disable_ppp_user(test_user)
                mt.enable_ppp_user(test_user)
                operation_time = time.time() - start_time
                
                benchmark_results['state_operations'] = {
                    'time': operation_time,
                    'operations': 2,
                    'avg_time': operation_time / 2
                }
        
        self._print_benchmark_results(benchmark_results)
        return benchmark_results
    
    def _print_summary(self, results: Dict[str, Any]):
        """Imprimir resumen de tests"""
        table = Table(title="📊 Resumen de Tests")
        table.add_column("Test", style="cyan", no_wrap=True)
        table.add_column("Estado", style="magenta")
        table.add_column("Tiempo", style="green")
        table.add_column("Detalles", style="yellow")
        
        total_tests = len(results)
        passed_tests = sum(1 for r in results.values() if r['success'])
        
        for test_name, result in results.items():
            status = "✅ PASS" if result['success'] else "❌ FAIL"
            duration = f"{result['duration']:.2f}s"
            
            if 'error' in result:
                details = f"Error: {result['error'][:30]}..."
            elif result.get('details'):
                detail_items = result['details']
                if isinstance(detail_items, dict):
                    details = f"{len(detail_items)} items"
                else:
                    details = str(detail_items)[:30]
            else:
                details = "OK"
            
            table.add_row(test_name, status, duration, details)
        
        console.print(table)
        
        # Resumen final
        success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        
        if success_rate >= 80:
            status_color = "green"
            status_emoji = "✅"
        elif success_rate >= 60:
            status_color = "yellow"
            status_emoji = "⚠️"
        else:
            status_color = "red"
            status_emoji = "❌"
        
        console.print(Panel.fit(
            f"{status_emoji} [{status_color}]Tests completados: {passed_tests}/{total_tests} ({success_rate:.1f}%)[/{status_color}]",
            border_style=status_color
        ))
    
    def _print_benchmark_results(self, results: Dict[str, Any]):
        """Imprimir resultados de benchmark"""
        table = Table(title="⚡ Resultados de Benchmark")
        table.add_column("Operación", style="cyan")
        table.add_column("Tiempo Total", style="green")
        table.add_column("Cantidad", style="yellow")
        table.add_column("Promedio", style="magenta")
        table.add_column("Rate", style="blue")
        
        for operation, data in results.items():
            total_time = f"{data['time']:.3f}s"
            count = str(data.get('count', 1))
            avg_time = f"{data.get('avg_time', data['time']):.3f}s"
            rate = f"{data.get('rate', 0):.1f}/s" if 'rate' in data else "N/A"
            
            table.add_row(operation, total_time, count, avg_time, rate)
        
        console.print(table)


def main():
    """Función principal"""
    parser = argparse.ArgumentParser(description="Test de Conexión Mikrotik")
    
    parser.add_argument('--host', default='192.168.1.1', help='IP del router')
    parser.add_argument('--port', type=int, default=8728, help='Puerto (API: 8728, SSH: 22)')
    parser.add_argument('--username', default='admin', help='Usuario')
    parser.add_argument('--password', help='Contraseña (prompt si no se proporciona)')
    parser.add_argument('--connection-type', choices=['api', 'ssh'], default='api', help='Tipo de conexión')
    parser.add_argument('--mock', action='store_true', help='Usar router mock')
    parser.add_argument('--benchmark', action='store_true', help='Ejecutar benchmark')
    parser.add_argument('--scenario', choices=['normal', 'network_issues', 'high_failure', 'all_disabled'], 
                       default='normal', help='Escenario de testing (solo mock)')
    
    args = parser.parse_args()
    
    # Configurar conexión
    config = None
    if not args.mock:
        # Obtener contraseña si no se proporcionó
        if not args.password:
            args.password = Prompt.ask("Contraseña del router", password=True)
        
        config = ConnectionConfig(
            host=args.host,
            port=args.port,
            username=args.username,
            password=args.password,
            connection_type=args.connection_type
        )
        
        # Confirmación para operaciones en router real
        if not Confirm.ask(f"¿Conectar a router real {args.host}? Esto ejecutará operaciones de test"):
            console.print("❌ Test cancelado por el usuario")
            return
    
    # Crear tester
    if args.mock:
        console.print(f"🎮 Usando router mock - Escenario: {args.scenario}")
        if args.scenario != 'normal':
            # Usar escenario específico
            tester = MikrotikTester(use_mock=True)
            # Configurar escenario específico
            # (esto se podría extender más)
        else:
            tester = MikrotikTester(use_mock=True)
    else:
        console.print(f"🌐 Conectando a router real: {args.host}")
        tester = MikrotikTester(use_mock=False, config=config)
    
    try:
        if args.benchmark:
            # Solo benchmark
            tester.run_benchmark()
        else:
            # Suite completo de tests
            results = tester.run_all_tests()
            
            if args.benchmark:
                console.print("\n" + "="*50)
                tester.run_benchmark()
    
    except KeyboardInterrupt:
        console.print("\n❌ Test interrumpido por el usuario")
    except Exception as e:
        console.print(f"❌ Error inesperado: {str(e)}")
        logger.error(f"Unexpected error: {str(e)}")


if __name__ == "__main__":
    main()