from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import ConfigItem

router = APIRouter()


@router.get("/config")
def get_config(db: Session = Depends(get_db)):
    rows = db.execute(select(ConfigItem)).scalars().all()
    return {c.key: c.value for c in rows}


@router.post("/config/bulk")
def update_config_bulk(body: dict, db: Session = Depends(get_db)):
    for key, value in body.items():
        row = db.get(ConfigItem, str(key))
        if row:
            row.value = str(value)
        else:
            db.add(ConfigItem(key=str(key), value=str(value)))
    db.commit()
    return {"success": True}
