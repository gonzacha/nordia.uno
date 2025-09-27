"""
Nordia ISP Suite - Sistema de Automatización de Cortes por Mora
Integración con Mikrotik RouterOS para ISPs de Corrientes, Argentina

Desarrollado por: Gonzalo Haedo
Cliente: ISPs Locales de Corrientes
Version: 1.0.0-alpha
"""

__version__ = "1.0.0-alpha"
__author__ = "Gonzalo Haedo"
__email__ = "contacto@nordia-suite.com"

# Imports principales para facilitar uso
from app.core.csv_processor import CSVProcessor
from app.mikrotik.connection import MikrotikConnection