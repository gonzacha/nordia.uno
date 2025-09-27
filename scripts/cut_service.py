#!/usr/bin/env python3
"""
Cut Service CLI - Nordia ISP Suite
Script principal para automatización de cortes por mora
Integra procesamiento CSV + conexión Mikrotik RouterOS
"""

import sys
import json
import time
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
import logging

# Add app to path
sys.path.append(str(Path(__file__).parent.parent))

try:
    import click
    from rich.console import Console
    from rich.table import Table
    from rich.panel import Panel
    from rich.progress import Progress, TaskID, SpinnerColumn, TextColumn, BarColumn, MofNCompleteColumn
    from rich.prompt import Confirm, Prompt
    from rich.text import Text
    from rich.live import Live
    from loguru import logger
    
    from app.core.csv_processor import CSVProcessor, MorosoRecord
    from app.mikrotik.connection import MikrotikConnection
    from app.mikrotik.mock_router import MockRouterAPI
    
except ImportError as e:
    print(f"❌ Error importando dependencias: {e}")
    print("Instala las dependencias con: pip install -r requirements.txt")
    sys.exit(1)

console = Console()


class ServiceCutter:
    """Clase principal para gestión de cortes de servicio"""
    
    def __init__(self, 
                 router_host: str,
                 use_mock: bool = False,
                 batch_size: int = 10,
                 rollback_threshold: float = 0.1):
        """
        Inicializa el cortador de servicios
        
        Args:
            router_host: IP del router o "mock" para testing
            use_mock: Si usar router mock
            batch_size: Tamaño de lote para procesamiento
            rollback_threshold: % de fallas para activar rollback (0.1 = 10%)
        """
        self.router_host = router_host
        self.use_mock = use_mock or router_host.lower() == "mock"
        self.batch_size = batch_size
        self.rollback_threshold = rollback_threshold
        
        # Estadísticas de ejecución
        self.stats = {
            'total_records': 0,
            'processed': 0,
            'successful_cuts': 0,
            'failed_cuts': 0,
            'rollback_triggered': False,
            'execution_time': 0,
            'errors': []
        }
        
        # Lista de acciones ejecutadas para rollback
        self.executed_actions = []
        
        logger.info(f"ServiceCutter inicializado: {router_host} (mock: {self.use_mock})")
    
    def connect_to_router(self, username: str = None, password: str = None) -> bool:
        """
        Establece conexión con el router
        
        Args:
            username: Usuario del router (None para prompt)
            password: Contraseña del router (None para prompt)
            
        Returns:
            True si la conexión es exitosa
        """
        try:
            if self.use_mock:
                console.print("[yellow]Usando router mock para testing[/yellow]")
                self.router = MockRouterAPI()
                return True
            
            # Solicitar credenciales si no se proporcionaron
            if not username:
                username = Prompt.ask("👤 Usuario del router")
            if not password:
                password = Prompt.ask("🔐 Contraseña del router", password=True)
            
            console.print(f"[blue]Conectando a router: {self.router_host}[/blue]")
            
            with console.status("[bold blue]Estableciendo conexión..."):
                self.router = MikrotikConnection(
                    host=self.router_host,
                    username=username,
                    password=password
                )
            
            console.print("[green]✅ Conexión establecida exitosamente[/green]")
            return True
            
        except Exception as e:
            console.print(f"[red]❌ Error conectando al router: {e}[/red]")
            return False
    
    def process_records_dry_run(self, records: List[MorosoRecord]) -> List[Dict[str, Any]]:
        """
        Simula el procesamiento sin ejecutar cambios reales
        
        Args:
            records: Lista de registros a procesar
            
        Returns:
            Lista de resultados simulados
        """
        console.print("\n[bold cyan]🔍 MODO DRY-RUN - SIMULACIÓN[/bold cyan]")
        
        results = []
        
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            BarColumn(),
            MofNCompleteColumn(),
            console=console
        ) as progress:
            
            task = progress.add_task("Simulando cortes...", total=len(records))
            
            for i, record in enumerate(records, 1):
                try:
                    # Simular verificación de usuario
                    time.sleep(0.1)  # Simular latencia de red
                    
                    # Determinar si el usuario existe (simulado)
                    user_exists = True  # En mock siempre existe
                    if not self.use_mock:
                        # En router real, verificar existencia
                        user_exists = True  # Placeholder - implementar verificación real
                    
                    result = {
                        'username': record.username,
                        'dni': record.dni,
                        'nombre': record.nombre,
                        'dias_mora': record.dias_mora,
                        'monto_deuda': record.monto_deuda,
                        'action': 'would_cut' if user_exists else 'user_not_found',
                        'success': user_exists,
                        'message': f"Cortaría servicio - {record.dias_mora} días mora" if user_exists else "Usuario no encontrado",
                        'timestamp': datetime.now().isoformat()
                    }
                    
                    results.append(result)
                    
                    progress.update(task, advance=1, description=f"Simulado {i}/{len(records)}: {record.username}")
                    
                except Exception as e:
                    result = {
                        'username': record.username,
                        'action': 'error',
                        'success': False,
                        'message': f"Error en simulación: {e}",
                        'timestamp': datetime.now().isoformat()
                    }
                    results.append(result)
                    logger.error(f"Error simulando {record.username}: {e}")
        
        # Mostrar resumen de simulación
        successful_sims = sum(1 for r in results if r['success'])
        self.show_dry_run_summary(results, successful_sims)
        
        return results
    
    def process_records_execute(self, records: List[MorosoRecord]) -> List[Dict[str, Any]]:
        """
        Ejecuta el corte real de servicios
        
        Args:
            records: Lista de registros a procesar
            
        Returns:
            Lista de resultados de ejecución
        """
        console.print("\n[bold red]⚡ MODO EXECUTE - EJECUCIÓN REAL[/bold red]")
        
        # Confirmación final
        if not self.confirm_execution(records):
            console.print("[yellow]Operación cancelada por el usuario[/yellow]")
            return []
        
        results = []
        failed_count = 0
        start_time = time.time()
        
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            BarColumn(),
            MofNCompleteColumn(),
            console=console
        ) as progress:
            
            task = progress.add_task("Ejecutando cortes...", total=len(records))
            
            for i, record in enumerate(records, 1):
                try:
                    # Ejecutar corte real
                    success = self.cut_single_service(record)
                    
                    if success:
                        result = {
                            'username': record.username,
                            'dni': record.dni,
                            'nombre': record.nombre,
                            'dias_mora': record.dias_mora,
                            'monto_deuda': record.monto_deuda,
                            'action': 'cut_executed',
                            'success': True,
                            'message': f"Servicio cortado exitosamente",
                            'timestamp': datetime.now().isoformat()
                        }
                        
                        # Registrar para posible rollback
                        self.executed_actions.append({
                            'username': record.username,
                            'action': 'cut',
                            'timestamp': datetime.now().isoformat()
                        })
                        
                        self.stats['successful_cuts'] += 1
                        
                    else:
                        result = {
                            'username': record.username,
                            'action': 'cut_failed',
                            'success': False,
                            'message': f"Error ejecutando corte",
                            'timestamp': datetime.now().isoformat()
                        }
                        failed_count += 1
                        self.stats['failed_cuts'] += 1
                    
                    results.append(result)
                    self.stats['processed'] += 1
                    
                    # Verificar threshold de rollback
                    if len(records) > 5:  # Solo verificar rollback si hay suficientes registros
                        failure_rate = failed_count / (i)
                        if failure_rate > self.rollback_threshold:
                            console.print(f"[bold red]🚨 ACTIVANDO ROLLBACK - Tasa de fallas: {failure_rate:.1%}[/bold red]")
                            self.execute_rollback()
                            break
                    
                    progress.update(task, advance=1, description=f"Procesado {i}/{len(records)}: {record.username}")
                    
                    # Batch delay para no sobrecargar el router
                    if i % self.batch_size == 0:
                        time.sleep(0.5)
                    
                except Exception as e:
                    result = {
                        'username': record.username,
                        'action': 'error',
                        'success': False,
                        'message': f"Error crítico: {e}",
                        'timestamp': datetime.now().isoformat()
                    }
                    results.append(result)
                    failed_count += 1
                    self.stats['failed_cuts'] += 1
                    self.stats['errors'].append(str(e))
                    logger.error(f"Error crítico procesando {record.username}: {e}")
        
        self.stats['execution_time'] = time.time() - start_time
        
        return results
    
    def cut_single_service(self, record: MorosoRecord) -> bool:
        """
        Ejecuta el corte de un servicio individual
        
        Args:
            record: Registro del moroso
            
        Returns:
            True si el corte fue exitoso
        """
        try:
            if self.use_mock:
                # Usar mock router
                return self.router.disable_user(record.username)
            else:
                # Usar router real
                with self.router:
                    return self.router.disable_user(record.username)
                    
        except Exception as e:
            logger.error(f"Error cortando servicio {record.username}: {e}")
            return False
    
    def execute_rollback(self) -> bool:
        """
        Ejecuta rollback de las acciones realizadas
        
        Returns:
            True si el rollback fue exitoso
        """
        if not self.executed_actions:
            console.print("[yellow]No hay acciones para revertir[/yellow]")
            return True
        
        console.print(f"\n[bold yellow]🔄 EJECUTANDO ROLLBACK - {len(self.executed_actions)} acciones[/bold yellow]")
        
        success_count = 0
        
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            BarColumn(),
            MofNCompleteColumn(),
            console=console
        ) as progress:
            
            task = progress.add_task("Revirtiendo cambios...", total=len(self.executed_actions))
            
            # Revertir en orden inverso
            for action in reversed(self.executed_actions):
                try:
                    if action['action'] == 'cut':
                        # Reactivar usuario
                        if self.use_mock:
                            success = self.router.enable_user(action['username'])
                        else:
                            with self.router:
                                success = self.router.enable_user(action['username'])
                        
                        if success:
                            success_count += 1
                            logger.info(f"Rollback exitoso: {action['username']}")
                        else:
                            logger.error(f"Fallo en rollback: {action['username']}")
                    
                    progress.advance(task)
                    
                except Exception as e:
                    logger.error(f"Error en rollback {action['username']}: {e}")
        
        self.stats['rollback_triggered'] = True
        rollback_success_rate = success_count / len(self.executed_actions) if self.executed_actions else 0
        
        if rollback_success_rate > 0.8:
            console.print(f"[green]✅ Rollback completado: {success_count}/{len(self.executed_actions)}[/green]")
            return True
        else:
            console.print(f"[red]⚠️ Rollback parcial: {success_count}/{len(self.executed_actions)}[/red]")
            return False
    
    def confirm_execution(self, records: List[MorosoRecord]) -> bool:
        """
        Solicita confirmación antes de ejecutar
        
        Args:
            records: Registros a procesar
            
        Returns:
            True si el usuario confirma
        """
        # Mostrar resumen pre-ejecución
        table = Table(title="🎯 Resumen de Ejecución")
        table.add_column("Concepto", style="white")
        table.add_column("Valor", style="cyan")
        
        table.add_row("Total registros", str(len(records)))
        table.add_row("Router", self.router_host)
        table.add_row("Modo", "MOCK" if self.use_mock else "REAL")
        table.add_row("Batch size", str(self.batch_size))
        table.add_row("Rollback threshold", f"{self.rollback_threshold:.1%}")
        
        console.print(table)
        
        # Mostrar muestra de usuarios a cortar
        if len(records) > 0:
            sample_table = Table(title="📋 Muestra de Usuarios (primeros 5)")
            sample_table.add_column("Username", style="yellow")
            sample_table.add_column("Días Mora", style="red")
            sample_table.add_column("Deuda", style="green")
            
            for record in records[:5]:
                sample_table.add_row(
                    record.username,
                    str(record.dias_mora),
                    f"${record.monto_deuda:,.2f}"
                )
            
            if len(records) > 5:
                sample_table.add_row("...", f"y {len(records) - 5} más", "...")
            
            console.print(sample_table)
        
        # Confirmación con texto claro
        warning_text = "[bold red]⚠️ ATENCIÓN ⚠️[/bold red]\n"
        if self.use_mock:
            warning_text += "Ejecutarás cortes en modo MOCK (simulación)\n"
        else:
            warning_text += f"Ejecutarás cortes REALES en router {self.router_host}\n"
        
        warning_text += f"Se cortarán {len(records)} servicios de clientes morosos\n"
        warning_text += "Esta acción afectará el servicio de internet de los usuarios"
        
        console.print(Panel(warning_text))
        
        return Confirm.ask("¿Confirmas la ejecución?", default=False)
    
    def show_dry_run_summary(self, results: List[Dict[str, Any]], successful: int):
        """Muestra resumen del dry run"""
        table = Table(title="📊 Resumen Simulación")
        table.add_column("Concepto", style="white")
        table.add_column("Cantidad", style="cyan")
        
        table.add_row("Total simulados", str(len(results)))
        table.add_row("Cortes exitosos", str(successful))
        table.add_row("Usuarios no encontrados", str(len(results) - successful))
        table.add_row("Tasa de éxito", f"{(successful/len(results)*100):.1f}%" if results else "0%")
        
        console.print(table)
    
    def generate_report(self, results: List[Dict[str, Any]], output_dir: Path, mode: str):
        """
        Genera reportes de la ejecución
        
        Args:
            results: Resultados de la ejecución
            output_dir: Directorio de salida
            mode: Modo de ejecución (dry-run o execute)
        """
        try:
            output_dir = Path(output_dir)
            output_dir.mkdir(parents=True, exist_ok=True)
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            
            # Reporte CSV
            csv_path = output_dir / f"reporte_cortes_{mode}_{timestamp}.csv"
            if results:
                import pandas as pd
                df = pd.DataFrame(results)
                df.to_csv(csv_path, index=False, encoding='utf-8')
            
            # Reporte JSON con estadísticas completas
            json_path = output_dir / f"estadisticas_{mode}_{timestamp}.json"
            report_data = {
                'metadata': {
                    'timestamp': datetime.now().isoformat(),
                    'mode': mode,
                    'router_host': self.router_host,
                    'use_mock': self.use_mock,
                    'batch_size': self.batch_size,
                    'rollback_threshold': self.rollback_threshold
                },
                'statistics': self.stats,
                'results': results
            }
            
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(report_data, f, indent=2, ensure_ascii=False)
            
            console.print(f"\n📁 [green]Reportes generados:[/green]")
            console.print(f"   📊 CSV: {csv_path}")
            console.print(f"   📋 JSON: {json_path}")
            
        except Exception as e:
            console.print(f"[red]❌ Error generando reportes: {e}[/red]")
            logger.error(f"Error generando reportes: {e}")


