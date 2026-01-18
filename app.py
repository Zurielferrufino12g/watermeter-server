from fastapi import FastAPI, Depends, HTTPException, Request, Form, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.security import HTTPBasic, HTTPBasicCredentials

# ✅ ADDED (CORS)
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session
from datetime import datetime
import asyncio
import secrets
from typing import Dict, Set

from db import engine, SessionLocal
from models import Base, User, Meter, Reading

app = FastAPI()

# ✅ ADDED (CORS) - para que el Static Site pueda hacer fetch al backend
# Si no sabes tu dominio exacto del static site, deja "*" por ahora.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*"
        # Si quieres restringirlo después, usa esto en vez de "*":
        # "https://watermeter-server-1.onrender.com",
        # "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static + Templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# DB tables
Base.metadata.create_all(bind=engine)

# =========================
# ADMIN BASIC AUTH (admin/admin)
# =========================
security = HTTPBasic()
ADMIN_USER = "admin"
ADMIN_PASS = "admin"

def require_admin(credentials: HTTPBasicCredentials = Depends(security)) -> bool:
    ok_user = secrets.compare_digest(credentials.username, ADMIN_USER)
    ok_pass = secrets.compare_digest(credentials.password, ADMIN_PASS)
    if not (ok_user and ok_pass):
        raise HTTPException(
            status_code=401,
            detail="No autorizado",
            headers={"WWW-Authenticate": "Basic"},
        )
    return True


# =========================
# 1) MANEJADOR DE WEBSOCKETS
# =========================
class WSManager:
    def __init__(self):
        # meter_code -> set(websocket)
        self.active: Dict[str, Set[WebSocket]] = {}

    async def connect(self, meter_code: str, websocket: WebSocket):
        await websocket.accept()
        self.active.setdefault(meter_code, set()).add(websocket)

    def disconnect(self, meter_code: str, websocket: WebSocket):
        if meter_code in self.active:
            self.active[meter_code].discard(websocket)
            if not self.active[meter_code]:
                del self.active[meter_code]

    async def broadcast(self, meter_code: str, payload: dict):
        """Envía JSON a todos los clientes conectados a ese medidor."""
        if meter_code not in self.active:
            return

        dead = []
        for ws in list(self.active[meter_code]):
            try:
                await ws.send_json(payload)
            except Exception:
                dead.append(ws)

        for ws in dead:
            self.disconnect(meter_code, ws)


ws_manager = WSManager()


# =========================
# 2) WEBSOCKET ENDPOINT
# =========================
@app.websocket("/ws/meter/{meter_code}")
async def websocket_endpoint(websocket: WebSocket, meter_code: str):
    await ws_manager.connect(meter_code, websocket)

    # Mensaje inicial en JSON (no rompe tu frontend)
    await websocket.send_json({
        "status": "connected",
        "meter_code": meter_code,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "flow_lps": 0.0,
        "liters_delta": 0.0,
        "liters_total": 0.0,
    })

    try:
        # Mantener vivo el socket sin depender de receive_text()
        while True:
            await asyncio.sleep(60)
    except WebSocketDisconnect:
        ws_manager.disconnect(meter_code, websocket)
    except Exception:
        ws_manager.disconnect(meter_code, websocket)


# =========================
# 3) DB DEPENDENCY
# =========================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =========================
# 4) DEMO SEED (opcional)
# =========================
def seed_demo(db: Session):
    admin = db.query(User).filter(User.role == "ADMIN").first()
    if not admin:
        admin = User(first_name="Admin", last_name="Sistema", phone="000", role="ADMIN")
        db.add(admin)
        db.commit()
        db.refresh(admin)

    def ensure_meter(code, pin):
        m = db.query(Meter).filter(Meter.meter_code == code).first()
        if not m:
            m = Meter(
                meter_code=code,
                pin=pin,
                category="DOMESTICA",
                barrio="Cobija",
                calle="Demo",
                numero="S/N",
                predio="",
                user_id=admin.id
            )
            db.add(m)
            db.commit()

    ensure_meter("MED-001A", "1111")
    ensure_meter("MED-002B", "2222")
    ensure_meter("MED-003C", "3333")


@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    try:
        seed_demo(db)
    finally:
        db.close()


# =========================
# 5) WEB ROUTES
# =========================
@app.get("/", response_class=HTMLResponse)
def login_page(request: Request, err: str = ""):
    return templates.TemplateResponse("login.html", {"request": request, "error": bool(err)})


@app.post("/login")
def do_login(meter_code: str = Form(...), pin: str = Form(...), db: Session = Depends(get_db)):
    m = db.query(Meter).filter(Meter.meter_code == meter_code).first()
    if not m or m.pin != pin:
        return RedirectResponse(url="/?err=1", status_code=303)
    return RedirectResponse(url=f"/meter/{m.meter_code}?pin={pin}", status_code=303)


