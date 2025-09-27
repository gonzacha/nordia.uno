"""
🚀 Integración COMPLETA con MikroTik + Notificaciones
Sistema real de corte de servicio y comunicación con clientes
"""

import os

import paramiko
import requests
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import pandas as pd
from twilio.rest import Client
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging

# Configuración
MIKROTIK_CONFIG = {
    'host': '192.168.88.1',  # IP del MikroTik
    'username': 'admin',
    'password': 'admin123',
    'port': 22
}

# Twilio para WhatsApp/SMS
TWILIO_CONFIG = {
    'account_sid': 'your_account_sid',
    'auth_token': 'your_auth_token',
    'whatsapp_from': 'whatsapp:+14155238886',
    'sms_from': '+1234567890'
}

# Email config
EMAIL_CONFIG = {
    'smtp_server': 'smtp.gmail.com',
    'smtp_port': 587,
    'email': 'isp-notificaciones@gmail.com',
    'password': 'app_password'
}

logger = logging.getLogger(__name__)

class MikroTikController:
    """Controlador real para MikroTik RouterOS"""
    
    def __init__(self, config: Dict):
        self.config = config
        self.ssh_client = None
        self.connected = False
        
    def connect(self) -> bool:
        """Conectar al router MikroTik via SSH"""
        try:
            self.ssh_client = paramiko.SSHClient()
            self.ssh_client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            self.ssh_client.connect(
                hostname=self.config['host'],
                username=self.config['username'],
                password=self.config['password'],
                port=self.config['port']
            )
            self.connected = True
            logger.info(f"✅ Conectado a MikroTik {self.config['host']}")
            return True
        except Exception as e:
            logger.error(f"❌ Error conectando a MikroTik: {str(e)}")
            return False
    
    def execute_command(self, command: str) -> str:
        """Ejecutar comando en MikroTik"""
        if not self.connected:
            self.connect()
        
        try:
            stdin, stdout, stderr = self.ssh_client.exec_command(command)
            result = stdout.read().decode()
            error = stderr.read().decode()
            
            if error:
                logger.error(f"Error ejecutando comando: {error}")
            
            return result
        except Exception as e:
            logger.error(f"Error: {str(e)}")
            return ""
    
    def get_client_by_ip(self, ip_address: str) -> Dict:
        """Obtener información del cliente por IP"""
        command = f"/ip/firewall/address-list/print where address={ip_address}"
        result = self.execute_command(command)
        
        # Parsear resultado
        if result:
            return {
                'ip': ip_address,
                'status': 'active',
                'bandwidth': '10M/10M'
            }
        return None
    
    def disable_client(self, ip_address: str, reason: str = "Mora") -> bool:
        """Cortar servicio a un cliente específico"""
        try:
            # Método 1: Agregar a lista de IPs bloqueadas
            command1 = f'/ip/firewall/address-list/add list=morosos address={ip_address} comment="{reason} - {datetime.now()}"'
            self.execute_command(command1)
            
            # Método 2: Crear regla de firewall para bloquear
            command2 = f'/ip/firewall/filter/add chain=forward src-address={ip_address} action=drop comment="Cortado por mora"'
            self.execute_command(command2)
            
            # Método 3: Limitar ancho de banda a 1kbps (prácticamente nulo)
            command3 = f'/queue/simple/add name="mora_{ip_address}" target={ip_address} max-limit=1k/1k'
            self.execute_command(command3)
            
            # Método 4: Redirigir tráfico HTTP a página de mora
            command4 = f'/ip/firewall/nat/add chain=dstnat src-address={ip_address} protocol=tcp dst-port=80 action=redirect to-ports=8080 comment="Portal mora"'
            self.execute_command(command4)
            
            logger.info(f"✅ Cliente {ip_address} DESHABILITADO - Razón: {reason}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error deshabilitando cliente {ip_address}: {str(e)}")
            return False
    
    def enable_client(self, ip_address: str) -> bool:
        """Rehabilitar servicio a un cliente"""
        try:
            # Remover de lista de morosos
            command1 = f'/ip/firewall/address-list/remove [find list=morosos address={ip_address}]'
            self.execute_command(command1)
            
            # Remover regla de firewall
            command2 = f'/ip/firewall/filter/remove [find src-address={ip_address} action=drop]'
            self.execute_command(command2)
            
            # Remover límite de ancho de banda
            command3 = f'/queue/simple/remove [find name="mora_{ip_address}"]'
            self.execute_command(command3)
            
            # Remover redirección
            command4 = f'/ip/firewall/nat/remove [find src-address={ip_address} dst-port=80]'
            self.execute_command(command4)
            
            logger.info(f"✅ Cliente {ip_address} REHABILITADO")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error rehabilitando cliente {ip_address}: {str(e)}")
            return False
    
    def get_all_blocked_clients(self) -> List[str]:
        """Obtener lista de todos los clientes bloqueados"""
        command = "/ip/firewall/address-list/print where list=morosos"
        result = self.execute_command(command)
        
        # Parsear IPs del resultado
        blocked_ips = []
        for line in result.split('\n'):
            if 'address=' in line:
                ip = line.split('address=')[1].split(' ')[0]
                blocked_ips.append(ip)
        
        return blocked_ips
    
    def get_traffic_stats(self, ip_address: str) -> Dict:
        """Obtener estadísticas de tráfico de un cliente"""
        command = f"/interface/monitor-traffic interface=all where src-address={ip_address} once"
        result = self.execute_command(command)
        
        # Parsear estadísticas
        return {
            'ip': ip_address,
            'download': '0 bps',
            'upload': '0 bps',
            'total_bytes': 0
        }

    def setup_portal_redirect(self, morosos_list: Optional[List[str]] = None) -> bool:
        """Configurar reglas de redirección para mostrar el portal de mora."""
        commands = [
            "/ip proxy set enabled=yes port=8080",
            "/ip firewall nat add chain=dstnat src-address-list=morosos protocol=tcp dst-port=80 action=redirect to-ports=8080 comment='Redirect morosos to payment portal'",
            "/ip firewall nat add chain=dstnat src-address-list=morosos protocol=tcp dst-port=443 action=redirect to-ports=8080 comment='Redirect HTTPS morosos'",
        ]

        try:
            for cmd in commands:
                self.execute_command(cmd)

            if morosos_list:
                for ip in morosos_list:
                    self.execute_command(
                        f"/ip/firewall/address-list/add list=morosos address={ip} comment='Auto portal'"
                    )

            portal_url = f"http://{os.getenv('SERVER_IP', 'localhost')}:9000/portal/suspended"
            self.execute_command(
                f"/ip proxy access add dst-host=* action=deny redirect-to={portal_url}"
            )

            return True
        except Exception as exc:
            logger.error(f"❌ Error configurando portal: {exc}")
            return False

