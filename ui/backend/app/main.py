from __future__ import annotations

import hashlib
import random
from datetime import datetime
from pathlib import Path
from typing import Any, Dict

import pandas as pd
import urllib.parse
from fastapi import Depends, FastAPI, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel

from .deps import get_brand_config
from .routers import dashboard, dashboard_real, mikrotik, tenants

BASE_DIR = Path(__file__).resolve().parent
TEMPLATES_DIR = BASE_DIR / "templates"
STATIC_DIR = BASE_DIR / "static"
CSV_PATH = Path(__file__).resolve().parents[3] / "data" / "sample_morosos.csv"
FAVICON_PATH = Path(__file__).resolve().parents[3] / "favicon.ico"
PAYMENT_REDIRECT_DELAY = 5

app = FastAPI(title="Nordia ISP Suite API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
)

app.include_router(tenants.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(mikrotik.router, prefix="/api")
app.include_router(dashboard_real.router, prefix="/api")

app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))


@app.middleware("http")
async def inject_brand(request: Request, call_next):
    tenant = request.headers.get("X-Tenant-ID") or request.query_params.get("tenant")
    request.state.tenant = tenant or "default"
    return await call_next(request)


@app.get("/health")
async def health(brand=Depends(get_brand_config)):
    return {
        "status": "ok",
        "tenant": brand["id"],
        "brand": brand["name"],
    }


def _build_default_client(client_ip: str) -> Dict[str, Any]:
    return {
        "id": hashlib.md5(client_ip.encode(), usedforsecurity=False).hexdigest()[:8],
        "name": "Juan Pérez",
        "dni_masked": "****3456",
        "plan": "100 Mbps Fibra",
        "days_overdue": 35,
        "debt_amount": 15000.50,
        "ip": client_ip,
    }


@app.get("/portal/suspended/{client_ip}", response_class=HTMLResponse)
async def portal_suspended(request: Request, client_ip: str):
    """Portal de suspensión para clientes morosos."""

    client_data = _build_default_client(client_ip)

    if CSV_PATH.exists():
        try:
            df = pd.read_csv(CSV_PATH)
            if "IP_Address" in df.columns:
                client_row = df[df["IP_Address"] == client_ip]
                if not client_row.empty:
                    row = client_row.iloc[0]
                    client_data = {
                        "id": hashlib.md5(str(row.get("DNI", client_ip)).encode(), usedforsecurity=False).hexdigest()[:8],
                        "name": row.get("Nombre", client_data["name"]),
                        "dni_masked": "****" + str(row.get("DNI", "0000"))[-4:],
                        "plan": row.get("Plan", client_data["plan"]),
                        "days_overdue": int(row.get("Dias Mora", client_data["days_overdue"])),
                        "debt_amount": float(row.get("Monto Deuda", client_data["debt_amount"])),
                        "ip": client_ip,
                    }
        except Exception:
            # Si falla la lectura del CSV, mantenemos los datos simulados.
            pass

    return_path = f"/portal/suspended/{client_data['ip']}"
    payment_url = f"/api/process-payment/{client_data['id']}?return_to={urllib.parse.quote(return_path)}"

    return templates.TemplateResponse(
        "suspended.html",
        {
            "request": request,
            "client": client_data,
            "isp_name": "ISP Network",
            "payment_url": payment_url,
            "current_date": datetime.now().strftime("%Y%m%d"),
            "show_countdown": True,
        },
    )


@app.post("/api/process-payment/{client_id}")
async def process_payment(client_id: str, amount: float | None = Form(default=None), return_to: str | None = Form(default=None)):
    """Procesar pago del cliente (simulación)."""

    redirect_url = f"/api/process-payment/{client_id}"
    if return_to:
        redirect_url = f"{redirect_url}?return_to={urllib.parse.quote(return_to)}"

    return {
        "status": "redirect",
        "payment_url": redirect_url,
        "message": "Redirigiendo a MercadoPago...",
        "amount": amount,
    }


@app.get("/api/process-payment/{client_id}")
async def process_payment_redirect(request: Request, client_id: str, amount: float | None = None):
    """Simular pantalla previa al pago para mantener el flujo del portal."""

    return_to = request.query_params.get("return_to") or "/portal/suspended/demo"
    success_url = f"/payment-success?client_id={client_id}"
    if return_to:
        success_url = f"{success_url}&return_to={urllib.parse.quote(return_to)}"

    return templates.TemplateResponse(
        "payment_redirect.html",
        {
            "request": request,
            "client_id": client_id,
            "amount": amount,
            "auto_redirect_url": success_url,
            "auto_redirect_delay": PAYMENT_REDIRECT_DELAY,
            "return_to": return_to,
        },
    )


@app.get("/api/check-payment/{client_id}")
async def check_payment_status(client_id: str):
    """Verificar si el cliente pagó (simulado)."""

    paid = random.choice([True, False])

    if paid:
        # Aquí podríamos invocar lógica real de reconexión.
        pass

    return {
        "client_id": client_id,
        "paid": paid,
        "timestamp": datetime.now().isoformat(),
    }


@app.get("/payment-success", response_class=HTMLResponse)
async def payment_success(request: Request, client_id: str | None = None):
    """Pantalla final de confirmación de pago."""

    return_to = request.query_params.get("return_to") or "/portal/suspended/demo"
    redirect_home = urllib.parse.unquote(return_to)

    return templates.TemplateResponse(
        "payment_success.html",
        {
            "request": request,
            "client_id": client_id,
            "redirect_home_url": redirect_home,
        },
    )



@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    """Entregar el favicon del portal."""

    if not FAVICON_PATH.exists():
        return HTMLResponse(status_code=404, content="")

    return FileResponse(FAVICON_PATH)


@app.get("/portal", include_in_schema=False)
@app.get("/portal/", include_in_schema=False)
async def portal_root():
    """Redirigir al portal de suspensión con un cliente demo."""

    return RedirectResponse("/portal/suspended/demo")



class PaymentMethodSelection(BaseModel):
    client_id: str
    method: str


@app.post("/api/payment-method")
async def select_payment_method(selection: PaymentMethodSelection):
    """Registrar el método de pago elegido por el cliente (simulado)."""

    return {
        "status": "success",
        "method": selection.method,
        "client_id": selection.client_id,
        "instructions_sent": True,
    }