# ✅ ADMIN PROTEGIDO: pedirá usuario/contraseña
@app.get("/admin", response_class=HTMLResponse)
def admin_page(
    request: Request,
    db: Session = Depends(get_db),
    _: bool = Depends(require_admin)
):
    meters = db.query(Meter).all()
    return templates.TemplateResponse("admin.html", {"request": request, "meters": meters})


@app.get("/meter/{meter_code}", response_class=HTMLResponse)
def meter_page(request: Request, meter_code: str, pin: str, db: Session = Depends(get_db)):
    m = db.query(Meter).filter(Meter.meter_code == meter_code).first()
    if not m or m.pin != pin:
        return HTMLResponse("<h3>Acceso denegado</h3>", status_code=403)

    last = (
        db.query(Reading)
        .filter(Reading.meter_id == m.id)
        .order_by(Reading.timestamp.desc())
        .first()
    )

    flow_lps = round(last.flow_lps, 3) if last else 0.0
    liters_total = round(last.liters_total, 3) if last else 0.0
    last_ts = last.timestamp.strftime("%Y-%m-%d %H:%M:%S") if last else "Sin datos aún"

    recent = (
        db.query(Reading)
        .filter(Reading.meter_id == m.id)
        .order_by(Reading.timestamp.desc())
        .limit(10)
        .all()
    )

    return templates.TemplateResponse(
        "user.html",
        {
            "request": request,
            "meter": m,
            "flow_lps": flow_lps,
            "liters_total": liters_total,
            "last_ts": last_ts,
            "recent": recent,
        },
    )


# =========================
# ✅ ADDED: 5.1) API JSON PARA FRONTEND (DASHBOARD REACT)
# =========================
@app.get("/api/meter/{meter_code}/latest")
def api_meter_latest(meter_code: str, pin: str, db: Session = Depends(get_db)):
    m = db.query(Meter).filter(Meter.meter_code == meter_code).first()
    if not m or m.pin != pin:
        raise HTTPException(status_code=403, detail="Acceso denegado")

    last = (
        db.query(Reading)
        .filter(Reading.meter_id == m.id)
        .order_by(Reading.timestamp.desc())
        .first()
    )

    return {
        "meter_code": m.meter_code,
        "category": m.category,
        "barrio": m.barrio,
        "calle": m.calle,
        "numero": m.numero,
        "flow_lps": float(last.flow_lps) if last else 0.0,
        "liters_total": float(last.liters_total) if last else 0.0,
        "timestamp": last.timestamp.strftime("%Y-%m-%d %H:%M:%S") if last else None,
    }


@app.get("/api/meter/{meter_code}/recent")
def api_meter_recent(meter_code: str, pin: str, limit: int = 10, db: Session = Depends(get_db)):
    m = db.query(Meter).filter(Meter.meter_code == meter_code).first()
    if not m or m.pin != pin:
        raise HTTPException(status_code=403, detail="Acceso denegado")

    rows = (
        db.query(Reading)
        .filter(Reading.meter_id == m.id)
        .order_by(Reading.timestamp.desc())
        .limit(max(1, min(limit, 50)))
        .all()
    )

    return {
        "meter_code": m.meter_code,
        "recent": [
            {
                "timestamp": r.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                "flow_lps": float(r.flow_lps),
                "liters_delta": float(r.liters_delta),
                "liters_total": float(r.liters_total),
            }
            for r in rows
        ],
    }


# =========================
# 6) API (ESP32) + PUSH WS
# =========================
@app.post("/api/ingest")
async def ingest(data: dict, db: Session = Depends(get_db)):
    meter_code = data.get("meter_code")
    pin = data.get("pin")

    meter = db.query(Meter).filter(Meter.meter_code == meter_code).first()
    if not meter or meter.pin != pin:
        raise HTTPException(status_code=403, detail="Medidor o PIN incorrecto")

    flow_lps = float(data.get("flow_lps", 0))
    liters_delta = float(data.get("liters_delta", 0))
    liters_total = float(data.get("liters_total", 0))
    now = datetime.now()

    reading = Reading(
        meter_id=meter.id,
        flow_lps=flow_lps,
        liters_delta=liters_delta,
        liters_total=liters_total,
        timestamp=now
    )
    db.add(reading)
    db.commit()

    payload = {
        "meter_code": meter_code,
        "flow_lps": flow_lps,
        "liters_delta": liters_delta,
        "liters_total": liters_total,
        "timestamp": now.strftime("%Y-%m-%d %H:%M:%S"),
    }

    # push tiempo real
    await ws_manager.broadcast(meter_code, payload)

    return {"status": "ok"}