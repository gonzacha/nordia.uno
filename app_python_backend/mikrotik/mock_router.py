"""
Nordia ISP Suite - Mock Router para Testing
Simulador completo de RouterOS para desarrollo y testing sin hardware real

Funcionalidades:
- Simula API completa de Mikrotik RouterOS
- Mantiene estado persistente de usuarios
- Respuestas realistas con delays simulados
- Generación de datos fake para testing
- Compatibilidad completa con MikrotikConnection

Autor: Gonzalo Haedo
Fecha: 2024-09-26
"""

import time
import uuid
import random
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
from copy import deepcopy
from loguru import logger


@dataclass
class MockPPPoEUser:
    """Usuario PPPoE simulado"""
    id: str
    name: str
    password: str = "123456"
    service: str = "pppoe"
    disabled: bool = False
    profile: str = "default"
    local_address: str = "192.168.1.1"
    remote_address: str = ""
    comment: str = ""
    bytes_in: int = 0
    bytes_out: int = 0
    last_seen: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convertir a diccionario como retorna RouterOS API"""
        return {
            '.id': self.id,
            'name': self.name,
            'password': self.password,
            'service': self.service,
            'disabled': 'true' if self.disabled else 'false',
            'profile': self.profile,
            'local-address': self.local_address,
            'remote-address': self.remote_address,
            'comment': self.comment,
            'bytes-in': str(self.bytes_in),
            'bytes-out': str(self.bytes_out),
            'last-seen': self.last_seen or "never"
        }


@dataclass
class MockActiveConnection:
    """Conexión PPPoE activa simulada"""
    id: str
    name: str
    address: str
    uptime: str
    encoding: str = "default"
    caller_id: str = ""
    bytes_in: int = 0
    bytes_out: int = 0
    
    def to_dict(self) -> Dict[str, Any]:
        """Convertir a diccionario como retorna RouterOS API"""
        return {
            '.id': self.id,
            'name': self.name,
            'address': self.address,
            'uptime': self.uptime,
            'encoding': self.encoding,
            'caller-id': self.caller_id,
            'bytes-in': str(self.bytes_in),
            'bytes-out': str(self.bytes_out)
        }


class MockRouterAPI:
    """
    Simulador de RouterOS API
    Imita el comportamiento de librouteros para testing
    """
    
    def __init__(self, simulate_delays: bool = True, failure_rate: float = 0.0):
        """
        Args:
            simulate_delays: Si simular delays realistas
            failure_rate: Porcentaje de comandos que fallan (0.0-1.0)
        """
        self.simulate_delays = simulate_delays
        self.failure_rate = failure_rate
        self.users: Dict[str, MockPPPoEUser] = {}
        self.active_connections: Dict[str, MockActiveConnection] = {}
        self.is_connected = False
        self.command_count = 0
        
        # Generar usuarios de prueba
        self._generate_sample_users()
        
        logger.info(f"Mock Router inicializado con {len(self.users)} usuarios")
    
    def _simulate_network_delay(self):
        """Simular delay de red realista"""
        if self.simulate_delays:
            delay = random.uniform(0.01, 0.1)  # 10-100ms
            time.sleep(delay)
    
    def _simulate_random_failure(self):
        """Simular fallas aleatorias para testing de robustez"""
        if random.random() < self.failure_rate:
            failures = [
                "connection timeout",
                "invalid command",
                "permission denied",
                "resource exhausted"
            ]
            raise Exception(f"Mock failure: {random.choice(failures)}")
    
    def _generate_sample_users(self):
        """Generar usuarios de ejemplo para testing"""
        sample_names = [
            "juan.perez", "maria.gonzalez", "carlos.lopez", "ana.martinez",
            "luis.rodriguez", "sofia.fernandez", "diego.sanchez", "laura.torres",
            "miguel.ramirez", "elena.castro", "pablo.morales", "carla.ruiz",
            "fernando.silva", "valeria.herrera", "ricardo.mendoza", "patricia.vega"
        ]
        
        for i, name in enumerate(sample_names):
            user_id = f"*{i+1:X}"  # IDs como RouterOS
            self.users[user_id] = MockPPPoEUser(
                id=user_id,
                name=name,
                password="123456",
                disabled=random.choice([True, False]) if i > 10 else False,
                remote_address=f"10.0.{random.randint(1,254)}.{random.randint(1,254)}",
                comment=f"Cliente {name.replace('.', ' ').title()}",
                bytes_in=random.randint(1000000, 10000000000),
                bytes_out=random.randint(500000, 5000000000)
            )
        
        # Simular algunas conexiones activas
        active_users = random.sample(list(self.users.values()), min(5, len(self.users)))
        for user in active_users:
            if not user.disabled:
                conn_id = f"*{len(self.active_connections)+1:X}"
                self.active_connections[conn_id] = MockActiveConnection(
                    id=conn_id,
                    name=user.name,
                    address=user.remote_address,
                    uptime=f"{random.randint(1,48)}h{random.randint(0,59)}m{random.randint(0,59)}s",
                    bytes_in=user.bytes_in,
                    bytes_out=user.bytes_out
                )
    
    def connect(self, host: str, username: str, password: str, port: int = 8728, timeout: int = 30):
        """Simular conexión"""
        self._simulate_network_delay()
        self._simulate_random_failure()
        
        # Simular validación de credenciales
        if username != "admin" and username != "nordia-admin":
            raise Exception(f"Mock: invalid username '{username}'")
        
        if not password:
            raise Exception("Mock: empty password not allowed")
        
        self.is_connected = True
        logger.debug(f"Mock: Conectado a {host}:{port} como {username}")
        return self
    
    def close(self):
        """Simular cierre de conexión"""
        self.is_connected = False
        logger.debug("Mock: Conexión cerrada")
    
    def path(self):
        """Simular path API de RouterOS"""
        return MockRouterPath(self)


class MockRouterPath:
    """Simula el path de RouterOS API"""
    
    def __init__(self, api: MockRouterAPI):
        self.api = api
        self.ppp = MockPPPPath(api)
        self.system = MockSystemPath(api)


class MockSystemPath:
    """Simula /system path"""
    
    def __init__(self, api: MockRouterAPI):
        self.api = api
        self.identity = MockIdentityPath(api)


class MockIdentityPath:
    """Simula /system/identity path"""
    
    def __init__(self, api: MockRouterAPI):
        self.api = api
    
    def print(self):
        """Simular system identity print"""
        self.api._simulate_network_delay()
        self.api._simulate_random_failure()
        
        return [{
            '.id': '*1',
            'name': 'MockRouter-Nordia'
        }]


class MockPPPPath:
    """Simula /ppp path"""
    
    def __init__(self, api: MockRouterAPI):
        self.api = api
        self.secret = MockSecretPath(api)
        self.active = MockActivePath(api)


class MockSecretPath:
    """Simula /ppp/secret path"""
    
    def __init__(self, api: MockRouterAPI):
        self.api = api
    
    def print(self, **kwargs) -> List[Dict[str, Any]]:
        """Simular ppp secret print"""
        self.api._simulate_network_delay()
        self.api._simulate_random_failure()
        self.api.command_count += 1
        
        # Filtrar por nombre si se especifica
        if 'name' in kwargs:
            target_name = kwargs['name']
            matching_users = [
                user for user in self.api.users.values() 
                if user.name == target_name
            ]
            return [user.to_dict() for user in matching_users]
        
        # Filtrar por ID si se especifica
        if '.id' in kwargs:
            target_id = kwargs['.id']
            if target_id in self.api.users:
                return [self.api.users[target_id].to_dict()]
            return []
        
        # Retornar todos los usuarios
        return [user.to_dict() for user in self.api.users.values()]
    
    def set(self, **kwargs):
        """Simular ppp secret set"""
        self.api._simulate_network_delay()
        self.api._simulate_random_failure()
        self.api.command_count += 1
        
        if '.id' not in kwargs:
            raise Exception("Mock: .id required for set operation")
        
        user_id = kwargs['.id']
        if user_id not in self.api.users:
            raise Exception(f"Mock: user with id {user_id} not found")
        
        user = self.api.users[user_id]
        
        # Actualizar propiedades
        if 'disabled' in kwargs:
            user.disabled = kwargs['disabled'] == 'yes'
            logger.debug(f"Mock: Usuario {user.name} {'deshabilitado' if user.disabled else 'habilitado'}")
        
        if 'comment' in kwargs:
            user.comment = kwargs['comment']
        
        if 'password' in kwargs:
            user.password = kwargs['password']
    
    def add(self, **kwargs):
        """Simular ppp secret add"""
        self.api._simulate_network_delay()
        self.api._simulate_random_failure()
        self.api.command_count += 1
        
        if 'name' not in kwargs:
            raise Exception("Mock: name required for add operation")
        
        # Verificar que no existe
        existing = [u for u in self.api.users.values() if u.name == kwargs['name']]
        if existing:
            raise Exception(f"Mock: user {kwargs['name']} already exists")
        
        # Crear nuevo usuario
        user_id = f"*{len(self.api.users)+1:X}"
        new_user = MockPPPoEUser(
            id=user_id,
            name=kwargs['name'],
            password=kwargs.get('password', '123456'),
            disabled=kwargs.get('disabled', 'no') == 'yes',
            profile=kwargs.get('profile', 'default'),
            comment=kwargs.get('comment', '')
        )
        
        self.api.users[user_id] = new_user
        logger.debug(f"Mock: Usuario {new_user.name} agregado")
        return user_id
    
    def remove(self, **kwargs):
        """Simular ppp secret remove"""
        self.api._simulate_network_delay()
        self.api._simulate_random_failure()
        self.api.command_count += 1
        
        if '.id' not in kwargs:
            raise Exception("Mock: .id required for remove operation")
        
        user_id = kwargs['.id']
        if user_id not in self.api.users:
            raise Exception(f"Mock: user with id {user_id} not found")
        
        user_name = self.api.users[user_id].name
        del self.api.users[user_id]
        
        # Eliminar conexiones activas
        to_remove = []
        for conn_id, conn in self.api.active_connections.items():
            if conn.name == user_name:
                to_remove.append(conn_id)
        
        for conn_id in to_remove:
            del self.api.active_connections[conn_id]
        
        logger.debug(f"Mock: Usuario {user_name} eliminado")


class MockActivePath:
    """Simula /ppp/active path"""
    
    def __init__(self, api: MockRouterAPI):
        self.api = api
    
    def print(self, **kwargs) -> List[Dict[str, Any]]:
        """Simular ppp active print"""
        self.api._simulate_network_delay()
        self.api._simulate_random_failure()
        self.api.command_count += 1
        
        # Filtrar por nombre si se especifica
        if 'name' in kwargs:
            target_name = kwargs['name']
            matching_connections = [
                conn for conn in self.api.active_connections.values() 
                if conn.name == target_name
            ]
            return [conn.to_dict() for conn in matching_connections]
        
        # Retornar todas las conexiones activas
        return [conn.to_dict() for conn in self.api.active_connections.values()]
    
    def remove(self, **kwargs):
        """Simular ppp active remove"""
        self.api._simulate_network_delay()
        self.api._simulate_random_failure()
        self.api.command_count += 1
        
        if '.id' not in kwargs:
            raise Exception("Mock: .id required for remove operation")
        
        conn_id = kwargs['.id']
        if conn_id not in self.api.active_connections:
            raise Exception(f"Mock: active connection with id {conn_id} not found")
        
        conn_name = self.api.active_connections[conn_id].name
        del self.api.active_connections[conn_id]
        logger.debug(f"Mock: Conexión activa de {conn_name} desconectada")


class MockMikrotikConnection:
    """
    Conexión Mock que imita MikrotikConnection para testing
    Compatible con el mismo API
    """
    
    def __init__(self, config=None, simulate_delays: bool = True, failure_rate: float = 0.0):
        """
        Args:
            config: Ignorado en mock (compatibilidad)
            simulate_delays: Si simular delays de red
            failure_rate: Porcentaje de operaciones que fallan
        """
        self.config = config
        self.is_connected = False
        self.api = MockRouterAPI(simulate_delays, failure_rate)
        self.connection = None
        self._last_command_time = 0
        
        logger.info("Mock Mikrotik Connection inicializada")
    
    def __enter__(self):
        """Context manager entry"""
        self.connect()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        self.disconnect()
        return False
    
    def connect(self) -> bool:
        """Simular conexión"""
        try:
            self.connection = self.api.connect("mock://192.168.1.1", "admin", "password")
            self.is_connected = True
            logger.success("Mock: Conexión establecida")
            return True
        except Exception as e:
            logger.error(f"Mock: Error de conexión: {str(e)}")
            return False
    
    def disconnect(self):
        """Simular desconexión"""
        if self.connection:
            self.connection.close()
        self.is_connected = False
        logger.debug("Mock: Conexión cerrada")
    
    def _check_connection(self):
        """Verificar conexión mock"""
        if not self.is_connected:
            raise Exception("Mock: No connection")
    
    def _apply_rate_limit(self):
        """Rate limiting simulado"""
        current_time = time.time()
        if current_time - self._last_command_time < 0.1:  # Mock rate limit
            time.sleep(0.1)
        self._last_command_time = current_time
    
    def get_ppp_secrets(self) -> List[Dict[str, Any]]:
        """Obtener usuarios mock"""
        self._check_connection()
        self._apply_rate_limit()
        return self.connection.path().ppp.secret.print()
    
    def get_user_status(self, username: str) -> Optional[Dict[str, Any]]:
        """Obtener estado de usuario mock"""
        self._check_connection()
        self._apply_rate_limit()
        users = self.connection.path().ppp.secret.print(name=username)
        return users[0] if users else None
    
    def disable_ppp_user(self, username: str) -> bool:
        """Deshabilitar usuario mock"""
        self._check_connection()
        self._apply_rate_limit()
        
        try:
            users = self.connection.path().ppp.secret.print(name=username)
            if not users:
                return False
            
            user_id = users[0]['.id']
            self.connection.path().ppp.secret.set(**{'.id': user_id, 'disabled': 'yes'})
            return True
        except Exception as e:
            logger.error(f"Mock: Error deshabilitando {username}: {str(e)}")
            return False
    
    def disable_user(self, username: str) -> bool:
        """Alias para compatibilidad"""
        return self.disable_ppp_user(username)
    
    def enable_ppp_user(self, username: str) -> bool:
        """Habilitar usuario mock"""
        self._check_connection()
        self._apply_rate_limit()
        
        try:
            users = self.connection.path().ppp.secret.print(name=username)
            if not users:
                return False
            
            user_id = users[0]['.id']
            self.connection.path().ppp.secret.set(**{'.id': user_id, 'disabled': 'no'})
            return True
        except Exception as e:
            logger.error(f"Mock: Error habilitando {username}: {str(e)}")
            return False
    
    def enable_user(self, username: str) -> bool:
        """Alias para compatibilidad"""
        return self.enable_ppp_user(username)
    
    def get_active_connections(self) -> List[Dict[str, Any]]:
        """Obtener conexiones activas mock"""
        self._check_connection()
        self._apply_rate_limit()
        return self.connection.path().ppp.active.print()
    
    def batch_disable(self, usernames: List[str]) -> Dict[str, bool]:
        """Deshabilitar en lote mock"""
        results = {}
        for username in usernames:
            results[username] = self.disable_ppp_user(username)
        return results
    
    def batch_enable(self, usernames: List[str]) -> Dict[str, bool]:
        """Habilitar en lote mock"""
        results = {}
        for username in usernames:
            results[username] = self.enable_ppp_user(username)
        return results
    
    def disconnect_active_user(self, username: str) -> bool:
        """Desconectar usuario activo mock"""
        self._check_connection()
        self._apply_rate_limit()
        
        try:
            active = self.connection.path().ppp.active.print(name=username)
            if not active:
                return False
            
            for connection in active:
                self.connection.path().ppp.active.remove(**{'.id': connection['.id']})
            
            return True
        except Exception as e:
            logger.error(f"Mock: Error desconectando {username}: {str(e)}")
            return False


# Funciones de utilidad para testing

def create_mock_connection(simulate_delays: bool = False, failure_rate: float = 0.0) -> MockMikrotikConnection:
    """
    Crear conexión mock para testing
    
    Args:
        simulate_delays: Si simular delays realistas
        failure_rate: Porcentaje de operaciones que fallan (0.0-1.0)
    
    Returns:
        MockMikrotikConnection: Instancia mock configurada
    """
    return MockMikrotikConnection(
        simulate_delays=simulate_delays,
        failure_rate=failure_rate
    )


def generate_test_scenario(scenario: str = "normal") -> MockMikrotikConnection:
    """
    Generar escenario de testing específico
    
    Args:
        scenario: Tipo de escenario (normal, all_disabled, network_issues, etc.)
    
    Returns:
        MockMikrotikConnection: Conexión mock con escenario configurado
    """
    if scenario == "normal":
        return create_mock_connection(simulate_delays=False, failure_rate=0.0)
    
    elif scenario == "network_issues":
        return create_mock_connection(simulate_delays=True, failure_rate=0.1)
    
    elif scenario == "high_failure":
        return create_mock_connection(simulate_delays=False, failure_rate=0.3)
    
    elif scenario == "all_disabled":
        mock_conn = create_mock_connection(simulate_delays=False, failure_rate=0.0)
        # Deshabilitar todos los usuarios
        with mock_conn as mt:
            users = mt.get_ppp_secrets()
            for user in users:
                mt.disable_ppp_user(user['name'])
        return mock_conn
    
    else:
        raise ValueError(f"Escenario desconocido: {scenario}")


if __name__ == "__main__":
    # Demo del mock router
    print("🎮 Nordia ISP Suite - Mock Router Demo")
    print("=" * 50)
    
    # Crear conexión mock
    mock_conn = create_mock_connection(simulate_delays=True, failure_rate=0.05)
    
    try:
        with mock_conn as mt:
            print("✅ Conexión mock establecida")
            
            # Obtener usuarios
            users = mt.get_ppp_secrets()
            print(f"📊 Usuarios mock: {len(users)}")
            
            # Mostrar algunos usuarios
            print("\n👥 Usuarios de ejemplo:")
            for user in users[:5]:
                name = user['name']
                status = "❌ Deshabilitado" if user['disabled'] == 'true' else "✅ Habilitado"
                print(f"  {name}: {status}")
            
            # Probar deshabilitar un usuario
            test_user = users[0]['name']
            print(f"\n🔧 Deshabilitando usuario: {test_user}")
            success = mt.disable_ppp_user(test_user)
            print(f"  Resultado: {'✅ Éxito' if success else '❌ Fallo'}")
            
            # Verificar estado
            updated_user = mt.get_user_status(test_user)
            if updated_user:
                is_disabled = updated_user['disabled'] == 'true'
                print(f"  Estado actual: {'❌ Deshabilitado' if is_disabled else '✅ Habilitado'}")
            
            # Conexiones activas
            active = mt.get_active_connections()
            print(f"\n🌐 Conexiones activas: {len(active)}")
            
            print(f"\n📈 Comandos ejecutados: {mt.connection.command_count}")
    
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    
    print("\n🎯 Mock Router funcionando correctamente!")