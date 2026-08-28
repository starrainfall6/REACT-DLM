from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

import app.models  # noqa: F401  确保模型注册到 Base.metadata
from app.db import Base, SessionLocal, engine
from app.routers import ROUTERS


def _ensure_schema() -> None:
    """轻量 schema 对齐：为已存在的库补齐/移除字段（幂等）。"""
    statements = (
        "ALTER TABLE transactions ADD COLUMN IF NOT EXISTS note TEXT DEFAULT ''",
        "ALTER TABLE transactions DROP COLUMN IF EXISTS direction",
        "ALTER TABLE inventory_checks ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT '待同步'",
        "ALTER TABLE inventory_checks ADD COLUMN IF NOT EXISTS sync_time VARCHAR(40) DEFAULT '—'",
    )
    with engine.begin() as conn:
        for stmt in statements:
            conn.execute(text(stmt))


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    _ensure_schema()
    yield


app = FastAPI(title="DLM Warehouse Management", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for router in ROUTERS:
    app.include_router(router, prefix="/api")


@app.get("/")
def root():
    return {"message": "DLM Backend is running", "docs": "/docs"}


@app.get("/api/health")
def health():
    with SessionLocal() as db:
        db.execute(text("SELECT 1"))
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=False)
