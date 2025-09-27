#!/usr/bin/env python3
"""
Demo ISP - Nordia ISP Suite
Script de demostración profesional para presentar a ISPs
Simula un caso real de cortes por mora con datos argentinos
"""

import sys
import time
from pathlib import Path
from datetime import datetime
from typing import List

# Add app to path
sys.path.append(str(Path(__file__).parent.parent))

try:
    from rich.console import Console
    from rich.panel import Panel
    from rich.table import Table
    from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TimeElapsedColumn
    from rich.text import Text
    from rich.live import Live
    from rich.layout import Layout
    from rich.align import Align
    
    from app.core.csv_processor import CSVProcessor
    from app.mikrotik.mock_router import MockRouterAPI
    
except ImportError as e:
    print(f"❌ Error importando dependencias: {e}")
    sys.exit(1)

console = Console()


class ISPDemo:
    """Demo profesional para ISPs"""
    
    def __init__(self):
        self.isp_name = "TeleCorrientes SA"
        self.total_clients = 1247
        self.monthly_revenue = 15500000  # ARS
        self.manual_hours_week = 12
        self.hourly_cost = 3500  # ARS por hora
    
    def show_intro(self):
        """Introducción profesional"""
        intro_text = f"""
🏢 [bold blue]{self.isp_name}[/bold blue] - Caso de Estudio Real

📊 SITUACIÓN ACTUAL:
  👥 Clientes activos: {self.total_clients:,}
  💰 Facturación mensual: ${self.monthly_revenue:,}
  ⏰ Horas manuales/semana: {self.manual_hours_week}h
  💸 Costo operativo mensual: ${self.manual_hours_week * 4 * self.hourly_cost:,}

🎯 OBJETIVO:
  Automatizar proceso de cortes por mora
  Reducir errores humanos a CERO
  Generar reportes automáticos para gerencia
"""
        
        console.print(Panel.fit(
            intro_text,
            title="🚀 NORDIA ISP SUITE - DEMO EJECUTIVO",
            title_align="center",
            border_style="blue"
        ))
        
        console.print("\n[yellow]Presiona ENTER para continuar...[/yellow]")
        input()
    
    def show_problem_analysis(self):
        """Análisis del problema actual"""
        console.print("\n" + "="*60)
        console.print(Align.center("[bold red]🚨 ANÁLISIS DEL PROBLEMA ACTUAL 🚨[/bold red]"))
        console.print("="*60)
        
        problems_table = Table(title="💸 COSTOS OPERATIVOS ACTUALES")
        problems_table.add_column("Concepto", style="white", no_wrap=True)
        problems_table.add_column("Tiempo", style="yellow")
        problems_table.add_column("Costo Mensual", style="red")
        problems_table.add_column("Costo Anual", style="bold red")
        
        weekly_cost = self.manual_hours_week * self.hourly_cost
        monthly_cost = weekly_cost * 4
        annual_cost = monthly_cost * 12
        
        problems_table.add_row(
            "Gestión manual morosos", 
            f"{self.manual_hours_week}h/semana",
            f"${monthly_cost:,}",
            f"${annual_cost:,}"
        )
        problems_table.add_row(
            "Errores y retrabajos", 
            "3h/semana",
            f"${3 * 4 * self.hourly_cost:,}",
            f"${3 * 4 * self.hourly_cost * 12:,}"
        )
        problems_table.add_row(
            "Reportes manuales", 
            "2h/semana",
            f"${2 * 4 * self.hourly_cost:,}",
            f"${2 * 4 * self.hourly_cost * 12:,}"
        )
        
        total_annual = annual_cost + (3 * 4 * self.hourly_cost * 12) + (2 * 4 * self.hourly_cost * 12)
        problems_table.add_row(
            "[bold]TOTAL ANUAL[/bold]", 
            "[bold]17h/semana[/bold]",
            f"[bold]${total_annual//12:,}[/bold]",
            f"[bold red]${total_annual:,}[/bold red]"
        )
        
        console.print(problems_table)
        
        # Problemas adicionales
        additional_problems = Table(title="⚠️ PROBLEMAS OPERATIVOS")
        additional_problems.add_column("Problema", style="white")
        additional_problems.add_column("Impacto", style="red")
        
        additional_problems.add_row("Errores humanos", "5-8% de casos mal gestionados")
        additional_problems.add_row("Demoras en cortes", "24-48h promedio")
        additional_problems.add_row("Falta de trazabilidad", "Sin audit trail")
        additional_problems.add_row("Clientes enojados", "Reclamos por errores")
        additional_problems.add_row("Pérdida de ingresos", "Demoras = dinero perdido")
        
        console.print("\n")
        console.print(additional_problems)
        
        console.print("\n[yellow]Presiona ENTER para ver la SOLUCIÓN...[/yellow]")
        input()
    
    def show_solution_demo(self):
        """Demo de la solución"""
        console.print("\n" + "="*60)
        console.print(Align.center("[bold green]✨ SOLUCIÓN: NORDIA ISP SUITE ✨[/bold green]"))
        console.print("="*60)
        
        # Mostrar proceso actual vs automatizado
        comparison = Table(title="⚡ ANTES vs DESPUÉS")
        comparison.add_column("Proceso", style="white")
        comparison.add_column("ANTES (Manual)", style="red")
        comparison.add_column("DESPUÉS (Automatizado)", style="green")
        
        comparison.add_row(
            "Carga de morosos",
            "30 min - Excel manual",
            "5 seg - CSV automático"
        )
        comparison.add_row(
            "Validación datos",
            "45 min - revisión manual",
            "10 seg - validación automática"
        )
        comparison.add_row(
            "Conexión router",
            "10 min - SSH manual",
            "2 seg - conexión automática"
        )
        comparison.add_row(
            "Ejecución cortes",
            "120 min - uno por uno",
            "30 seg - batch automático"
        )
        comparison.add_row(
            "Generación reportes",
            "45 min - planillas manuales",
            "5 seg - reportes automáticos"
        )
        comparison.add_row(
            "[bold]TOTAL[/bold]",
            "[bold red]250 minutos[/bold red]",
            "[bold green]52 segundos[/bold green]"
        )
        
        console.print(comparison)
        
        console.print("\n[yellow]Presiona ENTER para ver la DEMOSTRACIÓN EN VIVO...[/yellow]")
        input()
    
    def run_live_demo(self):
        """Demostración en vivo del sistema"""
        console.print("\n" + "="*60)
        console.print(Align.center("[bold cyan]🔥 DEMOSTRACIÓN EN VIVO 🔥[/bold cyan]"))
        console.print("="*60)
        
        # Simular carga de archivo
        console.print("\n[bold]📂 PASO 1: Cargando archivo CSV de morosos...[/bold]")
        
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            BarColumn(),
            TimeElapsedColumn(),
            console=console
        ) as progress:
            
            task1 = progress.add_task("Analizando archivo CSV...", total=100)
            for i in range(100):
                time.sleep(0.02)
                progress.update(task1, advance=1)
        
        # Mostrar resultados de validación
        console.print("✅ Archivo procesado exitosamente")
        
        validation_table = Table(title="📊 Validación de Datos")
        validation_table.add_column("Métrica", style="white")
        validation_table.add_column("Resultado", style="green")
        
        validation_table.add_row("Registros totales", "127")
        validation_table.add_row("Registros válidos", "124 (97.6%)")
        validation_table.add_row("Morosos +30 días", "89")
        validation_table.add_row("Excepciones", "3 (filtradas)")
        validation_table.add_row("Para corte", "86")
        
        console.print(validation_table)
        
        # Simular conexión a router
        console.print("\n[bold]🔌 PASO 2: Conectando al router Mikrotik...[/bold]")
        
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console
        ) as progress:
            
            task2 = progress.add_task("Estableciendo conexión segura...", total=None)
            time.sleep(2)
            progress.update(task2, description="Autenticando usuario...")
            time.sleep(1)
            progress.update(task2, description="Verificando permisos...")
            time.sleep(1)
            progress.update(task2, description="Conexión establecida ✅")
            time.sleep(0.5)
        
        console.print("✅ Conectado a router 192.168.1.1 - MikrotikOS v7.x")
        
        # Mostrar preview de cortes
        console.print("\n[bold]🎯 PASO 3: Preview de usuarios para corte...[/bold]")
        
        preview_table = Table(title="👥 Usuarios Seleccionados (muestra)")
        preview_table.add_column("Usuario", style="yellow")
        preview_table.add_column("Días Mora", style="red")
        preview_table.add_column("Deuda", style="green")
        preview_table.add_column("Estado", style="white")
        
        preview_table.add_row("juan.perez", "45", "$15,420", "Activo → Cortar")
        preview_table.add_row("maria.gonzalez", "67", "$8,750", "Activo → Cortar")
        preview_table.add_row("carlos.lopez", "89", "$22,100", "Activo → Cortar")
        preview_table.add_row("ana.rodriguez", "156", "$45,200", "Activo → Cortar")
        preview_table.add_row("...", "...", "...", "y 82 usuarios más")
        
        console.print(preview_table)
        
        # Simular ejecución
        console.print("\n[bold red]⚡ PASO 4: Ejecutando cortes automáticos...[/bold red]")
        console.print("[yellow]⚠️ Modo demostración - NO se ejecutan cambios reales[/yellow]\n")
        
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            BarColumn(),
            TextColumn("[progress.percentage]{task.percentage:>3.0f}%"),
            console=console
        ) as progress:
            
            task3 = progress.add_task("Procesando cortes por lotes...", total=86)
            
            for i in range(86):
                time.sleep(0.1)  # Simular tiempo real de procesamiento
                if i < 10:
                    progress.update(task3, advance=1, description=f"Procesando lote 1/9...")
                elif i < 20:
                    progress.update(task3, advance=1, description=f"Procesando lote 2/9...")
                elif i < 30:
                    progress.update(task3, advance=1, description=f"Procesando lote 3/9...")
                elif i < 40:
                    progress.update(task3, advance=1, description=f"Procesando lote 4/9...")
                elif i < 50:
                    progress.update(task3, advance=1, description=f"Procesando lote 5/9...")
                elif i < 60:
                    progress.update(task3, advance=1, description=f"Procesando lote 6/9...")
                elif i < 70:
                    progress.update(task3, advance=1, description=f"Procesando lote 7/9...")
                elif i < 80:
                    progress.update(task3, advance=1, description=f"Procesando lote 8/9...")
                else:
                    progress.update(task3, advance=1, description=f"Procesando lote 9/9...")
        
        console.print("✅ Proceso completado en 8.6 segundos")
        
        # Mostrar resultados
        results_table = Table(title="📈 Resultados de Ejecución")
        results_table.add_column("Métrica", style="white")
        results_table.add_column("Resultado", style="green")
        
        results_table.add_row("Usuarios procesados", "86/86 (100%)")
        results_table.add_row("Cortes exitosos", "84 (97.7%)")
        results_table.add_row("Errores", "2 (usuarios no encontrados)")
        results_table.add_row("Tiempo total", "8.6 segundos")
        results_table.add_row("Rollback necesario", "NO")
        
        console.print(results_table)
        
        # Generar reportes
        console.print("\n[bold]📊 PASO 5: Generando reportes automáticos...[/bold]")
        
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console
        ) as progress:
            
            task4 = progress.add_task("Generando reporte CSV...", total=None)
            time.sleep(1)
            progress.update(task4, description="Generando reporte JSON...")
            time.sleep(1)
            progress.update(task4, description="Generando reporte para gerencia...")
            time.sleep(1)
        
        console.print("✅ Reportes generados:")
        console.print("   📄 cortes_ejecutados_20250926.csv")
        console.print("   📋 estadisticas_detalladas.json") 
        console.print("   📊 reporte_gerencial.pdf")
        
        console.print("\n[yellow]Presiona ENTER para ver el ROI...[/yellow]")
        input()
    
    def show_roi_analysis(self):
        """Análisis de ROI"""
        console.print("\n" + "="*60)
        console.print(Align.center("[bold green]💰 ANÁLISIS DE RETORNO DE INVERSIÓN 💰[/bold green]"))
        console.print("="*60)
        
        # Costos actuales vs automatizados
        roi_table = Table(title="💸 COMPARACIÓN COSTOS ANUALES")
        roi_table.add_column("Concepto", style="white")
        roi_table.add_column("Costo Actual", style="red")
        roi_table.add_column("Costo Automatizado", style="green")
        roi_table.add_column("Ahorro", style="bold green")
        
        manual_annual = 17 * 4 * self.hourly_cost * 12  # 17h semanales
        automated_annual = 2 * 4 * self.hourly_cost * 12  # 2h semanales supervisión
        software_cost = 150000  # Costo del software anual
        total_automated = automated_annual + software_cost
        savings = manual_annual - total_automated
        
        roi_table.add_row(
            "Gestión de morosos",
            f"${manual_annual:,}",
            f"${total_automated:,}",
            f"${savings:,}"
        )
        
        # Beneficios adicionales
        roi_table.add_row(
            "Reducción errores (estimado)",
            f"${500000:,}",
            "$0",
            f"${500000:,}"
        )
        
        roi_table.add_row(
            "Mayor velocidad cobranza",
            "Variable",
            "Variable",
            f"${300000:,} (est.)"
        )
        
        total_savings = savings + 500000 + 300000
        roi_percentage = (total_savings / software_cost) * 100
        
        roi_table.add_row(
            "[bold]AHORRO TOTAL ANUAL[/bold]",
            "",
            "",
            f"[bold green]${total_savings:,}[/bold green]"
        )
        
        console.print(roi_table)
        
        # ROI Summary
        roi_summary = Panel.fit(
            f"""
[bold green]🎯 RESUMEN ROI[/bold green]

💰 Inversión software: ${software_cost:,}/año
💵 Ahorro total anual: ${total_savings:,}
📈 ROI: {roi_percentage:.0f}%
⏱️ Período recuperación: {(software_cost/total_savings)*12:.1f} meses

[bold cyan]BENEFICIOS ADICIONALES:[/bold cyan]
✅ Cero errores humanos
✅ Proceso 300x más rápido  
✅ Trazabilidad completa
✅ Reportes automáticos
✅ Integración existente
""",
            title="💎 RETORNO DE INVERSIÓN",
            border_style="green"
        )
        
        console.print("\n")
        console.print(roi_summary)
        
        console.print("\n[yellow]Presiona ENTER para ver la propuesta comercial...[/yellow]")
        input()
    
    def show_commercial_proposal(self):
        """Propuesta comercial"""
        console.print("\n" + "="*60)
        console.print(Align.center("[bold blue]📋 PROPUESTA COMERCIAL 📋[/bold blue]"))
        console.print("="*60)
        
        proposal = Panel.fit(
            f"""
[bold blue]🏢 NORDIA ISP SUITE - Propuesta para {self.isp_name}[/bold blue]

[bold]📦 PAQUETE RECOMENDADO: PROFESSIONAL[/bold]

✅ Software completo con todas las funciones
✅ Instalación y configuración incluida
✅ Capacitación equipo técnico (8 horas)
✅ Soporte técnico 12 meses
✅ Actualizaciones incluidas
✅ Backup y rollback automático

[bold green]💰 INVERSIÓN:[/bold green]
   Setup inicial: $50,000 (una vez)
   Licencia anual: $150,000/año
   [dim](Incluye soporte y actualizaciones)[/dim]

[bold cyan]⏰ CRONOGRAMA IMPLEMENTACIÓN:[/bold cyan]
   Semana 1-2: Instalación y configuración
   Semana 3: Capacitación y pruebas
   Semana 4: Go-live con acompañamiento

[bold yellow]🎁 PROMOCIÓN LANZAMIENTO:[/bold yellow]
   [bold]30% descuento primer año[/bold]
   Setup inicial SIN COSTO
   [dim]Válida hasta fin de mes[/dim]

[bold red]💎 PRECIO FINAL PROMOCIONAL:[/bold red]
   Año 1: $105,000 (ahorro $95,000)
   Años siguientes: $150,000
""",
            title="💼 PROPUESTA EJECUTIVA",
            border_style="blue"
        )
        
        console.print(proposal)
        
        # Call to action
        cta = Panel.fit(
            """
[bold green]🚀 PRÓXIMOS PASOS:[/bold green]

1️⃣ [bold]Reunión técnica[/bold] - Validar infraestructura
2️⃣ [bold]Prueba piloto[/bold] - 50 usuarios de prueba  
3️⃣ [bold]Implementación[/bold] - Go-live completo

[bold cyan]📞 CONTACTO INMEDIATO:[/bold cyan]
📱 WhatsApp: +54 379 4123456
📧 Email: gonzalo@nordia-suite.com
💻 Web: nordia-isp-suite.com

[bold yellow]⚡ RESPUESTA EN 24 HORAS[/bold yellow]
""",
            title="📞 CALL TO ACTION",
            border_style="yellow"
        )
        
        console.print("\n")
        console.print(cta)
    
    def run_full_demo(self):
        """Ejecutar demo completo"""
        try:
            self.show_intro()
            self.show_problem_analysis()
            self.show_solution_demo()
            self.run_live_demo()
            self.show_roi_analysis()
            self.show_commercial_proposal()
            
            # Final
            console.print("\n" + "="*60)
            console.print(Align.center("[bold green]🎉 FIN DE DEMOSTRACIÓN 🎉[/bold green]"))
            console.print(Align.center("[bold]Gracias por su tiempo![/bold]"))
            console.print("="*60)
            
        except KeyboardInterrupt:
            console.print("\n[yellow]Demo interrumpida. ¡Gracias![/yellow]")


def main():
    """Función principal"""
    demo = ISPDemo()
    demo.run_full_demo()


if __name__ == "__main__":
    main()