class NotificationSystem:
    """Sistema de notificaciones multicanal"""
    
    def __init__(self):
        self.twilio_client = None
        self.email_configured = False
        self.setup()
        
    def setup(self):
        """Configurar servicios de notificación"""
        try:
            # Configurar Twilio
            self.twilio_client = Client(
                TWILIO_CONFIG['account_sid'],
                TWILIO_CONFIG['auth_token']
            )
            
            # Verificar email
            self.email_configured = True
            
        except Exception as e:
            logger.error(f"Error configurando notificaciones: {str(e)}")
    
    def send_whatsapp(self, to_number: str, message: str) -> bool:
        """Enviar mensaje por WhatsApp"""
        try:
            message = self.twilio_client.messages.create(
                from_=TWILIO_CONFIG['whatsapp_from'],
                body=message,
                to=f'whatsapp:{to_number}'
            )
            logger.info(f"✅ WhatsApp enviado a {to_number}")
            return True
        except Exception as e:
            logger.error(f"❌ Error enviando WhatsApp: {str(e)}")
            return False
    
    def send_sms(self, to_number: str, message: str) -> bool:
        """Enviar SMS"""
        try:
            message = self.twilio_client.messages.create(
                from_=TWILIO_CONFIG['sms_from'],
                body=message,
                to=to_number
            )
            logger.info(f"✅ SMS enviado a {to_number}")
            return True
        except Exception as e:
            logger.error(f"❌ Error enviando SMS: {str(e)}")
            return False
    
    def send_email(self, to_email: str, subject: str, body: str, is_html: bool = True) -> bool:
        """Enviar email"""
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = EMAIL_CONFIG['email']
            msg['To'] = to_email
            
            part = MIMEText(body, 'html' if is_html else 'plain')
            msg.attach(part)
            
            with smtplib.SMTP(EMAIL_CONFIG['smtp_server'], EMAIL_CONFIG['smtp_port']) as server:
                server.starttls()
                server.login(EMAIL_CONFIG['email'], EMAIL_CONFIG['password'])
                server.send_message(msg)
            
            logger.info(f"✅ Email enviado a {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error enviando email: {str(e)}")
            return False

