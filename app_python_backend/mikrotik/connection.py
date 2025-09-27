"""
Nordia ISP Suite - Conexión Mikrotik RouterOS
Módulo para integración robusta con RouterOS API y SSH

Funcionalidades:
- Conexión segura con context manager
- Gestión completa de usuarios PPPoE
- Manejo robusto de errores y reconexión
- Rate limiting para prevenir sobrecarga
- Logging detallado de todas las operaciones

Autor: Gonzalo Haedo
Fecha: 2024-09-26
"""

import time
import socket
from typing import List, Dict, Any, Optional, Union
from contextlib import contextmanager
from dataclasses import dataclass
from loguru import logger

try:
    import librouteros
    from librouteros.exceptions import TrapError, FatalError, MultiTrapError
    ROUTEROS_AVAILABLE = True
except ImportError:
    logger.warning("librouteros no disponible - usando modo mock")
    ROUTEROS_AVAILABLE = False

try:
    import paramiko
    PARAMIKO_AVAILABLE = True
except ImportError:
    logger.warning("paramiko no disponible - SSH deshabilitado")
    PARAMIKO_AVAILABLE = False


@dataclass
class PPPoEUser:
    """Modelo de datos para usuario PPPoE"""
    name: str
    password: str
    service: str = "pppoe"
    disabled: bool = False
    profile: str = "default"
    local_address: Optional[str] = None
    remote_address: Optional[str] = None
    comment: Optional[str] = None


@dataclass
class ConnectionConfig:
    """Configuración de conexión al router"""
    host: str
    port: int = 8728
    username: str = "admin"
    password: str = ""
    timeout: int = 30
    max_retries: int = 3
    connection_type: str = "api"  # api, ssh
    rate_limit_delay: float = 0.5  # segundos entre comandos


class MikrotikConnectionError(Exception):
    """Excepción personalizada para errores de conexión"""
    pass