@click.command()
@click.option('--csv', required=True, type=click.Path(exists=True), help='Archivo CSV con morosos')
@click.option('--router', required=True, help='IP del router Mikrotik o "mock" para testing')
@click.option('--mode', type=click.Choice(['dry-run', 'execute']), default='dry-run', 
              help='Modo de ejecución: dry-run (simulación) o execute (real)')
@click.option('--min-days', default=30, type=int, help='Días mínimos de mora para incluir')
@click.option('--batch-size', default=10, type=int, help='Tamaño de lote para procesamiento')
@click.option('--output', default='output', type=click.Path(), help='Directorio para reportes')
@click.option('--username', help='Usuario del router (opcional, se solicitará si no se proporciona)')
@click.option('--password', help='Contraseña del router (opcional, se solicitará si no se proporciona)')
@click.option('--verbose', '-v', is_flag=True, help='Salida verbosa')
def main(csv, router, mode, min_days, batch_size, output, username, password, verbose):
    """
    🔥 Nordia ISP Suite - Automatización de Cortes por Mora
    
    Procesa archivo CSV de morosos y ejecuta cortes automáticos en Mikrotik RouterOS.
    
    Ejemplos de uso:
    
      # Simulación con datos de prueba
      python cut_service.py --csv data/sample_morosos.csv --router mock --mode dry-run
      
      # Ejecución real en router
      python cut_service.py --csv morosos.csv --router 192.168.1.1 --mode execute --min-days 45
    """
    
    # Configurar logging
    if verbose:
        logger.add(sys.stderr, level="DEBUG")
    else:
        logger.add(sys.stderr, level="INFO")
    
    # Banner inicial
    console.print(Panel.fit(
        "🔥 [bold red]Nordia ISP Suite[/bold red]\n"
        "💼 Automatización de Cortes por Mora\n"
        f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
        f"🎯 Modo: [bold]{mode.upper()}[/bold]"
    ))
    
    try:
        # 1. Procesar CSV
        console.print(f"\n[bold cyan]📂 PASO 1: Procesando CSV[/bold cyan]")
        processor = CSVProcessor(min_dias_mora=min_days)
        
        with console.status("[bold blue]Cargando y validando CSV..."):
            records = processor.process_csv(csv)
            csv_stats = processor.get_stats_summary()
        
        console.print(f"✅ CSV procesado: {len(records)} registros válidos de {csv_stats['total_records']} totales")
        
        if len(records) == 0:
            console.print("[red]❌ No hay registros válidos para procesar[/red]")
            sys.exit(1)
        
        # 2. Conectar a router
        console.print(f"\n[bold cyan]🔌 PASO 2: Conectando al Router[/bold cyan]")
        cutter = ServiceCutter(
            router_host=router,
            use_mock=router.lower() == "mock",
            batch_size=batch_size
        )
        
        if not cutter.connect_to_router(username, password):
            console.print("[red]❌ No se pudo establecer conexión con el router[/red]")
            sys.exit(1)
        
        # 3. Procesar según modo
        console.print(f"\n[bold cyan]⚡ PASO 3: Procesamiento en Modo {mode.upper()}[/bold cyan]")
        
        if mode == 'dry-run':
            results = cutter.process_records_dry_run(records)
        else:
            results = cutter.process_records_execute(records)
        
        # 4. Generar reportes
        console.print(f"\n[bold cyan]📊 PASO 4: Generando Reportes[/bold cyan]")
        cutter.generate_report(results, Path(output), mode)
        
        # 5. Resumen final
        console.print(f"\n[bold green]✅ PROCESO COMPLETADO[/bold green]")
        final_stats = cutter.stats
        
        summary_table = Table(title="📈 Estadísticas Finales")
        summary_table.add_column("Métrica", style="white")
        summary_table.add_column("Valor", style="green")
        
        summary_table.add_row("Registros procesados", str(final_stats.get('processed', len(results))))
        summary_table.add_row("Cortes exitosos", str(final_stats.get('successful_cuts', 0)))
        summary_table.add_row("Cortes fallidos", str(final_stats.get('failed_cuts', 0)))
        if final_stats.get('execution_time', 0) > 0:
            summary_table.add_row("Tiempo ejecución", f"{final_stats['execution_time']:.1f}s")
        summary_table.add_row("Rollback activado", "Sí" if final_stats.get('rollback_triggered') else "No")
        
        console.print(summary_table)
        
    except KeyboardInterrupt:
        console.print("\n[yellow]⚠️ Operación cancelada por el usuario[/yellow]")
        sys.exit(1)
    except Exception as e:
        console.print(f"\n[red]❌ Error crítico: {e}[/red]")
        logger.error(f"Error crítico en main: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()