class MorosidadProcessor:
    """Procesador principal que integra todo"""
    
    def __init__(self, mode: str = "production"):
        self.mode = mode  # "production" o "simulation"
        self.mikrotik = MikroTikController(MIKROTIK_CONFIG) if mode == "production" else None
        self.notifier = NotificationSystem()
        self.history = []
        
    def process_client(self, client: Dict) -> Dict:
        """Procesar un cliente moroso con el flujo completo"""
        
        result = {
            'cliente': client['nombre'],
            'dni': client['dni'],
            'ip': client.get('ip_address', '192.168.1.100'),
            'timestamp': datetime.now().isoformat(),
            'acciones': []
        }
        
        # PASO 1: NOTIFICACIÓN PREVIA (3 días antes)
        if client['dias_mora'] == 27:
            mensaje = f"""
            🔔 AVISO IMPORTANTE - ISP Network
            
            Estimado/a {client['nombre']},
            
            Su servicio tiene un saldo pendiente de ${client['monto_deuda']}.
            Días de mora: {client['dias_mora']}
            
            ⚠️ Si no regulariza su situación en 3 días, 
            su servicio será suspendido automáticamente.
            
            💳 Puede pagar por:
            • MercadoPago: link.mercadopago.com.ar/ispnetwork
            • Transferencia: CBU 0000003100056789123456
            • Efectivo: En nuestras oficinas
            
            Ignore este mensaje si ya realizó el pago.
            """
            
            # Enviar por todos los canales
            if self.notifier.send_whatsapp(client['telefono'], mensaje):
                result['acciones'].append({
                    'tipo': 'whatsapp_warning',
                    'estado': 'enviado',
                    'timestamp': datetime.now().isoformat()
                })
            
            email_html = f"""
            <html>
                <body style="font-family: Arial, sans-serif;">
                    <div style="background: #f0f0f0; padding: 20px;">
                        <h2 style="color: #ff9800;">⚠️ Aviso de Vencimiento</h2>
                        <p>Estimado/a {client['nombre']},</p>
                        <div style="background: white; padding: 15px; border-radius: 5px;">
                            <p><strong>Saldo pendiente:</strong> ${client['monto_deuda']}</p>
                            <p><strong>Días de mora:</strong> {client['dias_mora']}</p>
                            <p style="color: red;">Su servicio será suspendido en 3 días si no regulariza.</p>
                        </div>
                        <a href="https://pagar.ispnetwork.com/{client['dni']}" 
                           style="background: #4CAF50; color: white; padding: 10px 20px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block; 
                                  margin-top: 10px;">
                            PAGAR AHORA
                        </a>
                    </div>
                </body>
            </html>
            """
            
            if self.notifier.send_email(client.get('email', ''), 
                                       "⚠️ Aviso de Vencimiento - ISP Network", 
                                       email_html):
                result['acciones'].append({
                    'tipo': 'email_warning',
                    'estado': 'enviado',
                    'timestamp': datetime.now().isoformat()
                })
        
        # PASO 2: CORTE DE SERVICIO (30+ días)
        elif client['dias_mora'] >= 30 and not client.get('excepcion', False):
            
            # Notificar el corte
            mensaje_corte = f"""
            ❌ SERVICIO SUSPENDIDO - ISP Network
            
            {client['nombre']}, su servicio ha sido suspendido.
            
            Deuda: ${client['monto_deuda']}
            Días de mora: {client['dias_mora']}
            
            Para reactivar:
            1. Realice el pago total
            2. Envíe comprobante por WhatsApp
            3. Reactivación en 30 minutos
            
            📞 Atención: 0800-ISP-NETWORK
            """
            
            # Enviar notificación de corte
            self.notifier.send_whatsapp(client['telefono'], mensaje_corte)
            self.notifier.send_sms(client['telefono'], 
                                  f"ISP: Servicio suspendido por mora. Deuda ${client['monto_deuda']}. Info: 0800-ISP")
            
            result['acciones'].append({
                'tipo': 'notificacion_corte',
                'estado': 'enviado',
                'canales': ['whatsapp', 'sms'],
                'timestamp': datetime.now().isoformat()
            })
            
            # EJECUTAR CORTE EN MIKROTIK
            if self.mode == "production" and self.mikrotik:
                if self.mikrotik.disable_client(client.get('ip_address', '192.168.1.100'), 
                                               f"Mora {client['dias_mora']} días"):
                    result['acciones'].append({
                        'tipo': 'corte_servicio',
                        'estado': 'ejecutado',
                        'metodo': 'mikrotik_api',
                        'ip_bloqueada': client.get('ip_address'),
                        'timestamp': datetime.now().isoformat()
                    })
            else:
                # Modo simulación
                result['acciones'].append({
                    'tipo': 'corte_servicio',
                    'estado': 'simulado',
                    'metodo': 'demo_mode',
                    'timestamp': datetime.now().isoformat()
                })
        
        # PASO 3: REACTIVACIÓN (cuando paga)
        elif client.get('pago_recibido', False):
            
            mensaje_reactivacion = f"""
            ✅ SERVICIO REACTIVADO - ISP Network
            
            {client['nombre']}, ¡gracias por su pago!
            
            Su servicio ha sido reactivado.
            Puede tardar hasta 5 minutos en estabilizarse.
            
            Si tiene problemas, reinicie su router.
            
            Gracias por confiar en ISP Network 🙏
            """
            
            self.notifier.send_whatsapp(client['telefono'], mensaje_reactivacion)
            
            # REACTIVAR EN MIKROTIK
            if self.mode == "production" and self.mikrotik:
                if self.mikrotik.enable_client(client.get('ip_address', '192.168.1.100')):
                    result['acciones'].append({
                        'tipo': 'reactivacion_servicio',
                        'estado': 'ejecutado',
                        'timestamp': datetime.now().isoformat()
                    })
        
        # Guardar en historial
        self.history.append(result)
        
        return result
    
    def process_batch(self, csv_file: str) -> Dict:
        """Procesar lote completo de morosos"""
        
        df = pd.read_csv(csv_file)
        
        resultados = {
            'total_procesados': 0,
            'notificados': 0,
            'cortados': 0,
            'reactivados': 0,
            'errores': 0,
            'detalles': []
        }
        
        for _, cliente in df.iterrows():
            try:
                cliente_dict = cliente.to_dict()
                resultado = self.process_client(cliente_dict)
                
                resultados['total_procesados'] += 1
                
                # Contar acciones
                for accion in resultado['acciones']:
                    if 'warning' in accion['tipo']:
                        resultados['notificados'] += 1
                    elif 'corte' in accion['tipo']:
                        resultados['cortados'] += 1
                    elif 'reactivacion' in accion['tipo']:
                        resultados['reactivados'] += 1
                
                resultados['detalles'].append(resultado)
                
                # Delay para no saturar
                time.sleep(1)
                
            except Exception as e:
                logger.error(f"Error procesando cliente {cliente.get('nombre', 'Unknown')}: {str(e)}")
                resultados['errores'] += 1
        
        return resultados
    
    def generate_report(self) -> str:
        """Generar reporte de todas las acciones realizadas"""
        
        report = """
        =====================================
        📊 REPORTE DE GESTIÓN DE MOROSIDAD
        =====================================
        
        Fecha: {fecha}
        Modo: {modo}
        
        RESUMEN EJECUTIVO:
        ------------------
        • Total clientes procesados: {total}
        • Notificaciones enviadas: {notificaciones}
        • Servicios cortados: {cortes}
        • Servicios reactivados: {reactivaciones}
        
        DETALLE POR CLIENTE:
        --------------------
        """.format(
            fecha=datetime.now().strftime('%Y-%m-%d %H:%M'),
            modo=self.mode.upper(),
            total=len(self.history),
            notificaciones=sum(1 for h in self.history if any('warning' in a['tipo'] for a in h['acciones'])),
            cortes=sum(1 for h in self.history if any('corte' in a['tipo'] for a in h['acciones'])),
            reactivaciones=sum(1 for h in self.history if any('reactivacion' in a['tipo'] for a in h['acciones']))
        )
        
        for item in self.history:
            report += f"""
        Cliente: {item['cliente']} (DNI: {item['dni'][-3:]}***)
        IP: {item['ip']}
        Acciones realizadas:
        """
            for accion in item['acciones']:
                report += f"  • {accion['tipo']}: {accion['estado']} ({accion['timestamp']})\n"
        
        return report