class MikrotikConnection:
    """
    Conexión robusta con Mikrotik RouterOS
    
    Ejemplo de uso:
        config = ConnectionConfig(
            host="192.168.1.1",
            username="admin",
            password="password123"
        )
        
        with MikrotikConnection(config) as mt:
            users = mt.get_ppp_secrets()
            mt.disable_ppp_user("juan.perez")
    """
    
    def __init__(self, config: ConnectionConfig):
        self.config = config
        self.connection = None
        self.api = None
        self.ssh_client = None
        self.is_connected = False
        self._last_command_time = 0
        
        # Configurar logging específico
        logger.add(
            "logs/mikrotik_connection.log",
            format="{time} | {level} | MIKROTIK | {message}",
            level="DEBUG",
            rotation="1 day",
            retention="7 days"
        )
    
    def __enter__(self):
        """Context manager entry"""
        self.connect()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        self.disconnect()
        if exc_type:
            logger.error(f"Error durante operación: {exc_type.__name__}: {exc_val}")
        return False
    
    def _apply_rate_limit(self):
        """Aplicar rate limiting entre comandos"""
        current_time = time.time()
        time_since_last = current_time - self._last_command_time
        
        if time_since_last < self.config.rate_limit_delay:
            sleep_time = self.config.rate_limit_delay - time_since_last
            logger.debug(f"Rate limiting: esperando {sleep_time:.2f}s")
            time.sleep(sleep_time)
        
        self._last_command_time = time.time()
    
    def connect(self) -> bool:
        """
        Establecer conexión con el router
        
        Returns:
            bool: True si conexión exitosa, False en caso contrario
        """
        logger.info(f"Conectando a {self.config.host}:{self.config.port}")
        
        for attempt in range(1, self.config.max_retries + 1):
            try:
                if self.config.connection_type == "api":
                    success = self._connect_api()
                elif self.config.connection_type == "ssh":
                    success = self._connect_ssh()
                else:
                    raise MikrotikConnectionError(f"Tipo de conexión no soportado: {self.config.connection_type}")
                
                if success:
                    self.is_connected = True
                    logger.success(f"Conectado exitosamente a {self.config.host} (intento {attempt})")
                    return True
                    
            except Exception as e:
                logger.warning(f"Intento {attempt} fallido: {str(e)}")
                if attempt < self.config.max_retries:
                    wait_time = 2 ** attempt  # Backoff exponencial
                    logger.info(f"Reintentando en {wait_time} segundos...")
                    time.sleep(wait_time)
                else:
                    logger.error(f"Falló conexión después de {self.config.max_retries} intentos")
                    raise MikrotikConnectionError(f"No se pudo conectar a {self.config.host}")
        
        return False
    
    def _connect_api(self) -> bool:
        """Conectar usando RouterOS API"""
        if not ROUTEROS_AVAILABLE:
            raise MikrotikConnectionError("librouteros no está instalado")
        
        try:
            self.connection = librouteros.connect(
                host=self.config.host,
                username=self.config.username,
                password=self.config.password,
                port=self.config.port,
                timeout=self.config.timeout
            )
            self.api = self.connection.path()
            
            # Verificar conexión con comando simple
            identity = list(self.api.system.identity.print())[0]
            logger.debug(f"Router identity: {identity.get('name', 'Unknown')}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error API: {str(e)}")
            return False
    
    def _connect_ssh(self) -> bool:
        """Conectar usando SSH"""
        if not PARAMIKO_AVAILABLE:
            raise MikrotikConnectionError("paramiko no está instalado")
        
        try:
            self.ssh_client = paramiko.SSHClient()
            self.ssh_client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            
            self.ssh_client.connect(
                hostname=self.config.host,
                port=self.config.port if self.config.port != 8728 else 22,
                username=self.config.username,
                password=self.config.password,
                timeout=self.config.timeout
            )
            
            # Verificar conexión
            stdin, stdout, stderr = self.ssh_client.exec_command('/system identity print')
            result = stdout.read().decode()
            logger.debug(f"SSH conectado: {result.strip()}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error SSH: {str(e)}")
            return False
    
    def disconnect(self):
        """Cerrar conexión limpiamente"""
        try:
            if self.connection:
                self.connection.close()
                logger.debug("Conexión API cerrada")
            
            if self.ssh_client:
                self.ssh_client.close()
                logger.debug("Conexión SSH cerrada")
                
        except Exception as e:
            logger.warning(f"Error al cerrar conexión: {str(e)}")
        finally:
            self.is_connected = False
            self.connection = None
            self.api = None
            self.ssh_client = None
    
    def _check_connection(self):
        """Verificar que la conexión está activa"""
        if not self.is_connected:
            raise MikrotikConnectionError("No hay conexión activa")
    
    def get_ppp_secrets(self) -> List[Dict[str, Any]]:
        """
        Obtener lista completa de usuarios PPPoE
        
        Returns:
            List[Dict]: Lista de usuarios con sus propiedades
        """
        self._check_connection()
        self._apply_rate_limit()
        
        try:
            if self.config.connection_type == "api":
                users = list(self.api.ppp.secret.print())
                logger.info(f"Obtenidos {len(users)} usuarios PPPoE")
                return users
            else:
                # Implementación SSH
                return self._get_ppp_secrets_ssh()
                
        except Exception as e:
            logger.error(f"Error obteniendo usuarios PPPoE: {str(e)}")
            raise MikrotikConnectionError(f"Error obteniendo usuarios: {str(e)}")
    
    def _get_ppp_secrets_ssh(self) -> List[Dict[str, Any]]:
        """Obtener usuarios PPPoE vía SSH"""
        stdin, stdout, stderr = self.ssh_client.exec_command('/ppp secret print detail')
        result = stdout.read().decode()
        
        # Parsear resultado SSH (implementación simplificada)
        users = []
        for line in result.split('\n'):
            if 'name=' in line:
                # Parsear línea de usuario SSH
                user_data = self._parse_ssh_user_line(line)
                if user_data:
                    users.append(user_data)
        
        return users
    
    def _parse_ssh_user_line(self, line: str) -> Optional[Dict[str, Any]]:
        """Parsear línea de usuario desde SSH"""
        # Implementación simplificada - mejorar según formato real
        try:
            parts = line.split()
            user_data = {}
            for part in parts:
                if '=' in part:
                    key, value = part.split('=', 1)
                    user_data[key] = value
            return user_data if 'name' in user_data else None
        except Exception:
            return None
    
    def get_user_status(self, username: str) -> Optional[Dict[str, Any]]:
        """
        Verificar estado de un usuario específico
        
        Args:
            username: Nombre del usuario PPPoE
            
        Returns:
            Dict con estado del usuario o None si no existe
        """
        self._check_connection()
        self._apply_rate_limit()
        
        try:
            if self.config.connection_type == "api":
                users = list(self.api.ppp.secret.print(name=username))
                return users[0] if users else None
            else:
                # Implementación SSH
                stdin, stdout, stderr = self.ssh_client.exec_command(f'/ppp secret print where name="{username}"')
                result = stdout.read().decode()
                return self._parse_ssh_user_line(result) if result.strip() else None
                
        except Exception as e:
            logger.error(f"Error verificando usuario {username}: {str(e)}")
            return None
    
    def disable_ppp_user(self, username: str) -> bool:
        """
        Deshabilitar usuario PPPoE
        
        Args:
            username: Nombre del usuario a deshabilitar
            
        Returns:
            bool: True si operación exitosa
        """
        self._check_connection()
        self._apply_rate_limit()
        
        logger.info(f"Deshabilitando usuario: {username}")
        
        try:
            if self.config.connection_type == "api":
                # Encontrar usuario
                users = list(self.api.ppp.secret.print(name=username))
                if not users:
                    logger.warning(f"Usuario no encontrado: {username}")
                    return False
                
                user_id = users[0]['.id']
                
                # Deshabilitar
                self.api.ppp.secret.set(**{'.id': user_id, 'disabled': 'yes'})
                
                # Verificar cambio
                updated_user = list(self.api.ppp.secret.print(**{'.id': user_id}))[0]
                is_disabled = updated_user.get('disabled', 'false') == 'true'
                
                if is_disabled:
                    logger.success(f"Usuario {username} deshabilitado exitosamente")
                    return True
                else:
                    logger.error(f"Fallo al deshabilitar usuario {username}")
                    return False
                    
            else:
                # Implementación SSH
                stdin, stdout, stderr = self.ssh_client.exec_command(f'/ppp secret set [find name="{username}"] disabled=yes')
                error_output = stderr.read().decode()
                
                if not error_output:
                    logger.success(f"Usuario {username} deshabilitado exitosamente (SSH)")
                    return True
                else:
                    logger.error(f"Error SSH deshabilitando {username}: {error_output}")
                    return False
                    
        except Exception as e:
            logger.error(f"Error deshabilitando usuario {username}: {str(e)}")
            return False
    
    def enable_ppp_user(self, username: str) -> bool:
        """
        Habilitar usuario PPPoE
        
        Args:
            username: Nombre del usuario a habilitar
            
        Returns:
            bool: True si operación exitosa
        """
        self._check_connection()
        self._apply_rate_limit()
        
        logger.info(f"Habilitando usuario: {username}")
        
        try:
            if self.config.connection_type == "api":
                # Encontrar usuario
                users = list(self.api.ppp.secret.print(name=username))
                if not users:
                    logger.warning(f"Usuario no encontrado: {username}")
                    return False
                
                user_id = users[0]['.id']
                
                # Habilitar
                self.api.ppp.secret.set(**{'.id': user_id, 'disabled': 'no'})
                
                # Verificar cambio
                updated_user = list(self.api.ppp.secret.print(**{'.id': user_id}))[0]
                is_enabled = updated_user.get('disabled', 'false') == 'false'
                
                if is_enabled:
                    logger.success(f"Usuario {username} habilitado exitosamente")
                    return True
                else:
                    logger.error(f"Fallo al habilitar usuario {username}")
                    return False
                    
            else:
                # Implementación SSH
                stdin, stdout, stderr = self.ssh_client.exec_command(f'/ppp secret set [find name="{username}"] disabled=no')
                error_output = stderr.read().decode()
                
                if not error_output:
                    logger.success(f"Usuario {username} habilitado exitosamente (SSH)")
                    return True
                else:
                    logger.error(f"Error SSH habilitando {username}: {error_output}")
                    return False
                    
        except Exception as e:
            logger.error(f"Error habilitando usuario {username}: {str(e)}")
            return False
    
    def get_active_connections(self) -> List[Dict[str, Any]]:
        """
        Obtener conexiones PPPoE activas
        
        Returns:
            List[Dict]: Lista de conexiones activas
        """
        self._check_connection()
        self._apply_rate_limit()
        
        try:
            if self.config.connection_type == "api":
                active = list(self.api.ppp.active.print())
                logger.info(f"Conexiones activas: {len(active)}")
                return active
            else:
                # Implementación SSH
                stdin, stdout, stderr = self.ssh_client.exec_command('/ppp active print')
                result = stdout.read().decode()
                # Parsear resultado (implementación simplificada)
                return self._parse_active_connections_ssh(result)
                
        except Exception as e:
            logger.error(f"Error obteniendo conexiones activas: {str(e)}")
            return []
    
    def _parse_active_connections_ssh(self, result: str) -> List[Dict[str, Any]]:
        """Parsear conexiones activas desde SSH"""
        connections = []
        for line in result.split('\n'):
            if 'name=' in line:
                conn_data = self._parse_ssh_user_line(line)
                if conn_data:
                    connections.append(conn_data)
        return connections
    
    def batch_disable(self, usernames: List[str]) -> Dict[str, bool]:
        """
        Deshabilitar múltiples usuarios en lote
        
        Args:
            usernames: Lista de nombres de usuario
            
        Returns:
            Dict[str, bool]: Resultado por usuario
        """
        self._check_connection()
        
        logger.info(f"Iniciando deshabilitación en lote: {len(usernames)} usuarios")
        results = {}
        
        for username in usernames:
            try:
                results[username] = self.disable_ppp_user(username)
            except Exception as e:
                logger.error(f"Error procesando {username}: {str(e)}")
                results[username] = False
        
        successful = sum(1 for success in results.values() if success)
        logger.info(f"Lote completado: {successful}/{len(usernames)} exitosos")
        
        return results
    
    def batch_enable(self, usernames: List[str]) -> Dict[str, bool]:
        """
        Habilitar múltiples usuarios en lote
        
        Args:
            usernames: Lista de nombres de usuario
            
        Returns:
            Dict[str, bool]: Resultado por usuario
        """
        self._check_connection()
        
        logger.info(f"Iniciando habilitación en lote: {len(usernames)} usuarios")
        results = {}
        
        for username in usernames:
            try:
                results[username] = self.enable_ppp_user(username)
            except Exception as e:
                logger.error(f"Error procesando {username}: {str(e)}")
                results[username] = False
        
        successful = sum(1 for success in results.values() if success)
        logger.info(f"Lote completado: {successful}/{len(usernames)} exitosos")
        
        return results
    
    def disconnect_active_user(self, username: str) -> bool:
        """
        Desconectar usuario actualmente conectado
        
        Args:
            username: Nombre del usuario a desconectar
            
        Returns:
            bool: True si operación exitosa
        """
        self._check_connection()
        self._apply_rate_limit()
        
        logger.info(f"Desconectando usuario activo: {username}")
        
        try:
            if self.config.connection_type == "api":
                # Encontrar conexión activa
                active = list(self.api.ppp.active.print(name=username))
                if not active:
                    logger.warning(f"Usuario {username} no está conectado")
                    return False
                
                # Desconectar
                for connection in active:
                    self.api.ppp.active.remove(**{'.id': connection['.id']})
                
                logger.success(f"Usuario {username} desconectado")
                return True
                
            else:
                # Implementación SSH
                stdin, stdout, stderr = self.ssh_client.exec_command(f'/ppp active remove [find name="{username}"]')
                error_output = stderr.read().decode()
                
                if not error_output:
                    logger.success(f"Usuario {username} desconectado (SSH)")
                    return True
                else:
                    logger.error(f"Error SSH desconectando {username}: {error_output}")
                    return False
                    
        except Exception as e:
            logger.error(f"Error desconectando usuario {username}: {str(e)}")
            return False


