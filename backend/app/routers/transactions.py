from fastapi import APIRouter, Depends
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import SparePart, SparePartTransaction, Transaction
from app.utils import model_to_dict

router = APIRouter()


@router.get("/transactions")
def list_transactions(
    page: int = 1,
    page_size: int = 20,
    keyword: str = "",
    type: str = "",
    date_from: str = "",
    date_to: str = "",
    db: Session = Depends(get_db),
):
    where = []
    if keyword:
        kw = f"%{keyword}%"
        where.append(
            or_(
                Transaction.item_code.like(kw),
                Transaction.item_name.like(kw),
                Transaction.operator.like(kw),
                Transaction.ref_no.like(kw),
            )
        )
    if type:
        where.append(Transaction.tx_type == type)
    if date_from:
        where.append(func.date(Transaction.created_at) >= date_from)
    if date_to:
        where.append(func.date(Transaction.created_at) <= date_to)
    total = db.execute(select(func.count()).select_from(Transaction).where(*where)).scalar_one()
    stmt = select(Transaction).where(*where).order_by(Transaction.created_at.desc(), Transaction.id.desc())
    if page_size and 0 < page_size <= 1000:
        stmt = stmt.limit(page_size).offset((page - 1) * page_size)
    rows = db.execute(stmt).scalars().all()
    items = []
    for t in rows:
        d = model_to_dict(t)
        if hasattr(d.get("created_at"), "strftime"):
            d["created_at"] = d["created_at"].strftime("%Y-%m-%d %H:%M")
        items.append(d)
    return {"items": items, "total": total, "page": page, "page_size": page_size}


@router.get("/spare-transactions")
def list_spare_transactions(
    page: int = 1,
    page_size: int = 20,
    keyword: str = "",
    type: str = "",
    date_from: str = "",
    date_to: str = "",
    db: Session = Depends(get_db),
):
    where = []
    if keyword:
        kw = f"%{keyword}%"
        where.append(
            or_(
                SparePart.code.like(kw),
                SparePart.name.like(kw),
                SparePartTransaction.operator.like(kw),
            )
        )
    if type:
        where.append(SparePartTransaction.type == type)
    if date_from:
        where.append(func.date(SparePartTransaction.created_at) >= date_from)
    if date_to:
        where.append(func.date(SparePartTransaction.created_at) <= date_to)
    total = (
        db.execute(
            select(func.count())
            .select_from(SparePartTransaction)
            .join(SparePart, SparePartTransaction.spare_part_id == SparePart.id)
            .where(*where)
        )
        .scalar_one()
    )
    cols = (
        SparePartTransaction.id,
        SparePartTransaction.spare_part_id,
        SparePartTransaction.type,
        SparePartTransaction.quantity,
        SparePartTransaction.operator,
        SparePartTransaction.purpose,
        SparePartTransaction.balance_after,
        SparePartTransaction.notes,
        SparePartTransaction.created_at,
        SparePart.name.label("spare_name"),
        SparePart.code.label("spare_code"),
    )
    stmt = (
        select(*cols)
        .join(SparePart, SparePartTransaction.spare_part_id == SparePart.id)
        .where(*where)
        .order_by(SparePartTransaction.created_at.desc())
    )
    if page_size and 0 < page_size <= 1000:
        stmt = stmt.limit(page_size).offset((page - 1) * page_size)
    rows = db.execute(stmt).all()
    return {
        "items": [dict(r._mapping) for r in rows],
        "total": total,
        "page": page,
        "page_size": page_size,
    }