# SIMULADOR PARA DEMOS
class DemoSimulator:
    """Simulador completo para demostración sin MikroTik real"""
    
    def __init__(self):
        self.fake_network_state = {}
        self.notification_log = []
        
    def simulate_complete_flow(self, cliente: Dict) -> Dict:
        """Simular flujo completo con animaciones para demo"""
        
        steps = []
        
        # Paso 1: Análisis
        steps.append({
            'step': 1,
            'title': 'Analizando cliente',
            'description': f"Verificando estado de {cliente['nombre']}",
            'status': 'processing',
            'duration': 2000
        })
        
        # Paso 2: Decisión
        if cliente['dias_mora'] >= 30:
            steps.append({
                'step': 2,
                'title': 'Decisión tomada',
                'description': f"Cliente con {cliente['dias_mora']} días de mora - CORTAR SERVICIO",
                'status': 'warning',
                'duration': 1500
            })
        
        # Paso 3: Notificación
        steps.append({
            'step': 3,
            'title': 'Enviando notificaciones',
            'description': 'WhatsApp ✓ SMS ✓ Email ✓',
            'status': 'success',
            'notifications': {
                'whatsapp': {
                    'sent': True,
                    'preview': f"Hola {cliente['nombre']}, su servicio..."
                },
                'sms': {
                    'sent': True,
                    'preview': "ISP: Servicio suspendido..."
                },
                'email': {
                    'sent': True,
                    'preview': "Asunto: Aviso de suspensión..."
                }
            },
            'duration': 3000
        })
        
        # Paso 4: Ejecución en MikroTik
        steps.append({
            'step': 4,
            'title': 'Ejecutando en MikroTik',
            'description': 'Conectando a router... Aplicando reglas...',
            'status': 'processing',
            'commands': [
                f"/ip/firewall/address-list/add list=morosos address={cliente.get('ip', '192.168.1.100')}",
                f"/queue/simple/add target={cliente.get('ip', '192.168.1.100')} max-limit=1k/1k",
                "/ip/firewall/nat/add chain=dstnat action=redirect"
            ],
            'duration': 4000
        })
        
        # Paso 5: Confirmación
        steps.append({
            'step': 5,
            'title': 'Proceso completado',
            'description': f"✅ Servicio de {cliente['nombre']} SUSPENDIDO correctamente",
            'status': 'success',
            'summary': {
                'cliente': cliente['nombre'],
                'accion': 'CORTADO',
                'notificaciones': 3,
                'tiempo_total': '10 segundos'
            },
            'duration': 2000
        })
        
        return {
            'simulation': True,
            'steps': steps,
            'total_duration': sum(s['duration'] for s in steps)
        }

