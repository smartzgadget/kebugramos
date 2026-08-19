from fastapi import FastAPI
from pydantic import BaseModel
from datetime import datetime, timezone
from typing import Literal

app = FastAPI(title="KebuGram Analytics — 6.4", version="0.1.0")

class Metric(BaseModel):
    name: str
    value: float
    unit: str
    trend: Literal["up", "down", "flat"] | None = None

class Dashboard(BaseModel):
    consumer: list[Metric]
    business: list[Metric]
    at: str
    isShowcase: bool | None = True

class Event(BaseModel):
    name: str
    value: float
    attrs: dict[str, str] | None = None

showcase = Dashboard(
    consumer=[
        Metric(name="Reach", value=12400, unit="views", trend="up"),
        Metric(name="Followers", value=842, unit="people", trend="up"),
    ],
    business=[
        Metric(name="Revenue", value=84000, unit="RWF", trend="up"),
        Metric(name="Orders", value=128, unit="orders", trend="flat"),
    ],
    at="2026-08-17T15:00:00.000Z",
    isShowcase=True,
)

@app.get("/analytics/dashboard", response_model=Dashboard)
def get_dashboard():
    showcase.at = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    return showcase

@app.post("/analytics/event")
def post_event(ev: Event):
    # Otel → Grafana stub: ack and log (real: push to Otel collector)
    return {"acked": True, "name": ev.name, "value": ev.value}

@app.get("/health")
def health():
    return {"status": "ok", "service": "analytics", "version": "0.1.0"}
