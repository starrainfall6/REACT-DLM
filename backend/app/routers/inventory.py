from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import ConfigItem, InventoryCheck
from app.schemas import InventoryCheckCreate
from app.utils import next_inventory_ref

router = APIRouter()

KM = {
    "tool": ("inventory_date_tool", "inventory_interval_tool"),
    "fixture": ("inventory_date_fixture", "inventory_interval_fixture"),
    "spare": ("inventory_date_spare", "inventory_interval_spare"),
}


@router.get("/inventory-days")
def get_inventory_days(type: str = "tool", db: Session = Depends(get_db)):
    if type not in KM:
        raise HTTPException(status_code=400, detail="invalid type")
    date_key, interval_key = KM[type]
    last_row = db.get(ConfigItem, date_key)
    interval_row = db.get(ConfigItem, interval_key)
    last = last_row.value if last_row else ""
    try:
        interval = int(interval_row.value) if interval_row and interval_row.value else 30
    except ValueError:
        interval = 30
    days = interval
    if last:
        try:
            d = datetime.strptime(last, "%Y-%m-%d")
            elapsed = (datetime.now() - d).days
            days = max(0, interval - elapsed % interval)
        except ValueError:
            days = interval
    return {"days": days, "cycle": interval, "last_date": last}


def _check_dict(c: InventoryCheck) -> dict:
    return {
        "id": c.id,
        "ref_no": c.ref_no,
        "type": c.check_type,
        "project": c.project,
        "time": c.check_time,
        "person": c.person,
        "status": c.status,
        "sync_time": c.sync_time,
        "result": c.result,
        "note": c.note,
    }


@router.get("/inventory-checks")
def list_checks(db: Session = Depends(get_db)):
    rows = db.execute(
        select(InventoryCheck).order_by(InventoryCheck.check_time.desc(), InventoryCheck.id.desc())
    ).scalars().all()
    return {"items": [_check_dict(c) for c in rows], "total": len(rows)}


@router.post("/inventory-checks")
def create_check(body: InventoryCheckCreate, db: Session = Depends(get_db)):
    c = InventoryCheck(
        ref_no=next_inventory_ref(db),
        check_type=body.type,
        project=body.project,
        check_time=body.time,
        person=body.person,
        result=body.result,
        note=body.note,
        status="待同步",
        sync_time="—",
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return _check_dict(c)


@router.post("/inventory-checks/{check_id}/sync")
def sync_check(check_id: int, db: Session = Depends(get_db)):
    """同步盘点单：待同步 → 已同步，并记录同步时间。"""
    c = db.get(InventoryCheck, check_id)
    if not c:
        raise HTTPException(status_code=404, detail="盘点单不存在")
    if c.status == "已同步":
        return _check_dict(c)
    c.status = "已同步"
    c.sync_time = datetime.now().strftime("%Y-%m-%d %H:%M")
    db.commit()
    db.refresh(c)
    return _check_dict(c)


@router.delete("/inventory-checks/{check_id}")
def delete_check(check_id: int, db: Session = Depends(get_db)):
    c = db.get(InventoryCheck, check_id)
    if not c:
        raise HTTPException(status_code=404, detail="盘点单不存在")
    db.delete(c)
    db.commit()
    return {"success": True}