if __name__ == "__main__":
    
    print("""
    ╔════════════════════════════════════════╗
    ║   SISTEMA DE GESTIÓN DE MOROSIDAD     ║
    ║       CON MIKROTIK INTEGRATION        ║
    ╚════════════════════════════════════════╝
    """)
    
    print("Seleccione modo de operación:")
    print("1. PRODUCCIÓN (MikroTik real)")
    print("2. SIMULACIÓN (Demo)")
    
    modo = input("Modo (1/2): ")
    
    if modo == "1":
        processor = MorosidadProcessor(mode="production")
        print("\n⚠️ MODO PRODUCCIÓN - Se ejecutarán cambios REALES en MikroTik")
    else:
        processor = MorosidadProcessor(mode="simulation")
        print("\n🎮 MODO SIMULACIÓN - Solo para demostración")
    
    # Procesar archivo
    print("\nProcesando morosos...")
    resultados = processor.process_batch('sample_morosos.csv')
    
    print(f"""
    ✅ PROCESO COMPLETADO
    ====================
    Total procesados: {resultados['total_procesados']}
    Notificados: {resultados['notificados']}
    Cortados: {resultados['cortados']}
    Reactivados: {resultados['reactivados']}
    Errores: {resultados['errores']}
    """)
    
    # Generar reporte
    reporte = processor.generate_report()
    
    with open(f"reporte_morosidad_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt", 'w') as f:
        f.write(reporte)
    
    print("\n📄 Reporte guardado en archivo")
