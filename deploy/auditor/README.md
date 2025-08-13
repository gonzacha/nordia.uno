# DonWeb Auditor Externo

Aplicación Flask para auditoría profesional de performance del servidor DonWeb.

## Estructura del Proyecto
```
donweb-auditor/
├── app.py                    # Flask principal
├── models.py                 # SQLAlchemy models
├── audit_utils.py           # Funciones de auditoría
├── requirements.txt         # Dependencias Python
├── templates/
│   ├── dashboard.html       # Dashboard principal
│   └── audit_report.html    # Template de reportes
├── static/
│   └── style.css           # Estilos CSS
└── README.md               # Este archivo
```

## Instalación
1. `pip install -r requirements.txt`
2. `python app.py`

## Uso
- Acceder a http://localhost:5000 para el dashboard
- Iniciar auditoría y generar reportes JSON

## Estado
🔄 En desarrollo - Rellenando archivos desde Codex