# Funciones de utilidad

def create_connection_from_env() -> MikrotikConnection:
    """
    Crear conexión desde variables de entorno
    
    Returns:
        MikrotikConnection: Instancia configurada
    """
    import os
    from dotenv import load_dotenv
    
    load_dotenv()
    
    config = ConnectionConfig(
        host=os.getenv('MIKROTIK_HOST', '192.168.1.1'),
        port=int(os.getenv('MIKROTIK_PORT', '8728')),
        username=os.getenv('MIKROTIK_USERNAME', 'admin'),
        password=os.getenv('MIKROTIK_PASSWORD', ''),
        timeout=int(os.getenv('MIKROTIK_TIMEOUT', '30')),
        max_retries=int(os.getenv('MIKROTIK_MAX_RETRIES', '3')),
        connection_type=os.getenv('MIKROTIK_CONNECTION_TYPE', 'api')
    )
    
    return MikrotikConnection(config)


def test_connection_config(config: ConnectionConfig) -> bool:
    """
    Probar configuración de conexión
    
    Args:
        config: Configuración a probar
        
    Returns:
        bool: True si conexión exitosa
    """
    try:
        with MikrotikConnection(config) as mt:
            users = mt.get_ppp_secrets()
            logger.success(f"Conexión exitosa: {len(users)} usuarios encontrados")
            return True
    except Exception as e:
        logger.error(f"Error de conexión: {str(e)}")
        return False


if __name__ == "__main__":
    # Ejemplo de uso
    from dotenv import load_dotenv
    import os
    
    load_dotenv()
    
    config = ConnectionConfig(
        host=os.getenv('MIKROTIK_HOST', '192.168.1.1'),
        username=os.getenv('MIKROTIK_USERNAME', 'admin'),
        password=os.getenv('MIKROTIK_PASSWORD', '')
    )
    
    try:
        with MikrotikConnection(config) as mt:
            print("✅ Conexión establecida")
            
            # Obtener usuarios
            users = mt.get_ppp_secrets()
            print(f"📊 Usuarios encontrados: {len(users)}")
            
            # Mostrar primeros 5 usuarios
            for user in users[:5]:
                name = user.get('name', 'Unknown')
                disabled = user.get('disabled', 'false')
                status = "❌ Deshabilitado" if disabled == 'true' else "✅ Habilitado"
                print(f"  {name}: {status}")
                
    except Exception as e:
        print(f"❌ Error: {str(e)}")