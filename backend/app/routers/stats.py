from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import BorrowRecord, Item, SparePart
from app.utils import update_overdue

router = APIRouter()


@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    update_overdue(db)
    total_tools = db.execute(select(func.count()).select_from(Item).where(Item.type == "tool")).scalar_one()
    total_fixtures = db.execute(select(func.count()).select_from(Item).where(Item.type == "fixture")).scalar_one()
    total_spares = db.execute(select(func.count()).select_from(SparePart)).scalar_one()
    borrowed_items = db.execute(select(func.count()).select_from(BorrowRecord).where(BorrowRecord.status == "active")).scalar_one()
    overdue_items = db.execute(select(func.count()).select_from(BorrowRecord).where(BorrowRecord.status == "overdue")).scalar_one()
    returned_records = db.execute(select(func.count()).select_from(BorrowRecord).where(BorrowRecord.status == "returned")).scalar_one()

    # 一次性聚合各物料的未归还数量，避免逐条查询（N+1）
    outstanding_rows = db.execute(
        select(
            BorrowRecord.item_id,
            func.coalesce(func.sum(BorrowRecord.borrow_quantity - BorrowRecord.returned_quantity), 0).label("outstanding"),
        )
        .where(BorrowRecord.status.in_(["active", "overdue"]))
        .group_by(BorrowRecord.item_id)
    ).all()
    outstanding = {item_id: int(out or 0) for item_id, out in outstanding_rows}

    low_stock_items = []
    for item in db.execute(select(Item).where(Item.min_stock_alert > 0)).scalars():
        available = item.quantity - outstanding.get(item.id, 0)
        if available <= item.min_stock_alert:
            low_stock_items.append(
                {
                    "code": item.code,
                    "name": item.name,
                    "quantity": available,
                    "min_stock_alert": item.min_stock_alert,
                }
            )
    low_stock_spares = [
        {"code": s.code, "name": s.name, "quantity": s.quantity, "min_stock_alert": s.min_stock_alert}
        for s in db.execute(
            select(SparePart).where(SparePart.min_stock_alert > 0, SparePart.quantity <= SparePart.min_stock_alert)
        ).scalars()
    ]
    return {
        "total_tools": total_tools,
        "total_fixtures": total_fixtures,
        "total_spares": total_spares,
        "borrowed_items": borrowed_items,
        "overdue_items": overdue_items,
        "low_stock_items": low_stock_items,
        "low_stock_spares": low_stock_spares,
        "active_records": borrowed_items,
        "returned_records": returned_records,
        "overdue_records": overdue_items,
    }


@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    recent = db.execute(
        select(
            BorrowRecord.id,
            BorrowRecord.borrower_name,
            BorrowRecord.borrow_date,
            BorrowRecord.status,
            Item.name.label("item_name"),
            Item.code.label("item_code"),
        )
        .join(Item, BorrowRecord.item_id == Item.id)
        .order_by(BorrowRecord.borrow_date.desc())
        .limit(10)
    ).all()
    recent_records = []
    for r in recent:
        d = dict(r._mapping)
        if hasattr(d.get("borrow_date"), "strftime"):
            d["borrow_date"] = d["borrow_date"].strftime("%Y-%m-%d")
        recent_records.append(d)
    cats = db.execute(
        select(SparePart.category.label("name"), func.count().label("count"))
        .where(SparePart.category != "")
        .group_by(SparePart.category)
        .order_by(func.count().desc())
    ).all()
    return {
        "recent_records": recent_records,
        "category_stats": [dict(r._mapping) for r in cats],
    }
