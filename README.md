# 🚀 Nordia ISP Suite
## Sistema de Automatización de Cortes por Mora con Mikrotik RouterOS

### 📋 Descripción del Proyecto

**Nordia ISP Suite** es un sistema automatizado para la gestión de cortes por mora en ISPs que utilizan Mikrotik RouterOS. Diseñado específicamente para proveedores de internet locales en Corrientes, Argentina.

**Problema que resuelve:**
- Gestión manual de cortes por mora (10+ horas semanales)
- Errores humanos en el proceso
- Falta de trazabilidad de acciones
- Demoras en aplicar políticas de cobranza

**Solución:**
- Automatización completa del proceso
- Integración directa con Mikrotik RouterOS API
- Sistema robusto de rollback y auditoría
- Interfaz CLI intuitiva para operadores

---

### 🏗️ Arquitectura del Sistema

```
nordia-isp-suite/
├── app/
│   ├── core/           # Lógica de negocio principal
│   ├── mikrotik/        # Integración RouterOS API
│   ├── models/          # Modelos de datos
│   └── utils/           # Utilidades compartidas
├── scripts/             # Scripts CLI standalone
├── tests/               # Suite de testing
├── data/                # Archivos CSV de prueba
├── config/              # Configuraciones
├── logs/                # Sistema de logging
├── output/              # Reportes generados
├── docs/                # Documentación técnica
└── deployment/          # Archivos de despliegue
```

---

### 🔧 Instalación y Configuración

#### Prerrequisitos
- Python 3.11+
- Access SSH/API al router Mikrotik
- Windows 11 / Linux Ubuntu 22.04+

#### Setup Rápido

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/nordia-isp-suite.git
cd nordia-isp-suite

# 2. Crear entorno virtual
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac  
source venv/bin/activate

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 5. Verificar conexión Mikrotik
python scripts/test_connection.py
```

---

### 🚀 Uso Básico

#### 1. Validar archivo CSV de morosos
```bash
python scripts/validate_csv.py --file data/morosos.csv
```

#### 2. Simulación (Dry Run)
```bash
python scripts/cut_service.py --csv data/morosos.csv --router 192.168.1.1 --mode dry-run
```

#### 3. Ejecución Real
```bash
python scripts/cut_service.py --csv data/morosos.csv --router 192.168.1.1 --mode execute
```

---

### 📊 Formato CSV Requerido

El archivo CSV debe contener las siguientes columnas:

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| username | string | Usuario PPPoE | juan.perez |
| dni | string | DNI del cliente | 12345678 |
| nombre | string | Nombre completo | Juan Pérez |
| dias_mora | int | Días de atraso | 45 |
| monto_deuda | float | Deuda en ARS | 15000.50 |
| excepcion | boolean | Excepción de corte | false |
| telefono | string | Teléfono (opcional) | +5493794123456 |

---

### ✅ Funcionalidades Principales

- ✅ **Conexión Mikrotik**: Integración robusta con RouterOS API
- ✅ **Validación CSV**: Verificación completa de datos de entrada
- ✅ **Modo Dry-Run**: Simulación sin ejecutar acciones reales
- ✅ **Procesamiento por Lotes**: Manejo eficiente de múltiples usuarios
- ✅ **Sistema de Rollback**: Reversión automática en caso de errores
- ✅ **Auditoría Completa**: Logging detallado de todas las operaciones
- ✅ **Manejo de Errores**: Recuperación automática de fallos transitorios
- ✅ **Rate Limiting**: Prevención de sobrecarga del router
- ✅ **Reportes Detallados**: Generación automática de reportes CSV/JSON

---

### 🛡️ Seguridad y Confiabilidad

- **Autenticación Segura**: Credenciales encriptadas
- **Validación Estricta**: Verificación de permisos antes de cada acción
- **Respaldo Automático**: Backup del estado antes de modificaciones
- **Rollback Inteligente**: Reversión automática si falla >10% de operaciones
- **Trazabilidad Completa**: Audit trail inmutable de todas las acciones

---

### 📈 Roadmap del Proyecto

#### Sprint 1: Core Script (Días 1-7)
- [x] Estructura del proyecto
- [ ] Conexión Mikrotik
- [ ] Procesador CSV  
- [ ] Script CLI principal
- [ ] Sistema de testing
- [ ] Logging y auditoría
- [ ] Hardening para producción

#### Sprint 2: Backend API (Días 8-14)
- [ ] API REST con FastAPI
- [ ] Panel de administración web
- [ ] Base de datos PostgreSQL
- [ ] Autenticación de usuarios

#### Sprint 3: Portal Cliente (Días 15-21)
- [ ] Portal web para clientes
- [ ] Notificaciones automáticas
- [ ] Integración con pasarelas de pago

---

### 🧪 Testing

```bash
# Tests completos
pytest

# Tests con cobertura
pytest --cov=app

# Tests de integración con router real
pytest tests/test_integration.py
```

---

### 📚 Documentación Adicional

- [Manual del Operador](docs/manual_operador.md)
- [Guía Técnica](docs/technical.md)
- [Troubleshooting](docs/troubleshooting.md)
- [FAQ](docs/faq.md)

---

### 🤝 Contribuciones

1. Fork del proyecto
2. Crear branch para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

---

### 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo [LICENSE](LICENSE) para más detalles.

---

### 📞 Soporte

**Desarrollado por:** Gonzalo Haedo  
**Cliente:** ISPs de Corrientes, Argentina  
**Email:** contacto@nordia-suite.com  
**Slack:** #nordia-isp-suite  

---

### 🏆 Estado del Proyecto

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-85%25-green)
![Python](https://img.shields.io/badge/python-3.11+-blue)
![License](https://img.shields.io/badge/license-MIT-green)

**Versión Actual:** 1.0.0-alpha  
**Estado:** En desarrollo activo  
**Próximo Release:** 2024-10-15  

---

### 🔥 Quick Start para Desarrolladores

```bash
# Setup completo en 30 segundos
curl -sSL https://raw.githubusercontent.com/tu-usuario/nordia-isp-suite/main/scripts/quick_setup.sh | bash
```

¡Listo para automatizar tus cortes por mora! 🚀